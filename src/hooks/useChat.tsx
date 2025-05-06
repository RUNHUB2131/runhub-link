
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchMessages, 
  markMessagesAsRead, 
  sendMessage, 
  fetchChatById,
  Chat,
  ChatMessage,
  fetchChats
} from "@/services/chat";

export const useChat = (chatId: string) => {
  const { user, userType } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load chat details and messages
  const loadChat = useCallback(async () => {
    if (!chatId || !user) return;
    
    setIsLoading(true);
    try {
      // Fetch chat details
      const chatData = await fetchChatById(chatId);
      if (chatData) {
        setChat(chatData);
      }
      
      // Fetch messages
      const messagesData = await fetchMessages(chatId);
      setMessages(messagesData);
      
      // Mark messages as read
      await markMessagesAsRead(chatId, user.id);
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, user]);

  // Send a new message
  const handleSendMessage = async (content: string) => {
    if (!user || !chatId || !content.trim() || !userType) return;
    
    setIsSending(true);
    try {
      const senderType = userType as 'brand' | 'run_club';
      await sendMessage(chatId, user.id, senderType, content);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Setup real-time subscription to messages
  useEffect(() => {
    if (!chatId) return;
    
    // Load initial data
    loadChat();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark the message as read if it's not from the current user
          if (user && newMessage.sender_id !== user.id) {
            markMessagesAsRead(chatId, user.id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user, loadChat]);

  return {
    chat,
    messages,
    isLoading,
    isSending,
    sendMessage: handleSendMessage,
    refreshChat: loadChat
  };
};

// Hook for ChatList component
export const useChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userType } = useAuth();
  
  const loadChats = useCallback(async () => {
    if (!user?.id || !userType) return;
    
    setIsLoading(true);
    try {
      const userChats = await fetchChats(user.id, userType as 'brand' | 'run_club');
      setChats(userChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userType]);
  
  useEffect(() => {
    loadChats();
    
    // Setup real-time subscriptions for new messages and chats
    if (!user?.id) return;
    
    // Subscribe to messages to update unread count
    const messagesChannel = supabase
      .channel('chat-messages-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          // Refresh chat list when a new message is received
          loadChats();
        }
      )
      .subscribe();
    
    // Subscribe to new chats
    const chatsChannel = supabase
      .channel('chats-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats'
        },
        () => {
          // Refresh chat list when a new chat is created
          loadChats();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [user?.id, loadChats]);
  
  return {
    chats,
    isLoading,
    refreshChats: loadChats
  };
};

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
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
  const { markChatAsRead } = useNotifications();
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
        
        // Mark chat notifications as read using the synchronized system
        if (chatData.application_id) {
          await markChatAsRead(chatData.application_id);
        }
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
  }, [chatId, user, markChatAsRead]);

  // Send a new message
  const handleSendMessage = async (content: string) => {
    if (!user || !chatId || !content.trim() || !userType) return;
    
    setIsSending(true);
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      chat_id: chatId,
      sender_id: user.id,
      sender_type: userType as 'brand' | 'run_club',
      content: content.trim(),
      read: true,
      created_at: new Date().toISOString()
    };
    
    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      const senderType = userType as 'brand' | 'run_club';
      const sentMessage = await sendMessage(chatId, user.id, senderType, content.trim());
      
      if (sentMessage) {
        // Replace optimistic message with real message from server
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? sentMessage : msg
          )
        );
      } else {
        // Remove optimistic message if sending failed
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticMessage.id)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message if sending failed
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
    } finally {
      setIsSending(false);
    }
  };

  // Setup real-time subscription to messages
  useEffect(() => {
    if (!chatId || !user) return;
    
    // Load initial data
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch chat details
        const chatData = await fetchChatById(chatId);
        if (chatData) {
          setChat(chatData);
          
          // Mark chat notifications as read using the synchronized system
          if (chatData.application_id) {
            await markChatAsRead(chatData.application_id);
          }
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
    };
    
    loadInitialData();
    
    // Subscribe to new messages with a unique channel name per chat
    const channel = supabase
      .channel(`chat-messages-${chatId}`)
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
          console.log('New message received:', newMessage);
          setMessages(prev => [...prev, newMessage]);
          
          // Mark the message as read if it's not from the current user
          if (newMessage.sender_id !== user.id) {
            markMessagesAsRead(chatId, user.id);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, markChatAsRead]);

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
    console.log('Loading chats...');
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
  }, [loadChats]);
  
  return {
    chats,
    isLoading,
    refreshChats: loadChats
  };
};


import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChatMessage } from "./types";

// Fetch messages for a specific chat
export const fetchMessages = async (chatId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data as ChatMessage[];
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    toast({
      title: "Error",
      description: "Failed to load messages",
      variant: "destructive",
    });
    return [];
  }
};

// Send a message
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  senderType: 'brand' | 'run_club',
  content: string
) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        sender_type: senderType,
        content
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);
    
    return data as ChatMessage;
  } catch (error: any) {
    console.error("Error sending message:", error);
    toast({
      title: "Error",
      description: "Failed to send message",
      variant: "destructive",
    });
    return null;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .not('sender_id', 'eq', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return false;
  }
};

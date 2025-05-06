
import { supabase } from "@/integrations/supabase/client";

// Find a chat by application ID
export const findChatByApplicationId = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .eq('application_id', applicationId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error finding chat by application ID:", error);
    return null;
  }
};

// Mark all messages in a chat as read for a specific user
export const markChatMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .not('sender_id', 'eq', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error marking chat messages as read:", error);
    return false;
  }
};

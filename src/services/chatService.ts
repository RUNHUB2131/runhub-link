
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Chat {
  id: string;
  application_id: string;
  opportunity_id: string;
  brand_id: string;
  run_club_id: string;
  created_at: string;
  updated_at: string;
  opportunity?: {
    title: string;
  };
  brand_profile?: {
    company_name: string;
    logo_url?: string;
  } | null;
  run_club_profile?: {
    club_name: string;
    logo_url?: string;
  } | null;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: 'brand' | 'run_club';
  content: string;
  read: boolean;
  created_at: string;
}

// Fetch chats for the current user (filtered by user type)
export const fetchChats = async (userId: string, userType: 'brand' | 'run_club') => {
  try {
    const idField = userType === 'brand' ? 'brand_id' : 'run_club_id';
    
    // Query chats with additional information
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        opportunity:opportunities(title),
        brand_profile:brand_profiles!brand_id(company_name, logo_url),
        run_club_profile:run_club_profiles!run_club_id(club_name, logo_url)
      `)
      .eq(idField, userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;

    // Get unread messages count for each chat
    const chatsWithUnreadCount = await Promise.all(
      (data || []).map(async (chat) => {
        const { count, error: countError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('read', false)
          .not('sender_id', 'eq', userId);
        
        return {
          ...chat,
          unread_count: count || 0
        };
      })
    );
    
    // Type assertion to ensure compatibility
    return chatsWithUnreadCount as unknown as Chat[];
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    toast({
      title: "Error",
      description: "Failed to load chats",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch chat by ID with details
export const fetchChatById = async (chatId: string) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        opportunity:opportunities(title),
        brand_profile:brand_profiles!brand_id(company_name, logo_url),
        run_club_profile:run_club_profiles!run_club_id(club_name, logo_url)
      `)
      .eq('id', chatId)
      .single();
    
    if (error) throw error;
    
    // Type assertion to ensure compatibility
    return data as unknown as Chat;
  } catch (error: any) {
    console.error("Error fetching chat details:", error);
    toast({
      title: "Error",
      description: "Failed to load chat details",
      variant: "destructive",
    });
    return null;
  }
};

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

// Check if a chat exists for an application
export const checkChatExistsForApplication = async (applicationId: string) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .eq('application_id', applicationId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data?.id || null;
  } catch (error: any) {
    console.error("Error checking chat existence:", error);
    return null;
  }
};

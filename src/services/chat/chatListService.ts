
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Chat } from "./types";

// Fetch chats for the current user (filtered by user type)
export const fetchChats = async (userId: string, userType: 'brand' | 'run_club') => {
  try {
    const idField = userType === 'brand' ? 'brand_id' : 'run_club_id';
    
    // Query chats for the current user first
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq(idField, userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    // Then fetch related data for each chat
    const enrichedChats = await Promise.all(
      (data || []).map(async (chat) => {
        // Get opportunity info
        const { data: oppData } = await supabase
          .from('opportunities')
          .select('title')
          .eq('id', chat.opportunity_id)
          .single();
        
        // Get brand profile info
        const { data: brandData } = await supabase
          .from('brand_profiles')
          .select('company_name, logo_url')
          .eq('id', chat.brand_id)
          .single();
        
        // Get run club profile info
        const { data: runClubData } = await supabase
          .from('run_club_profiles')
          .select('club_name, logo_url')
          .eq('id', chat.run_club_id)
          .single();
        
        // Get unread count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('read', false)
          .not('sender_id', 'eq', userId);
        
        return {
          ...chat,
          opportunity: oppData,
          brand_profile: brandData,
          run_club_profile: runClubData,
          unread_count: count || 0
        };
      })
    );
    
    return enrichedChats as Chat[];
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

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
    
    if (error) {
      console.error("Supabase error fetching chats:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }
    
    // Then fetch related data for each chat
    const enrichedChats = await Promise.all(
      data.map(async (chat) => {
        try {
          // Get opportunity info (use .maybeSingle() to handle missing data)
          const { data: oppData, error: oppError } = await supabase
            .from('opportunities')
            .select('title')
            .eq('id', chat.opportunity_id)
            .maybeSingle();
          
          if (oppError) {
            console.error("Error fetching opportunity for chat", chat.id, oppError);
          }
          
          // Get brand profile info
          const { data: brandData, error: brandError } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('id', chat.brand_id)
            .maybeSingle();
          
          if (brandError) {
            console.error("Error fetching brand profile for chat", chat.id, brandError);
          }
          
          // Get run club profile info
          const { data: runClubData, error: runClubError } = await supabase
            .from('run_club_profiles')
            .select('club_name, logo_url')
            .eq('id', chat.run_club_id)
            .maybeSingle();
          
          if (runClubError) {
            console.error("Error fetching run club profile for chat", chat.id, runClubError);
          }
          
          // Get unread count
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('read', false)
            .not('sender_id', 'eq', userId);
          
          if (countError) {
            console.error("Error getting unread count for chat", chat.id, countError);
          }
          
          return {
            ...chat,
            opportunity: oppData || null,
            brand_profile: brandData || null,
            run_club_profile: runClubData || null,
            unread_count: count || 0
          };
        } catch (error) {
          console.error("Error processing chat", chat.id, error);
          // Return chat with default values if there's an error
          return {
            ...chat,
            opportunity: null,
            brand_profile: null,
            run_club_profile: null,
            unread_count: 0
          };
        }
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

// Create a new chat for an accepted application
export const createChatForApplication = async (applicationId: string, opportunityId: string, brandId: string, runClubId: string) => {
  try {
    console.log("Creating chat with params:", { applicationId, opportunityId, brandId, runClubId });
    
    const { data, error } = await supabase
      .from('chats')
      .insert({
        application_id: applicationId,
        opportunity_id: opportunityId,
        brand_id: brandId,
        run_club_id: runClubId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error from Supabase when creating chat:", error);
      throw error;
    }
    
    console.log("Successfully created chat:", data);
    return data;
  } catch (error: any) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

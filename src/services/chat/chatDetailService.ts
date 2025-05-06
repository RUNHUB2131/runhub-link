
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Chat } from "./types";

// Fetch chat by ID with details
export const fetchChatById = async (chatId: string) => {
  try {
    // First, fetch the basic chat data
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatError) throw chatError;
    
    // Then fetch the related data separately
    const [opportunityData, brandData, runClubData] = await Promise.all([
      // Get opportunity info
      supabase
        .from('opportunities')
        .select('title')
        .eq('id', chatData.opportunity_id)
        .single()
        .then(res => res.data),
      
      // Get brand profile info
      supabase
        .from('brand_profiles')
        .select('company_name, logo_url')
        .eq('id', chatData.brand_id)
        .single()
        .then(res => res.data),
      
      // Get run club profile info
      supabase
        .from('run_club_profiles')
        .select('club_name, logo_url')
        .eq('id', chatData.run_club_id)
        .single()
        .then(res => res.data)
    ]);
    
    // Combine all data
    const enrichedChat: Chat = {
      ...chatData,
      opportunity: opportunityData,
      brand_profile: brandData,
      run_club_profile: runClubData
    };
    
    return enrichedChat;
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

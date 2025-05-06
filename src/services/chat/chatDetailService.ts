
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Chat } from "./types";

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

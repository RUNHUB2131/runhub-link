
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

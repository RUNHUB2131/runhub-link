
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

export const fetchNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data as Notification[];
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    toast({
      title: "Error",
      description: "Failed to mark notification as read",
      variant: "destructive",
    });
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    toast({
      title: "Error",
      description: "Failed to mark all notifications as read",
      variant: "destructive",
    });
    return false;
  }
};

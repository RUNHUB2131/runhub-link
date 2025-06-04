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
  user_id: string;
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
    toast({
      title: "Error",
      description: "Failed to load notifications",
      variant: "destructive",
    });
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    // First check if the notification exists and is already read
    const { data: existingNotification, error: fetchError } = await supabase
      .from("notifications")
      .select("read")
      .eq("id", notificationId)
      .single();

    if (fetchError) throw fetchError;
    if (!existingNotification) throw new Error("Notification not found");
    if (existingNotification.read) return true; // Already read, no need to update

    // Update the notification
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (updateError) throw updateError;
    
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
    // First check if there are any unread notifications
    const { count, error: countError } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (countError) throw countError;
    if (count === 0) return true; // No unread notifications, no need to update

    // Update all unread notifications
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (updateError) throw updateError;
    
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

// Mark chat notifications as read for a specific application
export const markChatNotificationsAsRead = async (userId: string, applicationId: string) => {
  try {
    // Get chat notifications related to this application
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "new_chat")
      .eq("related_id", applicationId)
      .eq("read", false);

    if (fetchError) throw fetchError;
    if (!notifications || notifications.length === 0) return true; // No unread notifications

    // Mark all these notifications as read
    const notificationIds = notifications.map(notif => notif.id);
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", notificationIds);

    if (updateError) throw updateError;
    
    return true;
  } catch (error: any) {
    console.error("Error marking chat notifications as read:", error);
    toast({
      title: "Error",
      description: "Failed to mark chat notifications as read",
      variant: "destructive",
    });
    return false;
  }
};

// Helper function to create a notification (useful for testing)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  relatedId?: string
) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId || null,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    
    return data as Notification;
  } catch (error: any) {
    console.error("Error creating notification:", error);
    toast({
      title: "Error",
      description: "Failed to create notification",
      variant: "destructive",
    });
    return null;
  }
};

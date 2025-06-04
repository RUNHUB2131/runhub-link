import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Notification, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, markChatNotificationsAsRead } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query to manage notifications globally
  const {
    data: notifications = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    // Find the notification first
    const notification = notifications.find(notif => notif.id === notificationId);
    if (!notification || notification.read) {
      return; // Don't proceed if notification doesn't exist or is already read
    }

    try {
      // Optimistically update the cache
      queryClient.setQueryData(['notifications', user?.id], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        );
      });

      // Update the database
      const success = await markNotificationAsRead(notificationId);
      if (!success) {
        // Revert the optimistic update if the database update failed
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, [notifications, user?.id, queryClient]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Optimistically update the cache
      queryClient.setQueryData(['notifications', user?.id], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notif => ({ ...notif, read: true }));
      });

      const success = await markAllNotificationsAsRead(user.id);
      if (!success) {
        // Revert the optimistic update if the database update failed
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  }, [user?.id, queryClient]);

  const markChatAsRead = useCallback(async (applicationId: string) => {
    if (!user?.id) return;

    try {
      // Optimistically update the cache - mark all chat notifications for this application as read
      queryClient.setQueryData(['notifications', user?.id], (oldData: Notification[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(notif =>
          notif.type === 'new_chat' && notif.related_id === applicationId 
            ? { ...notif, read: true } 
            : notif
        );
      });

      // Update the database
      const success = await markChatNotificationsAsRead(user.id, applicationId);
      if (!success) {
        // Revert the optimistic update if the database update failed
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      }
    } catch (error) {
      console.error("Error marking chat notifications as read:", error);
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: "Error",
        description: "Failed to mark chat notifications as read",
        variant: "destructive",
      });
    }
  }, [user?.id, queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
  }, [user?.id, queryClient]);

  // Set up real-time listener for new notifications and updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add the new notification to the cache
          queryClient.setQueryData(['notifications', user?.id], (oldData: Notification[] | undefined) => {
            if (!oldData) return [newNotification];
            return [newNotification, ...oldData];
          });
          
          // Display a toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          
          // Update the notification in the cache
          queryClient.setQueryData(['notifications', user?.id], (oldData: Notification[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(notif =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    markChatAsRead,
    refresh
  };
};

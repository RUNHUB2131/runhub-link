
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Notification, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const data = await fetchNotifications(user.id);
    setNotifications(data);
    setUnreadCount(data.filter(notif => !notif.read).length);
    setIsLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    const success = await markAllNotificationsAsRead(user.id);
    if (success) {
      setNotifications(prevNotifs => 
        prevNotifs.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Set up real-time listener for new notifications
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
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Display a toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
};

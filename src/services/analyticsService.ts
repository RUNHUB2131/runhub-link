import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  user_id: string;
  event_type: string;
  event_data?: Record<string, any>;
}

/**
 * Track user interactions for internal analytics
 */
export const trackEvent = async (event: Omit<AnalyticsEvent, 'user_id'>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot track event: User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: event.event_type,
        event_data: event.event_data || {}
      });

    if (error) {
      console.error('Error tracking analytics event:', error);
    }
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

/**
 * Track when brands click Contact Club button
 */
export const trackContactClubClick = async (clubId: string, clubName: string) => {
  await trackEvent({
    event_type: 'contact_club_clicked',
    event_data: {
      club_id: clubId,
      club_name: clubName,
      feature: 'premium_contact',
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Track other user interactions
 */
export const trackClubView = async (clubId: string, clubName: string) => {
  await trackEvent({
    event_type: 'club_profile_viewed',
    event_data: {
      club_id: clubId,
      club_name: clubName,
      timestamp: new Date().toISOString()
    }
  });
};

export const trackClubFavorite = async (clubId: string, clubName: string, action: 'added' | 'removed') => {
  await trackEvent({
    event_type: 'club_favorited',
    event_data: {
      club_id: clubId,
      club_name: clubName,
      action,
      timestamp: new Date().toISOString()
    }
  });
}; 
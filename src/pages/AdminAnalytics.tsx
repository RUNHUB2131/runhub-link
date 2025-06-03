import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

interface ContactClubEvent {
  id: string;
  user_id: string;
  club_id: string;
  club_name: string;
  created_at: string;
}

// This component is for internal use only - add appropriate access controls in production
export const AdminAnalytics = () => {
  const [contactClubClicks, setContactClubClicks] = useState<ContactClubEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch contact club click events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'contact_club_clicked')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      // Transform the data
      const contactEvents = events.map(event => ({
        id: event.id,
        user_id: event.user_id,
        club_id: (event.event_data as any)?.club_id || 'Unknown',
        club_name: (event.event_data as any)?.club_name || 'Unknown Club',
        created_at: event.created_at
      }));

      setContactClubClicks(contactEvents);
      setTotalEvents(events.length);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Internal analytics for feature usage tracking</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact Club Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Total premium feature interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(contactClubClicks.map(event => event.club_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Clubs that received contact attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(contactClubClicks.map(event => event.user_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Brands who tried to contact clubs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contact Club Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {contactClubClicks.length === 0 ? (
            <p className="text-muted-foreground">No contact club clicks recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {contactClubClicks.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Contact Attempt</Badge>
                      <span className="font-medium">{event.club_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      User: {event.user_id.slice(0, 8)}... • Club: {event.club_id.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 
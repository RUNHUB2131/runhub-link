import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Check, X, Settings } from "lucide-react";

interface UserPreferences {
  user_id: string;
  email: string;
  full_name: string;
  email_notifications_enabled: boolean;
  email_new_applications: boolean;
  email_application_updates: boolean;
  email_new_messages: boolean;
  email_new_opportunities: boolean;
}

export const EmailPreferencesPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const unsubscribeAll = searchParams.get('unsubscribe') === 'all';
  
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (unsubscribeAll) {
      handleUnsubscribeAll();
    } else {
      fetchPreferences();
    }
  }, [token, unsubscribeAll]);

  const fetchPreferences = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.rpc('get_user_preferences_by_token', {
        token_value: token
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setPreferences(data[0]);
      } else {
        throw new Error('Invalid or expired token');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Invalid or expired link. Please use a recent email link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('unsubscribe_all_by_token', {
        token_value: token
      });

      if (error) throw error;

      if (data) {
        setUpdated(true);
        toast({
          title: "Unsubscribed",
          description: "You have been unsubscribed from all email notifications.",
        });
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const updatePreference = async (field: keyof UserPreferences, value: boolean) => {
    if (!token || !preferences) return;

    try {
      setSaving(true);
      
      const updateData: any = {};
      updateData[`new_${field}`] = value;

      const { data, error } = await supabase.rpc('update_preferences_by_token', {
        token_value: token,
        ...updateData
      });

      if (error) throw error;

      if (data) {
        setPreferences(prev => prev ? { ...prev, [field]: value } : null);
        setUpdated(true);
        toast({
          title: "Updated",
          description: "Your email preferences have been updated.",
        });
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
          <p className="text-center text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-muted-foreground">
            This email preferences link is invalid. Please use a recent email from RUNHUB Connect.
          </p>
        </div>
      </div>
    );
  }

  if (updated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Preferences Updated</h1>
          <p className="text-muted-foreground mb-6">
            Your email preferences have been successfully updated.
          </p>
          <Button 
            onClick={() => window.location.href = 'https://runhub.co'}
            className="w-full"
          >
            Visit RUNHUB Connect
          </Button>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-muted-foreground">
            This email preferences link has expired. Please use a recent email from RUNHUB Connect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Email Preferences</h1>
          <p className="text-muted-foreground">
            Manage your email notifications for <strong>{preferences.email}</strong>
          </p>
        </div>

        {/* Master Toggle */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="master-toggle" className="text-base font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
            </div>
            <Switch
              id="master-toggle"
              checked={preferences.email_notifications_enabled}
              onCheckedChange={(enabled) => updatePreference('email_notifications_enabled', enabled)}
              disabled={saving}
            />
          </div>
        </Card>

        {/* Individual Settings */}
        {preferences.email_notifications_enabled && (
          <Card className="divide-y">
            <div className="p-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Notification Types
              </h3>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="new-applications" className="text-base font-medium">
                    New Applications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when run clubs apply to your opportunities
                  </p>
                </div>
                <Switch
                  id="new-applications"
                  checked={preferences.email_new_applications}
                  onCheckedChange={(enabled) => updatePreference('email_new_applications', enabled)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="application-updates" className="text-base font-medium">
                    Application Updates
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when brands update your application status
                  </p>
                </div>
                <Switch
                  id="application-updates"
                  checked={preferences.email_application_updates}
                  onCheckedChange={(enabled) => updatePreference('email_application_updates', enabled)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="new-messages" className="text-base font-medium">
                    New Messages
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when brands send you messages
                  </p>
                </div>
                <Switch
                  id="new-messages"
                  checked={preferences.email_new_messages}
                  onCheckedChange={(enabled) => updatePreference('email_new_messages', enabled)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="new-opportunities" className="text-base font-medium">
                    New Opportunities
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get notified when new sponsorship opportunities are posted
                  </p>
                </div>
                <Switch
                  id="new-opportunities"
                  checked={preferences.email_new_opportunities}
                  onCheckedChange={(enabled) => updatePreference('email_new_opportunities', enabled)}
                  disabled={saving}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            You can also manage these settings when logged into your RUNHUB Connect account.
          </p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = 'https://runhub.co'}
          >
            Visit RUNHUB Connect
          </Button>
        </div>
      </div>
    </div>
  );
}; 
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail } from "lucide-react";

interface EmailPreferences {
  email_notifications_enabled: boolean;
  email_new_applications: boolean;
  email_application_updates: boolean;
  email_new_messages: boolean;
  email_new_opportunities: boolean;
}

interface EmailNotificationSettingsProps {
  onBack: () => void;
}

export const EmailNotificationSettings = ({ onBack }: EmailNotificationSettingsProps) => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    email_notifications_enabled: true,
    email_new_applications: true,
    email_application_updates: true,
    email_new_messages: true,
    email_new_opportunities: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications_enabled, email_new_applications, email_application_updates, email_new_messages, email_new_opportunities')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          email_new_applications: data.email_new_applications ?? true,
          email_application_updates: data.email_application_updates ?? true,
          email_new_messages: data.email_new_messages ?? true,
          email_new_opportunities: data.email_new_opportunities ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load email preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: EmailPreferences) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications_enabled: newPreferences.email_notifications_enabled,
          email_new_applications: newPreferences.email_new_applications,
          email_application_updates: newPreferences.email_application_updates,
          email_new_messages: newPreferences.email_new_messages,
          email_new_opportunities: newPreferences.email_new_opportunities,
        })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: "Settings saved",
        description: "Your email notification preferences have been updated",
      });
    } catch (error) {
      console.error('Error updating email preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMasterToggle = (enabled: boolean) => {
    const newPreferences = {
      ...preferences,
      email_notifications_enabled: enabled,
    };
    updatePreferences(newPreferences);
  };

  const handleSpecificToggle = (key: keyof EmailPreferences, enabled: boolean) => {
    const newPreferences = {
      ...preferences,
      [key]: enabled,
    };
    updatePreferences(newPreferences);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Email Notifications</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Get notification settings based on user type
  const getNotificationSettings = () => {
    const settings = [];
    
    if (userType === 'brand') {
      settings.push({
        key: 'email_new_applications' as keyof EmailPreferences,
        title: 'New Applications',
        description: 'Get notified when run clubs apply to your opportunities',
      });
    }
    
    if (userType === 'run_club') {
      settings.push(
        {
          key: 'email_application_updates' as keyof EmailPreferences,
          title: 'Application Updates',
          description: 'Get notified when brands update your application status',
        },
        {
          key: 'email_new_messages' as keyof EmailPreferences,
          title: 'New Messages',
          description: 'Get notified when brands send you messages',
        },
        {
          key: 'email_new_opportunities' as keyof EmailPreferences,
          title: 'New Opportunities',
          description: 'Get notified when new sponsorship opportunities are posted',
        }
      );
    }
    
    return settings;
  };

  const notificationSettings = getNotificationSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Email Notifications</h1>
      </div>

      {/* Master Toggle */}
      <Card className="p-6">
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
            onCheckedChange={handleMasterToggle}
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
          {notificationSettings.map((setting, index) => (
            <div key={setting.key} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor={setting.key} className="text-base font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={setting.key}
                  checked={preferences[setting.key]}
                  onCheckedChange={(enabled) => handleSpecificToggle(setting.key, enabled)}
                  disabled={saving}
                />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Info Message */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 You can manage these settings at any time. All emails will include unsubscribe options.
        </p>
      </Card>
    </div>
  );
}; 
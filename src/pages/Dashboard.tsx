import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNotifications } from "@/hooks/useNotifications";
import { useTotalViews } from "@/hooks/useTotalViews";
import { useTotalApplications, ApplicationsPeriod } from "@/hooks/useTotalApplications";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards, ViewsPeriod } from "@/components/dashboard/StatsCards";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { RunClubProfile } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { isProfileComplete, getMissingProfileFields } from "@/utils/profileCompletionUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewsPeriod, setViewsPeriod] = useState<ViewsPeriod>('all');
  const [applicationsPeriod, setApplicationsPeriod] = useState<ApplicationsPeriod>('all');
  const { isLoading, stats } = useDashboardData();
  const { notifications, isLoading: notificationsLoading, markAsRead } = useNotifications();
  const { totalViews, isLoading: totalViewsLoading } = useTotalViews(viewsPeriod);
  const { totalApplications, isLoading: totalApplicationsLoading } = useTotalApplications(applicationsPeriod);
  const [profilePercentage, setProfilePercentage] = useState<number>(0);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [welcomeDialogChecked, setWelcomeDialogChecked] = useState(false);

  const handleViewsPeriodChange = (period: ViewsPeriod) => {
    setViewsPeriod(period);
  };

  const handleApplicationsPeriodChange = (period: ApplicationsPeriod) => {
    setApplicationsPeriod(period);
  };

  // Check if brand has seen welcome dialog
  useEffect(() => {
    const checkWelcomeDialogStatus = async () => {
      if (user?.id && userType === 'brand' && !welcomeDialogChecked) {
        try {
          const { data: brandProfile, error } = await supabase
            .from('brand_profiles')
            .select('welcome_dialog_seen')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error checking welcome dialog status:', error);
            return;
          }

          setWelcomeDialogChecked(true);

          // Show dialog if not seen before and dashboard has loaded
          if (!(brandProfile as any)?.welcome_dialog_seen && !isLoading) {
            setShowWelcomeDialog(true);
          }
        } catch (error) {
          console.error('Error in welcome dialog check:', error);
          setWelcomeDialogChecked(true);
        }
      }
    };

    checkWelcomeDialogStatus();
  }, [user?.id, userType, isLoading, welcomeDialogChecked]);

  const handleWelcomeAction = async (createOpportunity = false) => {
    // Mark as seen in database
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('brand_profiles')
          .update({ welcome_dialog_seen: true } as any)
          .eq('id', user.id);

        if (error) {
          console.error('Error updating welcome dialog status:', error);
        }
      } catch (error) {
        console.error('Error in welcome dialog update:', error);
      }
    }
    
    setShowWelcomeDialog(false);
    
    if (createOpportunity) {
      navigate("/opportunities/add");
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id || userType !== 'run_club') return;
      
      try {
        setProfileLoading(true);
        const profileData = await fetchRunClubProfile(user.id);
        
        if (profileData) {
          setRunClubProfile(profileData);
          
          // Use the same profile completion logic as the rest of the app
          if (isProfileComplete(profileData)) {
            setProfilePercentage(100);
          } else {
            // Calculate percentage based on completed vs missing required fields
            const missingFields = getMissingProfileFields(profileData);
            
            // Total required categories for completion
            const totalRequiredCategories = 5; // club_name, location, member_count, description, (social_media OR run_types)
            const completedCategories = totalRequiredCategories - missingFields.length;
            
            const percentage = Math.round((completedCategories / totalRequiredCategories) * 100);
            setProfilePercentage(Math.max(0, percentage));
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadProfileData();
  }, [user?.id, userType, toast]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <DashboardHeader userType={userType} />
        
        {userType === 'run_club' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <StatsCards 
                userType={userType} 
                stats={stats} 
                isLoading={isLoading} 
                totalViews={totalViews}
                totalViewsLoading={totalViewsLoading}
                onViewsPeriodChange={handleViewsPeriodChange}
                totalApplications={totalApplications}
                totalApplicationsLoading={totalApplicationsLoading}
                onApplicationsPeriodChange={handleApplicationsPeriodChange}
              />
            </div>
            
            <ProfileCompletionCard 
              isLoading={profileLoading} 
              percentage={profilePercentage}
              profile={runClubProfile} 
            />
          </div>
        ) : (
          <StatsCards 
            userType={userType} 
            stats={stats} 
            isLoading={isLoading} 
            totalViews={totalViews}
            totalViewsLoading={totalViewsLoading}
            onViewsPeriodChange={handleViewsPeriodChange}
            totalApplications={totalApplications}
            totalApplicationsLoading={totalApplicationsLoading}
            onApplicationsPeriodChange={handleApplicationsPeriodChange}
          />
        )}
        
        <RecentActivitySection 
          notifications={notifications} 
          isLoading={isLoading} 
          notificationsLoading={notificationsLoading}
          markAsRead={markAsRead}
        />
      </div>

      {/* Brand Welcome Dialog */}
      {userType === 'brand' && (
        <Dialog open={showWelcomeDialog} onOpenChange={(open) => {
          if (!open) {
            handleWelcomeAction(false); // Mark as seen when closed via X button
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <div className="flex flex-col items-center text-center space-y-6 pt-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              
              <DialogTitle className="text-2xl font-bold">
                Welcome to RUNHUB LINK!
              </DialogTitle>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Connect with
                  </span>
                </div>
                <div className="text-3xl font-bold text-primary mb-1">100+</div>
                <div className="text-sm text-muted-foreground">active run clubs</div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="font-semibold">Ready to get started?</h4>
                <p className="text-sm text-muted-foreground">
                  Create your first opportunity and start receiving applications from interested run clubs.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => handleWelcomeAction(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                size="lg"
              >
                Create Your First Opportunity
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => handleWelcomeAction(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                I'll do this later
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Application } from "@/types";
import ApplicationsHeader from "@/components/opportunities/applications/ApplicationsHeader";
import ApplicationsContent from "@/components/opportunities/applications/ApplicationsContent";
import { updateApplicationStatus, markApplicationsAsSeen } from "@/services/applicationService";
import { PageContainer } from "@/components/layout/PageContainer";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

const OpportunityApplications = () => {
  const { id: opportunityId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any>(null);

  const fetchOpportunity = async () => {
    if (!opportunityId) {
      console.log("No opportunityId provided to fetchOpportunity");
      return;
    }
    
    console.log("Fetching opportunity details for ID:", opportunityId);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', opportunityId)
        .single();
      
      if (error) {
        console.error("Error fetching opportunity:", error);
        throw error;
      }
      console.log("Successfully fetched opportunity:", data);
      setOpportunity(data);
    } catch (error) {
      console.error("Error in fetchOpportunity:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    console.log("fetchApplications called, opportunityId:", opportunityId);
    if (!opportunityId) {
      console.log("No opportunityId, aborting fetch.");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Fetching applications for opportunity:", opportunityId);
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', opportunityId);

      console.log("Applications fetch result:", appData, appError);

      if (appError) throw appError;

      const initialApps: RunClubApplication[] = (appData || []).map(app => ({
        ...app,
        status: app.status as "pending" | "accepted" | "rejected"
      }));
      
      console.log("Initial applications:", initialApps);
      
      // Now fetch the run club profile data separately for each application
      const appsWithProfiles = await Promise.all(
        initialApps.map(async (app) => {
          console.log("Fetching profile for run club:", app.run_club_id);
          const { data: profileData, error: profileError } = await supabase
            .from('run_club_profiles')
            .select('club_name, location, member_count')
            .eq('id', app.run_club_id)
            .single();

          console.log(`Fetched run club profile for run_club_id ${app.run_club_id}:`, profileData, profileError);

          return {
            ...app,
            run_club_profile: profileError ? null : profileData
          };
        })
      );

      console.log("Final applications with profiles:", appsWithProfiles);
      setApplications(appsWithProfiles);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsSeen = async () => {
    if (!opportunityId || !user || !opportunity) {
      return;
    }
    
    // Only mark as seen if the current user is the brand owner of this opportunity
    if (user.id === opportunity.brand_id) {
      try {
        await markApplicationsAsSeen(opportunityId);
        console.log("Applications marked as seen for opportunity:", opportunityId);
      } catch (error) {
        console.error("Failed to mark applications as seen:", error);
      }
    }
  };

  const handleRefresh = () => {
    fetchApplications();
  };

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      await updateApplicationStatus(applicationId, status);

      // Update local state to reflect the change
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));

      toast({
        title: "Status updated",
        description: `Application ${status === 'accepted' ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!opportunityId) {
      console.error("No opportunityId provided. Redirecting...");
      // Optionally redirect to a fallback page
      // navigate("/opportunities");
    } else {
      fetchOpportunity();
      fetchApplications();
    }
  }, [opportunityId]);

  // Mark applications as seen when opportunity data is available
  useEffect(() => {
    if (opportunity && user) {
      markAsSeen();
    }
  }, [opportunity, user]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <ApplicationsHeader
          title={opportunity?.title || ''}
          description={opportunity?.description}
          onRefresh={handleRefresh}
        />
        
        <ApplicationsContent
          applications={applications}
          isLoading={isLoading}
          handleUpdateStatus={handleUpdateStatus}
        />
      </div>
    </PageContainer>
  );
};

export default OpportunityApplications;

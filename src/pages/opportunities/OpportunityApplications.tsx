
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import ApplicationsHeader from "@/components/opportunities/applications/ApplicationsHeader";
import ApplicationsContent, { RunClubApplication } from "@/components/opportunities/applications/ApplicationsContent";

interface Opportunity {
  id: string;
  title: string;
  description: string;
}

const OpportunityApplications = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch opportunity details
      supabase
        .from('opportunities')
        .select('id, title, description')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching opportunity details:", error);
            toast({
              title: "Error",
              description: "Failed to load opportunity details",
              variant: "destructive",
            });
          } else {
            setOpportunity(data as Opportunity);
          }
        });
        
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // First fetch the applications
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', id);

      if (appError) throw appError;

      // Initialize applications array with proper typing for status
      const initialApps: RunClubApplication[] = (appData || []).map(app => ({
        ...app,
        status: app.status as "pending" | "accepted" | "rejected"
      }));
      
      // Now fetch the run club profile data separately for each application
      const appsWithProfiles = await Promise.all(
        initialApps.map(async (app) => {
          const { data: profileData, error: profileError } = await supabase
            .from('run_club_profiles')
            .select('club_name, location, member_count')
            .eq('id', app.run_club_id)
            .single();

          return {
            ...app,
            run_club_profile: profileError ? null : profileData
          };
        })
      );

      setApplications(appsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadApplications();
  };

  const handleUpdateStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

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

  return (
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
  );
};

export default OpportunityApplications;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types";

interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    city?: string;
    state?: string;
    member_count: number;
    social_media?: any;
    community_data?: any;
  } | null;
}

export const useApplications = (opportunityId: string) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<RunClubApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // First fetch the applications
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', opportunityId);

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
            .select('club_name, location, city, state, member_count, social_media, community_data')
            .eq('id', app.run_club_id)
            .single();

          return {
            ...app,
            run_club_profile: profileError ? null : profileData
          };
        })
      );

      // Sort applications: pending first, then accepted, then rejected, and within each status by newest first
      const sortedApplications = appsWithProfiles.sort((a, b) => {
        // Define status priority: pending = 1, accepted = 2, rejected = 3
        const statusPriority = { 'pending': 1, 'accepted': 2, 'rejected': 3 };
        const aPriority = statusPriority[a.status] || 4;
        const bPriority = statusPriority[b.status] || 4;
        
        // First sort by status priority
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // If same status, sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setApplications(sortedApplications);
    } catch (error: any) {
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

  const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );

      return { success: true };
    } catch (error: any) {
      console.error("Error updating application status:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (opportunityId) {
      fetchApplications();
    }
  }, [opportunityId]);

  return {
    applications,
    isLoading,
    updateApplicationStatus,
    refetch: fetchApplications
  };
};

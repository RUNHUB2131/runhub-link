
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
}

export interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    member_count: number;
  } | null;
}

export const fetchOpportunityDetails = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, title, description')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching opportunity details:", error);
    throw error;
  }
};

export const fetchApplications = async (opportunityId: string) => {
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
          .select('club_name, location, member_count')
          .eq('id', app.run_club_id)
          .single();

        return {
          ...app,
          run_club_profile: profileError ? null : profileData
        };
      })
    );

    return appsWithProfiles;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected") => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

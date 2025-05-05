
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

export const fetchRunClubApplications = async (runClubId: string) => {
  try {
    // Fetch applications for this run club
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*, opportunities:opportunity_id(id, title, description, brand_id, reward, deadline, created_at)')
      .eq('run_club_id', runClubId);

    if (appError) throw appError;

    // Get brand details for each opportunity
    const applicationsWithBrands = await Promise.all(
      (appData || []).map(async (app) => {
        // Fetch brand profile for this opportunity
        if (app.opportunities?.brand_id) {
          const { data: brandData, error: brandError } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('id', app.opportunities.brand_id)
            .single();
          
          return {
            ...app,
            status: app.status as "pending" | "accepted" | "rejected",
            opportunities: {
              ...app.opportunities,
              brand: brandError ? null : brandData
            }
          };
        }
        
        return {
          ...app,
          status: app.status as "pending" | "accepted" | "rejected",
        };
      })
    );

    return applicationsWithBrands;
  } catch (error) {
    console.error("Error fetching run club applications:", error);
    throw error;
  }
};

export const withdrawApplication = async (applicationId: string) => {
  try {
    console.log("Withdrawing application with ID:", applicationId);
    
    // Get the application details first (including opportunity_id) before deleting
    const { data: applicationData, error: fetchError } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('id', applicationId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching application before withdrawal:", fetchError);
      throw fetchError;
    }
    
    // Now delete the application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error("Error deleting application:", deleteError);
      throw deleteError;
    }
    
    console.log("Application successfully withdrawn:", applicationId);
    
    return { 
      success: true, 
      opportunityId: applicationData?.opportunity_id 
    };
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw error;
  }
};

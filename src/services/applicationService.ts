import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types";
import { createChatForApplication } from "./chat/chatListService";
import { toast } from "@/hooks/use-toast";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
}

export interface RunClubApplication extends Application {
  run_club_profile?: {
    club_name: string;
    location: string;
    city?: string;
    state?: string;
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
    console.log("Fetching applications for opportunity:", opportunityId);
    
    // First fetch the applications
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('opportunity_id', opportunityId);

    if (appError) throw appError;
    console.log("Fetched applications:", appData);

    // Initialize applications array with proper typing for status
    const initialApps: RunClubApplication[] = (appData || []).map(app => ({
      ...app,
      status: app.status as "pending" | "accepted" | "rejected"
    }));
    
    // Now fetch the run club profile data for each application
    const appsWithProfiles = await Promise.all(
      initialApps.map(async (app) => {
        console.log("Fetching profile for run club:", app.run_club_id);
        const { data: profileData, error: profileError } = await supabase
          .from('run_club_profiles')
          .select('club_name, location, member_count')
          .eq('id', app.run_club_id)
          .single();

        console.log("Fetched run club profile:", profileData, profileError);

        return {
          ...app,
          run_club_profile: profileError ? null : profileData
        };
      })
    );

    console.log("Final applications with profiles:", appsWithProfiles);
    return appsWithProfiles;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

export const updateApplicationStatus = async (applicationId: string, status: "accepted" | "rejected") => {
  try {
    console.log("Starting application status update for:", applicationId, "to status:", status);
    
    // First get the application details to get the opportunity_id, brand_id, and run_club_id
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('opportunity_id, run_club_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error("Error fetching application details:", fetchError);
      throw fetchError;
    }
    
    console.log("Fetched application details:", application);

    // Get the opportunity details to get the brand_id and title
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('brand_id, title')
      .eq('id', application.opportunity_id)
      .single();

    if (oppError) {
      console.error("Error fetching opportunity details:", oppError);
      throw oppError;
    }
    
    console.log("Fetched opportunity details:", opportunity);

    // Update the application status
    // Note: Database trigger will automatically create notifications
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (updateError) {
      console.error("Error updating application status:", updateError);
      throw updateError;
    }
    
    console.log("Successfully updated application status");

    // If the application is accepted, create a chat
    if (status === 'accepted') {
      console.log("Creating chat for accepted application");
      try {
        const chat = await createChatForApplication(
          applicationId,
          application.opportunity_id,
          opportunity.brand_id,
          application.run_club_id
        );
        console.log("Successfully created chat:", chat);
      } catch (chatError) {
        console.error("Error creating chat:", chatError);
        throw chatError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    throw error;
  }
};

export const fetchRunClubApplications = async (runClubId: string) => {
  try {
    console.log("Fetching applications for run club:", runClubId);
    
    // First fetch the applications with opportunity data
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        opportunities:opportunity_id(
          id, 
          title, 
          brand_id, 
          club_incentives, 
          submission_deadline, 
          target_launch_date
        )
      `)
      .eq('run_club_id', runClubId);

    if (appError) throw appError;
    console.log("Fetched applications:", appData);

    // Then fetch the run club profile data
    const { data: profileData, error: profileError } = await supabase
      .from('run_club_profiles')
      .select('club_name, location, member_count')
      .eq('id', runClubId)
      .single();

    console.log("Fetched run club profile:", profileData, profileError);

    // Get brand details for each opportunity and combine with run club profile
    const applicationsWithBrands = await Promise.all(
      (appData || []).map(async (app) => {
        if (app.opportunities?.brand_id) {
          const { data: brandData, error: brandError } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('id', app.opportunities.brand_id)
            .single();
          
          return {
            ...app,
            status: app.status as "pending" | "accepted" | "rejected",
            run_club_profile: profileError ? null : profileData,
            opportunities: {
              ...app.opportunities,
              brand: brandError ? null : brandData
            }
          };
        }
        
        return {
          ...app,
          status: app.status as "pending" | "accepted" | "rejected",
          run_club_profile: profileError ? null : profileData
        };
      })
    );

    console.log("Final applications with all data:", applicationsWithBrands);
    return applicationsWithBrands;
  } catch (error) {
    console.error("Error fetching run club applications:", error);
    throw error;
  }
};

export const withdrawApplication = async (applicationId: string) => {
  try {
    console.log("Withdrawing application:", applicationId);
    
    // First, get the opportunity ID associated with this application
    const { data: applicationData, error: fetchError } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('id', applicationId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching application:", fetchError);
      throw fetchError;
    }
    
    const opportunityId = applicationData?.opportunity_id;
    console.log("Found opportunity ID:", opportunityId);
    
    // Now delete the application
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error("Error deleting application:", deleteError);
      throw deleteError;
    }
    
    console.log("Application successfully deleted");
    
    return { 
      success: true,
      opportunityId // Return the opportunity ID for navigation purposes
    };
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw error;
  }
};

export const markApplicationsAsSeen = async (opportunityId: string) => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ seen_by_brand: true })
      .eq('opportunity_id', opportunityId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error marking applications as seen:", error);
    throw error;
  }
};

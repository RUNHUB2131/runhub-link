
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, Application, RunClubProfile } from "@/types";
import OpportunityApplicationsTable from "@/components/opportunities/OpportunityApplicationsTable";
import OpportunityDetailsSkeleton from "@/components/opportunities/OpportunityDetailsSkeleton";
import OpportunityNotFound from "@/components/opportunities/OpportunityNotFound";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";
import OpportunityActionButton from "@/components/opportunities/OpportunityActionButton";
import OpportunityDetailsContent from "@/components/opportunities/OpportunityDetailsContent";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { isProfileComplete } from "@/utils/profileCompletionUtils";

const OpportunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});

  useEffect(() => {
    if (id) {
      fetchOpportunityDetails();
    }
  }, [id]);
  
  // Fetch the run club profile if the user is a run club
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || userType !== 'run_club') return;
      
      try {
        const profileData = await fetchRunClubProfile(user.id);
        if (profileData) {
          // Ensure profileData is properly typed as Partial<RunClubProfile>
          setRunClubProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching run club profile:", error);
      }
    };
    
    loadProfile();
  }, [user?.id, userType]);

  const fetchOpportunityDetails = async () => {
    if (!id || !user) return;
    
    setIsLoading(true);
    try {
      // First fetch the opportunity
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (opportunityError) throw opportunityError;
      
      // Then fetch the brand information separately
      const { data: brandData, error: brandError } = await supabase
        .from('brand_profiles')
        .select('company_name, logo_url')
        .eq('id', opportunityData.brand_id)
        .single();
      
      // Combine the data
      const completeOpportunity: Opportunity = {
        ...opportunityData,
        brand: brandError ? {
          company_name: "Unknown Brand",
          logo_url: undefined
        } : brandData
      };
      
      setOpportunity(completeOpportunity);
      
      // For run clubs, check if they've already applied
      if (userType === 'run_club') {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('id, status, created_at, opportunity_id, run_club_id')
          .eq('opportunity_id', id)
          .eq('run_club_id', user.id)
          .maybeSingle();
        
        if (appError) console.error("Error checking application:", appError);
        
        if (appData) {
          // Ensure status is of the correct type
          if (appData.status === 'pending' || appData.status === 'accepted' || appData.status === 'rejected') {
            setApplication(appData as Application);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching opportunity details:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details",
        variant: "destructive",
      });
      navigate("/opportunities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !opportunity) return;
    
    // Check if profile is complete before applying
    if (!isProfileComplete(runClubProfile)) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before applying",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunity.id,
          run_club_id: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted",
      });
      
      setApplication({
        id: 'new', // Placeholder ID until we refresh
        opportunity_id: opportunity.id,
        run_club_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      // Redirect to my applications page after successful application
      navigate('/applications');
    } catch (error: any) {
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <OpportunityDetailsSkeleton />;
  }

  if (!opportunity) {
    return <OpportunityNotFound />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{opportunity?.title}</h1>
          <OpportunityBrandInfo opportunity={opportunity} />
        </div>
        
        <OpportunityActionButton 
          userType={userType}
          userId={user?.id}
          brandId={opportunity.brand_id}
          opportunityId={opportunity.id}
          application={application}
          isApplying={isApplying}
          handleApply={handleApply}
          showApplications={showApplications}
          setShowApplications={setShowApplications}
          runClubProfile={runClubProfile}
        />
      </div>
      
      <OpportunityDetailsContent opportunity={opportunity} />
    </div>
  );
};

export default OpportunityDetails;

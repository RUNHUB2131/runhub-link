
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, Application } from "@/types";
import OpportunityApplicationsTable from "@/components/opportunities/OpportunityApplicationsTable";

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

  useEffect(() => {
    if (id) {
      fetchOpportunityDetails();
    }
  }, [id]);

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
      
      // Refresh to get the actual application data
      fetchOpportunityDetails();
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

  const renderActionButton = () => {
    if (userType === 'run_club') {
      if (application) {
        return (
          <Button disabled className="w-full md:w-auto">
            Application {application.status}
          </Button>
        );
      } else {
        return (
          <Button 
            onClick={handleApply} 
            disabled={isApplying} 
            className="w-full md:w-auto"
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
        );
      }
    } else if (userType === 'brand' && opportunity?.brand_id === user?.id) {
      return (
        <Button 
          variant="outline"
          onClick={() => setShowApplications(!showApplications)} 
          className="w-full md:w-auto"
        >
          {showApplications ? "Hide Applications" : "View Applications"}
        </Button>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Opportunity not found</h2>
        <p className="text-gray-500 mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/opportunities")}>
          Back to Opportunities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{opportunity?.title}</h1>
          {opportunity?.brand && (
            <div className="flex items-center mt-2">
              {opportunity.brand.logo_url ? (
                <div className="w-6 h-6 rounded overflow-hidden mr-2 bg-gray-100">
                  <img 
                    src={opportunity.brand.logo_url} 
                    alt={opportunity.brand.company_name || "Brand logo"}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center mr-2">
                  {(opportunity.brand.company_name?.[0] || "B").toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-600">
                {opportunity.brand.company_name || "Unknown Brand"}
              </span>
            </div>
          )}
        </div>
        
        {renderActionButton()}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="mt-2 whitespace-pre-line">{opportunity?.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">Reward</h3>
            <div className="mt-2 py-3 px-4 bg-primary/5 rounded-md inline-block">
              <p className="font-medium">{opportunity?.reward}</p>
            </div>
          </div>
          
          {opportunity?.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg">Requirements</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {opportunity.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunity?.deadline && (
              <div>
                <h3 className="font-semibold">Application Deadline</h3>
                <p className="mt-1">{new Date(opportunity.deadline).toLocaleDateString()}</p>
              </div>
            )}
            
            {opportunity?.duration && (
              <div>
                <h3 className="font-semibold">Campaign Duration</h3>
                <p className="mt-1">{opportunity.duration}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold">Posted On</h3>
              <p className="mt-1">{opportunity && new Date(opportunity.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Show Applications Table for Brand Users */}
      {userType === 'brand' && 
       opportunity?.brand_id === user?.id && 
       showApplications && 
       id && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <OpportunityApplicationsTable opportunityId={id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpportunityDetails;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";

const BrowseOpportunities = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userApplications, setUserApplications] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchUserApplications();
    }
  }, [user?.id]);

  // Update to fetch opportunities AFTER we have user applications
  useEffect(() => {
    if (user?.id) {
      fetchOpportunities();
    }
  }, [userApplications]); // Depend on userApplications instead of user.id

  const fetchUserApplications = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch all opportunities this run club has already applied for
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('run_club_id', user.id);
      
      if (applicationsError) throw applicationsError;
      
      // Extract just the opportunity IDs into an array
      const appliedOpportunityIds = (applicationsData || []).map(app => app.opportunity_id);
      setUserApplications(appliedOpportunityIds);
    } catch (error: any) {
      console.error("Error fetching user applications:", error);
    }
  };

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      // First, fetch all opportunities
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (opportunitiesError) throw opportunitiesError;
      
      if (!opportunitiesData) {
        setOpportunities([]);
        return;
      }
      
      // Then, for each opportunity, fetch the brand information separately
      const enhancedOpportunities = await Promise.all(
        opportunitiesData.map(async (opp) => {
          // Get brand profile for each opportunity
          const { data: brandData, error: brandError } = await supabase
            .from('brand_profiles')
            .select('company_name, logo_url')
            .eq('id', opp.brand_id)
            .single();
          
          return {
            ...opp,
            brand: brandError ? {
              company_name: "Unknown Brand",
              logo_url: undefined
            } : brandData
          } as Opportunity;
        })
      );
      
      // Filter out opportunities the user has already applied for
      const filteredOpportunities = enhancedOpportunities.filter(
        opp => !userApplications.includes(opp.id)
      );
      
      setOpportunities(filteredOpportunities);
    } catch (error: any) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOpportunity = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  const handleApply = async (opportunityId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to details page
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          run_club_id: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted",
      });
      
      // Update the userApplications state
      setUserApplications([...userApplications, opportunityId]);
      
      // Remove the opportunity from the list
      setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
      
      // Redirect to applications page
      navigate('/applications');
      
    } catch (error: any) {
      console.error("Error applying to opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Opportunities</h1>
        <p className="text-gray-500 mt-2">Find sponsorship opportunities for your run club</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <Card 
              key={opportunity.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewOpportunity(opportunity.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center mb-2">
                  {opportunity.brand?.logo_url ? (
                    <div className="w-8 h-8 rounded overflow-hidden mr-2 bg-gray-100 flex-shrink-0">
                      <img 
                        src={opportunity.brand.logo_url} 
                        alt={opportunity.brand.company_name || "Brand logo"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center mr-2 flex-shrink-0">
                      {(opportunity.brand?.company_name?.[0] || "B").toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {opportunity.brand?.company_name || "Unknown Brand"}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{opportunity.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  Posted {new Date(opportunity.created_at).toLocaleDateString()}
                </p>
                <p className="line-clamp-3 text-sm">{opportunity.description}</p>
                <div className="mt-3 py-2 px-3 bg-primary/5 rounded-md">
                  <p className="font-medium">Reward: {opportunity.reward}</p>
                </div>
                {opportunity.deadline && (
                  <p className="text-sm mt-3">
                    <span className="font-medium">Deadline:</span> {new Date(opportunity.deadline).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              
              <CardFooter>
                <div className="w-full flex gap-2">
                  <Button 
                    variant="outline"
                    className="w-1/2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOpportunity(opportunity.id);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="w-1/2"
                    onClick={(e) => handleApply(opportunity.id, e)}
                  >
                    Apply Now
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No opportunities available</h3>
          <p className="text-gray-500">Check back later for new sponsorship opportunities</p>
        </div>
      )}
    </div>
  );
};

export default BrowseOpportunities;

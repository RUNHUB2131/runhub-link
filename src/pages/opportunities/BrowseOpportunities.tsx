
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import EmptyOpportunities from "@/components/opportunities/EmptyOpportunities";
import OpportunitiesLoading from "@/components/opportunities/OpportunitiesLoading";

const BrowseOpportunities = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

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
      
      setOpportunities(enhancedOpportunities);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Browse Opportunities</h1>
        <Button className="bg-[#0040FF] hover:bg-[#0033cc]">
          <Search className="h-4 w-4 mr-2" />
          Find Opportunities
        </Button>
      </div>
      
      {isLoading ? (
        <OpportunitiesLoading />
      ) : opportunities.length > 0 ? (
        <div className="space-y-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard 
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))}
        </div>
      ) : (
        <EmptyOpportunities />
      )}
    </div>
  );
};

export default BrowseOpportunities;

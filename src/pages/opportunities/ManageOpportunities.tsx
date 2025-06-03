import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { fetchOpportunities } from "@/services/opportunityService";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import EmptyOpportunities from "@/components/opportunities/EmptyOpportunities";
import OpportunitiesLoading from "@/components/opportunities/OpportunitiesLoading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

// Extended interface for opportunities with additional database fields
interface ExtendedOpportunity {
  id: string;
  brand_id: string;
  activation_overview: string;
  target_launch_date: string;
  club_incentives: string;
  created_at: string;
  applications_count?: number;
  unseen_applications_count?: number;
  unique_views_count?: number;
  title: string;
  submission_deadline: string;
}

const ManageOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<ExtendedOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadOpportunities();
    }
  }, [user?.id]);

  const loadOpportunities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await fetchOpportunities(user.id);
      setOpportunities(data as ExtendedOpportunity[]);
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

  const handleAddOpportunity = () => {
    navigate("/opportunities/add");
  };
  
  return (
    <PageContainer>
      <PageHeader 
        title="Manage Opportunities"
      >
        <Button onClick={handleAddOpportunity} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </PageHeader>
      
      {isLoading ? (
        <OpportunitiesLoading />
      ) : opportunities.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard 
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))}
        </div>
      ) : (
        <EmptyOpportunities onAddOpportunity={handleAddOpportunity} />
      )}
    </PageContainer>
  );
};

export default ManageOpportunities;

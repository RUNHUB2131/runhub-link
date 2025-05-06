
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { fetchOpportunities } from "@/services/opportunityService";
import { Opportunity } from "@/types"; // Import from types instead of service
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import EmptyOpportunities from "@/components/opportunities/EmptyOpportunities";
import OpportunitiesLoading from "@/components/opportunities/OpportunitiesLoading";

const ManageOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
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
      setOpportunities(data);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Opportunities</h1>
        <Button onClick={handleAddOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
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
        <EmptyOpportunities onAddOpportunity={handleAddOpportunity} />
      )}
    </div>
  );
};

export default ManageOpportunities;

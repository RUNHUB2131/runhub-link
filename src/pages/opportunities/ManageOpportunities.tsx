
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string | null;
  created_at: string;
  applications_count?: number;
}

const ManageOpportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, [user?.id]);

  const fetchOpportunities = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch opportunities created by this brand
      const { data: opportunitiesData, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get application counts for each opportunity
      const opportunitiesWithCounts = await Promise.all(
        (opportunitiesData || []).map(async (opp) => {
          const { count, error: countError } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('opportunity_id', opp.id);
          
          return {
            ...opp,
            applications_count: count || 0
          };
        })
      );
      
      setOpportunities(opportunitiesWithCounts);
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

  const handleViewOpportunity = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Opportunities</h1>
        <Button onClick={handleAddOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
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
            <Card key={opportunity.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{opportunity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </p>
                <p className="line-clamp-3 text-sm">{opportunity.description}</p>
                <p className="mt-2 font-medium">Reward: {opportunity.reward}</p>
                <p className="text-sm text-primary mt-2">
                  {opportunity.applications_count} application{opportunity.applications_count === 1 ? '' : 's'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewOpportunity(opportunity.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
          <p className="text-gray-500 mb-4">Create your first sponsorship opportunity to connect with run clubs</p>
          <Button onClick={handleAddOpportunity}>
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManageOpportunities;

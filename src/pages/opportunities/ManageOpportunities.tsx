
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Eye, Edit } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string | null;
  duration: string | null;
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

  const handleViewApplications = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    navigate(`/opportunities/applications/${id}`);
  };

  const handleEditOpportunity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    // This would navigate to an edit page if one exists
    navigate(`/opportunities/${id}`);
  };

  const getOpportunityType = (opportunity: Opportunity) => {
    // This is a placeholder logic - you might want to determine type based on actual data
    return opportunity.title.toLowerCase().includes('sponsor') ? 'Sponsorship' : 'Event';
  };

  const isNew = (createdAt: string) => {
    // Consider opportunities created in the last 7 days as "new"
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(createdAt) > oneWeekAgo;
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return `Complete by ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
  };

  const formatDuration = (duration: string | null) => {
    return duration ? `${duration}` : "No duration set";
  };

  const isActive = (deadline: string | null) => {
    if (!deadline) return true; // If no deadline, consider active
    return new Date(deadline) > new Date();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Opportunities</h1>
        <Button onClick={handleAddOpportunity} className="bg-[#f26640] hover:bg-[#d9572f]">
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="space-y-6">
          {opportunities.map((opportunity) => {
            const opportunityType = getOpportunityType(opportunity);
            return (
              <div 
                key={opportunity.id}
                className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewOpportunity(opportunity.id)}
              >
                <div className="p-6">
                  <div className="flex flex-row justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge 
                          className="bg-[#FEC6A1] text-[#7d4829] hover:bg-[#FEC6A1]"
                        >
                          {opportunityType}
                        </Badge>
                        
                        {isNew(opportunity.created_at) && (
                          <Badge 
                            className="bg-[#F2FCE2] text-[#4c7520] hover:bg-[#F2FCE2]"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-semibold">{opportunity.title}</h2>
                      <p className="text-gray-600 line-clamp-1">{opportunity.description}</p>
                    </div>
                    
                    <div className="text-[#f26640] font-bold text-2xl">
                      {opportunity.reward.startsWith('$') ? opportunity.reward : `$${opportunity.reward}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center text-gray-500">
                      <span className="mr-2">
                        {formatDeadline(opportunity.deadline)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <span className="mr-2">
                        {formatDuration(opportunity.duration)}
                      </span>
                    </div>
                    
                    {isActive(opportunity.deadline) && (
                      <div className="text-green-600">Active</div>
                    )}
                    
                    <div className="ml-auto flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleViewApplications(opportunity.id, e)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Applications
                        <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-xs">
                          {opportunity.applications_count}
                        </span>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleEditOpportunity(opportunity.id, e)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No opportunities yet</h3>
          <p className="text-gray-500 mb-4">Create your first sponsorship opportunity to connect with run clubs</p>
          <Button onClick={handleAddOpportunity} className="bg-[#f26640] hover:bg-[#d9572f]">
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManageOpportunities;

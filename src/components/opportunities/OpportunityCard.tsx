import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewOpportunity = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  const handleViewApplications = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/opportunities/applications/${opportunity.id}`);
  };

  const handleEditOpportunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If there are applications, don't allow editing
    if (opportunity.applications_count && opportunity.applications_count > 0) {
      toast({
        title: "Cannot edit opportunity",
        description: "This opportunity cannot be edited because it has received applications.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/opportunities/edit/${opportunity.id}`);
  };

  const isNew = (createdAt: string) => {
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
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  const getOpportunityType = () => {
    return opportunity.title.toLowerCase().includes('sponsor') ? 'Sponsorship' : 'Event';
  };

  // Determine if the opportunity can be edited
  const canEdit = !opportunity.applications_count || opportunity.applications_count === 0;

  return (
    <div 
      className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewOpportunity}
    >
      <div className="p-6">
        <div className="flex flex-row justify-between items-start">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge 
                className="bg-primary-100 text-primary-800 hover:bg-primary-100"
              >
                {getOpportunityType()}
              </Badge>
              
              {isNew(opportunity.created_at) && (
                <Badge 
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  New
                </Badge>
              )}
            </div>
            
            <h2 className="text-xl font-semibold">{opportunity.title}</h2>
            <p className="text-gray-600 line-clamp-1">{opportunity.description}</p>
          </div>
          
          <div className="text-primary-500 font-bold text-2xl">
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
              onClick={handleViewApplications}
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
              onClick={handleEditOpportunity}
              className={!canEdit ? "opacity-50" : ""}
              title={!canEdit ? "Cannot edit opportunities that have applications" : "Edit opportunity"}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;

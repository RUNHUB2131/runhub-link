import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit, Eye } from "lucide-react";
import { markApplicationsAsSeen } from "@/services/applicationService";
import { useAuth } from "@/contexts/AuthContext";

interface Opportunity {
  id: string;
  brand_id: string;
  activation_overview: string;
  target_launch_date: string;
  club_incentives: string;
  created_at: string;
  applications_count?: number;
  unseen_applications_count?: number;
  title: string;
  submission_deadline: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewOpportunity = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  const handleViewApplications = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user && user.id === opportunity.brand_id) {
      try {
        await markApplicationsAsSeen(opportunity.id);
      } catch (error) {
        console.error("Failed to mark applications as seen:", error);
      }
    }
    navigate(`/opportunities/${opportunity.id}/applications`);
  };

  const handleEditOpportunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/opportunities/${opportunity.id}`);
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
    return opportunity.activation_overview.toLowerCase().includes('sponsor') ? 'Sponsorship' : 'Event';
  };

  // Debug: Log applications_count value and type for all cards
  console.log('OpportunityCard:', {
    id: opportunity.id,
    applications_count: opportunity.applications_count,
    coerced: Number(opportunity.applications_count),
    type: typeof opportunity.applications_count
  });

  // Debug: Log unseen_applications_count value and type for all cards
  console.log('OpportunityCard unseen:', {
    id: opportunity.id,
    unseen_applications_count: opportunity.unseen_applications_count,
    coerced: Number(opportunity.unseen_applications_count),
    type: typeof opportunity.unseen_applications_count
  });

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
                Activation
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
            <div className="text-gray-600">
              <span className="font-medium">Incentive:</span> {opportunity.club_incentives}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Application Due:</span> {opportunity.submission_deadline}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Activation Launch:</span> {opportunity.target_launch_date}
            </div>
          </div>
          <div className="ml-auto flex gap-2 items-start">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleViewApplications}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Applications
              {Number(opportunity.applications_count) > 0 && (
                <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-xs">
                  {opportunity.applications_count}
                </span>
              )}
              {Number(opportunity.applications_count) === 0 && (
                <span className="ml-1 bg-yellow-200 px-1.5 py-0.5 rounded-full text-xs">
                  ZERO
                </span>
              )}
              {typeof opportunity.unseen_applications_count === 'number' && opportunity.unseen_applications_count > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  New
                </span>
              )}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleEditOpportunity}
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

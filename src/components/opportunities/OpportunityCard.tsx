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
  unique_views_count?: number;
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
    navigate(`/opportunities/${opportunity.id}/edit`);
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

  // Check if editing should be allowed (no applications)
  const hasApplications = Number(opportunity.applications_count) > 0;

  return (
    <div 
      className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewOpportunity}
    >
      <div className="p-4 sm:p-6">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0">
          {/* Main content */}
          <div className="flex-1 space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
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
            
            {/* Title */}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
              {opportunity.title}
            </h2>
            
            {/* Details */}
            <div className="space-y-2 text-sm sm:text-base">
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
          </div>
          
          {/* Actions and Stats - Stack on mobile, side-by-side on larger screens */}
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:space-y-0 lg:space-x-4 lg:ml-6">
            {/* Action buttons with view count inline */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0">
              {/* View count and Applications button in same row on mobile */}
              <div className="flex items-center space-x-2 sm:space-x-0 sm:block lg:flex lg:space-x-2">
                {/* View count display - inline with buttons */}
                {typeof opportunity.unique_views_count === 'number' && opportunity.unique_views_count > 0 && (
                  <div className="flex items-center text-gray-500 text-sm whitespace-nowrap">
                    <span>{opportunity.unique_views_count} {opportunity.unique_views_count === 1 ? 'view' : 'views'}</span>
                  </div>
                )}
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleViewApplications}
                  className="flex items-center justify-center w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="flex-1 sm:flex-none">Applications</span>
                  {Number(opportunity.applications_count) > 0 && (
                    <span className="ml-1 bg-gray-100 px-1.5 py-0.5 rounded-full text-xs flex-shrink-0">
                      {opportunity.applications_count}
                    </span>
                  )}
                  {Number(opportunity.applications_count) === 0 && (
                    <span className="ml-1 bg-yellow-200 px-1.5 py-0.5 rounded-full text-xs flex-shrink-0">
                      ZERO
                    </span>
                  )}
                  {typeof opportunity.unseen_applications_count === 'number' && opportunity.unseen_applications_count > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs flex-shrink-0">
                      New
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Only show edit button if there are no applications */}
              {!hasApplications && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleEditOpportunity}
                  className="flex items-center justify-center w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;

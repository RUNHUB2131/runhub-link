import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Calendar, Target, MapPin, Star } from "lucide-react";
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
  geographic_locations?: string[];
  club_size_preference?: string;
  online_reach_preference?: string;
  is_targeted?: boolean;
  target_club_name?: string | null;
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

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return deadlineDate <= threeDaysFromNow && deadlineDate > new Date();
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (isExpired(opportunity.submission_deadline)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isDeadlineApproaching(opportunity.submission_deadline)) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Deadline Soon</Badge>;
    }
    if (isNew(opportunity.created_at)) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const getApplicationsStatus = () => {
    const count = Number(opportunity.applications_count) || 0;
    if (count === 0) {
      return <Badge variant="outline" className="text-gray-500">No Applications</Badge>;
    }
    if (count >= 10) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">High Interest</Badge>;
    }
    return null;
  };

  const getLocationDisplay = () => {
    if (opportunity.geographic_locations && opportunity.geographic_locations.length > 0) {
      return opportunity.geographic_locations.slice(0, 2).join(", ");
    }
    return "Location not specified";
  };

  const hasApplications = Number(opportunity.applications_count) > 0;

  return (
    <div 
      className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={handleViewOpportunity}
    >
      <div className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header with badges and view count */}
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {getStatusBadge()}
              {getApplicationsStatus()}
              {opportunity.is_targeted && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Targeted
                </Badge>
              )}
            </div>
            {typeof opportunity.unique_views_count === 'number' && opportunity.unique_views_count > 0 && (
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                <span>{opportunity.unique_views_count} view{opportunity.unique_views_count !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          {/* Title and key details */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">
              {opportunity.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Due:</span>
                <span className="ml-1">{formatDate(opportunity.submission_deadline)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Launch:</span>
                <span className="ml-1">{formatDate(opportunity.target_launch_date)}</span>
              </div>
              
              <div className="flex items-center text-gray-600 md:col-span-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span className="ml-1 truncate">{getLocationDisplay()}</span>
              </div>
              
              {opportunity.is_targeted && opportunity.target_club_name && (
                <div className="flex items-center text-gray-600 md:col-span-2">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="font-medium">Sent to:</span>
                  <span className="ml-1 truncate font-medium text-yellow-700">{opportunity.target_club_name}</span>
                </div>
              )}
            </div>
            
            {/* Incentive highlight */}
            <div className="bg-primary-50 rounded-md p-3">
              <p className="text-sm">
                <span className="font-medium text-primary-700">Incentive:</span>
                <span className="ml-2 text-gray-700">{opportunity.club_incentives}</span>
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleViewApplications}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span>Applications</span>
              {Number(opportunity.applications_count) > 0 && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                  {opportunity.applications_count}
                </span>
              )}
              {typeof opportunity.unseen_applications_count === 'number' && opportunity.unseen_applications_count > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {opportunity.unseen_applications_count} new
                </span>
              )}
            </Button>
            
            {!hasApplications && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleEditOpportunity}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;

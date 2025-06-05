import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Users, 
  Clock, 
  Calendar, 
  Target, 
  MapPin, 
  Edit,
  FileText
} from "lucide-react";

interface OpportunityDetailsContentProps {
  opportunity: Opportunity;
}

interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  unseen: number;
}

interface PerformanceMetrics {
  views: number;
  applications: ApplicationStats;
}

const OpportunityDetailsContent = ({ opportunity }: OpportunityDetailsContentProps) => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is the brand viewing their own opportunity
  const isBrandOwner = userType === 'brand' && user?.id === opportunity.brand_id;

  useEffect(() => {
    if (isBrandOwner) {
      fetchPerformanceMetrics();
    } else {
      setIsLoading(false);
    }
  }, [isBrandOwner, opportunity.id]);

  const fetchPerformanceMetrics = async () => {
    try {
      // Fetch view count
      const { count: viewCount } = await supabase
        .from('opportunity_views')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', opportunity.id);

      // Fetch application stats
      const { data: applications } = await supabase
        .from('applications')
        .select('status, seen_by_brand')
        .eq('opportunity_id', opportunity.id);

      const appStats: ApplicationStats = {
        total: applications?.length || 0,
        pending: applications?.filter(app => app.status === 'pending').length || 0,
        accepted: applications?.filter(app => app.status === 'accepted').length || 0,
        rejected: applications?.filter(app => app.status === 'rejected').length || 0,
        unseen: applications?.filter(app => !app.seen_by_brand).length || 0,
      };

      setMetrics({
        views: viewCount || 0,
        applications: appStats
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDeadlineStatus = () => {
    const deadline = new Date(opportunity.submission_deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', message: 'Deadline passed', color: 'destructive' };
    } else if (diffDays <= 3) {
      return { status: 'urgent', message: `${diffDays} day${diffDays !== 1 ? 's' : ''} left`, color: 'amber' };
    } else if (diffDays <= 7) {
      return { status: 'soon', message: `${diffDays} days left`, color: 'blue' };
    } else {
      return { status: 'active', message: `${diffDays} days left`, color: 'green' };
    }
  };

  const deadlineInfo = getDeadlineStatus();
  const hasApplications = metrics?.applications.total && metrics.applications.total > 0;

  // Brand owner view - focused on performance and management
  if (isBrandOwner) {
    return (
      <div className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '...' : metrics?.views || 0}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '...' : metrics?.applications.total || 0}</p>
                  <p className="text-sm text-gray-600">Applications</p>
                  {metrics?.applications.unseen > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {metrics.applications.unseen} new
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Summary & Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Opportunity Overview
              </CardTitle>
              <div className="flex gap-2">
                {!hasApplications && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/opportunities/${opportunity.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/opportunities/${opportunity.id}/applications`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Applications
                  {metrics?.applications.total && metrics.applications.total > 0 && (
                    <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                      {metrics.applications.total}
                    </span>
                  )}
                  {metrics?.applications.unseen > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {metrics.applications.unseen} new
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Application Deadline:</span>
                  <Badge 
                    variant={deadlineInfo.color === 'destructive' ? 'destructive' : 'outline'}
                    className={
                      deadlineInfo.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                      deadlineInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      deadlineInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''
                    }
                  >
                    {deadlineInfo.message}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Launch Date:</span>
                  <span className="text-gray-600">{formatDate(opportunity.target_launch_date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span className="text-gray-600">
                    {opportunity.geographic_locations?.slice(0, 2).join(", ") || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Club Size Preference:</span>
                  <span className="ml-2 text-gray-600">{opportunity.club_size_preference}</span>
                </div>
                <div>
                  <span className="font-medium">Online Reach:</span>
                  <span className="ml-2 text-gray-600">{opportunity.online_reach_preference}</span>
                </div>
                <div>
                  <span className="font-medium">Primary Objective:</span>
                  <span className="ml-2 text-gray-600">{opportunity.primary_objective}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-700">Incentive Offering</p>
                  <p className="text-sm text-gray-700 mt-1">{opportunity.club_incentives}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        {metrics?.applications.total && metrics.applications.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{metrics.applications.pending}</p>
                  <p className="text-sm text-amber-700">Pending Review</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{metrics.applications.accepted}</p>
                  <p className="text-sm text-green-700">Accepted</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{metrics.applications.rejected}</p>
                  <p className="text-sm text-red-700">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete opportunity details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Opportunity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activation Overview */}
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-2">Activation Overview</h4>
              <p className="text-gray-700 whitespace-pre-line">{opportunity.activation_overview}</p>
            </div>

            {/* Content & Media Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-2">Content Specifications</h4>
                <p className="text-gray-700 whitespace-pre-line">{opportunity.content_specifications}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-2">Professional Media Requirements</h4>
                <p className="text-gray-700">{opportunity.professional_media}</p>
                {opportunity.media_requirements && (
                  <p className="text-sm text-gray-600 mt-2">{opportunity.media_requirements}</p>
                )}
              </div>
            </div>

            {/* Responsibilities & Incentives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-2">Club Responsibilities</h4>
                <p className="text-gray-700 whitespace-pre-line">{opportunity.club_responsibilities}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-2">Club Incentives</h4>
                <p className="text-gray-700 whitespace-pre-line">{opportunity.club_incentives}</p>
              </div>
            </div>

            {/* Target Criteria */}
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-3">Target Club Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Geographic Locations:</span>
                  <p className="text-gray-900 mt-1">{opportunity.geographic_locations?.join(", ") || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Club Size Preference:</span>
                  <p className="text-gray-900 mt-1">{opportunity.club_size_preference}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Online Reach Preference:</span>
                  <p className="text-gray-900 mt-1">{opportunity.online_reach_preference}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-3">Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4">
                <div>
                  <span className="text-sm font-medium text-blue-700">Target Launch Date:</span>
                  <p className="text-blue-900 mt-1">{formatDate(opportunity.target_launch_date)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-700">Posted On:</span>
                  <p className="text-blue-900 mt-1">{formatDate(opportunity.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {opportunity.additional_notes && (
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-2">Additional Notes</h4>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{opportunity.additional_notes}</p>
                </div>
              </div>
            )}

            {/* Primary Objective */}
            <div>
              <h4 className="font-semibold text-gray-900 text-base mb-2">Primary Objective</h4>
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-primary-700 font-medium">{opportunity.primary_objective}</p>
                {opportunity.primary_objective_other && (
                  <p className="text-primary-600 mt-2">{opportunity.primary_objective_other}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Original view for run clubs viewing opportunities
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg">Activation Overview</h3>
          <p className="mt-2 whitespace-pre-line">{opportunity?.activation_overview}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Content Specifications</h3>
          <p className="mt-2 whitespace-pre-line">{opportunity?.content_specifications}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Professional Media Requirements</h3>
          <p className="mt-2">{opportunity?.professional_media}</p>
          {opportunity?.media_requirements && (
            <p className="mt-1 text-sm text-gray-600">{opportunity.media_requirements}</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg">Club Responsibilities</h3>
          <p className="mt-2 whitespace-pre-line">{opportunity?.club_responsibilities}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Club Incentives</h3>
          <p className="mt-2 whitespace-pre-line">{opportunity?.club_incentives}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Target Club Criteria</h3>
          <div className="mt-2">
            <span className="font-medium">Geographic Locations:</span> {opportunity?.geographic_locations?.join(", ")}
          </div>
          <div>
            <span className="font-medium">Club Size Preference:</span> {opportunity?.club_size_preference}
          </div>
          <div>
            <span className="font-medium">Online Reach Preference:</span> {opportunity?.online_reach_preference}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Target Launch Date</h3>
            <p className="mt-1">{opportunity?.target_launch_date}</p>
          </div>
          <div>
            <h3 className="font-semibold">Posted On</h3>
            <p className="mt-1">{opportunity && new Date(opportunity.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {opportunity?.additional_notes && (
          <div>
            <h3 className="font-semibold text-lg">Additional Notes</h3>
            <p className="mt-2 whitespace-pre-line">{opportunity.additional_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunityDetailsContent;

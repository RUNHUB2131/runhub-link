
import { Application } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OpportunityBrandInfo from "@/components/opportunities/OpportunityBrandInfo";

interface ApplicationWithOpportunity extends Application {
  opportunities?: {
    id: string;
    title: string;
    description: string;
    brand_id: string;
    reward: string;
    deadline: string | null;
    created_at: string;
    brand?: {
      company_name: string;
      logo_url?: string;
    } | null;
  };
}

interface ApplicationCardProps {
  application: ApplicationWithOpportunity;
}

const ApplicationCard = ({ application }: ApplicationCardProps) => {
  const navigate = useNavigate();

  if (!application.opportunities) {
    return null;
  }

  const opportunity = application.opportunities;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FEC6A1] text-[#7d4829] hover:bg-[#FEC6A1]';
      case 'accepted':
        return 'bg-[#F2FCE2] text-[#4c7520] hover:bg-[#F2FCE2]';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  const viewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div>
                <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                {/* Use OpportunityBrandInfo component to display brand information */}
                <OpportunityBrandInfo opportunity={{
                  brand_id: opportunity.brand_id,
                  brand: opportunity.brand || null
                } as any} />
              </div>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={getStatusBadgeClass(application.status)}
          >
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm line-clamp-2">{opportunity.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div>
              <strong>Reward:</strong> {opportunity.reward}
            </div>
            {opportunity.deadline && (
              <div>
                <strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}
              </div>
            )}
            <div>
              <strong>Applied on:</strong> {new Date(application.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          onClick={() => viewOpportunity(opportunity.id)}
        >
          View Opportunity
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;

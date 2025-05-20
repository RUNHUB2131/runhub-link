import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Opportunity } from "@/types";

interface OpportunityDetailsContentProps {
  opportunity: Opportunity;
}

const OpportunityDetailsContent = ({ opportunity }: OpportunityDetailsContentProps) => {
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

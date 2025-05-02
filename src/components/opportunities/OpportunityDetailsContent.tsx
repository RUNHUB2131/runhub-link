
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
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="mt-2 whitespace-pre-line">{opportunity?.description}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">Reward</h3>
          <div className="mt-2 py-3 px-4 bg-primary/5 rounded-md inline-block">
            <p className="font-medium">{opportunity?.reward}</p>
          </div>
        </div>
        
        {opportunity?.requirements && opportunity.requirements.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg">Requirements</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {opportunity.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunity?.deadline && (
            <div>
              <h3 className="font-semibold">Application Deadline</h3>
              <p className="mt-1">{new Date(opportunity.deadline).toLocaleDateString()}</p>
            </div>
          )}
          
          {opportunity?.duration && (
            <div>
              <h3 className="font-semibold">Campaign Duration</h3>
              <p className="mt-1">{opportunity.duration}</p>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold">Posted On</h3>
            <p className="mt-1">{opportunity && new Date(opportunity.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityDetailsContent;

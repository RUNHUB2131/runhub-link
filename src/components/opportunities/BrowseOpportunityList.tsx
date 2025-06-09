import BrowseOpportunityCard from "./BrowseOpportunityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Opportunity, RunClubProfile } from "@/types";

interface BrowseOpportunityListProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onApply: (opportunityId: string, pitch: string) => void;
  runClubProfile?: Partial<RunClubProfile>;
}

const BrowseOpportunityList = ({
  opportunities,
  isLoading,
  onApply,
  runClubProfile
}: BrowseOpportunityListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No opportunities available</h3>
        <p className="text-gray-500">Check back later for new sponsorship opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {opportunities.map((opportunity) => (
        <BrowseOpportunityCard 
          key={opportunity.id}
          opportunity={opportunity} 
          onApply={onApply}
          runClubProfile={runClubProfile}
        />
      ))}
    </div>
  );
};

export default BrowseOpportunityList;

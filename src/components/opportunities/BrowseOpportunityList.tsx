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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
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
    <div className="flex flex-col gap-6">
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

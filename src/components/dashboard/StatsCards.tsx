
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserType } from "@/types";

interface StatsCardsProps {
  userType: UserType;
  isLoading: boolean;
  stats: {
    opportunities: number;
    applications: number;
  };
}

export const StatsCards = ({ userType, isLoading, stats }: StatsCardsProps) => {
  if (userType === 'run_club') {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Open Opportunities</CardTitle>
            <CardDescription>Find sponsorship opportunities for your club</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-10 w-16" /> : "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>Track your open applications</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Your currently active sponsorship opportunities</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {isLoading ? <Skeleton className="h-10 w-16" /> : stats.opportunities}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>New Applications</CardTitle>
          <CardDescription>Applications waiting for your review</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
        </CardContent>
      </Card>
    </>
  );
};

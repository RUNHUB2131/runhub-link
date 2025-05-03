
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserType } from "@/types";
import { LayoutGrid, Users } from "lucide-react";

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
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Open Opportunities</CardTitle>
              <LayoutGrid className="h-5 w-5 text-primary-500" />
            </div>
            <CardDescription>Find sponsorship opportunities for your club</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-500">
              {isLoading ? <Skeleton className="h-10 w-16" /> : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Applications</CardTitle>
              <Users className="h-5 w-5 text-primary-500" />
            </div>
            <CardDescription>Track your open applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-500">
              {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Campaigns</CardTitle>
            <LayoutGrid className="h-5 w-5 text-primary-500" />
          </div>
          <CardDescription>Your currently active sponsorship opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-500">
            {isLoading ? <Skeleton className="h-10 w-16" /> : stats.opportunities}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New Applications</CardTitle>
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          <CardDescription>Applications waiting for your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-500">
            {isLoading ? <Skeleton className="h-10 w-16" /> : stats.applications}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

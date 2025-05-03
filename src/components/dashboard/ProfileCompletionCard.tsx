
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileCompletionCardProps {
  isLoading: boolean;
  percentage: number;
}

export const ProfileCompletionCard = ({ isLoading, percentage }: ProfileCompletionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>Add more details to your profile to increase visibility</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-2 w-full" />
        ) : (
          <>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2">{percentage}% complete</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCompletionCardProps {
  isLoading: boolean;
  percentage: number;
}

export const ProfileCompletionCard = ({ isLoading, percentage }: ProfileCompletionCardProps) => {
  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300">
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
                className={`h-2 rounded-full ${percentage < 50 ? 'bg-amber-500' : percentage < 80 ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-medium">{percentage}% complete</p>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-1">
                  Complete profile <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

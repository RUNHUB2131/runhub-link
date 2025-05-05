
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RunClubProfile } from "@/types";
import { getMissingProfileFields } from "@/utils/profileCompletionUtils";

interface ProfileCompletionCardProps {
  isLoading: boolean;
  percentage: number;
  profile?: Partial<RunClubProfile>;
}

export const ProfileCompletionCard = ({ isLoading, percentage, profile = {} }: ProfileCompletionCardProps) => {
  const navigate = useNavigate();
  const missingFields = getMissingProfileFields(profile);

  // If profile is 100% complete, don't show the card
  if (percentage === 100) {
    return null;
  }

  const handleCardClick = () => {
    navigate("/profile");
  };

  return (
    <Card 
      className="col-span-1 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          {missingFields.length > 0 
            ? "Complete your profile to be able to apply for opportunities" 
            : "Add more details to your profile to increase visibility"}
        </CardDescription>
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
            
            {missingFields.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Required fields:</h4>
                <ul className="space-y-1 text-sm">
                  {missingFields.slice(0, 3).map((field, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{field}</span>
                    </li>
                  ))}
                  {missingFields.length > 3 && (
                    <li className="text-sm text-gray-500 mt-1">
                      +{missingFields.length - 3} more fields...
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-medium">{percentage}% complete</p>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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

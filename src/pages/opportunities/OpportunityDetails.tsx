
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Opportunity, RunClubProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchRunClubProfile } from "@/utils/profileUtils";

const OpportunityDetails = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!opportunityId) {
        toast({
          title: "Error",
          description: "Opportunity ID is missing.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            brand:brand_id (
              company_name,
              logo_url
            )
          `)
          .eq('id', opportunityId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setOpportunity(data as Opportunity);
        } else {
          toast({
            title: "Not Found",
            description: "Opportunity not found.",
            variant: "destructive",
          });
          navigate("/opportunities");
        }
      } catch (error: any) {
        console.error("Error fetching opportunity:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load opportunity details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchApplicationStatus = async () => {
      if (user && opportunityId) {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .eq('run_club_id', user.id)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (data) {
            setHasApplied(true);
          }
        } catch (error: any) {
          console.error("Error fetching application status:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to check application status.",
            variant: "destructive",
          });
        }
      }
    };

    const fetchProfileData = async () => {
      if (userType === 'run_club' && user) {
        try {
          const profileData = await fetchRunClubProfile(user.id);
          if (profileData) {
            // Use type assertion to handle the type mismatch
            setRunClubProfile(profileData as Partial<RunClubProfile>);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchOpportunity();
    fetchApplicationStatus();
    fetchProfileData();
  }, [opportunityId, user, userType, navigate, toast]);

  const handleApply = async () => {
    if (!user || !opportunityId) {
      toast({
        title: "Error",
        description: "Missing user or opportunity information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          opportunity_id: opportunityId,
          run_club_id: user.id,
          status: 'pending'
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
      setHasApplied(true);
    } catch (error: any) {
      console.error("Error applying for opportunity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!opportunity) {
    return <div className="text-center">Opportunity not found.</div>;
  }

  const isProfileComplete = !!runClubProfile.club_name && !!runClubProfile.description && !!runClubProfile.city && !!runClubProfile.state && !!runClubProfile.member_count && !!runClubProfile.average_group_size && !!runClubProfile.core_demographic;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{opportunity.title}</CardTitle>
          <CardDescription>
            {opportunity.brand?.company_name && (
              <div className="flex items-center space-x-2">
                {opportunity.brand.logo_url && (
                  <img src={opportunity.brand.logo_url} alt="Brand Logo" className="w-8 h-8 rounded-full" />
                )}
                <span>{opportunity.brand.company_name}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{opportunity.description}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Reward</h3>
            <p>{opportunity.reward}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Deadline</h3>
            <p>{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No Deadline'}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Duration</h3>
            <p>{opportunity.duration || 'Not specified'}</p>
          </div>
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <ul className="list-disc pl-5">
                {opportunity.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          {userType === 'run_club' ? (
            hasApplied ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="mr-2 h-4 w-4" />
                Applied
              </Badge>
            ) : (
              <>
                {!isProfileComplete ? (
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                    <p className="text-sm text-yellow-500">
                      Complete your profile to apply! <Link to="/profile" className="underline">Go to Profile</Link>
                    </p>
                  </div>
                ) : (
                  <Button onClick={handleApply}>Apply Now</Button>
                )}
              </>
            )
          ) : (
            <Button asChild>
              <Link to="/login">Login as Run Club to Apply</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OpportunityDetails;

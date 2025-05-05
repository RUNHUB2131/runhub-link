import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { RunClubProfile, Opportunity } from "@/types";
import { fetchRunClubProfile } from "@/utils/profileUtils";
import { isProfileComplete } from "@/utils/profileCompletionUtils";
import { getMissingProfileFields } from "@/utils/profileCompletionUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BrowseOpportunities = () => {
  const { user, userType } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [runClubProfile, setRunClubProfile] = useState<Partial<RunClubProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileIncompleteDialogOpen, setIsProfileIncompleteDialogOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchRunClubProfile = async () => {
      if (userType === 'run_club' && user) {
        try {
          setProfileLoading(true);
          const profileData = await fetchRunClubProfile(user.id);
          if (profileData) {
            // Use type assertion to handle the type mismatch
            setRunClubProfile(profileData as Partial<RunClubProfile>);
          }
        } catch (error) {
          console.error("Error fetching run club profile:", error);
        } finally {
          setProfileLoading(false);
        }
      }
    };
    
    const fetchOpportunities = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*, brand:brand_id (company_name, logo_url)');
        
        if (error) {
          console.error("Error fetching opportunities:", error);
          toast({
            title: "Error",
            description: "Failed to load opportunities",
            variant: "destructive",
          });
        } else {
          setOpportunities(data || []);
        }
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        toast({
          title: "Error",
          description: "Failed to load opportunities",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRunClubProfile();
    fetchOpportunities();
  }, [user, userType]);

  useEffect(() => {
    if (runClubProfile && Object.keys(runClubProfile).length > 0) {
      const isComplete = isProfileComplete(runClubProfile);
      if (!isComplete) {
        const missing = getMissingProfileFields(runClubProfile);
        setMissingFields(missing);
        setIsProfileIncompleteDialogOpen(true);
      } else {
        setIsProfileIncompleteDialogOpen(false);
        setMissingFields([]);
      }
    }
  }, [runClubProfile]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Browse Opportunities</h1>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} profile={runClubProfile} />
          ))}
        </div>
      )}

      <Dialog open={isProfileIncompleteDialogOpen} onOpenChange={setIsProfileIncompleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Incomplete Profile</DialogTitle>
            <DialogDescription>
              To apply for opportunities, please complete your profile.
              Missing fields: {missingFields.join(', ')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Please fill in the missing information to continue.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Link to="/profile">
              <Button variant="outline">
                Go to Profile
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseOpportunities;

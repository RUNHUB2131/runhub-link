
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Globe, Instagram, Facebook, User } from "lucide-react";
import { RunClubProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RunClubProfileDialogProps {
  runClubId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RunClubProfileDialog = ({ runClubId, isOpen, onOpenChange }: RunClubProfileDialogProps) => {
  const [profile, setProfile] = useState<Partial<RunClubProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the run club profile details when the dialog opens
  useEffect(() => {
    if (isOpen && runClubId) {
      setIsLoading(true);
      
      // Fetch the run club profile from Supabase
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("run_club_profiles")
          .select("*")
          .eq("id", runClubId)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching run club profile:", error);
            } else {
              setProfile(data as Partial<RunClubProfile>);
            }
            setIsLoading(false);
          });
      });
    }
  }, [isOpen, runClubId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run Club Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Club header with logo and name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt={`${profile.club_name} logo`} />
                ) : (
                  <div className="bg-primary/10 h-full w-full flex items-center justify-center text-xl font-bold">
                    {profile?.club_name?.charAt(0) || "R"}
                  </div>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{profile?.club_name || "Unknown Club"}</h3>
                {(profile?.city || profile?.state) && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {profile.city}{profile.city && profile.state ? ", " : ""}{profile.state || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {profile?.description && (
              <Card className="p-4 bg-muted/30">
                <p className="text-sm">{profile.description}</p>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Members</span>
                </div>
                <p className="text-2xl font-bold mt-1">{profile?.member_count || 0}</p>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Avg. Group</span>
                </div>
                <p className="text-2xl font-bold mt-1">{profile?.average_group_size || 0}</p>
              </div>
            </div>
            
            {/* Core demographic */}
            {profile?.core_demographic && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Core demographic: {profile.core_demographic}</span>
              </div>
            )}

            {/* Run types */}
            {profile?.community_data?.run_types && profile.community_data.run_types.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium">Run Types</div>
                <div className="flex flex-wrap gap-1">
                  {(profile.community_data.run_types as string[]).map((type, i) => (
                    <Badge key={i} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Website and Social Links */}
            <div className="space-y-2">
              {profile?.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              
              {/* Social Media Links */}
              <div className="flex gap-3">
                {profile?.social_media?.instagram && (
                  <a 
                    href={`https://instagram.com/${profile.social_media.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {profile?.social_media?.facebook && (
                  <a 
                    href={`https://facebook.com/${profile.social_media.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {profile?.social_media?.tiktok && (
                  <a 
                    href={`https://tiktok.com/@${profile.social_media.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <span className="flex items-center justify-center h-5 w-5 font-bold">T</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RunClubProfileDialog;

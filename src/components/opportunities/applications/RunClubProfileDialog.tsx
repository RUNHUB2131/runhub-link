import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RunClubProfile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Globe } from "lucide-react";

interface RunClubProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runClubId: string;
}

export function RunClubProfileDialog({
  open,
  onOpenChange,
  runClubId
}: RunClubProfileDialogProps) {
  const [profile, setProfile] = useState<Partial<RunClubProfile>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && runClubId) {
      setIsLoading(true);
      supabase
        .from('run_club_profiles')
        .select('*')
        .eq('id', runClubId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching run club profile:", error);
          } else if (data) {
            // Convert average_group_size to string if needed
            const profileData = { ...data };
            if (typeof profileData.average_group_size === 'number') {
              profileData.average_group_size = String(profileData.average_group_size);
            }
            
            // Use type assertion to handle the type mismatch
            setProfile(profileData as unknown as Partial<RunClubProfile>);
          }
          setIsLoading(false);
        });
    }
  }, [open, runClubId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Run Club Profile</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        ) : profile ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{profile.club_name}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.city}, {profile.state}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Description:</p>
              <p className="text-muted-foreground">{profile.description || "Not available"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Member Count:</p>
                <p className="text-muted-foreground">{profile.member_count || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Average Group Size:</p>
                <p className="text-muted-foreground">{profile.average_group_size || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Core Demographic:</p>
                <p className="text-muted-foreground">{profile.core_demographic || "Not specified"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Social Media:</p>
              <div className="flex items-center space-x-2">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </a>
                )}
                {profile.social_media?.instagram && (
                  <a href={profile.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </a>
                )}
                {profile.social_media?.facebook && (
                  <a href={profile.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    <Facebook className="h-4 w-4 mr-1" />
                    Facebook
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Run Types:</p>
              <div className="flex flex-wrap gap-2">
                {profile.community_data?.run_types && profile.community_data.run_types.length > 0 ? (
                  profile.community_data.run_types.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No run types specified</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>No profile data found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

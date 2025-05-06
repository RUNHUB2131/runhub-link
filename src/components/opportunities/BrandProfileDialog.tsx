
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MapPin, Globe, Instagram, Facebook, Linkedin } from "lucide-react";
import { BrandProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface BrandProfileDialogProps {
  brandId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BrandProfileDialog = ({ brandId, isOpen, onOpenChange }: BrandProfileDialogProps) => {
  const [profile, setProfile] = useState<Partial<BrandProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch the brand profile details when the dialog opens
  useEffect(() => {
    if (isOpen && brandId) {
      setIsLoading(true);
      setNotFound(false);
      
      console.log("Fetching brand profile for brand ID:", brandId);
      
      // Fetch the brand profile from Supabase
      supabase
        .from("brand_profiles")
        .select("*")
        .eq("id", brandId)
        .maybeSingle() // Use maybeSingle instead of single to prevent errors
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching brand profile:", error);
            setNotFound(true);
          } else if (!data) {
            console.log("No brand profile found for ID:", brandId);
            setNotFound(true);
          } else {
            console.log("Brand profile found:", data);
            setProfile(data as Partial<BrandProfile>);
            setNotFound(false);
          }
          setIsLoading(false);
        });
    }
  }, [isOpen, brandId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Brand Profile</DialogTitle>
          {notFound && (
            <DialogDescription>
              Brand information is not available at this moment.
            </DialogDescription>
          )}
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
            <Skeleton className="h-10 w-full" />
          </div>
        ) : notFound ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>The brand profile could not be found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand header with logo and name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile?.logo_url ? (
                  <AvatarImage 
                    src={profile.logo_url} 
                    alt={`${profile.company_name} logo`}
                    onError={(e) => {
                      console.log("Failed to load brand logo in dialog");
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.display = 'none';
                    }}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 h-full w-full flex items-center justify-center text-xl font-bold">
                    {profile?.company_name?.charAt(0) || "B"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{profile?.company_name || "Unknown Brand"}</h3>
                {profile?.industry && (
                  <div className="text-muted-foreground">
                    {profile.industry}
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
                  {profile.website}
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
                {profile?.social_media?.linkedin && (
                  <a 
                    href={`https://linkedin.com/company/${profile.social_media.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Linkedin className="h-5 w-5" />
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

export default BrandProfileDialog;

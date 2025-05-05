
import { BrandProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Instagram, Facebook, Linkedin } from "lucide-react";

interface BrandSocialMediaSectionProps {
  profile: Partial<BrandProfile>;
}

export const BrandSocialMediaSection = ({ profile }: BrandSocialMediaSectionProps) => {
  const hasSocialMedia = 
    profile.social_media?.instagram || 
    profile.social_media?.facebook || 
    profile.social_media?.tiktok ||
    profile.social_media?.linkedin;
  
  if (!hasSocialMedia) {
    return (
      <Card className="p-4 bg-muted/30 text-center">
        <p className="text-muted-foreground">No social media accounts connected</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {profile.social_media?.instagram && (
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-2 rounded-md text-white">
            <Instagram className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Instagram</p>
            <a
              href={`https://instagram.com/${profile.social_media.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              @{profile.social_media.instagram}
            </a>
          </div>
        </Card>
      )}
      
      {profile.social_media?.facebook && (
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-md text-white">
            <Facebook className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Facebook</p>
            <a
              href={`https://facebook.com/${profile.social_media.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {profile.social_media.facebook}
            </a>
          </div>
        </Card>
      )}
      
      {profile.social_media?.tiktok && (
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-black p-2 rounded-md text-white">
            <span className="font-bold text-sm">TT</span>
          </div>
          <div>
            <p className="font-medium">TikTok</p>
            <a
              href={`https://tiktok.com/@${profile.social_media.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              @{profile.social_media.tiktok}
            </a>
          </div>
        </Card>
      )}
      
      {profile.social_media?.linkedin && (
        <Card className="p-4 flex items-center gap-3">
          <div className="bg-blue-700 p-2 rounded-md text-white">
            <Linkedin className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">LinkedIn</p>
            <a
              href={`https://linkedin.com/company/${profile.social_media.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {profile.social_media.linkedin}
            </a>
          </div>
        </Card>
      )}
    </div>
  );
};

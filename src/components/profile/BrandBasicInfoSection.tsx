
import { BrandProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { Globe, Building2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface BrandBasicInfoSectionProps {
  profile: Partial<BrandProfile>;
}

export const BrandBasicInfoSection = ({ profile }: BrandBasicInfoSectionProps) => {
  const hasDetails = profile.company_name || profile.industry || profile.description || profile.website;
  
  if (!hasDetails) {
    return (
      <Card className="p-4 bg-muted/30 text-center">
        <p className="text-muted-foreground">No brand information added yet</p>
      </Card>
    );
  }

  // Helper function to format the website URL
  const formatWebsiteUrl = (website: string): string => {
    if (!website) return '';
    return website.startsWith('http://') || website.startsWith('https://') 
      ? website 
      : `https://${website}`;
  };

  // Helper function to display the website without protocol
  const displayWebsite = (website: string): string => {
    if (!website) return '';
    return website.replace(/^https?:\/\//, '');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border">
          {profile.logo_url ? (
            <img src={profile.logo_url} alt="Brand logo" className="aspect-square object-cover" />
          ) : (
            <div className="bg-primary/10 h-full w-full flex items-center justify-center text-xl font-bold">
              {profile.company_name?.charAt(0) || "B"}
            </div>
          )}
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{profile.company_name || "Your Brand"}</h3>
          {profile.industry && <p className="text-muted-foreground">{profile.industry}</p>}
        </div>
      </div>

      {profile.description && (
        <div className="bg-muted/10 p-4 rounded-md">
          <p className="whitespace-pre-wrap">{profile.description}</p>
        </div>
      )}

      {profile.website && (
        <div className="flex items-center text-muted-foreground">
          <Globe className="h-4 w-4 mr-2" />
          <a 
            href={formatWebsiteUrl(profile.website)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {displayWebsite(profile.website)}
          </a>
        </div>
      )}
    </div>
  );
};

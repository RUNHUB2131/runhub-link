import { ExternalLink } from "lucide-react";
import { RunClubProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BasicInfoSectionProps {
  profile: Partial<RunClubProfile>;
}

export const BasicInfoSection = ({ profile }: BasicInfoSectionProps) => {
  const clubInitial = profile.club_name ? profile.club_name.charAt(0).toUpperCase() : "C";
  
  // Function to ensure URL has proper protocol
  const formatWebsiteUrl = (website: string): string => {
    if (!website) return '';
    
    // If the website already has a protocol, return as is
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website;
    }
    
    // Otherwise, add https:// prefix
    return `https://${website}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-24 w-24 border-2 border-muted">
          {profile.logo_url ? (
            <AvatarImage src={profile.logo_url} alt={profile.club_name || "Club logo"} />
          ) : null}
          <AvatarFallback className="text-2xl">{clubInitial}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{profile.club_name || "Not specified"}</h2>
          <p className="text-muted-foreground">{profile.location || "No location specified"}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Website</h3>
        {profile.website ? (
          <a 
            href={formatWebsiteUrl(profile.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-blue-500 hover:underline flex items-center"
          >
            {profile.website}
            <ExternalLink size={20} className="ml-2" />
          </a>
        ) : (
          <p className="text-2xl">Not specified</p>
        )}
      </div>

      <div>
        <p className="text-lg">
          {profile.description || "No description provided."}
        </p>
      </div>
    </div>
  );
};

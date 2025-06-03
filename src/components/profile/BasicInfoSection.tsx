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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 border-muted self-center sm:self-start">
          {profile.logo_url ? (
            <AvatarImage src={profile.logo_url} alt={profile.club_name || "Club logo"} />
          ) : null}
          <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">{clubInitial}</AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{profile.club_name || "Not specified"}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {profile.city && profile.state 
              ? `${profile.city}, ${profile.state}`
              : profile.city || profile.state || profile.location || "No location specified"
            }
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base">Website</h3>
        {profile.website ? (
          <a 
            href={formatWebsiteUrl(profile.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base sm:text-lg lg:text-xl text-[#021fdf] hover:underline flex items-center break-all sm:break-normal"
          >
            <span className="truncate sm:inline">{profile.website}</span>
            <ExternalLink size={16} className="ml-2 shrink-0 h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        ) : (
          <p className="text-base sm:text-lg lg:text-xl">Not specified</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm sm:text-base">Description</h3>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
          {profile.description || "No description provided."}
        </p>
      </div>
    </div>
  );
};


import { ExternalLink } from "lucide-react";
import { RunClubProfile } from "@/types";

interface SocialMediaSectionProps {
  profile: Partial<RunClubProfile>;
}

export const SocialMediaSection = ({ profile }: SocialMediaSectionProps) => {
  const socialMedia = profile.social_media || {};
  
  const formatSocialHandle = (handle: string | undefined, platform: string): string => {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const getSocialUrl = (handle: string | undefined, platform: string): string => {
    if (!handle) return '#';
    
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    switch (platform.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${cleanHandle}`;
      case 'twitter':
        return `https://twitter.com/${cleanHandle}`;
      case 'facebook':
        return `https://facebook.com/${cleanHandle}`;
      case 'strava':
        return `https://strava.com/clubs/${cleanHandle}`;
      default:
        return '#';
    }
  };
  
  const getFollowerRangeDisplay = (range: string | undefined): string => {
    if (!range) return 'Not specified';
    
    switch (range) {
      case 'under_1000':
        return '0 - 1,000 followers';
      case '1000_to_4000':
        return '1,000 - 4,000 followers';
      case '4000_to_9000':
        return '4,000 - 9,000 followers';
      case '9000_to_20000':
        return '9,000 - 20,000 followers';
      case 'over_20000':
        return '20,000+ followers';
      default:
        return 'Not specified';
    }
  };

  return (
    <div className="space-y-4">
      {socialMedia.follower_count_range && (
        <div className="p-4 bg-muted/50 rounded-lg mb-4">
          <h3 className="font-medium mb-1">Total Social Media Audience</h3>
          <p className="text-lg font-semibold">{getFollowerRangeDisplay(socialMedia.follower_count_range)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Instagram</h3>
          {socialMedia.instagram ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.instagram, 'instagram')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2"
              >
                {formatSocialHandle(socialMedia.instagram, 'instagram')}
                <ExternalLink size={16} className="ml-1" />
              </a>
            </>
          ) : (
            <p className="text-muted-foreground">Not linked</p>
          )}
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Twitter</h3>
          {socialMedia.twitter ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.twitter, 'twitter')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2"
              >
                {formatSocialHandle(socialMedia.twitter, 'twitter')}
                <ExternalLink size={16} className="ml-1" />
              </a>
            </>
          ) : (
            <p className="text-muted-foreground">Not linked</p>
          )}
        </div>
        
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-4">Facebook</h3>
          {socialMedia.facebook ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.facebook, 'facebook')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2"
              >
                {socialMedia.facebook}
                <ExternalLink size={16} className="ml-1" />
              </a>
            </>
          ) : (
            <p className="text-muted-foreground">Not linked</p>
          )}
        </div>
      </div>
    </div>
  );
};

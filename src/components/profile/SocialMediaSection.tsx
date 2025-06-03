import { ExternalLink } from "lucide-react";
import { RunClubProfile, FollowerCountRange } from "@/types";

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
      case 'tiktok':
        return `https://tiktok.com/@${cleanHandle}`;
      case 'facebook':
        return `https://facebook.com/${cleanHandle}`;
      case 'strava':
        return `https://strava.com/clubs/${cleanHandle}`;
      default:
        return '#';
    }
  };
  
  const getFollowerRangeDisplay = (range: FollowerCountRange | undefined): string => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Instagram</h3>
          {socialMedia.instagram ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.instagram, 'instagram')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2 text-sm sm:text-base break-all sm:break-normal"
              >
                <span className="truncate">{formatSocialHandle(socialMedia.instagram, 'instagram')}</span>
                <ExternalLink size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
              </a>
              {socialMedia.instagram_follower_range && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getFollowerRangeDisplay(socialMedia.instagram_follower_range)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Not linked</p>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">TikTok</h3>
          {socialMedia.tiktok ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.tiktok, 'tiktok')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2 text-sm sm:text-base break-all sm:break-normal"
              >
                <span className="truncate">{formatSocialHandle(socialMedia.tiktok, 'tiktok')}</span>
                <ExternalLink size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
              </a>
              {socialMedia.tiktok_follower_range && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getFollowerRangeDisplay(socialMedia.tiktok_follower_range)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Not linked</p>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Facebook</h3>
          {socialMedia.facebook ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.facebook, 'facebook')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2 text-sm sm:text-base break-all sm:break-normal"
              >
                <span className="truncate">{socialMedia.facebook}</span>
                <ExternalLink size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
              </a>
              {socialMedia.facebook_follower_range && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getFollowerRangeDisplay(socialMedia.facebook_follower_range)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Not linked</p>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border rounded-lg">
          <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Strava</h3>
          {socialMedia.strava ? (
            <>
              <a 
                href={getSocialUrl(socialMedia.strava, 'strava')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center mb-2 text-sm sm:text-base break-all sm:break-normal"
              >
                <span className="truncate">{socialMedia.strava}</span>
                <ExternalLink size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
              </a>
              {socialMedia.strava_follower_range && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getFollowerRangeDisplay(socialMedia.strava_follower_range)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">Not linked</p>
          )}
        </div>
      </div>
    </div>
  );
};

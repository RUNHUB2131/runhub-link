import { RunClubProfile, FollowerCountRange } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Globe, Instagram, Facebook, ArrowRight, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface ClubCardProps {
  club: RunClubProfile;
  onClick?: () => void;
}

const followerRangeLabels: Record<FollowerCountRange, string> = {
  'under_1000': 'Under 1K',
  '1000_to_4000': '1K - 4K',
  '4000_to_9000': '4K - 9K',
  '9000_to_20000': '9K - 20K',
  'over_20000': '20K+'
};

export const ClubCard = ({ club, onClick }: ClubCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const socialMedia = club.social_media as any;
  const location = club.city && club.state ? `${club.city}, ${club.state}` : club.location;
  const isClubFavorited = isFavorite(club.id);
  
  // Get the highest follower count range across all platforms
  const getHighestFollowerRange = (): FollowerCountRange | null => {
    if (!socialMedia) return null;
    
    const ranges = [
      socialMedia.instagram_follower_range,
      socialMedia.facebook_follower_range,
      socialMedia.tiktok_follower_range,
      socialMedia.strava_follower_range
    ].filter(Boolean) as FollowerCountRange[];
    
    if (ranges.length === 0) return null;
    
    // Order by follower count (highest first)
    const orderPriority: Record<FollowerCountRange, number> = {
      'over_20000': 5,
      '9000_to_20000': 4,
      '4000_to_9000': 3,
      '1000_to_4000': 2,
      'under_1000': 1
    };
    
    return ranges.sort((a, b) => orderPriority[b] - orderPriority[a])[0];
  };

  const highestFollowerRange = getHighestFollowerRange();

  // Get social media platforms
  const socialPlatforms = [];
  if (socialMedia?.instagram) socialPlatforms.push({ name: 'instagram', icon: Instagram, handle: socialMedia.instagram });
  if (socialMedia?.facebook) socialPlatforms.push({ name: 'facebook', icon: Facebook, handle: socialMedia.facebook });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(club.id);
  };

  return (
    <Card 
      className={`group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0 border-2 border-background shadow-sm">
            {club.logo_url ? (
              <AvatarImage src={club.logo_url} alt={`${club.club_name} logo`} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                {club.club_name?.charAt(0) || "C"}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {club.club_name || "Unnamed Club"}
              </h3>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteClick}
                  className="p-1 h-8 w-8"
                >
                  <Heart 
                    className={`h-4 w-4 ${isClubFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'}`} 
                  />
                </Button>
                
                {onClick && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
            
            {location && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Description */}
        {club.description && (
          <p 
            className="text-sm text-muted-foreground leading-relaxed overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.5em',
              maxHeight: '3em'
            }}
          >
            {club.description}
          </p>
        )}
        
        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {club.member_count && club.member_count > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="rounded-full bg-primary/10 p-1">
                  <Users className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium">{club.member_count.toLocaleString()}</span>
              </div>
            )}
            
            {club.website && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="rounded-full bg-green-100 p-1">
                  <Globe className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-xs">Website</span>
              </div>
            )}
          </div>
          
          {highestFollowerRange && (
            <Badge variant="secondary" className="text-xs font-medium bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20">
              {followerRangeLabels[highestFollowerRange]}
            </Badge>
          )}
        </div>
        
        {/* Social Media */}
        {socialPlatforms.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const followerRange = socialMedia[`${platform.name}_follower_range`];
                return (
                  <div key={platform.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {followerRange && (
                      <span className="font-medium">{followerRangeLabels[followerRange]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubCard; 
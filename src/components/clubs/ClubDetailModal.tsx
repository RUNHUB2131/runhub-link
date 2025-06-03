import { RunClubProfile, FollowerCountRange } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Users, 
  Globe, 
  Instagram, 
  Facebook, 
  Heart,
  ExternalLink,
  Mail,
  Phone
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface ClubDetailModalProps {
  club: RunClubProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const followerRangeLabels: Record<FollowerCountRange, string> = {
  'under_1000': 'Under 1K',
  '1000_to_4000': '1K - 4K',
  '4000_to_9000': '4K - 9K',
  '9000_to_20000': '9K - 20K',
  'over_20000': '20K+'
};

export const ClubDetailModal = ({ club, isOpen, onOpenChange }: ClubDetailModalProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!club) return null;

  const socialMedia = club.social_media as any;
  const location = club.city && club.state ? `${club.city}, ${club.state}` : club.location;
  const isClubFavorited = isFavorite(club.id);

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: socialMedia?.instagram, 
      followers: socialMedia?.instagram_follower_range,
      color: 'text-pink-600'
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: socialMedia?.facebook, 
      followers: socialMedia?.facebook_follower_range,
      color: 'text-blue-600'
    },
  ].filter(link => link.url);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(club.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              {club.logo_url ? (
                <AvatarImage src={club.logo_url} alt={`${club.club_name} logo`} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-2xl">
                  {club.club_name?.charAt(0) || "C"}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle className="text-2xl font-bold">{club.club_name}</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteClick}
                  className="p-2"
                >
                  <Heart 
                    className={`h-5 w-5 ${isClubFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                  />
                </Button>
              </div>
              
              {location && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {club.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed">{club.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {club.member_count && club.member_count > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{club.member_count.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {club.website && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Website</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left justify-start"
                        onClick={() => window.open(club.website, '_blank')}
                      >
                        Visit Site <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Social Media</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={social.name}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => window.open(`https://${social.url}`, '_blank')}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${social.color}`} />
                        <div className="text-left">
                          <p className="font-medium">{social.name}</p>
                          {social.followers && (
                            <p className="text-xs text-muted-foreground">
                              {followerRangeLabels[social.followers]} followers
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Data */}
          {club.community_data && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Community Details</h3>
                
                {club.community_data.run_types && club.community_data.run_types.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Run Types</p>
                    <div className="flex flex-wrap gap-2">
                      {club.community_data.run_types.map((type, index) => (
                        <Badge key={index} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {club.community_data.demographics && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Demographics</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {club.community_data.demographics.average_group_size && (
                        <div>Group Size: {club.community_data.demographics.average_group_size}</div>
                      )}
                      {club.community_data.demographics.core_demographic && (
                        <div>Core Demo: {club.community_data.demographics.core_demographic}</div>
                      )}
                      {club.community_data.demographics.average_pace && (
                        <div>Avg Pace: {club.community_data.demographics.average_pace}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Actions */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Contact Club
            </Button>
            <Button variant="outline" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
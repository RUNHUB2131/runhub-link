import { RunClubProfile, FollowerCountRange } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Trophy,
  Crown
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useState } from "react";
import { trackContactClubClick, trackClubView } from "@/services/analyticsService";
import React from "react";

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
  if (!club) return null;

  const { isFavorite, toggleFavorite } = useFavorites();
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);

  const socialMedia = club.social_media as any;
  const location = club.city && club.state ? `${club.city}, ${club.state}` : club.location;
  const isClubFavorited = isFavorite(club.id);

  // Track when the modal opens (club profile viewed)
  React.useEffect(() => {
    if (isOpen && club) {
      trackClubView(club.id, club.club_name || 'Unknown Club');
    }
  }, [isOpen, club]);

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

  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: socialMedia?.instagram, 
      followers: socialMedia?.instagram_follower_range,
      color: 'text-pink-600',
      urlPrefix: 'https://instagram.com/'
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: socialMedia?.facebook, 
      followers: socialMedia?.facebook_follower_range,
      color: 'text-blue-600',
      urlPrefix: 'https://facebook.com/'
    },
    { 
      name: 'TikTok', 
      icon: () => (
        <div className="h-5 w-5 flex items-center justify-center text-xs font-bold bg-black text-white rounded">
          T
        </div>
      ), 
      url: socialMedia?.tiktok, 
      followers: socialMedia?.tiktok_follower_range,
      color: 'text-black',
      urlPrefix: 'https://tiktok.com/@'
    },
    { 
      name: 'Strava', 
      icon: () => (
        <div className="h-5 w-5 flex items-center justify-center text-xs font-bold bg-orange-500 text-white rounded">
          S
        </div>
      ), 
      url: socialMedia?.strava, 
      followers: socialMedia?.strava_follower_range,
      color: 'text-orange-600',
      urlPrefix: 'https://strava.com/clubs/'
    },
  ].filter(link => link.url);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(club.id);
  };

  const handleContactClubClick = async () => {
    // Track the analytics event
    await trackContactClubClick(club.id, club.club_name || 'Unknown Club');
    
    // Show the premium dialog
    setIsPremiumDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-2xl font-bold">{club.club_name}</DialogTitle>
                    {location && (
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons positioned to left of close button */}
                  <div className="flex items-center gap-3 mr-8">
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
                    
                    <Button onClick={handleContactClubClick} size="sm" className="px-4">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Club
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* Description */}
            {club.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-lg">About</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{club.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {club.member_count && club.member_count > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{club.member_count.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {club.website && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-green-100 p-3">
                        <Globe className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">Website</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-left justify-start text-base"
                          onClick={() => window.open(formatWebsiteUrl(club.website!), '_blank')}
                        >
                          Visit Site <ExternalLink className="h-4 w-4 ml-1" />
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
                  <h3 className="font-semibold mb-6 text-lg">Social Media</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {socialLinks.map((social) => {
                      const IconComponent = social.icon;
                      return (
                        <Button
                          key={social.name}
                          variant="outline"
                          className="justify-start h-auto p-4 border-muted/30"
                          onClick={() => window.open(`${social.urlPrefix}${social.url}`, '_blank')}
                        >
                          <div className="mr-4">
                            {typeof IconComponent === 'function' && IconComponent.length === 0 ? (
                              <IconComponent />
                            ) : (
                              <IconComponent className={`h-5 w-5 ${social.color}`} />
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium text-base">{social.name}</p>
                            {social.followers && (
                              <p className="text-sm text-muted-foreground">
                                {followerRangeLabels[social.followers]} followers
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
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
                  <h3 className="font-semibold mb-6 text-lg">Community Details</h3>
                  
                  <div className="space-y-8">
                    {/* Run Types */}
                    {club.community_data.run_types && club.community_data.run_types.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-base">Run Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {club.community_data.run_types.map((type, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Demographics */}
                    {club.community_data.demographics && (
                      <div>
                        <h4 className="font-medium mb-4 text-base">Demographics</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {club.community_data.demographics.average_group_size && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-muted/20">
                              <span className="font-medium text-sm text-muted-foreground">Group Size</span>
                              <p className="text-base font-medium mt-1">{club.community_data.demographics.average_group_size}</p>
                            </div>
                          )}
                          {club.community_data.demographics.core_demographic && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-muted/20">
                              <span className="font-medium text-sm text-muted-foreground">Core Demo</span>
                              <p className="text-base font-medium mt-1">{club.community_data.demographics.core_demographic}</p>
                            </div>
                          )}
                          {club.community_data.demographics.average_pace && (
                            <div className="bg-muted/30 p-4 rounded-lg border border-muted/20 sm:col-span-2">
                              <span className="font-medium text-sm text-muted-foreground">Average Pace</span>
                              <p className="text-base font-medium mt-1">{club.community_data.demographics.average_pace}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Event Experience - Now a top-level section */}
                    {club.community_data.demographics?.event_experience && club.community_data.demographics.event_experience.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Trophy className="h-5 w-5 text-amber-600" />
                          <h4 className="font-medium text-base">Event Experience</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(club.community_data.demographics.event_experience as string[]).map((experience, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 text-sm py-1.5 px-3"
                            >
                              {experience}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bottom Contact Action */}
            <div className="flex justify-center pt-4">
              <Button onClick={handleContactClubClick} size="lg" className="px-8">
                <Mail className="h-4 w-4 mr-2" />
                Contact Club
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Feature Dialog */}
      <AlertDialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premium Feature</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Direct club contact is available with our premium partnership plan. 
              
              <br /><br />
              
              To learn more about accessing this feature and our premium services, please reach out to our team at{" "}
              <a 
                href="mailto:hello@runhub.co" 
                className="font-medium text-primary hover:underline"
              >
                hello@runhub.co
              </a>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 
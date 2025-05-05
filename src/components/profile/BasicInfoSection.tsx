
import { MapPin, Users, Globe, User } from "lucide-react";
import { RunClubProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface BasicInfoSectionProps {
  profile: Partial<RunClubProfile>;
}

export function BasicInfoSection({ profile }: BasicInfoSectionProps) {
  if (!profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(profile.city || profile.state) && (
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span>
            {profile.city}{profile.city && profile.state ? ", " : ""}{profile.state || ""}
          </span>
        </div>
      )}
      
      {profile.member_count !== undefined && (
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>{profile.member_count} members</span>
        </div>
      )}
      
      {profile.average_group_size !== undefined && (
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>Average group size: {profile.average_group_size}</span>
        </div>
      )}
      
      {profile.core_demographic && (
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <span>Core demographic: {profile.core_demographic}</span>
        </div>
      )}
      
      {profile.website && (
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <a 
            href={profile.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}
      
      {profile.description && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">About</h4>
          <p className="text-sm">{profile.description}</p>
        </div>
      )}
    </div>
  );
}

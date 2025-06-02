import { Badge } from "@/components/ui/badge";
import { RunClubProfile } from "@/types";
import { Users, Calendar, Timer } from "lucide-react";

interface CommunityInfoSectionProps {
  profile: Partial<RunClubProfile>;
}

export const CommunityInfoSection = ({ profile }: CommunityInfoSectionProps) => {
  const communityData = profile.community_data || {};
  const runTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
  const demographics = communityData.demographics || {};
  const eventTypes = demographics.event_experience || [];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-6 border rounded-lg flex items-center">
          <Users className="h-10 w-10 text-blue-500 mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Total Member Count</p>
            <p className="text-3xl font-semibold">
              {profile.member_count ? `${profile.member_count}` : "Not specified"}
            </p>
          </div>
        </div>
        <div className="p-6 border rounded-lg flex items-center">
          <Users className="h-10 w-10 text-green-500 mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Average Group Size</p>
            <p className="text-3xl font-semibold">
              {demographics.average_group_size || "Not specified"}
            </p>
          </div>
        </div>
        <div className="p-6 border rounded-lg flex items-center">
          <Calendar className="h-10 w-10 text-amber-500 mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Core Demographic</p>
            <p className="text-3xl font-semibold">
              {demographics.core_demographic || "Not specified"}
            </p>
          </div>
        </div>
        <div className="p-6 border rounded-lg flex items-center">
          <Timer className="h-10 w-10 text-purple-500 mr-4" />
          <div>
            <p className="text-sm text-muted-foreground">Average Pace</p>
            <p className="text-3xl font-semibold">
              {demographics.average_pace || "Not specified"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Run Types</h3>
        <div className="flex flex-wrap gap-2">
          {runTypes.length > 0 ? (
            runTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-base py-2 px-6 rounded-full bg-blue-100">
                {type}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No run types specified</p>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Event Experience</h3>
        <div className="flex flex-wrap gap-2">
          {eventTypes.length > 0 ? (
            eventTypes.map((event, index) => (
              <Badge key={index} className="text-base py-2 px-6 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200">
                {event}
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No event experience specified</p>
          )}
        </div>
      </div>
    </div>
  );
};

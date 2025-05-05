
import { ExternalLink } from "lucide-react";
import { RunClubProfile } from "@/types";

interface BasicInfoSectionProps {
  profile: Partial<RunClubProfile>;
}

export const BasicInfoSection = ({ profile }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Club Name</h3>
          <p className="text-2xl">{profile.club_name || "Not specified"}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Location</h3>
          <p className="text-2xl">{profile.location || "Not specified"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Member Count</h3>
          <p className="text-2xl">
            {profile.member_count ? `${profile.member_count} members` : "Not specified"}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Website</h3>
          {profile.website ? (
            <a 
              href={profile.website}
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
      </div>

      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-lg">
          {profile.description || "No description provided."}
        </p>
      </div>
    </div>
  );
};

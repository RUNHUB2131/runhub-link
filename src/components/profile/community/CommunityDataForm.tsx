
import { RunClubProfile } from "@/types";
import { useState } from "react";
import { DemographicSelections } from "./DemographicSelections";
import { RunTypeSelection } from "./RunTypeSelection";
import { EventExperienceSelection } from "./EventExperienceSelection";

interface CommunityDataFormProps {
  profile: Partial<RunClubProfile>;
  onSaveData: (data: {
    member_count: number;
    average_group_size: string;
    core_demographic: string;
    runTypes: string[];
    eventExperience: string[];
  }) => Promise<void>;
}

export function CommunityDataForm({ profile, onSaveData }: CommunityDataFormProps) {
  const communityData = profile.community_data || {};
  const demographics = communityData.demographics || {};
  
  const initialRunTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
  const initialEventExperience = Array.isArray(demographics.event_experience) ? demographics.event_experience : [];
  
  const [formData, setFormData] = useState({
    member_count: profile.member_count || 0,
    average_group_size: demographics.average_group_size || "",
    core_demographic: profile.core_demographic || "",
  });
  
  const [runTypes, setRunTypes] = useState<string[]>(initialRunTypes);
  const [eventExperience, setEventExperience] = useState<string[]>(initialEventExperience);
  const [isLoading, setIsLoading] = useState(false);

  const availableRunTypes = ["Road", "Trail", "Track", "Urban"];
  const availableEventTypes = ["Races", "Charity Runs", "Sponsored Events", "Community Meetups"];
  const groupSizeRanges = ["0-10", "10-25", "25-50", "50-100", "100-200", "200+"];
  const demographicRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "member_count" ? parseInt(value) || 0 : value,
    }));
  };

  const handleRunTypeToggle = (value: string) => {
    setRunTypes(current =>
      current.includes(value)
        ? current.filter(type => type !== value)
        : [...current, value]
    );
  };

  const handleEventTypeToggle = (value: string) => {
    setEventExperience(current =>
      current.includes(value)
        ? current.filter(type => type !== value)
        : [...current, value]
    );
  };

  const handleGroupSizeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      average_group_size: value,
    }));
  };

  const handleDemographicChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      core_demographic: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSaveData({
        member_count: formData.member_count,
        average_group_size: formData.average_group_size,
        core_demographic: formData.core_demographic,
        runTypes,
        eventExperience,
      });
    } catch (error) {
      console.error("Error saving community info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formComponents: (
      <>
        <DemographicSelections
          memberCount={formData.member_count}
          averageGroupSize={formData.average_group_size}
          coreDemographic={formData.core_demographic}
          groupSizeRanges={groupSizeRanges}
          demographicRanges={demographicRanges}
          onMemberCountChange={handleChange}
          onGroupSizeChange={handleGroupSizeChange}
          onDemographicChange={handleDemographicChange}
        />
        
        <RunTypeSelection
          availableRunTypes={availableRunTypes}
          selectedRunTypes={runTypes}
          onRunTypeToggle={handleRunTypeToggle}
        />
        
        <EventExperienceSelection
          availableEventTypes={availableEventTypes}
          selectedEventTypes={eventExperience}
          onEventTypeToggle={handleEventTypeToggle}
        />
      </>
    ),
    handleSubmit,
    isLoading,
  };
}

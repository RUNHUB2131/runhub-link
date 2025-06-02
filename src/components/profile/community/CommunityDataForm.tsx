import { RunClubProfile } from "@/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DemographicSelections } from "./DemographicSelections";
import { RunTypeSelection } from "./RunTypeSelection";
import { EventExperienceSelection } from "./EventExperienceSelection";

interface CommunityDataFormProps {
  profile: Partial<RunClubProfile>;
  open: boolean;
  onSaveData: (data: {
    member_count: number;
    average_group_size: string;
    core_demographic: string;
    average_pace: string;
    runTypes: string[];
    eventExperience: string[];
  }) => Promise<void>;
}

export function CommunityDataForm({ profile, open, onSaveData }: CommunityDataFormProps) {
  const { user } = useAuth();
  const communityData = profile.community_data || {};
  const demographics = communityData.demographics || {};
  
  const initialRunTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
  const initialEventExperience = Array.isArray(demographics.event_experience) ? demographics.event_experience : [];
  
  const [formData, setFormData] = useState({
    member_count: profile.member_count || 0,
    average_group_size: demographics.average_group_size || "",
    core_demographic: demographics.core_demographic || "",
    average_pace: demographics.average_pace || "",
  });
  
  const [runTypes, setRunTypes] = useState<string[]>(initialRunTypes);
  const [eventExperience, setEventExperience] = useState<string[]>(initialEventExperience);
  const [isLoading, setIsLoading] = useState(false);

  // Create a unique key for localStorage based on user ID and dialog type
  const storageKey = `editCommunityInfo_${user?.id}_draft`;

  // Load draft data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setFormData(draftData.formData);
          setRunTypes(draftData.runTypes);
          setEventExperience(draftData.eventExperience);
        } catch (error) {
          console.error("Error parsing saved draft:", error);
          // Fallback to profile data if draft is corrupted
          const communityData = profile.community_data || {};
          const demographics = communityData.demographics || {};
          const newRunTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
          const newEventExperience = Array.isArray(demographics.event_experience) ? demographics.event_experience : [];
          
          setFormData({
            member_count: profile.member_count || 0,
            average_group_size: demographics.average_group_size || "",
            core_demographic: demographics.core_demographic || "",
            average_pace: demographics.average_pace || "",
          });
          
          setRunTypes(newRunTypes);
          setEventExperience(newEventExperience);
        }
      } else {
        // No draft exists, use current profile data
        const communityData = profile.community_data || {};
        const demographics = communityData.demographics || {};
        const newRunTypes = Array.isArray(communityData.run_types) ? communityData.run_types : [];
        const newEventExperience = Array.isArray(demographics.event_experience) ? demographics.event_experience : [];
        
        setFormData({
          member_count: profile.member_count || 0,
          average_group_size: demographics.average_group_size || "",
          core_demographic: demographics.core_demographic || "",
          average_pace: demographics.average_pace || "",
        });
        
        setRunTypes(newRunTypes);
        setEventExperience(newEventExperience);
      }
    }
  }, [open, profile.member_count, profile.community_data, storageKey]);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (open) {
      const draftData = {
        formData,
        runTypes,
        eventExperience,
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    }
  }, [formData, runTypes, eventExperience, open, storageKey]);

  const availableRunTypes = ["Road", "Trail", "Track", "Urban"];
  const availableEventTypes = ["Races", "Charity Runs", "Sponsored Events", "Community Meetups"];
  const groupSizeRanges = ["0-10", "10-25", "25-50", "50-100", "100-200", "200+"];
  const demographicRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  const paceRanges = ["3:00-4:00", "4:00-5:00", "5:00-6:00", "6:00-7:00", "7:00-8:00", "8:00+"];

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

  const handleAveragePaceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      average_pace: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSaveData({
        member_count: formData.member_count,
        average_group_size: formData.average_group_size,
        core_demographic: formData.core_demographic,
        average_pace: formData.average_pace,
        runTypes,
        eventExperience,
      });
      // Clear the draft after successful save
      localStorage.removeItem(storageKey);
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
          averagePace={formData.average_pace}
          groupSizeRanges={groupSizeRanges}
          demographicRanges={demographicRanges}
          paceRanges={paceRanges}
          onMemberCountChange={handleChange}
          onGroupSizeChange={handleGroupSizeChange}
          onDemographicChange={handleDemographicChange}
          onAveragePaceChange={handleAveragePaceChange}
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
    clearDraft: () => localStorage.removeItem(storageKey),
  };
}

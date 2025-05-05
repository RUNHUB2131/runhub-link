
import { RunClubProfile } from "@/types";

/**
 * Checks if a run club profile has completed the minimum required fields
 * to apply for opportunities
 */
export const isProfileComplete = (profile: Partial<RunClubProfile>): boolean => {
  // Required fields - medium enforcement level
  const requiredFields = [
    !!profile.club_name,
    !!profile.city,
    !!profile.state,
    !!profile.description,
    profile.member_count !== undefined && profile.member_count > 0,
    profile.average_group_size !== undefined && profile.average_group_size > 0,
    !!profile.core_demographic,
  ];
  
  // Social media - medium enforcement - at least one platform should be added
  const hasSocialMedia = profile.social_media && 
    Object.values(profile.social_media).some(value => !!value && typeof value === 'string' && value.trim() !== '');
    
  // Check if all required base fields are completed
  const allRequiredFieldsComplete = requiredFields.every(field => field === true);
  
  // For medium enforcement, require all basic fields AND at least one social media account
  return allRequiredFieldsComplete && hasSocialMedia;
};

/**
 * Gets a list of missing required fields from a run club profile
 */
export const getMissingProfileFields = (profile: Partial<RunClubProfile>): string[] => {
  const missingFields: string[] = [];
  
  if (!profile.club_name) missingFields.push("Club Name");
  if (!profile.city) missingFields.push("City");
  if (!profile.state) missingFields.push("State");
  if (!profile.description) missingFields.push("Description");
  if (!profile.member_count || profile.member_count <= 0) missingFields.push("Total Member Count");
  if (!profile.average_group_size || profile.average_group_size <= 0) missingFields.push("Average Group Size");
  if (!profile.core_demographic) missingFields.push("Core Demographic");
  
  // Check if at least one social media platform is added
  const hasSocialMedia = profile.social_media && 
    Object.values(profile.social_media).some(value => !!value && typeof value === 'string' && value.trim() !== '');
    
  if (!hasSocialMedia) {
    missingFields.push("At least one Social Media account");
  }
  
  return missingFields;
};

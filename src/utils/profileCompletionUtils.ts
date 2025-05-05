
import { RunClubProfile } from "@/types";

/**
 * Checks if a run club profile has completed the minimum required fields
 * to apply for opportunities
 */
export const isProfileComplete = (profile: Partial<RunClubProfile>): boolean => {
  // Required fields - medium enforcement level
  const requiredFields = [
    !!profile.club_name,
    !!profile.location,
    profile.member_count !== undefined && profile.member_count > 0,
    !!profile.description,
  ];
  
  // Social media - medium enforcement - at least one platform should be added
  const hasSocialMedia = profile.social_media && 
    Object.values(profile.social_media).some(value => !!value && typeof value === 'string' && value.trim() !== '');
    
  // Community data - medium enforcement - at least some run types should be selected
  const hasRunTypes = profile.community_data?.run_types && 
    Array.isArray(profile.community_data.run_types) && 
    profile.community_data.run_types.length > 0;
  
  // Check if all required base fields are completed
  const allRequiredFieldsComplete = requiredFields.every(field => field === true);
  
  // For medium enforcement, require basic fields AND at least one of: social media or run types
  return allRequiredFieldsComplete && (hasSocialMedia || hasRunTypes);
};

/**
 * Gets a list of missing required fields from a run club profile
 */
export const getMissingProfileFields = (profile: Partial<RunClubProfile>): string[] => {
  const missingFields: string[] = [];
  
  if (!profile.club_name) missingFields.push("Club Name");
  if (!profile.location) missingFields.push("Location");
  if (!profile.member_count || profile.member_count <= 0) missingFields.push("Member Count");
  if (!profile.description) missingFields.push("Description");
  
  // Check if at least one social media platform is added
  const hasSocialMedia = profile.social_media && 
    Object.values(profile.social_media).some(value => !!value && typeof value === 'string' && value.trim() !== '');
    
  // Check if at least some run types are selected
  const hasRunTypes = profile.community_data?.run_types && 
    Array.isArray(profile.community_data.run_types) && 
    profile.community_data.run_types.length > 0;
  
  // Add additional category requirements for medium enforcement
  if (!hasSocialMedia && !hasRunTypes) {
    missingFields.push("At least one Social Media platform or Run Type");
  }
  
  return missingFields;
};

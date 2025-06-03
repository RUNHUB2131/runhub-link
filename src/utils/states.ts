export const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' }
] as const;

export type AustralianStateCode = typeof AUSTRALIAN_STATES[number]['value'];

// Migration utility to parse existing location data
export const parseLocationString = (location: string): { city?: string; state?: string } => {
  if (!location) return {};
  
  // Handle common formats: "City, State", "City, ST", etc.
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const city = parts[0];
    const state = parts[1];
    
    // Try to match state name or abbreviation
    const stateMatch = AUSTRALIAN_STATES.find(s => 
      s.label.toLowerCase() === state.toLowerCase() || 
      s.value.toLowerCase() === state.toLowerCase()
    );
    
    return {
      city,
      state: stateMatch?.value || state
    };
  }
  
  return { city: location }; // Fallback: treat whole string as city
}; 
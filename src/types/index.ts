
export type UserType = 'run_club' | 'brand';

export interface User {
  id: string;
  email: string;
  user_type?: UserType;
}

export interface Profile {
  id: string;
  user_id: string;
  user_type: UserType;
  created_at: string;
}

export interface RunClubProfile extends Profile {
  club_name: string;
  description?: string;
  location?: string;
  member_count?: number;
  website?: string;
  logo_url?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    strava?: string;
  };
  community_data?: {
    run_types?: string[];
    demographics?: Record<string, any>;
  };
}

export interface BrandProfile extends Profile {
  company_name: string;
  industry?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface Opportunity {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string | null;
  duration: string | null;
  requirements: string[] | null;
  created_at: string;
  brand?: {
    company_name: string;
    logo_url?: string;
  } | null;
}

export interface Application {
  id: string;
  opportunity_id: string;
  run_club_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

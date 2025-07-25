export type UserType = 'run_club' | 'brand' | 'content_producer';

export type FollowerCountRange = 'under_1000' | '1000_to_4000' | '4000_to_9000' | '9000_to_20000' | 'over_20000';

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
  city?: string;
  state?: string;
  member_count?: number;
  website?: string;
  logo_url?: string;
  social_media?: {
    instagram?: string;
    instagram_follower_range?: FollowerCountRange;
    facebook?: string;
    facebook_follower_range?: FollowerCountRange;
    tiktok?: string;
    tiktok_follower_range?: FollowerCountRange;
    strava?: string;
    strava_follower_range?: FollowerCountRange;
  };
  community_data?: {
    run_types?: string[];
    demographics?: {
      average_group_size?: string;
      core_demographic?: string;
      average_pace?: string;
      event_experience?: string[];
    };
  };
}

export interface BrandProfile extends Profile {
  company_name: string;
  industry?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  open_to_pitches?: boolean;
  social_media?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
  };
}

export interface Opportunity {
  id: string;
  brand_id: string;
  title: string;
  activation_overview: string;
  target_launch_date: string;
  primary_objective: string;
  primary_objective_other: string | null;
  content_specifications: string;
  professional_media: string;
  media_requirements: string | null;
  club_responsibilities: string;
  club_incentives: string;
  geographic_locations: string[];
  city?: string;
  state?: string;
  club_size_preference: string;
  online_reach_preference: string;
  additional_notes: string | null;
  submission_deadline: string;
  quotes_requested?: boolean;
  quotes_requested_at?: string;
  target_run_club_id?: string | null;
  created_at: string;
  brand?: {
    company_name: string;
    logo_url?: string;
  };
}

export interface Application {
  id: string;
  opportunity_id: string;
  run_club_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  seen_by_brand?: boolean;
  pitch?: string;
  run_club_profile?: {
    club_name: string;
    location: string;
    city?: string;
    state?: string;
    member_count: number;
  } | null;
}

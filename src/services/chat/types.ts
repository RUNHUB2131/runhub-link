
// Define all chat related types in a separate file
export interface Chat {
  id: string;
  application_id: string;
  opportunity_id: string;
  brand_id: string;
  run_club_id: string;
  created_at: string;
  updated_at: string;
  opportunity?: {
    title: string;
  };
  brand_profile?: {
    company_name: string;
    logo_url?: string;
  } | null;
  run_club_profile?: {
    club_name: string;
    logo_url?: string;
  } | null;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: 'brand' | 'run_club';
  content: string;
  read: boolean;
  created_at: string;
}

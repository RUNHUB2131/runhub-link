export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          pitch: string | null
          run_club_id: string
          seen_by_brand: boolean
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          pitch?: string | null
          run_club_id: string
          seen_by_brand?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          pitch?: string | null
          run_club_id?: string
          seen_by_brand?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          company_name: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          open_to_pitches: boolean | null
          social_media: Json | null
          website: string | null
          welcome_dialog_seen: boolean | null
        }
        Insert: {
          company_name?: string | null
          description?: string | null
          id: string
          industry?: string | null
          logo_url?: string | null
          open_to_pitches?: boolean | null
          social_media?: Json | null
          website?: string | null
          welcome_dialog_seen?: boolean | null
        }
        Update: {
          company_name?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          open_to_pitches?: boolean | null
          social_media?: Json | null
          website?: string | null
          welcome_dialog_seen?: boolean | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
          sender_type: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
          sender_type: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          application_id: string
          brand_id: string
          created_at: string
          id: string
          opportunity_id: string
          run_club_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          brand_id: string
          created_at?: string
          id?: string
          opportunity_id: string
          run_club_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          brand_id?: string
          created_at?: string
          id?: string
          opportunity_id?: string
          run_club_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preference_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          email_data: Json
          email_type: string
          id: string
          processed_at: string | null
          recipient_email: string
          recipient_name: string
          status: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email_data: Json
          email_type: string
          id?: string
          processed_at?: string | null
          recipient_email: string
          recipient_name: string
          status?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email_data?: Json
          email_type?: string
          id?: string
          processed_at?: string | null
          recipient_email?: string
          recipient_name?: string
          status?: string | null
        }
        Relationships: []
      }
      magic_link_tokens: {
        Row: {
          created_at: string | null
          destination_path: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination_path: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination_path?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          activation_overview: string | null
          additional_notes: string | null
          brand_id: string
          city: string | null
          club_incentives: string | null
          club_responsibilities: string | null
          club_size_preference: string | null
          content_specifications: string | null
          created_at: string
          geographic_locations: string[] | null
          id: string
          media_requirements: string | null
          online_reach_preference: string | null
          phone_number: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_objective: string | null
          primary_objective_other: string | null
          professional_media: string | null
          quotes_requested: boolean | null
          quotes_requested_at: string | null
          state: string | null
          submission_deadline: string
          target_launch_date: string | null
          target_run_club_id: string | null
          title: string
        }
        Insert: {
          activation_overview?: string | null
          additional_notes?: string | null
          brand_id: string
          city?: string | null
          club_incentives?: string | null
          club_responsibilities?: string | null
          club_size_preference?: string | null
          content_specifications?: string | null
          created_at?: string
          geographic_locations?: string[] | null
          id?: string
          media_requirements?: string | null
          online_reach_preference?: string | null
          phone_number?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_objective?: string | null
          primary_objective_other?: string | null
          professional_media?: string | null
          quotes_requested?: boolean | null
          quotes_requested_at?: string | null
          state?: string | null
          submission_deadline?: string
          target_launch_date?: string | null
          target_run_club_id?: string | null
          title: string
        }
        Update: {
          activation_overview?: string | null
          additional_notes?: string | null
          brand_id?: string
          city?: string | null
          club_incentives?: string | null
          club_responsibilities?: string | null
          club_size_preference?: string | null
          content_specifications?: string | null
          created_at?: string
          geographic_locations?: string[] | null
          id?: string
          media_requirements?: string | null
          online_reach_preference?: string | null
          phone_number?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_objective?: string | null
          primary_objective_other?: string | null
          professional_media?: string | null
          quotes_requested?: boolean | null
          quotes_requested_at?: string | null
          state?: string | null
          submission_deadline?: string
          target_launch_date?: string | null
          target_run_club_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_target_run_club_id_fkey"
            columns: ["target_run_club_id"]
            isOneToOne: false
            referencedRelation: "run_club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_views: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          run_club_id: string
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          run_club_id: string
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          run_club_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_views_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_views_run_club_id_fkey"
            columns: ["run_club_id"]
            isOneToOne: false
            referencedRelation: "run_club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email_application_updates: boolean | null
          email_new_applications: boolean | null
          email_new_messages: boolean | null
          email_new_opportunities: boolean | null
          email_notifications_enabled: boolean | null
          id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          email_application_updates?: boolean | null
          email_new_applications?: boolean | null
          email_new_messages?: boolean | null
          email_new_opportunities?: boolean | null
          email_notifications_enabled?: boolean | null
          id: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          email_application_updates?: boolean | null
          email_new_applications?: boolean | null
          email_new_messages?: boolean | null
          email_new_opportunities?: boolean | null
          email_notifications_enabled?: boolean | null
          id?: string
          user_type?: string
        }
        Relationships: []
      }
      run_club_profiles: {
        Row: {
          city: string | null
          club_name: string | null
          community_data: Json | null
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          member_count: number | null
          social_media: Json | null
          state: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          club_name?: string | null
          community_data?: Json | null
          description?: string | null
          id: string
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          social_media?: Json | null
          state?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          club_name?: string | null
          community_data?: Json | null
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          member_count?: number | null
          social_media?: Json | null
          state?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          club_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "run_club_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_opportunity_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      cleanup_and_process_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_expired_magic_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_magic_link_session: {
        Args: { validated_user_id: string; magic_token: string }
        Returns: Json
      }
      force_process_all_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_email_preference_token: {
        Args: { user_email: string }
        Returns: string
      }
      generate_magic_link_token: {
        Args: { user_email: string; destination_path?: string }
        Returns: string
      }
      get_email_queue_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_preferences_by_token: {
        Args: { token_value: string }
        Returns: {
          user_id: string
          email: string
          full_name: string
          email_notifications_enabled: boolean
          email_new_applications: boolean
          email_application_updates: boolean
          email_new_messages: boolean
          email_new_opportunities: boolean
        }[]
      }
      process_email_queue: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_pending_emails: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      send_email_notification: {
        Args: {
          email_type: string
          recipient_email: string
          recipient_name: string
          email_data: Json
        }
        Returns: undefined
      }
      unsubscribe_all_by_token: {
        Args: { token_value: string }
        Returns: boolean
      }
      update_preferences_by_token: {
        Args: {
          token_value: string
          new_email_notifications_enabled?: boolean
          new_email_new_applications?: boolean
          new_email_application_updates?: boolean
          new_email_new_messages?: boolean
          new_email_new_opportunities?: boolean
        }
        Returns: boolean
      }
      validate_magic_link_token: {
        Args: { token_value: string }
        Returns: Json
      }
      webhook_process_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
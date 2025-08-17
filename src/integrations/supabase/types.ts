export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_analytics: {
        Row: {
          id: string
          post_id: string | null
          referrer: string | null
          scroll_depth_percentage: number | null
          time_spent_seconds: number | null
          user_agent: string | null
          viewed_at: string | null
          visitor_ip: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          referrer?: string | null
          scroll_depth_percentage?: number | null
          time_spent_seconds?: number | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_ip?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          referrer?: string | null
          scroll_depth_percentage?: number | null
          time_spent_seconds?: number | null
          user_agent?: string | null
          viewed_at?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          canonical_url: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          include_in_newsletter: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          newsletter_sent_at: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          social_description: string | null
          social_image_url: string | null
          social_title: string | null
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id: string
          canonical_url?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          include_in_newsletter?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          newsletter_sent_at?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          social_description?: string | null
          social_image_url?: string | null
          social_title?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string
          canonical_url?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          include_in_newsletter?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          newsletter_sent_at?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          social_description?: string | null
          social_image_url?: string | null
          social_title?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_public_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          source: string | null
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          source?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_rate_limits: {
        Row: {
          id: string
          last_sent_at: string
          notification_type: string
          reader_email: string
        }
        Insert: {
          id?: string
          last_sent_at?: string
          notification_type: string
          reader_email: string
        }
        Update: {
          id?: string
          last_sent_at?: string
          notification_type?: string
          reader_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_notes: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          flags: Json | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          slug: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_emails_sent: Json | null
          stripe_onboarding_completed_at: string | null
          stripe_onboarding_started_at: string | null
          stripe_setup_complete: boolean | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          flags?: Json | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          slug?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_emails_sent?: Json | null
          stripe_onboarding_completed_at?: string | null
          stripe_onboarding_started_at?: string | null
          stripe_setup_complete?: boolean | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          flags?: Json | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          slug?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_emails_sent?: Json | null
          stripe_onboarding_completed_at?: string | null
          stripe_onboarding_started_at?: string | null
          stripe_setup_complete?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          slug: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_setup_complete: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          slug?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_setup_complete?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          slug?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_setup_complete?: boolean | null
        }
        Relationships: []
      }
      public_tips: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_private: boolean | null
          message: string | null
          qr_code_id: string | null
          reader_avatar_url: string | null
          reader_name: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id: string
          is_private?: boolean | null
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_name?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_private?: boolean | null
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_tips_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_tips_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          author_id: string
          average_tip: number | null
          book_title: string
          buy_now_link: string | null
          cover_image: string | null
          created_at: string
          framed_qr_code_image_url: string | null
          id: string
          is_paid: boolean
          isbn: string | null
          last_tip_date: string | null
          publisher: string | null
          qr_code_image_url: string | null
          qr_code_status: string
          release_date: string | null
          slug: string | null
          stripe_session_id: string | null
          template: string
          total_amount: number | null
          total_tips: number | null
          uniqode_qr_code_id: string | null
        }
        Insert: {
          author_id: string
          average_tip?: number | null
          book_title: string
          buy_now_link?: string | null
          cover_image?: string | null
          created_at?: string
          framed_qr_code_image_url?: string | null
          id?: string
          is_paid?: boolean
          isbn?: string | null
          last_tip_date?: string | null
          publisher?: string | null
          qr_code_image_url?: string | null
          qr_code_status?: string
          release_date?: string | null
          slug?: string | null
          stripe_session_id?: string | null
          template?: string
          total_amount?: number | null
          total_tips?: number | null
          uniqode_qr_code_id?: string | null
        }
        Update: {
          author_id?: string
          average_tip?: number | null
          book_title?: string
          buy_now_link?: string | null
          cover_image?: string | null
          created_at?: string
          framed_qr_code_image_url?: string | null
          id?: string
          is_paid?: boolean
          isbn?: string | null
          last_tip_date?: string | null
          publisher?: string | null
          qr_code_image_url?: string | null
          qr_code_status?: string
          release_date?: string | null
          slug?: string | null
          stripe_session_id?: string | null
          template?: string
          total_amount?: number | null
          total_tips?: number | null
          uniqode_qr_code_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_author_public_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tip_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          tip_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          tip_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          tip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tip_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_comments_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      tip_likes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          tip_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          tip_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          tip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tip_likes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_likes_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount: number
          author_id: string
          book_title: string | null
          created_at: string
          id: string
          is_private: boolean | null
          message: string | null
          qr_code_id: string | null
          reader_avatar_url: string | null
          reader_email: string | null
          reader_name: string | null
          status: string | null
          stripe_session_id: string | null
          unsubscribed: boolean | null
        }
        Insert: {
          amount: number
          author_id: string
          book_title?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_email?: string | null
          reader_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          unsubscribed?: boolean | null
        }
        Update: {
          amount?: number
          author_id?: string
          book_title?: string | null
          created_at?: string
          id?: string
          is_private?: boolean | null
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_email?: string | null
          reader_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          unsubscribed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_author_public_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      unsubscribe_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          tip_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          tip_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          tip_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "unsubscribe_tokens_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_tip_for_unsubscribe: {
        Args: { tip_uuid: string; token_value: string }
        Returns: boolean
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_qr_code: {
        Args: {
          author_id: string
          book_title: string
          cover_image: string
          isbn: string
          publisher: string
          template: string
        }
        Returns: string
      }
      ensure_unique_profile_slug: {
        Args: { base_slug: string; profile_id?: string }
        Returns: string
      }
      ensure_unique_qr_slug: {
        Args: { base_slug: string; qr_id?: string }
        Returns: string
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      generate_url_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_blog_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_public_profile_by_id: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          slug: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_setup_complete: boolean | null
        }[]
      }
      get_public_profile_by_name: {
        Args: { profile_name: string }
        Returns: Record<string, unknown>
      }
      get_public_profile_by_slug: {
        Args: { profile_slug: string }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          slug: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_setup_complete: boolean | null
        }[]
      }
      get_qr_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_tip_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_email_been_sent: {
        Args: { email_type: string; user_id: string }
        Returns: boolean
      }
      increment_blog_view: {
        Args: { post_id: string }
        Returns: undefined
      }
      insert_public_profile: {
        Args: {
          profile_avatar_url: string
          profile_bio: string
          profile_id: string
          profile_name: string
          profile_social_links: Json
        }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      record_email_sent: {
        Args: { email_type: string; user_id: string }
        Returns: undefined
      }
      test_pg_net_extension: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      unsubscribe_tip: {
        Args: { tip_uuid: string; unsubscribe_token: string }
        Returns: boolean
      }
      update_public_profile: {
        Args: {
          profile_avatar_url: string
          profile_bio: string
          profile_id: string
          profile_name: string
          profile_social_links: Json
        }
        Returns: undefined
      }
      validate_unsubscribe_token: {
        Args: { tip_uuid: string; token_value: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "author" | "reader"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "author", "reader"],
    },
  },
} as const

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
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_emails_sent: Json | null
          stripe_onboarding_completed_at: string | null
          stripe_onboarding_started_at: string | null
          stripe_setup_complete: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_emails_sent?: Json | null
          stripe_onboarding_completed_at?: string | null
          stripe_onboarding_started_at?: string | null
          stripe_setup_complete?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
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
          social_links: Json | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          social_links?: Json | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          social_links?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_qr_code: {
        Args: {
          author_id: string
          book_title: string
          template: string
          publisher: string
          isbn: string
          cover_image: string
        }
        Returns: string
      }
      get_public_profile_by_id: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          social_links: Json | null
        }[]
      }
      get_public_profile_by_name: {
        Args: { profile_name: string }
        Returns: Record<string, unknown>
      }
      has_email_been_sent: {
        Args: { user_id: string; email_type: string }
        Returns: boolean
      }
      insert_public_profile: {
        Args: {
          profile_id: string
          profile_name: string
          profile_bio: string
          profile_avatar_url: string
          profile_social_links: Json
        }
        Returns: undefined
      }
      record_email_sent: {
        Args: { user_id: string; email_type: string }
        Returns: undefined
      }
      test_pg_net_extension: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_public_profile: {
        Args: {
          profile_id: string
          profile_name: string
          profile_bio: string
          profile_avatar_url: string
          profile_social_links: Json
        }
        Returns: undefined
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

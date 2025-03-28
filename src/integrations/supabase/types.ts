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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          name: string | null
          role: string | null
          social_links: Json | null
          stripe_account_id: string | null
          stripe_setup_complete: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          name?: string | null
          role?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
          stripe_setup_complete?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name?: string | null
          role?: string | null
          social_links?: Json | null
          stripe_account_id?: string | null
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
          message: string | null
          qr_code_id: string | null
          reader_avatar_url: string | null
          reader_name: string | null
          status: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          author_id: string
          book_title?: string | null
          created_at?: string
          id?: string
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          author_id?: string
          book_title?: string | null
          created_at?: string
          id?: string
          message?: string | null
          qr_code_id?: string | null
          reader_avatar_url?: string | null
          reader_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile_by_id: {
        Args: {
          profile_id: string
        }
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
        Args: {
          profile_name: string
        }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          social_links: Json | null
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

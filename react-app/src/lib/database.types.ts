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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      business_cards: {
        Row: {
          address: string | null
          attachment_filename: string | null
          attachment_size: number | null
          attachment_title: string | null
          attachment_url: string | null
          background_image: string | null
          card_color: string | null
          company: string | null
          company_logo: string | null
          created_at: string | null
          custom_url: string | null
          department: string | null
          email: string | null
          facebook: string | null
          font_style: string | null
          github: string | null
          id: string
          instagram: string | null
          introduction: string | null
          is_active: boolean | null
          is_primary: boolean | null
          linkedin: string | null
          name: string
          phone: string | null
          profile_image: string | null
          qr_code: string | null
          services: string[] | null
          short_url: string | null
          skills: string[] | null
          theme: string | null
          title: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_title?: string | null
          attachment_url?: string | null
          background_image?: string | null
          card_color?: string | null
          company?: string | null
          company_logo?: string | null
          created_at?: string | null
          custom_url?: string | null
          department?: string | null
          email?: string | null
          facebook?: string | null
          font_style?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          introduction?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          linkedin?: string | null
          name: string
          phone?: string | null
          profile_image?: string | null
          qr_code?: string | null
          services?: string[] | null
          short_url?: string | null
          skills?: string[] | null
          theme?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_title?: string | null
          attachment_url?: string | null
          background_image?: string | null
          card_color?: string | null
          company?: string | null
          company_logo?: string | null
          created_at?: string | null
          custom_url?: string | null
          department?: string | null
          email?: string | null
          facebook?: string | null
          font_style?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          introduction?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          linkedin?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          qr_code?: string | null
          services?: string[] | null
          short_url?: string | null
          skills?: string[] | null
          theme?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      callback_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          phone_number: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["callback_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          phone_number?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["callback_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          phone_number?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["callback_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "callback_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          business_card_id: string | null
          campaign: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_scans: number | null
          scan_count: number | null
          short_code: string
          target_rules: Json | null
          target_type: string
          target_url: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_card_id?: string | null
          campaign?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          scan_count?: number | null
          short_code: string
          target_rules?: Json | null
          target_type?: string
          target_url: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_card_id?: string | null
          campaign?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          scan_count?: number | null
          short_code?: string
          target_rules?: Json | null
          target_type?: string
          target_url?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_business_card_id_fkey"
            columns: ["business_card_id"]
            isOneToOne: false
            referencedRelation: "business_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scans: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          qr_code_id: string
          referrer: string | null
          scanned_at: string | null
          session_duration: number | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          qr_code_id: string
          referrer?: string | null
          scanned_at?: string | null
          session_duration?: number | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          qr_code_id?: string
          referrer?: string | null
          scanned_at?: string | null
          session_duration?: number | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_code_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      sidejob_cards: {
        Row: {
          badge: string | null
          business_card_id: string | null
          category_primary:
            | Database["public"]["Enums"]["category_primary_type"]
            | null
          category_secondary: string | null
          click_count: number | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          display_order: number | null
          expiry_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          badge?: string | null
          business_card_id?: string | null
          category_primary?:
            | Database["public"]["Enums"]["category_primary_type"]
            | null
          category_secondary?: string | null
          click_count?: number | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          badge?: string | null
          business_card_id?: string | null
          category_primary?:
            | Database["public"]["Enums"]["category_primary_type"]
            | null
          category_secondary?: string | null
          click_count?: number | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sidejob_cards_business_card_id_fkey"
            columns: ["business_card_id"]
            isOneToOne: false
            referencedRelation: "business_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sidejob_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          bio: string | null
          callback_settings: Json | null
          company: string | null
          created_at: string | null
          id: string
          position: string | null
          social_links: Json | null
          theme: string | null
          theme_settings: Json | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          callback_settings?: Json | null
          company?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          social_links?: Json | null
          theme?: string | null
          theme_settings?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          callback_settings?: Json | null
          company?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          social_links?: Json | null
          theme?: string | null
          theme_settings?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          domain_name: string | null
          email: string
          id: string
          name: string
          phone: string | null
          profile_image_url: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain_name?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          profile_image_url?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain_name?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visitor_stats: {
        Row: {
          created_at: string | null
          id: string
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string
          visit_date: string | null
          visitor_ip: unknown | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id: string
          visit_date?: string | null
          visitor_ip?: unknown | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string
          visit_date?: string | null
          visitor_ip?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      qr_code_analytics: {
        Row: {
          active_days: number | null
          avg_session_duration: number | null
          campaign: string | null
          created_at: string | null
          desktop_scans: number | null
          id: string | null
          last_scanned_at: string | null
          mobile_scans: number | null
          short_code: string | null
          tablet_scans: number | null
          total_scans: number | null
          unique_visitors: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      callback_status: "PENDING" | "SENT" | "FAILED"
      category_primary_type:
        | "shopping"
        | "education"
        | "service"
        | "subscription"
        | "promotion"
      subscription_tier: "FREE" | "PREMIUM" | "BUSINESS"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      callback_status: ["PENDING", "SENT", "FAILED"],
      category_primary_type: [
        "shopping",
        "education",
        "service",
        "subscription",
        "promotion",
      ],
      subscription_tier: ["FREE", "PREMIUM", "BUSINESS"],
    },
  },
} as const

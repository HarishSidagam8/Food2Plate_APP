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
  public: {
    Tables: {
      food_posts: {
        Row: {
          available_until: string
          created_at: string | null
          description: string | null
          donor_id: string
          food_type: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          pickup_location: string
          quality_confidence: number | null
          quality_reasoning: string | null
          quality_status: string | null
          quantity: string
          shelf_life_hours: number | null
          status: Database["public"]["Enums"]["food_status"] | null
          updated_at: string | null
        }
        Insert: {
          available_until: string
          created_at?: string | null
          description?: string | null
          donor_id: string
          food_type: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          pickup_location: string
          quality_confidence?: number | null
          quality_reasoning?: string | null
          quality_status?: string | null
          quantity: string
          shelf_life_hours?: number | null
          status?: Database["public"]["Enums"]["food_status"] | null
          updated_at?: string | null
        }
        Update: {
          available_until?: string
          created_at?: string | null
          description?: string | null
          donor_id?: string
          food_type?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          pickup_location?: string
          quality_confidence?: number | null
          quality_reasoning?: string | null
          quality_status?: string | null
          quantity?: string
          shelf_life_hours?: number | null
          status?: Database["public"]["Enums"]["food_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_posts_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_restaurant: boolean | null
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          restaurant_description: string | null
          restaurant_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          total_ratings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_restaurant?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          restaurant_description?: string | null
          restaurant_name?: string | null
          role: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_restaurant?: boolean | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          restaurant_description?: string | null
          restaurant_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_ratings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          donor_id: string
          id: string
          rating: number
          receiver_id: string
          reservation_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          donor_id: string
          id?: string
          rating: number
          receiver_id: string
          reservation_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          donor_id?: string
          id?: string
          rating?: number
          receiver_id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string | null
          food_post_id: string
          id: string
          notes: string | null
          pickup_time: string | null
          receiver_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          food_post_id: string
          id?: string
          notes?: string | null
          pickup_time?: string | null
          receiver_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          food_post_id?: string
          id?: string
          notes?: string | null
          pickup_time?: string | null
          receiver_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_food_post_id_fkey"
            columns: ["food_post_id"]
            isOneToOne: false
            referencedRelation: "food_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          badge_level: string
          created_at: string | null
          green_points: number
          id: string
          profile_id: string
          total_co2_saved_kg: number
          total_food_saved_kg: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_level?: string
          created_at?: string | null
          green_points?: number
          id?: string
          profile_id: string
          total_co2_saved_kg?: number
          total_food_saved_kg?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_level?: string
          created_at?: string | null
          green_points?: number
          id?: string
          profile_id?: string
          total_co2_saved_kg?: number
          total_food_saved_kg?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_badge_level: {
        Args: { points: number }
        Returns: string
      }
      expire_old_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_donor_public_profile: {
        Args: { donor_profile_id: string }
        Returns: {
          full_name: string
          id: string
          is_restaurant: boolean
          profile_image_url: string
          rating: number
          restaurant_description: string
          restaurant_name: string
          role: string
          total_ratings: number
        }[]
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          full_name: string
          id: string
          is_restaurant: boolean
          profile_image_url: string
          rating: number
          restaurant_description: string
          restaurant_name: string
          role: string
          total_ratings: number
        }[]
      }
    }
    Enums: {
      food_status: "available" | "reserved" | "expired" | "completed"
      user_role: "donor" | "receiver"
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
      food_status: ["available", "reserved", "expired", "completed"],
      user_role: ["donor", "receiver"],
    },
  },
} as const

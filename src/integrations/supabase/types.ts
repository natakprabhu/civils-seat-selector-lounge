export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      library_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          otp: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          otp: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          otp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          mobile: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          mobile: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          mobile?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seat_bookings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booked_at: string
          duration_months: number | null
          id: string
          notes: string | null
          payment_reference: string | null
          requested_at: string | null
          seat_id: string
          status: string | null
          subscription_end_date: string | null
          total_amount: number | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booked_at?: string
          duration_months?: number | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          requested_at?: string | null
          seat_id: string
          status?: string | null
          subscription_end_date?: string | null
          total_amount?: number | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booked_at?: string
          duration_months?: number | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          requested_at?: string | null
          seat_id?: string
          status?: string | null
          subscription_end_date?: string | null
          total_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      seat_change_requests: {
        Row: {
          current_booking_id: string | null
          fee_amount: number | null
          id: string
          new_seat_id: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          user_id: string | null
        }
        Insert: {
          current_booking_id?: string | null
          fee_amount?: number | null
          id?: string
          new_seat_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          user_id?: string | null
        }
        Update: {
          current_booking_id?: string | null
          fee_amount?: number | null
          id?: string
          new_seat_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_change_requests_new_seat_id_fkey"
            columns: ["new_seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_change_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_holds: {
        Row: {
          expires_at: string
          held_at: string
          id: string
          seat_id: string
          show_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          held_at?: string
          id?: string
          seat_id: string
          show_id: string
          user_id: string
        }
        Update: {
          expires_at?: string
          held_at?: string
          id?: string
          seat_id?: string
          show_id?: string
          user_id?: string
        }
        Relationships: []
      }
      seat_images: {
        Row: {
          id: string
          image_url: string
          seat_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          image_url: string
          seat_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          seat_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_images_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: true
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          created_at: string | null
          id: string
          monthly_rate: number
          row_number: string
          seat_number: string
          section: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_rate?: number
          row_number: string
          seat_number: string
          section: string
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_rate?: number
          row_number?: string
          seat_number?: string
          section?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          change_request_id: string | null
          description: string
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          processed_by: string | null
          receipt_number: string | null
          transaction_date: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          change_request_id?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          processed_by?: string | null
          receipt_number?: string | null
          transaction_date?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          change_request_id?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          processed_by?: string | null
          receipt_number?: string | null
          transaction_date?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_change_request_id_fkey"
            columns: ["change_request_id"]
            isOneToOne: false
            referencedRelation: "seat_change_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      cleanup_expired_holds_and_bookings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_locks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "approved" | "cancelled" | "expired"
      payment_method: "cash" | "online" | "upi" | "card"
      payment_status: "pending" | "approved" | "rejected"
      seat_status: "vacant" | "booked" | "maintenance" | "on_hold"
      transaction_type: "booking" | "extension" | "seat_change" | "refund"
      user_role: "admin" | "staff" | "client"
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
      booking_status: ["pending", "approved", "cancelled", "expired"],
      payment_method: ["cash", "online", "upi", "card"],
      payment_status: ["pending", "approved", "rejected"],
      seat_status: ["vacant", "booked", "maintenance", "on_hold"],
      transaction_type: ["booking", "extension", "seat_change", "refund"],
      user_role: ["admin", "staff", "client"],
    },
  },
} as const

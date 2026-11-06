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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      order_notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          error: string | null
          failed_at: string | null
          id: string
          next_attempt_at: string
          order_id: string
          provider_id: string | null
          read_at: string | null
          sent_at: string | null
          state: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          failed_at?: string | null
          id?: string
          next_attempt_at?: string
          order_id: string
          provider_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          state?: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          failed_at?: string | null
          id?: string
          next_attempt_at?: string
          order_id?: string
          provider_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          state?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_service_state: {
        Row: {
          http_status: number | null
          id: string
          message: string | null
          paused: boolean
          updated_at: string
        }
        Insert: {
          http_status?: number | null
          id: string
          message?: string | null
          paused?: boolean
          updated_at?: string
        }
        Update: {
          http_status?: number | null
          id?: string
          message?: string | null
          paused?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      payment_credentials: {
        Row: {
          encrypted_key: string
          environment: string
          updated_at: string
        }
        Insert: {
          encrypted_key: string
          environment: string
          updated_at?: string
        }
        Update: {
          encrypted_key?: string
          environment?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          access_hash: string
          amount: number
          buyer_name: string
          buyer_whatsapp: string
          checkout_url: string | null
          created_at: string
          environment: string
          fulfilled: boolean
          id: string
          minecraft_name: string
          payment_method: string | null
          product_id: string
          product_name: string
          provider_invoice_id: string | null
          requester_hash: string
          status: string
          updated_at: string
          whatsapp_notifications: boolean
        }
        Insert: {
          access_hash: string
          amount: number
          buyer_name: string
          buyer_whatsapp: string
          checkout_url?: string | null
          created_at?: string
          environment: string
          fulfilled?: boolean
          id?: string
          minecraft_name?: string
          payment_method?: string | null
          product_id: string
          product_name: string
          provider_invoice_id?: string | null
          requester_hash: string
          status?: string
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Update: {
          access_hash?: string
          amount?: number
          buyer_name?: string
          buyer_whatsapp?: string
          checkout_url?: string | null
          created_at?: string
          environment?: string
          fulfilled?: boolean
          id?: string
          minecraft_name?: string
          payment_method?: string | null
          product_id?: string
          product_name?: string
          provider_invoice_id?: string | null
          requester_hash?: string
          status?: string
          updated_at?: string
          whatsapp_notifications?: boolean
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          enabled: boolean
          environment: string
          id: number
        }
        Insert: {
          enabled?: boolean
          environment?: string
          id?: number
        }
        Update: {
          enabled?: boolean
          environment?: string
          id?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string
          category: string
          created_at: string
          features: string[]
          gallery: string[]
          id: string
          is_featured: boolean
          main_image: string | null
          name: string
          price: number
          short_desc: string | null
          sold: number
          tags: string[]
          views: number
          wa_link: string | null
        }
        Insert: {
          badge?: string
          category?: string
          created_at?: string
          features?: string[]
          gallery?: string[]
          id?: string
          is_featured?: boolean
          main_image?: string | null
          name: string
          price?: number
          short_desc?: string | null
          sold?: number
          tags?: string[]
          views?: number
          wa_link?: string | null
        }
        Update: {
          badge?: string
          category?: string
          created_at?: string
          features?: string[]
          gallery?: string[]
          id?: string
          is_featured?: boolean
          main_image?: string | null
          name?: string
          price?: number
          short_desc?: string | null
          sold?: number
          tags?: string[]
          views?: number
          wa_link?: string | null
        }
        Relationships: []
      }
      store_owners: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: number
          whatsapp_url: string
        }
        Insert: {
          id?: number
          whatsapp_url?: string
        }
        Update: {
          id?: number
          whatsapp_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_delivery_statuses: {
        Row: {
          delivery_id: string
          errors: Json | null
          id: string
          provider_at: string
          provider_id: string
          status: string
        }
        Insert: {
          delivery_id: string
          errors?: Json | null
          id?: string
          provider_at: string
          provider_id: string
          status: string
        }
        Update: {
          delivery_id?: string
          errors?: Json | null
          id?: string
          provider_at?: string
          provider_id?: string
          status?: string
        }
        Relationships: []
      }
      whatsapp_webhook_events: {
        Row: {
          delivery_id: string
          event: string
          id: string
          next_attempt_at: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          delivery_id: string
          event: string
          id?: string
          next_attempt_at?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          delivery_id?: string
          event?: string
          id?: string
          next_attempt_at?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_views: { Args: { _id: string }; Returns: undefined }
      is_store_owner: { Args: never; Returns: boolean }
      process_whatsapp_event: { Args: { _id: string }; Returns: undefined }
      reconcile_whatsapp_delivery: {
        Args: { _provider_id: string }
        Returns: undefined
      }
      reserve_payment_order: {
        Args: {
          _access_hash: string
          _buyer_name: string
          _buyer_whatsapp: string
          _minecraft_name: string
          _product_id: string
          _requester_hash: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const

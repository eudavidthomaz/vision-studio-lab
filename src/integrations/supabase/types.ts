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
      content_library: {
        Row: {
          content: Json
          content_type: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          is_pinned: boolean | null
          pilar: string | null
          pinned_at: string | null
          prompt_original: string | null
          published_at: string | null
          search_vector: unknown
          sermon_id: string | null
          source_type: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json
          content_type: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          pilar?: string | null
          pinned_at?: string | null
          prompt_original?: string | null
          published_at?: string | null
          search_vector?: unknown
          sermon_id?: string | null
          source_type: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_pinned?: boolean | null
          pilar?: string | null
          pinned_at?: string | null
          prompt_original?: string | null
          published_at?: string | null
          search_vector?: unknown
          sermon_id?: string | null
          source_type?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_sermon_id_fkey"
            columns: ["sermon_id"]
            isOneToOne: false
            referencedRelation: "sermons"
            referencedColumns: ["id"]
          },
        ]
      }
      content_planners: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          sermon_id: string | null
          updated_at: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          sermon_id?: string | null
          updated_at?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          sermon_id?: string | null
          updated_at?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_planners_sermon_id_fkey"
            columns: ["sermon_id"]
            isOneToOne: false
            referencedRelation: "sermons"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          pillar: string
          template_data: Json
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          pillar: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          pillar?: string
          template_data?: Json
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string
          scopes: string[] | null
          token_expiry: string
          updated_at: string | null
          user_id: string
          volunteer_id: string | null
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token: string
          scopes?: string[] | null
          token_expiry: string
          updated_at?: string | null
          user_id: string
          volunteer_id?: string | null
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string
          scopes?: string[] | null
          token_expiry?: string
          updated_at?: string | null
          user_id?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_tokens_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: true
            referencedRelation: "volunteer_stats"
            referencedColumns: ["volunteer_id"]
          },
          {
            foreignKeyName: "google_calendar_tokens_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: true
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          recipient_email: string | null
          recipient_id: string
          schedule_id: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          recipient_email?: string | null
          recipient_id: string
          schedule_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          recipient_email?: string | null
          recipient_id?: string
          schedule_id?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "volunteer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          confirmation_request_app: boolean | null
          confirmation_request_email: boolean | null
          created_at: string | null
          id: string
          reminder_24h_app: boolean | null
          reminder_24h_email: boolean | null
          reminder_2h_app: boolean | null
          reminder_2h_email: boolean | null
          schedule_changed_app: boolean | null
          schedule_changed_email: boolean | null
          schedule_created_app: boolean | null
          schedule_created_email: boolean | null
          updated_at: string | null
          user_id: string
          volunteer_id: string | null
        }
        Insert: {
          confirmation_request_app?: boolean | null
          confirmation_request_email?: boolean | null
          created_at?: string | null
          id?: string
          reminder_24h_app?: boolean | null
          reminder_24h_email?: boolean | null
          reminder_2h_app?: boolean | null
          reminder_2h_email?: boolean | null
          schedule_changed_app?: boolean | null
          schedule_changed_email?: boolean | null
          schedule_created_app?: boolean | null
          schedule_created_email?: boolean | null
          updated_at?: string | null
          user_id: string
          volunteer_id?: string | null
        }
        Update: {
          confirmation_request_app?: boolean | null
          confirmation_request_email?: boolean | null
          created_at?: string | null
          id?: string
          reminder_24h_app?: boolean | null
          reminder_24h_email?: boolean | null
          reminder_2h_app?: boolean | null
          reminder_2h_email?: boolean | null
          schedule_changed_app?: boolean | null
          schedule_changed_email?: boolean | null
          schedule_created_app?: boolean | null
          schedule_created_email?: boolean | null
          updated_at?: string | null
          user_id?: string
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: true
            referencedRelation: "volunteer_stats"
            referencedColumns: ["volunteer_id"]
          },
          {
            foreignKeyName: "notification_preferences_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: true
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_content_id: string | null
          related_content_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_content_id?: string | null
          related_content_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_content_id?: string | null
          related_content_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          church: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          instagram: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          church?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          instagram?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          church?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      schedule_confirmation_tokens: {
        Row: {
          action_taken: string | null
          created_at: string | null
          expires_at: string
          id: string
          notes: string | null
          schedule_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          notes?: string | null
          schedule_id: string
          token?: string
          used_at?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          notes?: string | null
          schedule_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_confirmation_tokens_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: true
            referencedRelation: "volunteer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          endpoint: string | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sermons: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          sermon_hash: string | null
          status: string | null
          summary: string | null
          transcript: string | null
          transcription_time_ms: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          sermon_hash?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          transcription_time_ms?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          sermon_hash?: string | null
          status?: string | null
          summary?: string | null
          transcript?: string | null
          transcription_time_ms?: number | null
          user_id?: string
        }
        Relationships: []
      }
      shared_content: {
        Row: {
          approval_status: string
          content_id: string
          content_type: string
          created_at: string
          expires_at: string
          id: string
          is_public: boolean
          requires_approval: boolean
          review_token: string | null
          reviewed_at: string | null
          reviewer_comment: string | null
          share_token: string | null
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          approval_status?: string
          content_id: string
          content_type: string
          created_at?: string
          expires_at?: string
          id?: string
          is_public?: boolean
          requires_approval?: boolean
          review_token?: string | null
          reviewed_at?: string | null
          reviewer_comment?: string | null
          share_token?: string | null
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          approval_status?: string
          content_id?: string
          content_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_public?: boolean
          requires_approval?: boolean
          review_token?: string | null
          reviewed_at?: string | null
          reviewer_comment?: string | null
          share_token?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_quotas: {
        Row: {
          created_at: string
          id: string
          images_generated: number
          live_captures_used: number
          reset_date: string
          transcriptions_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          images_generated?: number
          live_captures_used?: number
          reset_date?: string
          transcriptions_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          images_generated?: number
          live_captures_used?: number
          reset_date?: string
          transcriptions_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string | null
          feedback_type: string
          id: string
          message: string
          page_url: string | null
          sentiment: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_type: string
          id?: string
          message: string
          page_url?: string | null
          sentiment?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback_type?: string
          id?: string
          message?: string
          page_url?: string | null
          sentiment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      volunteer_schedules: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          role: string
          service_date: string
          service_name: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          volunteer_id: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          role: string
          service_date: string
          service_name?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          volunteer_id: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          role?: string
          service_date?: string
          service_name?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_schedules_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_stats"
            referencedColumns: ["volunteer_id"]
          },
          {
            foreignKeyName: "volunteer_schedules_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          ministry: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          ministry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          ministry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      volunteer_stats: {
        Row: {
          absent_count: number | null
          attendance_rate: number | null
          confirmed_count: number | null
          email: string | null
          first_schedule: string | null
          is_active: boolean | null
          last_schedule: string | null
          ministry: string | null
          name: string | null
          pending_count: number | null
          phone: string | null
          primary_role: string | null
          roles_count: number | null
          roles_worked: string[] | null
          substituted_count: number | null
          total_schedules: number | null
          user_id: string | null
          volunteer_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_quota: {
        Args: { _feature: string; _user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          _endpoint: string
          _max_requests: number
          _user_id: string
          _window_minutes: number
        }
        Returns: Json
      }
      generate_random_token: { Args: { length: number }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_quota: {
        Args: { _feature: string; _user_id: string }
        Returns: Json
      }
      reset_monthly_quotas: { Args: never; Returns: undefined }
      search_content_by_tags: {
        Args: { _tags: string[]; _user_id: string }
        Returns: {
          content: Json
          planner_id: string
          week_start_date: string
        }[]
      }
      search_content_library: {
        Args: { search_query: string; user_uuid: string }
        Returns: {
          content: Json
          content_type: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          is_pinned: boolean | null
          pilar: string | null
          pinned_at: string | null
          prompt_original: string | null
          published_at: string | null
          search_vector: unknown
          sermon_id: string | null
          source_type: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "content_library"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      validate_text_input: {
        Args: {
          _field_name?: string
          _input: string
          _max_length?: number
          _min_length?: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "free" | "pro" | "team" | "admin"
      content_status: "draft" | "approved" | "published" | "archived"
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
      app_role: ["free", "pro", "team", "admin"],
      content_status: ["draft", "approved", "published", "archived"],
    },
  },
} as const

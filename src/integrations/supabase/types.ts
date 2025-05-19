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
      coach_messages: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          message: string
          project_id: string | null
          read_at: string | null
          resident_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          message: string
          project_id?: string | null
          read_at?: string | null
          resident_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          read_at?: string | null
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_messages_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          date: string
          id: string
          priority: string
          read: boolean
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          date?: string
          id?: string
          priority?: string
          read?: boolean
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          date?: string
          id?: string
          priority?: string
          read?: boolean
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_complete: boolean
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          profile_complete?: boolean
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_complete?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_action_items: {
        Row: {
          action_data: Json | null
          action_type: string
          completed: boolean
          completion_date: string | null
          created_at: string
          description: string | null
          for_role: string | null
          icon_name: string | null
          id: string
          priority: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          completed?: boolean
          completion_date?: string | null
          created_at?: string
          description?: string | null
          for_role?: string | null
          icon_name?: string | null
          id?: string
          priority?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          completed?: boolean
          completion_date?: string | null
          created_at?: string
          description?: string | null
          for_role?: string | null
          icon_name?: string | null
          id?: string
          priority?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          location: string | null
          project_id: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          location?: string | null
          project_id: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          location?: string | null
          project_id?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          project_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          project_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          project_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          added_at: string
          added_by: string | null
          email: string | null
          id: string
          name: string | null
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          email?: string | null
          id?: string
          name?: string | null
          project_id: string
          role: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          email?: string | null
          id?: string
          name?: string | null
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          construction_preferences: Json | null
          created_at: string
          description: string | null
          design_preferences: Json | null
          id: string
          management_preferences: Json | null
          prior_experience: Json | null
          project_preferences: Json | null
          property_id: string
          renovation_areas: Json | null
          state: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          construction_preferences?: Json | null
          created_at?: string
          description?: string | null
          design_preferences?: Json | null
          id?: string
          management_preferences?: Json | null
          prior_experience?: Json | null
          project_preferences?: Json | null
          property_id: string
          renovation_areas?: Json | null
          state?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          construction_preferences?: Json | null
          created_at?: string
          description?: string | null
          design_preferences?: Json | null
          id?: string
          management_preferences?: Json | null
          prior_experience?: Json | null
          project_preferences?: Json | null
          property_id?: string
          renovation_areas?: Json | null
          state?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address_line1: string
          address_line2: string | null
          bathrooms: string | null
          bedrooms: string | null
          blueprint_url: string | null
          city: string
          created_at: string
          exterior_attributes: string[] | null
          file_metadata: Json | null
          home_photos: string[] | null
          home_purpose: string | null
          home_type: string | null
          id: string
          image_url: string | null
          interior_attributes: string[] | null
          property_name: string
          sqft: string | null
          state: string
          updated_at: string
          user_id: string
          working_on_behalf: boolean | null
          zip_code: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          blueprint_url?: string | null
          city: string
          created_at?: string
          exterior_attributes?: string[] | null
          file_metadata?: Json | null
          home_photos?: string[] | null
          home_purpose?: string | null
          home_type?: string | null
          id?: string
          image_url?: string | null
          interior_attributes?: string[] | null
          property_name: string
          sqft?: string | null
          state: string
          updated_at?: string
          user_id: string
          working_on_behalf?: boolean | null
          zip_code: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          blueprint_url?: string | null
          city?: string
          created_at?: string
          exterior_attributes?: string[] | null
          file_metadata?: Json | null
          home_photos?: string[] | null
          home_purpose?: string | null
          home_type?: string | null
          id?: string
          image_url?: string | null
          interior_attributes?: string[] | null
          property_name?: string
          sqft?: string | null
          state?: string
          updated_at?: string
          user_id?: string
          working_on_behalf?: boolean | null
          zip_code?: string
        }
        Relationships: []
      }
      property_rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      room_design_preferences: {
        Row: {
          created_at: string
          design_assets: Json | null
          drawings: string[] | null
          id: string
          inspiration_images: string[] | null
          pinterest_boards: Json | null
          renderings: string[] | null
          room_id: string
          tags_metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          design_assets?: Json | null
          drawings?: string[] | null
          id?: string
          inspiration_images?: string[] | null
          pinterest_boards?: Json | null
          renderings?: string[] | null
          room_id: string
          tags_metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          design_assets?: Json | null
          drawings?: string[] | null
          id?: string
          inspiration_images?: string[] | null
          pinterest_boards?: Json | null
          renderings?: string[] | null
          room_id?: string
          tags_metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_design_preferences_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "property_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pro_insurance: {
        Row: {
          coverage_amount: number | null
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          insurance_type: string
          policy_number: string | null
          pro_id: string
          provider: string
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          coverage_amount?: number | null
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          insurance_type: string
          policy_number?: string | null
          pro_id: string
          provider: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          coverage_amount?: number | null
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          insurance_type?: string
          policy_number?: string | null
          pro_id?: string
          provider?: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_pro_insurance_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "service_pro_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pro_licenses: {
        Row: {
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          license_number: string
          license_type: string
          pro_id: string
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          license_number: string
          license_type: string
          pro_id: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          license_number?: string
          license_type?: string
          pro_id?: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_pro_licenses_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "service_pro_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pro_portfolio: {
        Row: {
          budget: number | null
          client_name: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          location: string | null
          pro_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          pro_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          pro_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_pro_portfolio_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "service_pro_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pro_profiles: {
        Row: {
          about_text: string | null
          company_name: string | null
          created_at: string | null
          id: string
          is_profile_complete: boolean | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          photo_url: string | null
          service_details: string | null
          service_radius: number | null
          services_offered: string[] | null
          updated_at: string | null
        }
        Insert: {
          about_text?: string | null
          company_name?: string | null
          created_at?: string | null
          id: string
          is_profile_complete?: boolean | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          photo_url?: string | null
          service_details?: string | null
          service_radius?: number | null
          services_offered?: string[] | null
          updated_at?: string | null
        }
        Update: {
          about_text?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          is_profile_complete?: boolean | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          photo_url?: string | null
          service_details?: string | null
          service_radius?: number | null
          services_offered?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_pro_team: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          pro_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          pro_id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          pro_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_pro_team_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "service_pro_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      statement_of_work: {
        Row: {
          bid_configuration: Json | null
          created_at: string
          feedback: string | null
          id: string
          labor_items: Json | null
          material_items: Json | null
          project_id: string
          status: string
          updated_at: string
          work_areas: Json | null
        }
        Insert: {
          bid_configuration?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          labor_items?: Json | null
          material_items?: Json | null
          project_id: string
          status?: string
          updated_at?: string
          work_areas?: Json | null
        }
        Update: {
          bid_configuration?: Json | null
          created_at?: string
          feedback?: string | null
          id?: string
          labor_items?: Json | null
          material_items?: Json | null
          project_id?: string
          status?: string
          updated_at?: string
          work_areas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "statement_of_work_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coaches_to_existing_projects: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_coach_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_project_ownership: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      check_team_member_access: {
        Args: { project_id_param: string }
        Returns: boolean
      }
      check_team_membership: {
        Args: { project_id_param: string; user_id_param: string }
        Returns: boolean
      }
      check_user_is_coach: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_recipient_id: string
          p_type: string
          p_title: string
          p_content?: string
          p_priority?: string
          p_data?: Json
        }
        Returns: string
      }
      get_property_details: {
        Args: { p_property_id: string }
        Returns: {
          address_line1: string
          address_line2: string | null
          bathrooms: string | null
          bedrooms: string | null
          blueprint_url: string | null
          city: string
          created_at: string
          exterior_attributes: string[] | null
          file_metadata: Json | null
          home_photos: string[] | null
          home_purpose: string | null
          home_type: string | null
          id: string
          image_url: string | null
          interior_attributes: string[] | null
          property_name: string
          sqft: string | null
          state: string
          updated_at: string
          user_id: string
          working_on_behalf: boolean | null
          zip_code: string
        }[]
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: {
          email: string
        }[]
      }
      get_user_properties: {
        Args: { p_user_id: string }
        Returns: {
          address_line1: string
          address_line2: string | null
          bathrooms: string | null
          bedrooms: string | null
          blueprint_url: string | null
          city: string
          created_at: string
          exterior_attributes: string[] | null
          file_metadata: Json | null
          home_photos: string[] | null
          home_purpose: string | null
          home_type: string | null
          id: string
          image_url: string | null
          interior_attributes: string[] | null
          property_name: string
          sqft: string | null
          state: string
          updated_at: string
          user_id: string
          working_on_behalf: boolean | null
          zip_code: string
        }[]
      }
      handle_coach_claim: {
        Args: { uid: string }
        Returns: undefined
      }
      handle_project_update: {
        Args: {
          p_project_id: string
          p_property_id: string
          p_user_id: string
          p_title: string
          p_renovation_areas?: Json
          p_project_preferences?: Json
          p_construction_preferences?: Json
          p_design_preferences?: Json
          p_management_preferences?: Json
          p_prior_experience?: Json
        }
        Returns: string
      }
      has_property_team_access: {
        Args: { p_property_id: string }
        Returns: boolean
      }
      is_project_owner: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_project_team_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_property_owner: {
        Args: { p_property_id: string }
        Returns: boolean
      }
      is_service_pro: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_team_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_user_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      safe_check_team_membership: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      set_coach_claim: {
        Args: { uid: string }
        Returns: undefined
      }
      update_action_item_completion: {
        Args: { item_id: string; is_completed: boolean }
        Returns: {
          id: string
          project_id: string
          title: string
          description: string
          priority: string
          icon_name: string
          action_type: string
          action_data: Json
          completed: boolean
          completion_date: string
          created_at: string
          updated_at: string
          for_role: string
        }[]
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

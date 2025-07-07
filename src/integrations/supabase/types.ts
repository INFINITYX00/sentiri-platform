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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      boms: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          materials: Json | null
          name: string
          total_carbon: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          materials?: Json | null
          name: string
          total_carbon?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          materials?: Json | null
          name?: string
          total_carbon?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          max_materials: number | null
          max_projects: number | null
          name: string
          phone: string | null
          slug: string
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          max_materials?: number | null
          max_projects?: number | null
          name: string
          phone?: string | null
          slug: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          max_materials?: number | null
          max_projects?: number | null
          name?: string
          phone?: string | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      design_suggestions: {
        Row: {
          applied: boolean
          carbon_reduction: number
          category: string
          company_id: string | null
          created_at: string
          description: string
          id: string
          impact: string
          implementation_effort: string
          materials_saved: string | null
          title: string
          updated_at: string
        }
        Insert: {
          applied?: boolean
          carbon_reduction?: number
          category: string
          company_id?: string | null
          created_at?: string
          description: string
          id?: string
          impact?: string
          implementation_effort?: string
          materials_saved?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          applied?: boolean
          carbon_reduction?: number
          category?: string
          company_id?: string | null
          created_at?: string
          description?: string
          id?: string
          impact?: string
          implementation_effort?: string
          materials_saved?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_suggestions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_records: {
        Row: {
          carbon_factor: number
          company_id: string | null
          created_at: string
          efficiency: number
          energy_consumed: number
          equipment_name: string
          equipment_type: string
          hours_used: number
          id: string
          power_rating: number
          project_id: string | null
        }
        Insert: {
          carbon_factor: number
          company_id?: string | null
          created_at?: string
          efficiency: number
          energy_consumed: number
          equipment_name: string
          equipment_type: string
          hours_used: number
          id?: string
          power_rating: number
          project_id?: string | null
        }
        Update: {
          carbon_factor?: number
          company_id?: string | null
          created_at?: string
          efficiency?: number
          energy_consumed?: number
          equipment_name?: string
          equipment_type?: string
          hours_used?: number
          id?: string
          power_rating?: number
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "energy_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_stages: {
        Row: {
          actual_energy: number
          actual_hours: number
          company_id: string | null
          completed_date: string | null
          created_at: string
          energy_estimate: number
          estimated_hours: number
          id: string
          name: string
          notes: string | null
          progress: number
          project_id: string | null
          stage_id: string
          start_date: string | null
          status: string
          updated_at: string
          workers: string[]
        }
        Insert: {
          actual_energy?: number
          actual_hours?: number
          company_id?: string | null
          completed_date?: string | null
          created_at?: string
          energy_estimate?: number
          estimated_hours?: number
          id?: string
          name: string
          notes?: string | null
          progress?: number
          project_id?: string | null
          stage_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
          workers?: string[]
        }
        Update: {
          actual_energy?: number
          actual_hours?: number
          company_id?: string | null
          completed_date?: string | null
          created_at?: string
          energy_estimate?: number
          estimated_hours?: number
          id?: string
          name?: string
          notes?: string | null
          progress?: number
          project_id?: string | null
          stage_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          workers?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "manufacturing_stages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturing_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      material_passports: {
        Row: {
          carbon_data: Json | null
          company_id: string | null
          created_at: string | null
          id: string
          material_id: string | null
          origin: Json | null
          specifications: Json | null
          sustainability: Json | null
        }
        Insert: {
          carbon_data?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          origin?: Json | null
          specifications?: Json | null
          sustainability?: Json | null
        }
        Update: {
          carbon_data?: Json | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          origin?: Json | null
          specifications?: Json | null
          sustainability?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "material_passports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_passports_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_types: {
        Row: {
          ai_sourced: boolean | null
          carbon_factor: number | null
          category: string
          confidence_score: number | null
          created_at: string | null
          data_source: string | null
          density: number | null
          id: string
          last_updated: string | null
          specific_type: string
        }
        Insert: {
          ai_sourced?: boolean | null
          carbon_factor?: number | null
          category: string
          confidence_score?: number | null
          created_at?: string | null
          data_source?: string | null
          density?: number | null
          id?: string
          last_updated?: string | null
          specific_type: string
        }
        Update: {
          ai_sourced?: boolean | null
          carbon_factor?: number | null
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          data_source?: string | null
          density?: number | null
          id?: string
          last_updated?: string | null
          specific_type?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          ai_carbon_confidence: number | null
          ai_carbon_source: string | null
          ai_carbon_updated_at: string | null
          carbon_factor: number | null
          carbon_footprint: number
          carbon_source: string | null
          company_id: string | null
          cost_per_unit: number | null
          created_at: string | null
          density: number | null
          description: string | null
          dimension_unit: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          length: number | null
          name: string
          origin: string | null
          qr_code: string
          qr_image_url: string | null
          quantity: number
          specific_material: string | null
          thickness: number | null
          type: string
          unit: string
          unit_count: number | null
          updated_at: string | null
          volume: number | null
          weight: number | null
          width: number | null
        }
        Insert: {
          ai_carbon_confidence?: number | null
          ai_carbon_source?: string | null
          ai_carbon_updated_at?: string | null
          carbon_factor?: number | null
          carbon_footprint?: number
          carbon_source?: string | null
          company_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          density?: number | null
          description?: string | null
          dimension_unit?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          length?: number | null
          name: string
          origin?: string | null
          qr_code: string
          qr_image_url?: string | null
          quantity?: number
          specific_material?: string | null
          thickness?: number | null
          type: string
          unit?: string
          unit_count?: number | null
          updated_at?: string | null
          volume?: number | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          ai_carbon_confidence?: number | null
          ai_carbon_source?: string | null
          ai_carbon_updated_at?: string | null
          carbon_factor?: number | null
          carbon_footprint?: number
          carbon_source?: string | null
          company_id?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          density?: number | null
          description?: string | null
          dimension_unit?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          length?: number | null
          name?: string
          origin?: string | null
          qr_code?: string
          qr_image_url?: string | null
          quantity?: number
          specific_material?: string | null
          thickness?: number | null
          type?: string
          unit?: string
          unit_count?: number | null
          updated_at?: string | null
          volume?: number | null
          weight?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_passports: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          image_url: string | null
          product_name: string
          product_type: string
          production_date: string
          project_id: string
          qr_code: string
          qr_image_url: string | null
          quantity_produced: number
          specifications: Json | null
          total_carbon_footprint: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_name: string
          product_type?: string
          production_date?: string
          project_id: string
          qr_code: string
          qr_image_url?: string | null
          quantity_produced?: number
          specifications?: Json | null
          total_carbon_footprint?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          product_name?: string
          product_type?: string
          production_date?: string
          project_id?: string
          qr_code?: string
          qr_image_url?: string | null
          quantity_produced?: number
          specifications?: Json | null
          total_carbon_footprint?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_passports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_passports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          allocated_materials: string[] | null
          company_id: string | null
          completion_date: string | null
          created_at: string | null
          deleted: boolean
          description: string | null
          id: string
          name: string
          progress: number | null
          start_date: string | null
          status: string | null
          total_carbon_footprint: number | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          allocated_materials?: string[] | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          deleted?: boolean
          description?: string | null
          id?: string
          name: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          total_carbon_footprint?: number | null
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          allocated_materials?: string[] | null
          company_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          deleted?: boolean
          description?: string | null
          id?: string
          name?: string
          progress?: number | null
          start_date?: string | null
          status?: string | null
          total_carbon_footprint?: number | null
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          id: string
          material_id: string
          project_id: string
          quantity_consumed: number
          quantity_required: number
          total_cost: number
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id: string
          project_id: string
          quantity_consumed?: number
          quantity_required?: number
          total_cost?: number
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id?: string
          project_id?: string
          quantity_consumed?: number
          quantity_required?: number
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_arrival: string | null
          carbon_offset: boolean
          carrier: string
          company_id: string | null
          created_at: string
          destination: string
          estimated_arrival: string
          id: string
          items: string[]
          status: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          actual_arrival?: string | null
          carbon_offset?: boolean
          carrier: string
          company_id?: string | null
          created_at?: string
          destination: string
          estimated_arrival: string
          id?: string
          items?: string[]
          status?: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          actual_arrival?: string | null
          carbon_offset?: boolean
          carrier?: string
          company_id?: string | null
          created_at?: string
          destination?: string
          estimated_arrival?: string
          id?: string
          items?: string[]
          status?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          company_id: string
          created_at: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      takeback_items: {
        Row: {
          assessment_notes: string | null
          carbon_saved: number
          company_id: string | null
          created_at: string
          customer_name: string
          id: string
          product_name: string
          recovery_value: number
          request_date: string
          scheduled_date: string | null
          serial_number: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_notes?: string | null
          carbon_saved?: number
          company_id?: string | null
          created_at?: string
          customer_name: string
          id?: string
          product_name: string
          recovery_value?: number
          request_date: string
          scheduled_date?: string | null
          serial_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_notes?: string | null
          carbon_saved?: number
          company_id?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          product_name?: string
          recovery_value?: number
          request_date?: string
          scheduled_date?: string | null
          serial_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "takeback_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          company_id: string | null
          cost: number
          created_at: string
          duration: number
          hourly_rate: number
          id: string
          project_id: string | null
          stage: string
          task: string
          timestamp: string
          worker: string
        }
        Insert: {
          company_id?: string | null
          cost: number
          created_at?: string
          duration: number
          hourly_rate: number
          id?: string
          project_id?: string | null
          stage: string
          task: string
          timestamp?: string
          worker: string
        }
        Update: {
          company_id?: string | null
          cost?: number
          created_at?: string
          duration?: number
          hourly_rate?: number
          id?: string
          project_id?: string | null
          stage?: string
          task?: string
          timestamp?: string
          worker?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          carbon_impact: number
          company_id: string | null
          created_at: string
          date: string
          destination: string
          distance: number
          id: string
          origin: string
          transport_type: string
        }
        Insert: {
          carbon_impact: number
          company_id?: string | null
          created_at?: string
          date: string
          destination: string
          distance: number
          id?: string
          origin: string
          transport_type: string
        }
        Update: {
          carbon_impact?: number
          company_id?: string | null
          created_at?: string
          date?: string
          destination?: string
          distance?: number
          id?: string
          origin?: string
          transport_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_company_view: {
        Row: {
          company_email: string | null
          company_id: string | null
          company_name: string | null
          company_slug: string | null
          subscription_status: string | null
          subscription_tier: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      debug_company_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          profile_company_id: string
          can_access_company: boolean
          company_exists: boolean
        }[]
      }
      debug_user_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          has_profile: boolean
          company_id: string
          is_in_signup: boolean
        }[]
      }
      get_current_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_in_signup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
    Enums: {},
  },
} as const

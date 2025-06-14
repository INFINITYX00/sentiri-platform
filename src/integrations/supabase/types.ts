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
      boms: {
        Row: {
          created_at: string | null
          id: string
          materials: Json | null
          name: string
          total_carbon: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          materials?: Json | null
          name: string
          total_carbon?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          materials?: Json | null
          name?: string
          total_carbon?: number | null
        }
        Relationships: []
      }
      material_passports: {
        Row: {
          carbon_data: Json | null
          created_at: string | null
          id: string
          material_id: string | null
          origin: Json | null
          specifications: Json | null
          sustainability: Json | null
        }
        Insert: {
          carbon_data?: Json | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          origin?: Json | null
          specifications?: Json | null
          sustainability?: Json | null
        }
        Update: {
          carbon_data?: Json | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          origin?: Json | null
          specifications?: Json | null
          sustainability?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "material_passports_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          carbon_footprint: number
          created_at: string | null
          description: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          name: string
          origin: string | null
          qr_code: string
          quantity: number
          type: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          carbon_footprint?: number
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          name: string
          origin?: string | null
          qr_code: string
          quantity?: number
          type: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          carbon_footprint?: number
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          name?: string
          origin?: string | null
          qr_code?: string
          quantity?: number
          type?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          allocated_materials: string[] | null
          created_at: string | null
          id: string
          name: string
          progress: number | null
          status: string | null
        }
        Insert: {
          allocated_materials?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          progress?: number | null
          status?: string | null
        }
        Update: {
          allocated_materials?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          progress?: number | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

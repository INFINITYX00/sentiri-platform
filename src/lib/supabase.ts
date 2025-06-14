import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = 'https://qnorkgosfpyuzmgoenvd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub3JrZ29zZnB5dXptZ29lbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTQ5NTgsImV4cCI6MjA2NTQ3MDk1OH0.XNChKuZa3WMn_oGuUkq9QQviqvFj42yagPd_FN8I-Cs'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Database types
export interface Material {
  id: string
  name: string
  type: string
  quantity: number
  unit: string
  dimensions?: string
  length?: number
  width?: number
  thickness?: number
  dimension_unit?: string
  volume?: number
  weight?: number
  density?: number
  specific_material?: string
  origin?: string
  description?: string
  image_url?: string
  qr_code: string
  qr_image_url?: string
  carbon_footprint: number
  unit_count?: number
  ai_carbon_confidence?: number
  ai_carbon_source?: string
  ai_carbon_updated_at?: string
  created_at: string
  updated_at: string
}

export interface MaterialType {
  id: string
  category: string
  specific_type: string
  density?: number
  carbon_factor?: number
  ai_sourced?: boolean
  confidence_score?: number
  data_source?: string
  last_updated?: string
  created_at: string
}

export interface MaterialPassport {
  id: string
  material_id: string
  specifications: Record<string, any>
  origin: Record<string, any>
  carbon_data: Record<string, any>
  sustainability: Record<string, any>
  created_at: string
}

export interface BOM {
  id: string
  name: string
  materials: Array<{
    material_id: string
    quantity: number
    carbon_impact: number
  }>
  total_carbon: number
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  total_cost: number
  total_carbon_footprint: number
  start_date?: string
  completion_date?: string
  allocated_materials: string[]
  created_at: string
}

export interface ProjectMaterial {
  id: string
  project_id: string
  material_id: string
  quantity_required: number
  quantity_consumed: number
  cost_per_unit: number
  total_cost: number
  created_at: string
  updated_at: string
}

export interface ProductPassport {
  id: string
  project_id: string
  product_name: string
  product_type: string
  quantity_produced: number
  total_carbon_footprint: number
  qr_code: string
  qr_image_url?: string
  image_url?: string
  specifications: Record<string, any>
  production_date: string
  created_at: string
  updated_at: string
}

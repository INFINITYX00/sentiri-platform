
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
  origin?: string
  description?: string
  image_url?: string
  qr_code: string
  carbon_footprint: number
  created_at: string
  updated_at: string
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
  status: string
  progress: number
  allocated_materials: string[]
  created_at: string
}

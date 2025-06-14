
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have real credentials
export const supabase = supabaseUrl !== 'https://placeholder.supabase.co' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabase !== null && 
         import.meta.env.VITE_SUPABASE_URL && 
         import.meta.env.VITE_SUPABASE_ANON_KEY
}

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


export interface MaterialFormData {
  name: string
  type: string
  specific_material: string
  origin: string
  quantity: number
  unit: string
  unit_count: number
  carbon_footprint: number
  carbon_factor: number
  carbon_source: string
  cost_per_unit: number
  description: string
  image_url: string
  length: number | null
  width: number | null
  thickness: number | null
  dimension_unit: string
  dimensions: string
  density: number | null
  ai_carbon_confidence: number | null
  ai_carbon_source: string
  ai_carbon_updated_at: string
}

export const initialFormData: MaterialFormData = {
  name: '',
  type: '',
  specific_material: '',
  origin: '',
  quantity: 0,
  unit: 'pieces',
  unit_count: 1,
  carbon_footprint: 0,
  carbon_factor: 0,
  carbon_source: 'estimated',
  cost_per_unit: 0,
  description: '',
  image_url: '',
  length: null,
  width: null,
  thickness: null,
  dimension_unit: 'mm',
  dimensions: '',
  density: null,
  ai_carbon_confidence: null,
  ai_carbon_source: '',
  ai_carbon_updated_at: ''
}

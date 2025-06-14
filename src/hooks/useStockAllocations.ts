
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface MaterialAllocation {
  material_id: string
  total_allocated: number
  projects: Array<{
    id: string
    name: string
    quantity_required: number
    quantity_consumed: number
  }>
}

export function useStockAllocations() {
  const [allocations, setAllocations] = useState<MaterialAllocation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAllocations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects_materials')
        .select(`
          material_id,
          quantity_required,
          quantity_consumed,
          project:projects(id, name)
        `)

      if (error) throw error

      // Group allocations by material
      const groupedAllocations = data?.reduce((acc, item) => {
        const materialId = item.material_id
        if (!acc[materialId]) {
          acc[materialId] = {
            material_id: materialId,
            total_allocated: 0,
            projects: []
          }
        }
        
        const remainingRequired = Math.max(0, item.quantity_required - item.quantity_consumed)
        acc[materialId].total_allocated += remainingRequired
        acc[materialId].projects.push({
          id: item.project.id,
          name: item.project.name,
          quantity_required: item.quantity_required,
          quantity_consumed: item.quantity_consumed
        })
        
        return acc
      }, {} as Record<string, MaterialAllocation>) || {}

      setAllocations(Object.values(groupedAllocations))
    } catch (error) {
      console.error('Error fetching allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllocations()
  }, [])

  return {
    allocations,
    loading,
    refreshAllocations: fetchAllocations
  }
}

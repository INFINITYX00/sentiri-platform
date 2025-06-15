
import { useState, useRef, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useMaterialsCore() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const channelRef = useRef<any>(null)

  const fetchMaterials = useCallback(async () => {
    console.log('fetchMaterials called - starting fetch')
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error in fetchMaterials:', error)
        throw error
      }
      console.log('Materials fetched successfully:', data?.length || 0, 'materials')
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast({
        title: "Error",
        description: "Failed to fetch materials",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      console.log('fetchMaterials completed')
    }
  }, [toast])

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    console.log('updateMaterial called for ID:', id, 'with updates:', updates)
    setLoading(true)
    try {
      const { error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error in updateMaterial:', error)
        throw error
      }

      console.log('Material updated successfully in database, real-time should handle UI update')
      
      toast({
        title: "Success",
        description: "Material updated successfully",
      })
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: "Error",
        description: "Failed to update material",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const deleteMaterial = useCallback(async (id: string) => {
    console.log('deleteMaterial called for ID:', id)
    setLoading(true)
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error in deleteMaterial:', error)
        throw error
      }

      console.log('Material deleted successfully from database, real-time should handle UI update')
      
      toast({
        title: "Success",
        description: "Material deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting material:', error)
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    materials,
    setMaterials,
    loading,
    setLoading,
    fetchMaterials,
    updateMaterial,
    deleteMaterial,
    channelRef
  }
}

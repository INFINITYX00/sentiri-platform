
import { useState, useRef, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useMaterialsCore() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const channelRef = useRef<any>(null)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Materials fetched:', data?.length || 0, 'materials')
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
    }
  }, [toast])

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      console.log('Material updated successfully, real-time will handle UI update')
      
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
    setLoading(true)
    try {
      console.log('Deleting material:', id)
      
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('Material deleted, real-time will handle UI update')
      
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


import { useState, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useMaterialsCore() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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
    loading,
    updateMaterial,
    deleteMaterial
  }
}

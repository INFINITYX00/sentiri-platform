
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Material } from '@/lib/supabase'

export function useMaterialsCore() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const updateMaterial = async (materialId: string, updates: Partial<Material>) => {
    setIsLoading(true)
    try {
      console.log('🔧 Updating material:', materialId, updates)
      
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', materialId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating material:', error)
        toast({
          title: "Error updating material",
          description: error.message,
          variant: "destructive"
        })
        return null
      }

      console.log('✅ Material updated successfully:', data)
      toast({
        title: "Material updated",
        description: `${data.name} has been updated successfully.`
      })

      return data
    } catch (error) {
      console.error('❌ Unexpected error updating material:', error)
      toast({
        title: "Error updating material",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMaterial = async (materialId: string) => {
    setIsLoading(true)
    try {
      console.log('🗑️ Deleting material:', materialId)
      
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) {
        console.error('❌ Error deleting material:', error)
        toast({
          title: "Error deleting material",
          description: error.message,
          variant: "destructive"
        })
        return false
      }

      console.log('✅ Material deleted successfully')
      toast({
        title: "Material deleted",
        description: "Material has been removed from your inventory."
      })

      return true
    } catch (error) {
      console.error('❌ Unexpected error deleting material:', error)
      toast({
        title: "Error deleting material",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateMaterial,
    deleteMaterial,
    isLoading
  }
}

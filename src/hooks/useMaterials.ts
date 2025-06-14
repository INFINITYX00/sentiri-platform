
import { useState, useEffect } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
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
  }

  const addMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'qr_code'>) => {
    setLoading(true)
    try {
      // Generate QR code
      const qrCode = `QR${Date.now().toString().slice(-6)}`
      
      // Simulate AI dimension detection
      const dimensions = simulateAIDimensions()
      
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          ...materialData,
          qr_code: qrCode,
          dimensions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      await fetchMaterials()
      toast({
        title: "Success",
        description: `Material "${materialData.name}" added successfully`,
      })

      return data[0]
    } catch (error) {
      console.error('Error adding material:', error)
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      await fetchMaterials()
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
    }
  }

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchMaterials()
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
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refreshMaterials: fetchMaterials
  }
}

function simulateAIDimensions(): string {
  const dimensions = [
    "2000x200x25mm",
    "1200x800x3mm", 
    "1000x500x10mm",
    "1220x610x18mm",
    "2400x150x50mm",
    "800x600x12mm"
  ]
  return dimensions[Math.floor(Math.random() * dimensions.length)]
}

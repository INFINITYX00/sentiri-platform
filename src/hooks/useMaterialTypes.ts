
import { useState, useEffect } from 'react'
import { supabase, type MaterialType } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useMaterialTypes() {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchMaterialTypes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('material_types')
        .select('*')
        .order('category', { ascending: true })
        .order('specific_type', { ascending: true })

      if (error) throw error
      setMaterialTypes(data || [])
    } catch (error) {
      console.error('Error fetching material types:', error)
      toast({
        title: "Error",
        description: "Failed to fetch material types",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addMaterialType = async (materialType: Omit<MaterialType, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('material_types')
        .insert([materialType])
        .select()
        .single()

      if (error) throw error
      
      setMaterialTypes(prev => [...prev, data])
      
      toast({
        title: "Success",
        description: "Material type added successfully",
      })
      
      return data
    } catch (error) {
      console.error('Error adding material type:', error)
      toast({
        title: "Error",
        description: "Failed to add material type",
        variant: "destructive"
      })
      return null
    }
  }

  const getMaterialTypeBySpecific = (specificType: string) => {
    return materialTypes.find(mt => mt.specific_type === specificType)
  }

  const getTypesByCategory = (category: string) => {
    return materialTypes.filter(mt => mt.category === category)
  }

  const getCategories = () => {
    return [...new Set(materialTypes.map(mt => mt.category))].sort()
  }

  useEffect(() => {
    fetchMaterialTypes()
  }, [])

  return {
    materialTypes,
    loading,
    addMaterialType,
    getMaterialTypeBySpecific,
    getTypesByCategory,
    getCategories,
    refreshMaterialTypes: fetchMaterialTypes
  }
}

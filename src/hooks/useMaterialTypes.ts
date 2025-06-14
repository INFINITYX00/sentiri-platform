
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

  const deleteMaterialType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('material_types')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMaterialTypes(prev => prev.filter(mt => mt.id !== id))
      
      toast({
        title: "Success",
        description: "Material type deleted successfully",
      })
      
      return true
    } catch (error) {
      console.error('Error deleting material type:', error)
      toast({
        title: "Error",
        description: "Failed to delete material type",
        variant: "destructive"
      })
      return false
    }
  }

  const deleteCategory = async (category: string) => {
    try {
      const { error } = await supabase
        .from('material_types')
        .delete()
        .eq('category', category)

      if (error) throw error
      
      setMaterialTypes(prev => prev.filter(mt => mt.category !== category))
      
      toast({
        title: "Success",
        description: `Category "${category}" and all its material types deleted successfully`,
      })
      
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
      return false
    }
  }

  const addCategory = async (categoryName: string) => {
    // Check if category already exists
    const existingCategory = materialTypes.find(mt => mt.category === categoryName)
    if (existingCategory) {
      toast({
        title: "Already Exists",
        description: "This category already exists",
        variant: "destructive"
      })
      return null
    }

    // Add a default material type for the new category
    try {
      const { data, error } = await supabase
        .from('material_types')
        .insert([{
          category: categoryName,
          specific_type: `Default ${categoryName}`,
          density: 500,
          carbon_factor: 2.0
        }])
        .select()
        .single()

      if (error) throw error
      
      setMaterialTypes(prev => [...prev, data])
      
      toast({
        title: "Success",
        description: `Category "${categoryName}" added successfully`,
      })
      
      return data
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Error",
        description: "Failed to add category",
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
    deleteMaterialType,
    deleteCategory,
    addCategory,
    getMaterialTypeBySpecific,
    getTypesByCategory,
    getCategories,
    refreshMaterialTypes: fetchMaterialTypes
  }
}

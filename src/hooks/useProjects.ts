
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

export type Project = {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  total_cost: number
  total_carbon_footprint: number
  start_date?: string
  completion_date?: string
  allocated_materials: string[]
  deleted: boolean
  created_at: string
  updated_at: string
  company_id?: string
}

export type ProjectMaterial = {
  id: string
  project_id: string
  material_id: string
  quantity_required: number
  cost_per_unit: number
  total_cost: number
  quantity_consumed: number
  created_at: string
  updated_at: string
  material?: {
    id: string
    name: string
    type: string
    unit: string
    quantity: number
    carbon_footprint: number
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const fetchProjects = async () => {
    if (!companyId) {
      setProjects([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectById = async (projectId: string): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('company_id', companyId)
        .eq('deleted', false)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching project by ID:', error)
      return null
    }
  }

  const getProjectMaterials = async (projectId: string): Promise<ProjectMaterial[]> => {
    try {
      const { data, error } = await supabase
        .from('projects_materials')
        .select(`
          *,
          material:materials(
            id,
            name,
            type,
            unit,
            quantity,
            carbon_footprint
          )
        `)
        .eq('project_id', projectId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project materials:', error)
      return []
    }
  }

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "No company found. Please ensure you're properly logged in.",
        variant: "destructive"
      })
      return null
    }

    try {
      const projectWithCompany = {
        ...projectData,
        company_id: companyId
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectWithCompany])
        .select()

      if (error) throw error

      await fetchProjects()
      toast({
        title: "Success",
        description: "Project added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding project:', error)
      toast({
        title: "Error",
        description: "Failed to add project",
        variant: "destructive"
      })
      return null
    }
  }

  const addMaterialToProject = async (
    projectId: string,
    materialId: string,
    quantityRequired: number,
    costPerUnit: number
  ) => {
    try {
      const totalCost = quantityRequired * costPerUnit

      const { data, error } = await supabase
        .from('projects_materials')
        .insert([{
          project_id: projectId,
          material_id: materialId,
          quantity_required: quantityRequired,
          cost_per_unit: costPerUnit,
          total_cost: totalCost
        }])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Material added to project successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding material to project:', error)
      toast({
        title: "Error",
        description: "Failed to add material to project",
        variant: "destructive"
      })
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()

      if (error) throw error

      await fetchProjects()
      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted: true })
        .eq('id', id)
        .eq('company_id', companyId)

      if (error) throw error

      await fetchProjects()
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })

      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      })
      return false
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchProjects()
    }
  }, [companyId])

  return {
    projects,
    loading,
    addProject,
    addMaterialToProject,
    getProjectMaterials,
    updateProject,
    deleteProject,
    fetchProjectById,
    refreshProjects: fetchProjects
  }
}

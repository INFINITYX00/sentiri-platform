import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Project {
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
  deleted?: boolean
  created_at: string
}

export interface ProjectMaterial {
  id: string
  project_id: string
  material_id: string
  quantity_required: number
  quantity_consumed: number
  cost_per_unit: number
  total_cost: number
  material?: {
    id: string
    name: string
    type: string
    unit: string
    carbon_footprint: number
    quantity: number
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Projects fetched:', data?.length || 0)
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

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, deleted: false }])
        .select()
        .single()

      if (error) throw error

      console.log('Project created:', data.id)
      await fetchProjects()
      
      toast({
        title: "Success",
        description: `Project "${projectData.name}" created successfully`,
      })
      
      return data
    } catch (error) {
      console.error('Error adding project:', error)
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await fetchProjects()
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addMaterialToProject = async (projectId: string, materialId: string, quantityRequired: number, costPerUnit: number) => {
    try {
      const { error } = await supabase
        .from('projects_materials')
        .insert([{
          project_id: projectId,
          material_id: materialId,
          quantity_required: quantityRequired,
          cost_per_unit: costPerUnit,
          total_cost: quantityRequired * costPerUnit
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Material added to project",
      })
    } catch (error) {
      console.error('Error adding material to project:', error)
      toast({
        title: "Error",
        description: "Failed to add material to project",
        variant: "destructive"
      })
    }
  }

  const getProjectMaterials = async (projectId: string): Promise<ProjectMaterial[]> => {
    try {
      const { data, error } = await supabase
        .from('projects_materials')
        .select(`
          *,
          material:materials(id, name, type, unit, carbon_footprint, quantity)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching project materials:', error)
      return []
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    addProject,
    updateProject,
    addMaterialToProject,
    getProjectMaterials,
    refreshProjects: fetchProjects
  }
}

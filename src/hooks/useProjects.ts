
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
  updated_at?: string
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

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
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
    try {
      console.log('Updating project:', id, 'with:', updates)
      
      // Remove any fields that shouldn't be updated directly
      const cleanUpdates = { ...updates }
      delete cleanUpdates.id
      delete cleanUpdates.created_at
      delete cleanUpdates.updated_at // Let the trigger handle this

      const { data, error } = await supabase
        .from('projects')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      console.log('Project updated successfully:', data)
      
      // Update local state immediately for better UX
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p))
      
      // Show success message only for non-deletion updates
      if (!updates.deleted) {
        toast({
          title: "Success",
          description: "Project updated successfully",
        })
      }
      
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
      throw error // Re-throw to allow caller to handle
    }
  }

  const deleteProject = async (id: string) => {
    try {
      console.log('Soft deleting project:', id)
      
      const { error } = await supabase
        .from('projects')
        .update({ deleted: true })
        .eq('id', id)

      if (error) throw error

      // Remove from local state immediately
      setProjects(prev => prev.filter(p => p.id !== id))
      
      toast({
        title: "Success",
        description: "Project deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      })
      throw error
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
    deleteProject,
    addMaterialToProject,
    getProjectMaterials,
    refreshProjects: fetchProjects
  }
}

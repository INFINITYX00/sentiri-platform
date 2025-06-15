
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
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  // Enhanced function to fetch a specific project by ID with retry logic
  const fetchProjectById = async (projectId: string, retries: number = 2): Promise<Project | null> => {
    let attempt = 0
    while (attempt <= retries) {
      try {
        console.log(`🔄 useProjects: Fetching project by ID (attempt ${attempt + 1}/${retries + 1}):`, projectId)
        
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('deleted', false)
          .single()

        if (error) {
          console.error(`❌ useProjects: Database query error (attempt ${attempt + 1}):`, error)
          if (attempt === retries) {
            throw new Error(`Database error after ${retries + 1} attempts: ${error.message}`)
          }
          attempt++
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          continue
        }

        if (!data) {
          console.log(`⚠️ useProjects: No project found for id (attempt ${attempt + 1}):`, projectId)
          return null
        }

        console.log(`✅ useProjects: Project retrieved successfully (attempt ${attempt + 1}):`, data.name)
        
        // Return properly typed project data
        const project: Project = {
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'planning',
          progress: data.progress || 0,
          total_cost: data.total_cost || 0,
          total_carbon_footprint: data.total_carbon_footprint || 0,
          start_date: data.start_date,
          completion_date: data.completion_date,
          allocated_materials: data.allocated_materials || [],
          deleted: data.deleted || false,
          created_at: data.created_at || '',
          updated_at: data.updated_at || ''
        }

        // Update local cache if project found
        setProjects(prevProjects => {
          const existingIndex = prevProjects.findIndex(p => p.id === projectId)
          if (existingIndex >= 0) {
            const updated = [...prevProjects]
            updated[existingIndex] = project
            return updated
          } else {
            return [project, ...prevProjects]
          }
        })

        return project
      } catch (error) {
        if (attempt === retries) {
          console.error(`💥 useProjects: Final error fetching project by ID:`, error)
          throw error
        }
        attempt++
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    return null
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
      
      // Immediately update local state
      setProjects(prev => [data, ...prev])
      
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
      console.log('🔄 useProjects: Updating project:', id, 'with:', updates)
      
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
        console.error('❌ useProjects: Supabase update error:', error)
        throw error
      }

      console.log('✅ useProjects: Project updated successfully:', data)
      
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
      console.error('💥 useProjects: Error updating project:', error)
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
    refreshProjects: fetchProjects,
    fetchProjectById // Export the new function for direct project fetching
  }
}

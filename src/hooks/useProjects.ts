
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

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
  company_id?: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface ProjectMaterial {
  id: string
  project_id: string
  material_id: string
  quantity_required: number
  quantity_consumed: number
  cost_per_unit: number
  total_cost: number
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
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const fetchProjects = useCallback(async () => {
    if (!companyId) {
      console.log('🔄 useProjects: No company ID, skipping fetch')
      setProjects([])
      setLoading(false)
      return
    }

    try {
      console.log('🔄 Fetching projects for company:', companyId)
      
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('❌ useProjects: No session found')
        setProjects([])
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching projects:', error)
        if (error.message.includes('JWT')) {
          console.log('🔄 JWT error, trying to refresh session...')
          await supabase.auth.refreshSession()
          return
        }
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      console.log('✅ Projects fetched:', data?.length || 0)
      setProjects(data || [])
    } catch (error) {
      console.error('❌ Unexpected error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId, toast])

  const fetchProjectById = async (projectId: string): Promise<Project | null> => {
    if (!companyId) {
      console.log('❌ useProjects: No company ID for fetchProjectById')
      return null
    }

    try {
      console.log('🔄 Fetching project by ID:', projectId)
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('company_id', companyId)
        .eq('deleted', false)
        .single()

      if (error) {
        console.error('❌ Error fetching project by ID:', error)
        return null
      }

      console.log('✅ Project fetched by ID:', data?.name)
      return data as Project
    } catch (error) {
      console.error('❌ Unexpected error fetching project by ID:', error)
      return null
    }
  }

  useEffect(() => {
    if (companyId) {
      fetchProjects()
    }
  }, [fetchProjects, companyId])

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company information not available. Please try logging in again.",
        variant: "destructive"
      })
      return null
    }

    try {
      console.log('🔧 Adding project with company_id:', companyId)
      
      const projectWithCompany = {
        ...projectData,
        company_id: companyId
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectWithCompany])
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding project:', error)
        toast({
          title: "Error adding project",
          description: error.message,
          variant: "destructive"
        })
        return null
      }

      console.log('✅ Project added successfully:', data)
      toast({
        title: "Project created successfully",
        description: `${data.name} has been created.`
      })

      await fetchProjects()
      return data
    } catch (error) {
      console.error('❌ Unexpected error adding project:', error)
      toast({
        title: "Error adding project",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        toast({
          title: "Error updating project",
          description: error.message,
          variant: "destructive"
        })
        return null
      }

      toast({
        title: "Project updated",
        description: "Project has been updated successfully."
      })

      await fetchProjects()
      return data
    } catch (error) {
      console.error('Unexpected error updating project:', error)
      return null
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted: true })
        .eq('id', projectId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting project:', error)
        toast({
          title: "Error deleting project",
          description: error.message,
          variant: "destructive"
        })
        return false
      }

      toast({
        title: "Project deleted",
        description: "Project has been moved to trash."
      })

      await fetchProjects()
      return true
    } catch (error) {
      console.error('Unexpected error deleting project:', error)
      return false
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
        .single()

      if (error) {
        console.error('Error adding material to project:', error)
        toast({
          title: "Error adding material",
          description: error.message,
          variant: "destructive"
        })
        return null
      }

      toast({
        title: "Material added to project",
        description: "Material has been successfully added to the project."
      })

      return data
    } catch (error) {
      console.error('Unexpected error adding material to project:', error)
      return null
    }
  }

  const getProjectMaterials = async (projectId: string): Promise<ProjectMaterial[]> => {
    try {
      const { data, error } = await supabase
        .from('projects_materials')
        .select(`
          *,
          material:materials!inner(id, name, type, unit, quantity, carbon_footprint)
        `)
        .eq('project_id', projectId)
        .eq('material.company_id', companyId)

      if (error) {
        console.error('Error fetching project materials:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Unexpected error fetching project materials:', error)
      return []
    }
  }

  const refreshProjects = fetchProjects

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
    addMaterialToProject,
    getProjectMaterials,
    fetchProjectById
  }
}

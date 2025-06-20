
import { useState, useEffect } from 'react'
import { supabase, type Project } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

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
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  }
}


import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface ManufacturingStage {
  id: string
  project_id: string
  stage_id: string
  name: string
  status: string
  progress: number
  estimated_hours: number
  actual_hours: number
  energy_estimate: number
  actual_energy: number
  workers: string[]
  start_date?: string
  completed_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export function useManufacturingStages() {
  const [stages, setStages] = useState<ManufacturingStage[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchStages = async (projectId?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('manufacturing_stages')
        .select('*')
        .order('created_at', { ascending: true })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setStages(data || [])
    } catch (error) {
      console.error('Error fetching manufacturing stages:', error)
      toast({
        title: "Error",
        description: "Failed to fetch manufacturing stages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addStage = async (stageData: Omit<ManufacturingStage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .insert([stageData])
        .select()
        .single()

      if (error) throw error

      setStages(prev => [...prev, data])
      toast({
        title: "Success",
        description: "Manufacturing stage added successfully",
      })

      return data
    } catch (error) {
      console.error('Error adding manufacturing stage:', error)
      toast({
        title: "Error",
        description: "Failed to add manufacturing stage",
        variant: "destructive"
      })
      return null
    }
  }

  const updateStage = async (id: string, updates: Partial<ManufacturingStage>) => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setStages(prev => prev.map(stage => stage.id === id ? data : stage))
      toast({
        title: "Success",
        description: "Manufacturing stage updated successfully",
      })

      return data
    } catch (error) {
      console.error('Error updating manufacturing stage:', error)
      toast({
        title: "Error",
        description: "Failed to update manufacturing stage",
        variant: "destructive"
      })
      return null
    }
  }

  const createDefaultStages = async (projectId: string) => {
    const defaultStages = [
      {
        project_id: projectId,
        stage_id: 'planning',
        name: 'Planning & Design',
        status: 'pending',
        progress: 0,
        estimated_hours: 8,
        actual_hours: 0,
        energy_estimate: 2,
        actual_energy: 0,
        workers: []
      },
      {
        project_id: projectId,
        stage_id: 'material_prep',
        name: 'Material Preparation',
        status: 'pending',
        progress: 0,
        estimated_hours: 4,
        actual_hours: 0,
        energy_estimate: 5,
        actual_energy: 0,
        workers: []
      },
      {
        project_id: projectId,
        stage_id: 'manufacturing',
        name: 'Manufacturing',
        status: 'pending',
        progress: 0,
        estimated_hours: 16,
        actual_hours: 0,
        energy_estimate: 20,
        actual_energy: 0,
        workers: []
      },
      {
        project_id: projectId,
        stage_id: 'assembly',
        name: 'Assembly',
        status: 'pending',
        progress: 0,
        estimated_hours: 8,
        actual_hours: 0,
        energy_estimate: 8,
        actual_energy: 0,
        workers: []
      },
      {
        project_id: projectId,
        stage_id: 'quality_control',
        name: 'Quality Control',
        status: 'pending',
        progress: 0,
        estimated_hours: 4,
        actual_hours: 0,
        energy_estimate: 2,
        actual_energy: 0,
        workers: []
      },
      {
        project_id: projectId,
        stage_id: 'finishing',
        name: 'Finishing',
        status: 'pending',
        progress: 0,
        estimated_hours: 6,
        actual_hours: 0,
        energy_estimate: 4,
        actual_energy: 0,
        workers: []
      }
    ]

    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .insert(defaultStages)
        .select()

      if (error) throw error

      setStages(prev => [...prev, ...data])
      return data
    } catch (error) {
      console.error('Error creating default stages:', error)
      return null
    }
  }

  useEffect(() => {
    fetchStages()
  }, [])

  return {
    stages,
    loading,
    addStage,
    updateStage,
    createDefaultStages,
    fetchStages,
    refreshStages: fetchStages
  }
}

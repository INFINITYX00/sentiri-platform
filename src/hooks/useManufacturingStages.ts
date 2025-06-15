
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

  const fetchStages = useCallback(async (projectId?: string) => {
    if (!projectId) {
      setStages([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setStages(data || [])
    } catch (error) {
      console.error('Error fetching manufacturing stages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const addStage = useCallback(async (stageData: Omit<ManufacturingStage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .insert([stageData])
        .select()
        .single()

      if (error) throw error

      setStages(prev => [...prev, data])
      return data
    } catch (error) {
      console.error('Error adding manufacturing stage:', error)
      return null
    }
  }, [])

  const updateStage = useCallback(async (id: string, updates: Partial<ManufacturingStage>, showToast: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('manufacturing_stages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setStages(prev => prev.map(stage => stage.id === id ? data : stage))
      
      // No toast notifications - using console logging for debugging
      console.log('Manufacturing stage updated successfully:', data.name)

      return data
    } catch (error) {
      console.error('Error updating manufacturing stage:', error)
      return null
    }
  }, [])

  const createDefaultStages = useCallback(async (projectId: string) => {
    try {
      // First check if stages already exist for this project
      const { data: existingStages, error: checkError } = await supabase
        .from('manufacturing_stages')
        .select('id')
        .eq('project_id', projectId)
        .limit(1)

      if (checkError) throw checkError

      // If stages already exist, don't create duplicates
      if (existingStages && existingStages.length > 0) {
        console.log('Manufacturing stages already exist for project:', projectId)
        return existingStages
      }

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

      const { data, error } = await supabase
        .from('manufacturing_stages')
        .insert(defaultStages)
        .select()

      if (error) throw error

      setStages(prev => [...prev, ...data])
      
      // No toast notifications - using console logging for debugging
      console.log('Manufacturing stages created successfully for project:', projectId)
      
      return data
    } catch (error) {
      console.error('Error creating default stages:', error)
      return null
    }
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

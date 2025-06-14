
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface TimeEntry {
  id: string
  project_id: string | null
  stage: string
  task: string
  duration: number
  worker: string
  hourly_rate: number
  cost: number
  timestamp: string
  created_at: string
}

export function useTimeEntries(projectId?: string) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchTimeEntries = async () => {
    setLoading(true)
    try {
      let query = supabase.from('time_entries').select('*').order('created_at', { ascending: false })
      
      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query

      if (error) throw error
      setTimeEntries(data || [])
    } catch (error) {
      console.error('Error fetching time entries:', error)
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([entryData])
        .select()

      if (error) throw error

      await fetchTimeEntries()
      toast({
        title: "Success",
        description: "Time entry added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding time entry:', error)
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive"
      })
      return null
    }
  }

  useEffect(() => {
    fetchTimeEntries()
  }, [projectId])

  return {
    timeEntries,
    loading,
    addTimeEntry,
    refreshTimeEntries: fetchTimeEntries
  }
}


import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalCarbonSaved: number
  totalMaterials: number
  lowStockMaterials: number
  totalCost: number
  averageProjectDuration: number
  energyConsumed: number
  wasteReduction: number
  recentActivity: Array<{
    id: string
    type: 'project' | 'material' | 'production'
    description: string
    timestamp: string
  }>
}

export function useDynamicDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCarbonSaved: 0,
    totalMaterials: 0,
    lowStockMaterials: 0,
    totalCost: 0,
    averageProjectDuration: 0,
    energyConsumed: 0,
    wasteReduction: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const calculateMetrics = async () => {
    try {
      setLoading(true)

      // Fetch projects data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')

      if (projectsError) throw projectsError

      // Fetch materials data
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('*')

      if (materialsError) throw materialsError

      // Fetch energy records
      const { data: energyRecords, error: energyError } = await supabase
        .from('energy_records')
        .select('*')

      if (energyError) throw energyError

      // Fetch time entries for recent activity
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (timeError) throw timeError

      // Calculate project metrics
      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0
      const totalCarbonSaved = projects?.reduce((sum, p) => sum + (p.total_carbon_footprint || 0), 0) || 0
      const totalCost = projects?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0

      // Calculate material metrics
      const totalMaterials = materials?.length || 0
      const lowStockMaterials = materials?.filter(m => m.quantity < 10).length || 0

      // Calculate energy consumption
      const energyConsumed = energyRecords?.reduce((sum, e) => sum + (e.energy_consumed || 0), 0) || 0

      // Calculate average project duration
      const completedProjectsWithDates = projects?.filter(p => 
        p.status === 'completed' && p.start_date && p.completion_date
      ) || []
      
      const averageProjectDuration = completedProjectsWithDates.length > 0
        ? completedProjectsWithDates.reduce((sum, p) => {
            const start = new Date(p.start_date!)
            const end = new Date(p.completion_date!)
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          }, 0) / completedProjectsWithDates.length
        : 0

      // Calculate waste reduction (estimated based on material efficiency)
      const plannedMaterials = materials?.reduce((sum, m) => sum + m.quantity, 0) || 0
      const usedMaterials = materials?.reduce((sum, m) => sum + Math.max(0, m.quantity - 5), 0) || 0 // Assuming 5 units as buffer
      const wasteReduction = plannedMaterials > 0 ? ((plannedMaterials - usedMaterials) / plannedMaterials) * 100 : 0

      // Build recent activity
      const recentActivity = [
        ...projects?.slice(0, 3).map(p => ({
          id: p.id,
          type: 'project' as const,
          description: `Project "${p.name}" ${p.status === 'completed' ? 'completed' : 'updated'}`,
          timestamp: p.updated_at || p.created_at
        })) || [],
        ...timeEntries?.slice(0, 3).map(t => ({
          id: t.id,
          type: 'production' as const,
          description: `${t.worker} worked on ${t.task} (${t.duration}h)`,
          timestamp: t.created_at
        })) || [],
        ...materials?.slice(0, 2).map(m => ({
          id: m.id,
          type: 'material' as const,
          description: `Material "${m.name}" updated (${m.quantity} ${m.unit})`,
          timestamp: m.updated_at || m.created_at
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

      setMetrics({
        totalProjects,
        activeProjects,
        completedProjects,
        totalCarbonSaved,
        totalMaterials,
        lowStockMaterials,
        totalCost,
        averageProjectDuration,
        energyConsumed,
        wasteReduction,
        recentActivity
      })

    } catch (error) {
      console.error('Error calculating dashboard metrics:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculateMetrics()
  }, [])

  return {
    metrics,
    loading,
    refreshMetrics: calculateMetrics
  }
}

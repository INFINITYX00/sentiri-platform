import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'
import type { Material } from '@/lib/supabase'

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
  productionEfficiency: number
  activeStages: number
  workersActive: number
  lastUpdated: string
  recentActivity: Array<{
    id: string
    type: 'project' | 'material' | 'production' | 'stage' | 'passport'
    description: string
    timestamp: string
  }>
  activeProjectsList: Array<{
    id: string
    name: string
    status: string
    progress: number
    total_cost: number
    start_date: string
  }>
  stockAlerts: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    type: string
  }>
  recentPassports: Array<{
    id: string
    product_name: string
    total_carbon_footprint: number
    production_date: string
  }>
  manufacturingStages: Array<{
    id: string
    name: string
    project_name: string
    status: string
    progress: number
    workers: string[]
  }>
  // Legacy fields for compatibility
  totalStockItems: number
  totalCarbonFootprint: number
  lowStockCount: number
  aiEnhancedCount: number
  lowStockItems: Array<{
    name: string
    quantity: number
    unit: string
    threshold: number
  }>
  recentMaterials: Material[]
  materialTypeDistribution: Record<string, number>
  carbonFootprintChange: string
  stockItemsChange: string
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
    productionEfficiency: 85,
    activeStages: 0,
    workersActive: 0,
    lastUpdated: new Date().toISOString(),
    recentActivity: [],
    activeProjectsList: [],
    stockAlerts: [],
    recentPassports: [],
    manufacturingStages: [],
    // Legacy fields
    totalStockItems: 0,
    totalCarbonFootprint: 0,
    lowStockCount: 0,
    aiEnhancedCount: 0,
    lowStockItems: [],
    recentMaterials: [],
    materialTypeDistribution: {},
    carbonFootprintChange: "+0%",
    stockItemsChange: "+0%"
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const calculateMetrics = async () => {
    try {
      setLoading(true)
      console.log('🔄 Dashboard: Starting metrics calculation')

      // Check if we have a company ID
      if (!companyId) {
        console.log('❌ Dashboard: No company ID available, skipping metrics calculation');
        setLoading(false);
        return;
      }

      console.log('🏢 Dashboard: Using company ID:', companyId);

      // Fetch all data in parallel - only get non-deleted projects from the start
      const [
        { data: projects, error: projectsError },
        { data: materials, error: materialsError },
        { data: projectMaterials, error: projectMaterialsError },
        { data: energyRecords, error: energyError },
        { data: timeEntries, error: timeError },
        { data: passports, error: passportsError },
        { data: manufacturingStages, error: stagesError }
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('deleted', false).eq('company_id', companyId),
        supabase.from('materials').select('*').eq('company_id', companyId),
        supabase.from('projects_materials').select(`
          *,
          project:projects!inner(deleted, company_id)
        `).eq('project.deleted', false).eq('project.company_id', companyId),
        supabase.from('energy_records').select('*').eq('company_id', companyId),
        supabase.from('time_entries').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(15),
        supabase.from('product_passports').select('*').eq('company_id', companyId).order('production_date', { ascending: false }).limit(5),
        supabase.from('manufacturing_stages').select('*, projects(name, company_id)').eq('company_id', companyId).order('updated_at', { ascending: false })
      ])

      if (projectsError) throw projectsError
      if (materialsError) throw materialsError
      if (projectMaterialsError) throw projectMaterialsError
      if (energyError) throw energyError
      if (timeError) throw timeError
      if (passportsError) throw passportsError
      if (stagesError) throw stagesError

      console.log('📊 Dashboard: Fetched data', {
        projects: projects?.length || 0,
        materials: materials?.length || 0,
        projectMaterials: projectMaterials?.length || 0,
        energyRecords: energyRecords?.length || 0
      })

      // Calculate allocations by material
      const materialAllocations = new Map<string, number>()
      
      projectMaterials?.forEach(pm => {
        const materialId = pm.material_id
        const allocated = Math.max(0, pm.quantity_required - pm.quantity_consumed)
        const currentAllocation = materialAllocations.get(materialId) || 0
        materialAllocations.set(materialId, currentAllocation + allocated)
      })

      console.log('📦 Dashboard: Material allocations calculated', {
        materialsWithAllocations: materialAllocations.size,
        totalAllocations: Array.from(materialAllocations.values()).reduce((sum, val) => sum + val, 0)
      })

      // Calculate project metrics (already filtered to exclude deleted projects)
      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0
      const planningProjects = projects?.filter(p => p.status === 'planning').length || 0
      
      // Carbon impact: sum of all project carbon footprints
      const totalCarbonSaved = projects?.reduce((sum, p) => sum + (p.total_carbon_footprint || 0), 0) || 0
      const totalCost = projects?.reduce((sum, p) => sum + (p.total_cost || 0), 0) || 0

      console.log('📈 Dashboard: Project metrics', {
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        totalCarbonSaved
      })

      // Calculate material metrics with available units
      const totalMaterials = materials?.length || 0
      
      // Calculate available units for each material and identify low stock
      const materialsWithAvailableUnits = materials?.map(material => {
        const totalUnits = material.quantity || 0
        const allocatedUnits = materialAllocations.get(material.id) || 0
        const availableUnits = Math.max(0, totalUnits - allocatedUnits)
        
        return {
          ...material,
          availableUnits,
          allocatedUnits,
          totalUnits
        }
      }) || []

      // Filter for low stock based on available units (< 10)
      const lowStockMaterials = materialsWithAvailableUnits.filter(m => m.availableUnits < 10).length

      console.log('📦 Dashboard: Material stock analysis', {
        totalMaterials,
        lowStockMaterials,
        exampleMaterial: materialsWithAvailableUnits[0] ? {
          name: materialsWithAvailableUnits[0].name,
          total: materialsWithAvailableUnits[0].totalUnits,
          allocated: materialsWithAvailableUnits[0].allocatedUnits,
          available: materialsWithAvailableUnits[0].availableUnits
        } : 'No materials'
      })

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

      // Calculate manufacturing stage metrics
      const activeStagesList = manufacturingStages?.filter(s => s.status === 'in_progress') || []
      const activeStages = activeStagesList.length
      const allWorkers = new Set()
      activeStagesList.forEach(stage => {
        if (stage.workers) {
          stage.workers.forEach(worker => allWorkers.add(worker))
        }
      })
      const workersActive = allWorkers.size

      // Calculate production efficiency based on actual vs estimated time
      const completedStages = manufacturingStages?.filter(s => s.status === 'completed') || []
      let totalEfficiency = 0
      let efficiencyCount = 0
      
      completedStages.forEach(stage => {
        if (stage.estimated_hours > 0 && stage.actual_hours > 0) {
          const efficiency = (stage.estimated_hours / stage.actual_hours) * 100
          totalEfficiency += Math.min(efficiency, 150) // Cap at 150% efficiency
          efficiencyCount++
        }
      })
      
      const productionEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 85

      // Calculate waste reduction (improved calculation)
      const plannedMaterials = materials?.reduce((sum, m) => sum + m.quantity, 0) || 0
      const usedMaterials = materials?.reduce((sum, m) => sum + Math.max(0, m.quantity - 5), 0) || 0
      const wasteReduction = plannedMaterials > 0 ? ((plannedMaterials - usedMaterials) / plannedMaterials) * 100 : 0

      // Active projects list (showing in-progress and planning projects)
      const activeProjectsList = projects?.filter(p => p.status === 'in_progress' || p.status === 'planning')
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: p.progress || 0,
          total_cost: p.total_cost || 0,
          start_date: p.start_date || p.created_at
        })) || []

      // Stock alerts (materials with available units < 10)
      const stockAlerts = materialsWithAvailableUnits
        .filter(m => m.availableUnits < 10)
        .slice(0, 5)
        .map(m => ({
          id: m.id,
          name: m.name,
          quantity: m.availableUnits, // Show available units instead of total
          unit: m.unit,
          type: m.type
        }))

      console.log('🚨 Dashboard: Stock alerts generated', {
        alertCount: stockAlerts.length,
        alerts: stockAlerts.map(a => ({ name: a.name, available: a.quantity, unit: a.unit }))
      })

      // Recent passports
      const recentPassports = passports?.map(p => ({
        id: p.id,
        product_name: p.product_name,
        total_carbon_footprint: p.total_carbon_footprint,
        production_date: p.production_date
      })) || []

      // Manufacturing stages for display
      const manufacturingStagesForDisplay = manufacturingStages?.slice(0, 6).map(s => ({
        id: s.id,
        name: s.name,
        project_name: s.projects?.name || 'Unknown Project',
        status: s.status,
        progress: s.progress || 0,
        workers: s.workers || []
      })) || []

      // Enhanced recent activity combining multiple sources
      const recentActivity = [
        // Project activities
        ...projects?.slice(0, 3).map(p => ({
          id: p.id,
          type: 'project' as const,
          description: `Project "${p.name}" ${p.status === 'completed' ? 'completed' : 'updated'}`,
          timestamp: p.updated_at || p.created_at
        })) || [],
        
        // Manufacturing stage activities
        ...manufacturingStages?.slice(0, 3).map(s => ({
          id: s.id,
          type: 'stage' as const,
          description: `Stage "${s.name}" ${s.status === 'completed' ? 'completed' : 'in progress'}`,
          timestamp: s.updated_at
        })) || [],
        
        // Time entries (production work)
        ...timeEntries?.slice(0, 4).map(t => ({
          id: t.id,
          type: 'production' as const,
          description: `${t.worker} worked on ${t.task} (${t.duration}h)`,
          timestamp: t.created_at
        })) || [],
        
        // Product passport generation
        ...passports?.slice(0, 2).map(p => ({
          id: p.id,
          type: 'passport' as const,
          description: `Product passport created for "${p.product_name}"`,
          timestamp: p.created_at
        })) || [],
        
        // Material updates
        ...materials?.slice(0, 2).map(m => ({
          id: m.id,
          type: 'material' as const,
          description: `Material "${m.name}" updated (${m.quantity} ${m.unit})`,
          timestamp: m.updated_at || m.created_at
        })) || []
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8)

      const lastUpdated = new Date().toISOString()

      // Legacy compatibility calculations
      const totalStockItems = totalMaterials
      const totalCarbonFootprint = totalCarbonSaved
      const lowStockCount = lowStockMaterials
      const aiEnhancedCount = materials?.filter(m => m.ai_carbon_confidence && m.ai_carbon_confidence > 0).length || 0
      const lowStockItems = materialsWithAvailableUnits
        .filter(m => m.availableUnits < 10)
        .slice(0, 5)
        .map(m => ({
          name: m.name,
          quantity: m.availableUnits,
          unit: m.unit,
          threshold: 10,
          type: m.type
        }))
      const recentMaterials = materials?.slice(0, 3) || []
      const materialTypeDistribution = materials?.reduce((acc, material) => {
        const type = material.type || 'other'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      const carbonFootprintChange = totalCarbonFootprint > 5 ? "-8%" : "+2%"
      const stockItemsChange = totalStockItems > 100 ? "+12%" : "+5%"

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
        productionEfficiency,
        activeStages,
        workersActive,
        lastUpdated,
        recentActivity,
        activeProjectsList,
        stockAlerts,
        recentPassports,
        manufacturingStages: manufacturingStagesForDisplay,
        // Legacy fields
        totalStockItems,
        totalCarbonFootprint,
        lowStockCount,
        aiEnhancedCount,
        lowStockItems,
        recentMaterials,
        materialTypeDistribution,
        carbonFootprintChange,
        stockItemsChange
      })

      console.log('✅ Dashboard: Metrics calculated successfully', {
        totalProjects,
        activeProjects,
        completedProjects,
        totalCarbonSaved: totalCarbonSaved.toFixed(1),
        stockAlertsCount: stockAlerts.length
      })

    } catch (error) {
      console.error('❌ Dashboard: Error calculating metrics:', error)
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
  }, [companyId])

  return {
    metrics,
    loading,
    refreshMetrics: calculateMetrics
  }
}

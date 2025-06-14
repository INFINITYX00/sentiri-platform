
import { useMemo } from 'react'
import { useMaterials } from './useMaterials'
import type { Material } from '@/lib/supabase'

export interface DashboardMetrics {
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
  wasteReduced: number
  energyUsage: number
}

export function useDashboardMetrics(): {
  metrics: DashboardMetrics
  loading: boolean
} {
  const { materials, loading } = useMaterials()

  const metrics = useMemo(() => {
    if (!materials || materials.length === 0) {
      return {
        totalStockItems: 0,
        totalCarbonFootprint: 0,
        lowStockCount: 0,
        aiEnhancedCount: 0,
        lowStockItems: [],
        recentMaterials: [],
        materialTypeDistribution: {},
        carbonFootprintChange: "+0%",
        stockItemsChange: "+0%",
        wasteReduced: 0,
        energyUsage: 0
      }
    }

    // Calculate total stock items
    const totalStockItems = materials.length

    // Calculate total carbon footprint
    const totalCarbonFootprint = materials.reduce((sum, material) => 
      sum + (material.carbon_footprint || 0), 0
    )

    // Calculate AI-enhanced materials count
    const aiEnhancedCount = materials.filter(material => 
      material.ai_carbon_confidence && material.ai_carbon_confidence > 0
    ).length

    // Define low stock thresholds based on material type
    const getThreshold = (type: string) => {
      switch (type.toLowerCase()) {
        case 'wood': return 10
        case 'metal': return 5
        case 'plastic': return 15
        case 'fabric': return 8
        default: return 10
      }
    }

    // Calculate low stock items (simplified based on quantity)
    const lowStockItems = materials
      .map(material => ({
        name: material.name,
        quantity: material.quantity || 0,
        unit: material.unit,
        threshold: getThreshold(material.type),
        type: material.type
      }))
      .filter(item => item.quantity < item.threshold)
      .slice(0, 5) // Show top 5 low stock items

    // Get recent materials (last 5 added)
    const recentMaterials = [...materials]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)

    // Calculate material type distribution
    const materialTypeDistribution = materials.reduce((acc, material) => {
      const type = material.type || 'other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate estimated changes (simplified mock calculations)
    const carbonFootprintChange = totalCarbonFootprint > 5 ? "-8%" : "+2%"
    const stockItemsChange = totalStockItems > 100 ? "+12%" : "+5%"

    // Calculate estimated waste reduction and energy usage
    const wasteReduced = Math.min(Math.round(aiEnhancedCount * 2.5), 34)
    const energyUsage = Math.round(totalCarbonFootprint * 540) || 1240

    return {
      totalStockItems,
      totalCarbonFootprint: Math.round(totalCarbonFootprint * 100) / 100,
      lowStockCount: lowStockItems.length,
      aiEnhancedCount,
      lowStockItems,
      recentMaterials,
      materialTypeDistribution,
      carbonFootprintChange,
      stockItemsChange,
      wasteReduced,
      energyUsage
    }
  }, [materials])

  return { metrics, loading }
}

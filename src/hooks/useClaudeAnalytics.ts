
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ClaudeInsight {
  type: 'optimization' | 'trend' | 'cost' | 'prediction'
  title: string
  description: string
  impact: string
  savings: string
  confidence: number
}

interface MaterialRecommendation {
  current_material: string
  suggestion: string
  carbon_reduction: string
  cost_impact: string
  implementation: string
}

interface TransportOptimization {
  current_route: string
  optimization: string
  carbon_savings: string
  cost_impact: string
}

interface SourcingRecommendation {
  material_type: string
  current_avg_distance: string
  recommended_sources: string
  potential_savings: string
}

export function useClaudeAnalytics() {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<ClaudeInsight[]>([])
  const [materialRecommendations, setMaterialRecommendations] = useState<MaterialRecommendation[]>([])
  const [transportOptimizations, setTransportOptimizations] = useState<TransportOptimization[]>([])
  const [sourcingRecommendations, setSourcingRecommendations] = useState<SourcingRecommendation[]>([])
  const { toast } = useToast()

  const generateCarbonInsights = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('claude-carbon-analytics', {
        body: { analysisType: 'carbon_insights' }
      })

      if (error) throw error

      if (data.success && data.data.insights) {
        setInsights(data.data.insights)
        toast({
          title: "Success",
          description: "AI insights generated successfully",
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating carbon insights:', error)
      toast({
        title: "Error",
        description: "Failed to generate AI insights",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMaterialOptimization = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('claude-carbon-analytics', {
        body: { analysisType: 'material_optimization' }
      })

      if (error) throw error

      if (data.success && data.data.recommendations) {
        setMaterialRecommendations(data.data.recommendations)
        toast({
          title: "Success",
          description: "Material optimization suggestions generated",
        })
      }
    } catch (error) {
      console.error('Error generating material optimization:', error)
      toast({
        title: "Error",
        description: "Failed to generate material optimization",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTransportOptimization = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('claude-carbon-analytics', {
        body: { analysisType: 'transport_optimization' }
      })

      if (error) throw error

      if (data.success && data.data.optimizations) {
        setTransportOptimizations(data.data.optimizations)
        setSourcingRecommendations(data.data.sourcing_recommendations || [])
        toast({
          title: "Success",
          description: "Transport optimization suggestions generated",
        })
      }
    } catch (error) {
      console.error('Error generating transport optimization:', error)
      toast({
        title: "Error",
        description: "Failed to generate transport optimization",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    insights,
    materialRecommendations,
    transportOptimizations,
    sourcingRecommendations,
    generateCarbonInsights,
    generateMaterialOptimization,
    generateTransportOptimization
  }
}

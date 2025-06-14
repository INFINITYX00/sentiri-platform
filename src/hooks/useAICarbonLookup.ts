
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface CarbonLookupData {
  carbonFactor: number
  totalCarbonFootprint: number
  density: number
  confidence: number
  source: string
  reasoning: string
  alternatives?: Array<{
    material: string
    carbonFactor: number
    reason: string
  }>
}

interface CarbonLookupParams {
  materialType: string
  specificMaterial: string
  origin?: string
  dimensions?: string
  quantity?: number
  unit?: string
  unitCount?: number
  weight?: number
}

export function useAICarbonLookup() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const lookupCarbonData = async (params: CarbonLookupParams): Promise<CarbonLookupData | null> => {
    setLoading(true)
    try {
      console.log('Starting AI carbon lookup with params:', params)
      
      const { data, error } = await supabase.functions.invoke('ai-carbon-lookup', {
        body: params
      })

      console.log('AI lookup response:', { data, error })

      if (error) {
        console.error('Edge function error:', error)
        throw error
      }

      if (data.error) {
        console.warn('Claude lookup returned fallback data:', data.error)
        toast({
          title: "Using Fallback Data",
          description: "AI lookup encountered an issue, using default estimates",
          variant: "default"
        })
      } else {
        console.log('AI lookup successful:', data)
        toast({
          title: "AI Data Retrieved Successfully",
          description: `Total Carbon: ${data.totalCarbonFootprint?.toFixed(2)}kg CO₂e • Confidence: ${Math.round(data.confidence * 100)}%`,
        })
      }

      return data
    } catch (error) {
      console.error('Error looking up carbon data:', error)
      
      // Provide more specific error messages
      let errorMessage = "AI lookup failed, using default estimates"
      if (error.message?.includes('network')) {
        errorMessage = "Network error during AI lookup"
      } else if (error.message?.includes('api key')) {
        errorMessage = "AI service configuration issue"
      }
      
      toast({
        title: "AI Lookup Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Return fallback data with calculated totals
      const fallbackCarbonFactor = 2.0
      const estimatedWeight = params.weight || 1
      
      return {
        carbonFactor: fallbackCarbonFactor,
        totalCarbonFootprint: fallbackCarbonFactor * estimatedWeight,
        density: 500,
        confidence: 0.1,
        source: 'Default estimate',
        reasoning: 'AI lookup failed, using system default values'
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    lookupCarbonData,
    loading
  }
}

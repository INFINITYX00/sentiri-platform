
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface CarbonLookupData {
  carbonFactor: number
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

export function useAICarbonLookup() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const lookupCarbonData = async (
    materialType: string,
    specificMaterial: string,
    origin?: string,
    dimensions?: string
  ): Promise<CarbonLookupData | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai-carbon-lookup', {
        body: {
          materialType,
          specificMaterial,
          origin,
          dimensions
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        throw error
      }

      if (data.error) {
        console.warn('AI lookup returned fallback data:', data.error)
        toast({
          title: "Using Fallback Data",
          description: "AI lookup unavailable, using default estimates",
          variant: "default"
        })
      } else {
        toast({
          title: "AI Carbon Data Retrieved",
          description: `Confidence: ${Math.round(data.confidence * 100)}% • Source: ${data.source}`,
        })
      }

      return data
    } catch (error) {
      console.error('Error looking up carbon data:', error)
      toast({
        title: "Lookup Failed",
        description: "Using default carbon estimates",
        variant: "destructive"
      })
      return {
        carbonFactor: 2.0,
        density: 500,
        confidence: 0.1,
        source: 'Default estimate',
        reasoning: 'AI lookup failed, using system default'
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

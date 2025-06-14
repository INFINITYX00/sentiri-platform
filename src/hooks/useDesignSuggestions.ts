
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface DesignSuggestion {
  id: string
  category: string
  title: string
  description: string
  impact: string
  implementation_effort: string
  applied: boolean
  materials_saved: string | null
  carbon_reduction: number
  created_at: string
  updated_at: string
}

export function useDesignSuggestions() {
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('design_suggestions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSuggestions(data || [])
    } catch (error) {
      console.error('Error fetching design suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch design suggestions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('design_suggestions')
        .update({ 
          applied: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      await fetchSuggestions()
      toast({
        title: "Success",
        description: "Design suggestion applied successfully",
      })
    } catch (error) {
      console.error('Error applying suggestion:', error)
      toast({
        title: "Error",
        description: "Failed to apply suggestion",
        variant: "destructive"
      })
    }
  }

  const generateSuggestions = async () => {
    // Simulate AI generating suggestions
    const newSuggestions = [
      {
        category: "Material Optimization",
        title: "Switch to Recycled Aluminum Profiles",
        description: "Replace virgin aluminum with 90% recycled content profiles for the frame structure.",
        impact: "high",
        implementation_effort: "low",
        applied: false,
        materials_saved: "Virgin aluminum: 12kg",
        carbon_reduction: 156
      },
      {
        category: "Design Efficiency",
        title: "Optimize Joint Design",
        description: "Redesign corner joints to reduce material waste by 15% while maintaining strength.",
        impact: "medium",
        implementation_effort: "medium",
        applied: false,
        materials_saved: "Steel fasteners: 2.4kg",
        carbon_reduction: 23
      }
    ]

    try {
      const { data, error } = await supabase
        .from('design_suggestions')
        .insert(newSuggestions)
        .select()

      if (error) throw error

      await fetchSuggestions()
      toast({
        title: "Success",
        description: `Generated ${newSuggestions.length} new design suggestions`,
      })

      return data
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast({
        title: "Error",
        description: "Failed to generate suggestions",
        variant: "destructive"
      })
      return null
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  return {
    suggestions,
    loading,
    applySuggestion,
    generateSuggestions,
    refreshSuggestions: fetchSuggestions
  }
}

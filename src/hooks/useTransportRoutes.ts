
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface TransportRoute {
  id: string
  origin: string
  destination: string
  distance: number
  transport_type: string
  carbon_impact: number
  date: string
  created_at: string
}

export function useTransportRoutes() {
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (error) {
      console.error('Error fetching transport routes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transport routes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addRoute = async (routeData: Omit<TransportRoute, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transport_routes')
        .insert([routeData])
        .select()

      if (error) throw error

      await fetchRoutes()
      toast({
        title: "Success",
        description: "Transport route added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding transport route:', error)
      toast({
        title: "Error",
        description: "Failed to add transport route",
        variant: "destructive"
      })
      return null
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  return {
    routes,
    loading,
    addRoute,
    refreshRoutes: fetchRoutes
  }
}

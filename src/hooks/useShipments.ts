
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Shipment {
  id: string
  tracking_number: string
  destination: string
  status: string
  estimated_arrival: string
  actual_arrival: string | null
  carrier: string
  items: string[]
  carbon_offset: boolean
  created_at: string
  updated_at: string
}

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchShipments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setShipments(data || [])
    } catch (error) {
      console.error('Error fetching shipments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch shipments",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addShipment = async (shipmentData: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select()

      if (error) throw error

      await fetchShipments()
      toast({
        title: "Success",
        description: "Shipment added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding shipment:', error)
      toast({
        title: "Error",
        description: "Failed to add shipment",
        variant: "destructive"
      })
      return null
    }
  }

  const updateShipmentStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'delivered') {
        updateData.actual_arrival = new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      await fetchShipments()
      toast({
        title: "Success",
        description: "Shipment status updated successfully",
      })
    } catch (error) {
      console.error('Error updating shipment:', error)
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  return {
    shipments,
    loading,
    addShipment,
    updateShipmentStatus,
    refreshShipments: fetchShipments
  }
}


import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface TakebackItem {
  id: string
  product_name: string
  serial_number: string
  customer_name: string
  request_date: string
  status: string
  scheduled_date: string | null
  assessment_notes: string | null
  recovery_value: number
  carbon_saved: number
  created_at: string
  updated_at: string
}

export function useTakebackItems() {
  const [items, setItems] = useState<TakebackItem[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('takeback_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching takeback items:', error)
      toast({
        title: "Error",
        description: "Failed to fetch takeback items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (itemData: Omit<TakebackItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('takeback_items')
        .insert([itemData])
        .select()

      if (error) throw error

      await fetchItems()
      toast({
        title: "Success",
        description: "Takeback request added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding takeback item:', error)
      toast({
        title: "Error",
        description: "Failed to add takeback request",
        variant: "destructive"
      })
      return null
    }
  }

  const updateItemStatus = async (id: string, status: string, scheduledDate?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      if (scheduledDate) {
        updateData.scheduled_date = scheduledDate
      }

      const { error } = await supabase
        .from('takeback_items')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      await fetchItems()
      toast({
        title: "Success",
        description: "Takeback item status updated successfully",
      })
    } catch (error) {
      console.error('Error updating takeback item:', error)
      toast({
        title: "Error",
        description: "Failed to update takeback item status",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    refreshItems: fetchItems
  }
}

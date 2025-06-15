
import { useEffect } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useMaterialsCore } from './useMaterialsCore'
import { useMaterialsOperations } from './useMaterialsOperations'

export function useMaterials() {
  const {
    materials,
    setMaterials,
    loading,
    setLoading,
    fetchMaterials,
    updateMaterial,
    deleteMaterial,
    channelRef
  } = useMaterialsCore()

  const {
    addMaterial,
    generateQRCodeForMaterial,
    regenerateQRCode
  } = useMaterialsOperations()

  useEffect(() => {
    console.log('Setting up materials hook with real-time subscription')
    
    // Initial fetch
    fetchMaterials()

    // Clean up existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing channel before creating new one')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.log('Error removing existing channel:', error)
      }
      channelRef.current = null
    }
    
    // Create a unique channel name to avoid conflicts
    const channelName = `materials-realtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('Creating new real-time channel:', channelName)
    
    // Set up real-time subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials'
        },
        (payload) => {
          console.log('Real-time update received:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('Adding new material via real-time:', payload.new)
            setMaterials(prev => {
              const exists = prev.some(m => m.id === payload.new.id)
              if (exists) {
                console.log('Material already exists, skipping duplicate')
                return prev
              }
              const updated = [payload.new as Material, ...prev]
              console.log('Updated materials list length after insert:', updated.length)
              return updated
            })
          } 
          
          if (payload.eventType === 'UPDATE') {
            console.log('Updating material via real-time:', payload.new)
            setMaterials(prev => {
              const updated = prev.map(m => 
                m.id === payload.new.id ? payload.new as Material : m
              )
              console.log('Updated materials list after update, count:', updated.length)
              return updated
            })
          }
          
          if (payload.eventType === 'DELETE') {
            console.log('Removing material via real-time:', payload.old)
            setMaterials(prev => {
              const updated = prev.filter(m => m.id !== payload.old.id)
              console.log('Updated materials list length after delete:', updated.length)
              return updated
            })
          }
        }
      )

    // Store the channel reference immediately
    channelRef.current = channel

    // Subscribe to the channel
    channel.subscribe((status, err) => {
      console.log('Real-time subscription status changed to:', status)
      if (err) {
        console.error('Real-time subscription error:', err)
      }
      if (status === 'SUBSCRIBED') {
        console.log('Real-time subscription is now active for materials')
      }
      if (status === 'CLOSED') {
        console.log('Real-time subscription was closed')
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Channel error occurred, attempting to reconnect...')
        setTimeout(() => {
          console.log('Reconnecting and fetching materials...')
          fetchMaterials()
        }, 2000)
      }
      if (status === 'TIMED_OUT') {
        console.error('Subscription timed out, attempting to reconnect...')
        setTimeout(() => {
          console.log('Reconnecting after timeout...')
          fetchMaterials()
        }, 1000)
      }
    })

    return () => {
      console.log('Cleaning up materials subscription on unmount')
      if (channelRef.current) {
        console.log('Removing channel:', channelRef.current)
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.log('Error during cleanup:', error)
        }
        channelRef.current = null
      }
    }
  }, [fetchMaterials, setMaterials]) // Add dependencies to ensure fresh references

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refreshMaterials: fetchMaterials,
    generateQRCodeForMaterial,
    regenerateQRCode
  }
}

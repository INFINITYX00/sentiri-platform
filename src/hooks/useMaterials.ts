
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

    // Clean up existing channel
    if (channelRef.current) {
      console.log('Cleaning up existing channel before creating new one')
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    
    // Create unique channel name
    const channelName = `materials-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
          
          setMaterials(prev => {
            if (payload.eventType === 'INSERT') {
              console.log('Adding new material via real-time:', payload.new)
              const exists = prev.some(m => m.id === payload.new.id)
              if (exists) {
                console.log('Material already exists, skipping duplicate')
                return prev
              }
              const updated = [payload.new as Material, ...prev]
              console.log('Updated materials list length:', updated.length)
              return updated
            } 
            
            if (payload.eventType === 'UPDATE') {
              console.log('Updating material via real-time:', payload.new)
              const updated = prev.map(m => 
                m.id === payload.new.id ? payload.new as Material : m
              )
              console.log('Updated materials list after update')
              return updated
            }
            
            if (payload.eventType === 'DELETE') {
              console.log('Removing material via real-time:', payload.old)
              const updated = prev.filter(m => m.id !== payload.old.id)
              console.log('Updated materials list length after delete:', updated.length)
              return updated
            }
            
            return prev
          })
        }
      )
      .subscribe((status, err) => {
        console.log('Real-time subscription status:', status)
        if (err) {
          console.error('Real-time subscription error:', err)
        }
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active for channel:', channelName)
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel error, attempting to reconnect...')
          // Attempt to reconnect after a delay
          setTimeout(() => {
            fetchMaterials()
          }, 2000)
        }
      })

    channelRef.current = channel

    return () => {
      console.log('Cleaning up materials subscription')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fetchMaterials, setMaterials])

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

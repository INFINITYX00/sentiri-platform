
import { useEffect, useCallback, useRef } from 'react'
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

  // Store stable references to avoid subscription recreation
  const setMaterialsRef = useRef(setMaterials)
  const fetchMaterialsRef = useRef(fetchMaterials)

  // Update refs when the functions change
  useEffect(() => {
    setMaterialsRef.current = setMaterials
    fetchMaterialsRef.current = fetchMaterials
  }, [setMaterials, fetchMaterials])

  useEffect(() => {
    console.log('Setting up materials hook with real-time subscription')
    
    // Initial fetch
    fetchMaterialsRef.current()

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
    
    // Set up real-time subscription with stable handlers
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials'
        },
        (payload: any) => {
          console.log('Real-time update received:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('Adding new material via real-time:', payload.new)
            setMaterialsRef.current(prev => {
              const exists = prev.some(m => m.id === payload.new.id)
              if (exists) {
                console.log('Material already exists, skipping duplicate')
                return prev
              }
              // Force completely new array with new object references
              const newMaterial = JSON.parse(JSON.stringify(payload.new)) as Material
              const newMaterials = [newMaterial, ...prev.map(m => ({ ...m }))]
              console.log('Updated materials list length after insert:', newMaterials.length)
              console.log('New materials array:', newMaterials.map(m => ({ id: m.id, name: m.name, updated_at: m.updated_at })))
              return newMaterials
            })
          } 
          
          if (payload.eventType === 'UPDATE') {
            console.log('Updating material via real-time:', payload.new)
            setMaterialsRef.current(prev => {
              // Force completely new object references
              const updatedMaterial = JSON.parse(JSON.stringify(payload.new)) as Material
              const newMaterials = prev.map(m => 
                m.id === payload.new.id ? updatedMaterial : { ...m }
              )
              console.log('Updated materials list after update, count:', newMaterials.length)
              console.log('Updated materials array:', newMaterials.map(m => ({ id: m.id, name: m.name, updated_at: m.updated_at })))
              console.log('🔄 FORCING RE-RENDER - Materials state updated')
              return newMaterials
            })
          }
          
          if (payload.eventType === 'DELETE') {
            console.log('Removing material via real-time:', payload.old)
            setMaterialsRef.current(prev => {
              const newMaterials = prev.filter(m => m.id !== payload.old.id)
              console.log('Updated materials list length after delete:', newMaterials.length)
              return newMaterials
            })
          }
        }
      )

    // Store the channel reference immediately
    channelRef.current = channel

    // Subscribe to the channel with stable status handler
    channel.subscribe((status: string, err?: any) => {
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
          fetchMaterialsRef.current()
        }, 2000)
      }
      if (status === 'TIMED_OUT') {
        console.error('Subscription timed out, attempting to reconnect...')
        setTimeout(() => {
          console.log('Reconnecting after timeout...')
          fetchMaterialsRef.current()
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
  }, []) // NO dependencies - subscription is created once and stays stable

  // Debug effect to track materials changes
  useEffect(() => {
    console.log('🎯 Materials state changed in useMaterials:', materials.length, materials.map(m => ({ id: m.id, name: m.name, updated_at: m.updated_at })))
  }, [materials])

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

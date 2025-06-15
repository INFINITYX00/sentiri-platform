
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface MaterialsContextType {
  materials: Material[]
  loading: boolean
  refreshMaterials: () => Promise<void>
  subscriptionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined)

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)

  const fetchMaterials = useCallback(async () => {
    console.log('🔄 MaterialsProvider: Fetching materials from database')
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching materials:', error)
        throw error
      }

      console.log('✅ MaterialsProvider: Fetched', data?.length || 0, 'materials')
      setMaterials(data || [])
    } catch (error) {
      console.error('❌ MaterialsProvider: Error fetching materials:', error)
      setSubscriptionStatus('error')
      toast({
        title: "Error",
        description: "Failed to fetch materials",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Setup real-time subscription - only once per provider instance
  useEffect(() => {
    // Prevent multiple subscriptions
    if (isSubscribedRef.current) {
      console.log('🚫 MaterialsProvider: Subscription already active, skipping')
      return
    }

    console.log('🚀 MaterialsProvider: Setting up real-time subscription')
    setSubscriptionStatus('connecting')

    // Initial fetch
    fetchMaterials()

    // Clean up any existing channel
    if (channelRef.current) {
      console.log('🧹 MaterialsProvider: Cleaning up existing channel')
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Create a unique channel
    const channelName = `materials-global-${Date.now()}`
    console.log('📡 MaterialsProvider: Creating channel:', channelName)

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
          console.log('📨 MaterialsProvider: Real-time update:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ MaterialsProvider: Adding new material')
            setMaterials(prev => {
              const exists = prev.some(m => m.id === payload.new.id)
              if (exists) {
                console.log('⚠️ Material already exists, skipping duplicate')
                return prev
              }
              return [payload.new as Material, ...prev]
            })
          }
          
          if (payload.eventType === 'UPDATE') {
            console.log('✏️ MaterialsProvider: Updating material')
            setMaterials(prev => prev.map(m => 
              m.id === payload.new.id ? payload.new as Material : m
            ))
          }
          
          if (payload.eventType === 'DELETE') {
            console.log('🗑️ MaterialsProvider: Removing material')
            setMaterials(prev => prev.filter(m => m.id !== payload.old.id))
          }
        }
      )

    channelRef.current = channel
    isSubscribedRef.current = true

    channel.subscribe((status: string, err?: any) => {
      console.log('📡 MaterialsProvider: Subscription status:', status)
      if (err) {
        console.error('❌ MaterialsProvider: Subscription error:', err)
        setSubscriptionStatus('error')
      } else if (status === 'SUBSCRIBED') {
        console.log('✅ MaterialsProvider: Real-time subscription active')
        setSubscriptionStatus('connected')
      } else if (status === 'CLOSED') {
        console.log('📪 MaterialsProvider: Subscription closed')
        setSubscriptionStatus('disconnected')
        isSubscribedRef.current = false
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('💥 MaterialsProvider: Connection issues, will retry')
        setSubscriptionStatus('error')
        setTimeout(() => {
          console.log('🔄 MaterialsProvider: Retrying connection...')
          fetchMaterials()
        }, 2000)
      }
    })

    // Cleanup function
    return () => {
      console.log('🧹 MaterialsProvider: Cleaning up subscription')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      isSubscribedRef.current = false
      setSubscriptionStatus('disconnected')
    }
  }, [fetchMaterials]) // Only depend on fetchMaterials

  const value: MaterialsContextType = {
    materials,
    loading,
    refreshMaterials: fetchMaterials,
    subscriptionStatus
  }

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  )
}

export function useMaterialsContext() {
  const context = useContext(MaterialsContext)
  if (context === undefined) {
    throw new Error('useMaterialsContext must be used within a MaterialsProvider')
  }
  return context
}

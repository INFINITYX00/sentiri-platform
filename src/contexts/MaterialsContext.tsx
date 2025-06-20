
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

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
  const { companyId } = useCompanyData()
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)

  const fetchMaterials = useCallback(async () => {
    if (!companyId) {
      console.log('🔄 MaterialsProvider: No company ID, skipping material fetch')
      setMaterials([])
      setLoading(false)
      return
    }

    console.log('🔄 MaterialsProvider: Fetching materials for company:', companyId)
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching materials:', error)
        throw error
      }

      console.log('✅ MaterialsProvider: Fetched', data?.length || 0, 'materials for company')
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
  }, [companyId, toast])

  const setupRealtimeSubscription = useCallback(() => {
    if (!companyId) {
      console.log('🔄 MaterialsProvider: No company ID, skipping realtime setup')
      return
    }

    if (isSubscribedRef.current) {
      console.log('🔄 MaterialsProvider: Already subscribed to realtime, skipping')
      return
    }

    console.log('🔄 MaterialsProvider: Setting up realtime subscription for company:', companyId)
    setSubscriptionStatus('connecting')

    try {
      // Clean up existing channel
      if (channelRef.current) {
        console.log('🧹 MaterialsProvider: Cleaning up existing channel')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }

      // Create new channel for company-specific materials
      const channel = supabase
        .channel('materials-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'materials',
            filter: `company_id=eq.${companyId}`
          },
          (payload) => {
            console.log('📡 MaterialsProvider: Realtime update received:', payload)
            
            switch (payload.eventType) {
              case 'INSERT':
                setMaterials(current => [payload.new as Material, ...current])
                break
              case 'UPDATE':
                setMaterials(current => 
                  current.map(material => 
                    material.id === payload.new.id ? payload.new as Material : material
                  )
                )
                break
              case 'DELETE':
                setMaterials(current => 
                  current.filter(material => material.id !== payload.old.id)
                )
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 MaterialsProvider: Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            setSubscriptionStatus('connected')
            isSubscribedRef.current = true
          } else if (status === 'CHANNEL_ERROR') {
            setSubscriptionStatus('error')
            isSubscribedRef.current = false
          }
        })

      channelRef.current = channel
    } catch (error) {
      console.error('❌ MaterialsProvider: Error setting up realtime:', error)
      setSubscriptionStatus('error')
    }
  }, [companyId])

  // Fetch materials when company changes
  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  // Setup realtime when company is available
  useEffect(() => {
    if (companyId) {
      setupRealtimeSubscription()
    }

    return () => {
      if (channelRef.current) {
        console.log('🧹 MaterialsProvider: Cleaning up subscription on unmount')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        isSubscribedRef.current = false
      }
    }
  }, [companyId, setupRealtimeSubscription])

  const value = {
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

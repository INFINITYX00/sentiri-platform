
import { useMaterialsContext } from '@/contexts/MaterialsContext'
import { useMaterialsOperations } from './useMaterialsOperations'
import { useMaterialsCore } from './useMaterialsCore'

export function useMaterials() {
  // Get materials state from global context
  const { materials, loading, refreshMaterials, subscriptionStatus } = useMaterialsContext()
  
  // Get operations (add, update, delete) from the core hook
  const { updateMaterial, deleteMaterial } = useMaterialsCore()
  
  // Get additional operations
  const {
    addMaterial,
    generateQRCodeForMaterial,
    regenerateQRCode
  } = useMaterialsOperations()

  console.log('🎯 useMaterials hook - materials count:', materials.length, 'status:', subscriptionStatus)

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refreshMaterials,
    generateQRCodeForMaterial,
    regenerateQRCode,
    subscriptionStatus
  }
}

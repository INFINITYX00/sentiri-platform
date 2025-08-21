
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { generateQRCode } from '@/utils/qrGenerator'
import { useCompanyData } from '@/hooks/useCompanyData'

export function useMaterialsOperations() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const addMaterial = async (materialData: any) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company information not available. Please try logging in again.",
        variant: "destructive"
      })
      return null
    }

    setIsLoading(true)
    try {
      console.log('🔧 Adding material with company_id:', companyId)
      console.log('🔧 Raw form data received:', JSON.stringify(materialData, null, 2))
      
      // Generate QR code
      const qrCode = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Define allowed fields (whitelist approach) to prevent problematic fields
      const allowedFields = [
        'name', 'type', 'specific_material', 'origin', 'quantity', 'unit', 
        'unit_count', 'carbon_footprint', 'carbon_factor', 'carbon_source',
        'cost_per_unit', 'description', 'image_url', 'length', 'width', 
        'thickness', 'dimension_unit', 'dimensions', 'density',
        'ai_carbon_confidence', 'ai_carbon_source'
      ]
      
      // Create clean object with only allowed fields
      const cleanMaterial: any = {}
      allowedFields.forEach(field => {
        if (materialData[field] !== undefined && materialData[field] !== '') {
          cleanMaterial[field] = materialData[field]
        }
      })
      
      // Handle ai_carbon_updated_at specially - only include if it's a valid timestamp
      if (materialData.ai_carbon_updated_at && 
          materialData.ai_carbon_updated_at !== '' && 
          materialData.ai_carbon_updated_at !== '1970-01-01T00:00:00.000Z') {
        cleanMaterial.ai_carbon_updated_at = materialData.ai_carbon_updated_at
      }
      
      // Add required fields
      const materialWithCompany = {
        ...cleanMaterial,
        company_id: companyId,
        qr_code: qrCode
      }
      
      console.log('🔧 Cleaned material data to send:', JSON.stringify(materialWithCompany, null, 2))
      console.log('🔧 Field count - Original:', Object.keys(materialData).length, 'Cleaned:', Object.keys(materialWithCompany).length)

      const { data, error } = await supabase
        .from('materials')
        .insert([materialWithCompany])
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding material:', error)
        toast({
          title: "Error adding material",
          description: error.message,
          variant: "destructive"
        })
        return null
      }

      console.log('✅ Material added successfully:', data)
      
      // Generate QR code image
      try {
        await generateQRCodeForMaterial(data.id, qrCode)
      } catch (qrError) {
        console.warn('⚠️ Failed to generate QR code image:', qrError)
      }

      toast({
        title: "Material added successfully",
        description: `${data.name} has been added to your inventory.`
      })

      return data
    } catch (error) {
      console.error('❌ Unexpected error adding material:', error)
      toast({
        title: "Error adding material",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCodeForMaterial = async (materialId: string, qrCode: string) => {
    try {
      const qrImageUrl = await generateQRCode(qrCode)
      
      const { error } = await supabase
        .from('materials')
        .update({ qr_image_url: qrImageUrl })
        .eq('id', materialId)

      if (error) {
        console.error('Error updating QR image URL:', error)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const regenerateQRCode = async (materialId: string) => {
    try {
      const newQrCode = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const qrImageUrl = await generateQRCode(newQrCode)
      
      const { error } = await supabase
        .from('materials')
        .update({ 
          qr_code: newQrCode,
          qr_image_url: qrImageUrl 
        })
        .eq('id', materialId)

      if (error) {
        console.error('Error regenerating QR code:', error)
        toast({
          title: "Error",
          description: "Failed to regenerate QR code",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "QR Code Regenerated",
        description: "A new QR code has been generated for this material."
      })
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to regenerate QR code",
        variant: "destructive"
      })
    }
  }

  return {
    addMaterial,
    generateQRCodeForMaterial,
    regenerateQRCode,
    loading: isLoading
  }
}

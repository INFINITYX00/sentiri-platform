
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
      console.log('🔧 Raw form data:', materialData)
      
      // Generate QR code
      const qrCode = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Clean up all timestamp fields and ensure no empty strings are sent
      const cleanedData = { ...materialData }
      
      // Remove or clean timestamp fields that could cause issues
      Object.keys(cleanedData).forEach(key => {
        if (key.includes('_at') && cleanedData[key] === '') {
          cleanedData[key] = null
        }
      })
      
      // Add company_id to the material data
      const materialWithCompany = {
        ...cleanedData,
        company_id: companyId,
        qr_code: qrCode,
        // Explicitly ensure these are not sent as empty strings
        created_at: undefined,
        updated_at: undefined,
        ai_carbon_updated_at: cleanedData.ai_carbon_updated_at || null
      }
      
      console.log('🔧 Final material data being sent to database:', materialWithCompany)

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

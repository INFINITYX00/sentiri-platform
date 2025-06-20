
import { useState } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

export function useMaterialsOperations() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const addMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "No company found. Please ensure you're properly logged in.",
        variant: "destructive"
      })
      return null
    }

    console.log('addMaterial called with data:', materialData)
    setLoading(true)
    try {
      const materialWithCompany = {
        ...materialData,
        company_id: companyId,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('materials')
        .insert([materialWithCompany])
        .select()

      if (error) {
        console.error('Error in addMaterial:', error)
        throw error
      }

      console.log('Material added successfully to database, real-time should handle UI update')
      
      toast({
        title: "Success",
        description: "Material added successfully",
      })

      return data[0]
    } catch (error) {
      console.error('Error adding material:', error)
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateQRCodeForMaterial = async (materialId: string) => {
    console.log('generateQRCodeForMaterial called for ID:', materialId)
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { 
          materialId,
          companyId 
        }
      })

      if (error) {
        console.error('Error generating QR code:', error)
        throw error
      }

      console.log('QR code generated successfully:', data)
      
      toast({
        title: "Success",
        description: "QR code generated successfully",
      })

      return data
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
      return null
    }
  }

  const regenerateQRCode = async (materialId: string) => {
    console.log('regenerateQRCode called for ID:', materialId)
    return await generateQRCodeForMaterial(materialId)
  }

  return {
    loading,
    addMaterial,
    generateQRCodeForMaterial,
    regenerateQRCode
  }
}

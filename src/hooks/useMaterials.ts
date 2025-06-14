import { useState, useEffect } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { generateQRCode, createMaterialQRData, generateSimpleQRCode } from '@/utils/qrGenerator'
import { uploadFile } from '@/utils/fileUpload'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast({
        title: "Error",
        description: "Failed to fetch materials",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'qr_code' | 'qr_image_url'>) => {
    setLoading(true)
    try {
      // First insert the material to get the ID
      const { data: newMaterial, error: insertError } = await supabase
        .from('materials')
        .insert([{
          ...materialData,
          qr_code: `TEMP_${Date.now()}`, // Temporary QR code
          dimensions: simulateAIDimensions(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Generate web-linkable QR code data and simple identifier
      const qrData = createMaterialQRData(newMaterial.id);
      const simpleQRCode = generateSimpleQRCode(newMaterial.id);
      
      // Generate QR code image
      const qrCodeDataURL = await generateQRCode(qrData)
      
      // Convert data URL to blob for upload
      const response = await fetch(qrCodeDataURL)
      const blob = await response.blob()
      const qrFile = new File([blob], `qr-${newMaterial.id}.png`, { type: 'image/png' })
      
      // Upload QR code image to storage
      const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes')
      
      if (uploadResult.error) {
        console.warn('QR code image upload failed:', uploadResult.error)
        // Update material with just the QR data, no QR image, but keep original material image
        await supabase
          .from('materials')
          .update({ 
            qr_code: qrData, // Store the web-linkable URL
            qr_image_url: null
            // Keep the original image_url from materialData
          })
          .eq('id', newMaterial.id)
          
        toast({
          title: "Warning",
          description: "QR code generated but image upload failed. Material added successfully.",
        })
      } else {
        // Update material with QR data and QR image URL, but keep original material image
        await supabase
          .from('materials')
          .update({ 
            qr_code: qrData, // Store the web-linkable URL
            qr_image_url: uploadResult.url
            // Keep the original image_url from materialData - don't overwrite it
          })
          .eq('id', newMaterial.id)
      }

      await fetchMaterials()
      toast({
        title: "Success",
        description: `Material "${materialData.name}" added with QR code ${simpleQRCode}`,
      })

      return { ...newMaterial, qr_code: qrData, qr_image_url: uploadResult.url }
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

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      await fetchMaterials()
      toast({
        title: "Success",
        description: "Material updated successfully",
      })
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: "Error",
        description: "Failed to update material",
        variant: "destructive"
      })
    }
  }

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchMaterials()
      toast({
        title: "Success",
        description: "Material deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting material:', error)
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive"
      })
    }
  }

  const generateQRCodeForMaterial = async (materialId: string) => {
    try {
      const qrData = createMaterialQRData(materialId);
      const qrCodeDataURL = await generateQRCode(qrData)
      
      // Convert to downloadable blob
      const response = await fetch(qrCodeDataURL)
      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `material-qr-${materialId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "Web-linkable QR code downloaded successfully",
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    }
  }

  const regenerateQRCode = async (materialId: string) => {
    try {
      const qrData = createMaterialQRData(materialId);
      const qrCodeDataURL = await generateQRCode(qrData)
      
      // Convert data URL to blob for upload
      const response = await fetch(qrCodeDataURL)
      const blob = await response.blob()
      const qrFile = new File([blob], `qr-${materialId}.png`, { type: 'image/png' })
      
      // Upload new QR code image
      const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes')
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error)
      }
      
      // Update material with new QR image URL, but don't change the material image
      await supabase
        .from('materials')
        .update({ 
          qr_code: qrData,
          qr_image_url: uploadResult.url,
          updated_at: new Date().toISOString()
          // Don't update image_url - that should remain the original material image
        })
        .eq('id', materialId)
      
      await fetchMaterials()
      toast({
        title: "Success",
        description: "QR code regenerated successfully",
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

  useEffect(() => {
    fetchMaterials()
  }, [])

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

function simulateAIDimensions(): string {
  const dimensions = [
    "2000x200x25mm",
    "1200x800x3mm", 
    "1000x500x10mm",
    "1220x610x18mm",
    "2400x150x50mm",
    "800x600x12mm"
  ]
  return dimensions[Math.floor(Math.random() * dimensions.length)]
}

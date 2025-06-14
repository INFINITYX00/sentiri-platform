import { useState, useEffect, useRef } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { generateQRCode, createMaterialQRData, generateSimpleQRCode } from '@/utils/qrGenerator'
import { uploadFile } from '@/utils/fileUpload'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const channelRef = useRef<any>(null)
  const subscriptionSetupRef = useRef(false)

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Materials fetched:', data?.length || 0, 'materials')
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
      console.log('Starting material creation with data:', materialData);
      
      const originalImageUrl = materialData.image_url;
      console.log('Original image URL to preserve:', originalImageUrl);
      
      // First insert the material to get the ID
      const { data: newMaterial, error: insertError } = await supabase
        .from('materials')
        .insert([{
          ...materialData,
          qr_code: `TEMP_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) throw insertError

      console.log('Material inserted:', newMaterial);

      // Generate web-linkable QR code data and simple identifier
      const qrData = createMaterialQRData(newMaterial.id);
      const simpleQRCode = generateSimpleQRCode(newMaterial.id);
      
      console.log('Generated QR data:', qrData);
      console.log('Simple QR code:', simpleQRCode);
      
      // Generate QR code image
      const qrCodeDataURL = await generateQRCode(qrData)
      
      // Convert data URL to blob for upload
      const response = await fetch(qrCodeDataURL)
      const blob = await response.blob()
      const qrFile = new File([blob], `qr-${newMaterial.id}.png`, { type: 'image/png' })
      
      console.log('Generated QR code file:', qrFile.name, qrFile.size);
      
      // Upload QR code image to storage
      const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes')
      
      console.log('QR code upload result:', uploadResult);
      
      if (uploadResult.error) {
        console.warn('QR code image upload failed:', uploadResult.error)
        const updateData = { 
          qr_code: qrData,
          qr_image_url: null,
          image_url: originalImageUrl
        };
        
        console.log('Updating material with QR data only, preserving image:', updateData);
        
        await supabase
          .from('materials')
          .update(updateData)
          .eq('id', newMaterial.id)
          
        toast({
          title: "Warning",
          description: "QR code generated but image upload failed. Material added successfully.",
        })
      } else {
        const updateData = { 
          qr_code: qrData,
          qr_image_url: uploadResult.url,
          image_url: originalImageUrl
        };
        
        console.log('Updating material with QR data and image, preserving original:', updateData);
        
        await supabase
          .from('materials')
          .update(updateData)
          .eq('id', newMaterial.id)
      }

      console.log('Material added successfully, real-time subscription will handle UI update')
      
      toast({
        title: "Success",
        description: `Material "${materialData.name}" added with QR code ${simpleQRCode}`,
      })

      const finalResult = { 
        ...newMaterial, 
        qr_code: qrData, 
        qr_image_url: uploadResult.url,
        image_url: originalImageUrl
      };
      console.log('Final material result:', finalResult);
      
      return finalResult;
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
    setLoading(true)
    try {
      const { error } = await supabase
        .from('materials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      console.log('Material updated successfully, materials will update via real-time subscription')
      
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
    } finally {
      setLoading(false)
    }
  }

  const deleteMaterial = async (id: string) => {
    setLoading(true)
    try {
      console.log('Attempting to delete material with id:', id)
      
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('Material deleted successfully, materials will update via real-time subscription')
      
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
    } finally {
      setLoading(false)
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
    setLoading(true)
    try {
      // First get the current material to preserve its image_url
      const { data: currentMaterial } = await supabase
        .from('materials')
        .select('image_url')
        .eq('id', materialId)
        .single()

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
      
      // Update material with new QR image URL, preserving the original image
      await supabase
        .from('materials')
        .update({ 
          qr_code: qrData,
          qr_image_url: uploadResult.url,
          image_url: currentMaterial?.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', materialId)
      
      console.log('QR code regenerated successfully, materials will update via real-time subscription')
      
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Setting up materials hook with real-time subscription')
    
    // Initial fetch
    fetchMaterials()

    // Only set up subscription if we haven't already done so
    if (!subscriptionSetupRef.current) {
      subscriptionSetupRef.current = true
      
      // Set up real-time subscription with a unique channel name
      const channelName = `materials-changes-${Date.now()}-${Math.random()}`
      console.log('Creating channel:', channelName)
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'materials'
          },
          (payload) => {
            console.log('Real-time update received:', payload.eventType, payload)
            
            if (payload.eventType === 'INSERT') {
              console.log('Material inserted via real-time:', payload.new)
              setMaterials(prev => {
                // Check if material already exists to avoid duplicates
                const exists = prev.some(m => m.id === payload.new.id)
                if (exists) {
                  console.log('Material already exists, skipping duplicate')
                  return prev
                }
                return [payload.new as Material, ...prev]
              })
            } else if (payload.eventType === 'DELETE') {
              console.log('Material deleted via real-time:', payload.old)
              setMaterials(prev => prev.filter(m => m.id !== payload.old.id))
            } else if (payload.eventType === 'UPDATE') {
              console.log('Material updated via real-time:', payload.new)
              setMaterials(prev => prev.map(m => m.id === payload.new.id ? payload.new as Material : m))
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status)
        })

      channelRef.current = channel
    }

    return () => {
      console.log('Cleaning up materials subscription')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      subscriptionSetupRef.current = false
    }
  }, []) // Empty dependency array to run only once

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

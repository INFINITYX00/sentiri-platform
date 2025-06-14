import { useState, useEffect, useRef } from 'react'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { generateCompleteQRPackage } from '@/utils/qrGenerator'
import { uploadFile } from '@/utils/fileUpload'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const channelRef = useRef<any>(null)

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
      console.log('Starting material creation with simplified data:', materialData);
      
      // Step 1: Generate QR package first
      const tempId = crypto.randomUUID();
      let qrData: string;
      let qrImageUrl: string | null = null;
      let simpleQRCode: string;
      
      try {
        const qrPackage = await generateCompleteQRPackage(tempId);
        qrData = qrPackage.qrData;
        simpleQRCode = qrPackage.simpleCode;
        
        // Convert QR code to file and upload
        const response = await fetch(qrPackage.qrCodeDataURL);
        const blob = await response.blob();
        const qrFile = new File([blob], `qr-${tempId}.png`, { type: 'image/png' });
        
        console.log('Generated QR code file:', qrFile.name, qrFile.size);
        
        const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes');
        
        if (uploadResult.error) {
          console.warn('QR code image upload failed:', uploadResult.error);
        } else {
          qrImageUrl = uploadResult.url;
          console.log('QR code uploaded successfully:', qrImageUrl);
        }
      } catch (qrError) {
        console.error('QR generation failed:', qrError);
        // Use fallback QR data
        qrData = `${window.location.origin}/material/${tempId}`;
        simpleQRCode = `QR${tempId.slice(-6).toUpperCase()}`;
      }

      // Step 2: Insert complete material with simplified data structure
      const completeData = {
        ...materialData,
        id: tempId,
        qr_code: qrData,
        qr_image_url: qrImageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Inserting complete material data:', completeData);
      
      const { data: newMaterial, error: insertError } = await supabase
        .from('materials')
        .insert([completeData])
        .select()
        .single()

      if (insertError) throw insertError
      console.log('Material creation completed successfully with ID:', newMaterial.id);
      
      // Show success message
      const costText = materialData.cost_per_unit ? ` at $${materialData.cost_per_unit}/${materialData.unit}` : '';
      
      toast({
        title: "Success",
        description: `Material "${materialData.name}" (${materialData.quantity} ${materialData.unit}) added with QR code ${simpleQRCode}${costText}`,
      });

      // Real-time subscription will handle UI update automatically
      return newMaterial;
      
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

      console.log('Material updated successfully, real-time will handle UI update')
      
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
      console.log('Deleting material:', id)
      
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('Material deleted, real-time will handle UI update')
      
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
      const qrPackage = await generateCompleteQRPackage(materialId);
      
      // Convert to downloadable blob
      const response = await fetch(qrPackage.qrCodeDataURL);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `material-qr-${materialId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Web-linkable QR code downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  }

  const regenerateQRCode = async (materialId: string) => {
    setLoading(true)
    try {
      // Get current material to preserve image_url
      const { data: currentMaterial } = await supabase
        .from('materials')
        .select('image_url')
        .eq('id', materialId)
        .single()

      // Generate new QR package
      const qrPackage = await generateCompleteQRPackage(materialId);
      
      // Convert to file and upload
      const response = await fetch(qrPackage.qrCodeDataURL);
      const blob = await response.blob();
      const qrFile = new File([blob], `qr-${materialId}.png`, { type: 'image/png' });
      
      const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes');
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      
      // Update material with new QR data
      await supabase
        .from('materials')
        .update({ 
          qr_code: qrPackage.qrData,
          qr_image_url: uploadResult.url,
          image_url: currentMaterial?.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', materialId)
      
      console.log('QR code regenerated, real-time will handle UI update')
      
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
    console.log('Setting up materials hook with fixed real-time subscription')
    
    // Initial fetch
    fetchMaterials()

    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing channel before creating new one')
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    
    // Create new channel with unique name
    const channelName = `materials-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('Creating new real-time channel:', channelName)
    
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
              // Check for duplicates
              const exists = prev.some(m => m.id === payload.new.id)
              if (exists) {
                console.log('Material already exists, skipping')
                return prev
              }
              return [payload.new as Material, ...prev]
            } 
            
            if (payload.eventType === 'UPDATE') {
              console.log('Updating material via real-time:', payload.new)
              return prev.map(m => 
                m.id === payload.new.id ? payload.new as Material : m
              )
            }
            
            if (payload.eventType === 'DELETE') {
              console.log('Removing material via real-time:', payload.old)
              return prev.filter(m => m.id !== payload.old.id)
            }
            
            return prev
          })
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active for channel:', channelName)
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

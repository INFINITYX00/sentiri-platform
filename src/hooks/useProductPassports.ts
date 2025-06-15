
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { generateCompleteQRPackage } from '@/utils/qrGenerator'
import { uploadFile } from '@/utils/fileUpload'

export interface ProductPassport {
  id: string
  project_id: string
  product_name: string
  product_type: string
  quantity_produced: number
  total_carbon_footprint: number
  qr_code: string
  qr_image_url?: string
  image_url?: string
  specifications: any // Changed from Record<string, any> to any to match Json type
  production_date: string
  created_at: string
  updated_at: string
  project?: {
    id: string
    name: string
    description?: string
  }
}

export function useProductPassports() {
  const [productPassports, setProductPassports] = useState<ProductPassport[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchProductPassports = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('product_passports')
        .select(`
          *,
          project:projects(id, name, description)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Product passports fetched:', data?.length || 0)
      setProductPassports(data || [])
    } catch (error) {
      console.error('Error fetching product passports:', error)
      toast({
        title: "Error",
        description: "Failed to fetch product passports",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateProductPassport = async (
    projectId: string,
    productName: string,
    productType: string = 'manufactured',
    quantityProduced: number = 1,
    totalCarbonFootprint: number = 0,
    specifications: Record<string, any> = {},
    productImageUrl?: string
  ) => {
    setLoading(true)
    console.log('🔧 useProductPassports: generateProductPassport called')
    console.log('📋 Parameters:', { projectId, productName, productType, quantityProduced, totalCarbonFootprint, productImageUrl })
    
    try {
      console.log('🎯 Step 1: Fetching complete project data...')
      
      // Fetch complete project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (projectError || !projectData) {
        throw new Error(`Failed to fetch project data: ${projectError?.message}`)
      }
      
      // Fetch project materials with actual material details
      const { data: projectMaterials, error: materialsError } = await supabase
        .from('projects_materials')
        .select(`
          *,
          material:materials(*)
        `)
        .eq('project_id', projectId)
      
      if (materialsError) {
        console.warn('Failed to fetch project materials:', materialsError)
      }
      
      // Fetch manufacturing stages
      const { data: manufacturingStages, error: stagesError } = await supabase
        .from('manufacturing_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      
      if (stagesError) {
        console.warn('Failed to fetch manufacturing stages:', stagesError)
      }
      
      console.log('📊 Fetched data:', {
        project: projectData.name,
        materialsCount: projectMaterials?.length || 0,
        stagesCount: manufacturingStages?.length || 0
      })
      
      // Calculate actual carbon footprint from materials and stages
      let calculatedCarbonFootprint = 0
      
      // Add carbon from materials
      if (projectMaterials) {
        calculatedCarbonFootprint += projectMaterials.reduce((total, pm) => {
          const material = pm.material as any
          if (material && material.carbon_footprint) {
            return total + (material.carbon_footprint * pm.quantity_consumed)
          }
          return total
        }, 0)
      }
      
      // Use calculated carbon footprint if available, otherwise use provided value
      const finalCarbonFootprint = calculatedCarbonFootprint > 0 ? calculatedCarbonFootprint : totalCarbonFootprint
      
      console.log('🎯 Step 2: Generating QR package...')
      
      // Generate QR package
      const tempId = crypto.randomUUID()
      console.log('🆔 Generated temp ID:', tempId)
      
      let qrData: string
      let qrImageUrl: string | null = null
      
      try {
        console.log('📱 Generating QR code for product passport...')
        const qrPackage = await generateCompleteQRPackage(tempId)
        qrData = qrPackage.qrData
        console.log('✅ QR data generated:', qrData)
        
        // Convert QR code to file and upload
        console.log('🔄 Converting QR code to blob...')
        const response = await fetch(qrPackage.qrCodeDataURL)
        if (!response.ok) {
          throw new Error(`Failed to fetch QR code data: ${response.status} ${response.statusText}`)
        }
        const blob = await response.blob()
        console.log('✅ QR code blob created, size:', blob.size, 'bytes')
        
        const qrFile = new File([blob], `product-qr-${tempId}.png`, { type: 'image/png' })
        console.log('📁 QR file created:', qrFile.name)
        
        console.log('☁️ Uploading QR code to storage...')
        const uploadResult = await uploadFile(qrFile, 'material-images', 'product-qr-codes')
        
        if (uploadResult.error) {
          console.error('❌ QR code upload failed:', uploadResult.error)
          throw new Error(`QR code upload failed: ${uploadResult.error}`)
        } else {
          qrImageUrl = uploadResult.url
          console.log('✅ Product QR code uploaded successfully:', qrImageUrl)
        }
      } catch (qrError) {
        console.error('❌ QR generation/upload failed:', qrError)
        // Fallback to simple URL
        qrData = `${window.location.origin}/product/${tempId}`
        console.log('🔄 Using fallback QR data:', qrData)
      }

      console.log('🎯 Step 3: Preparing enhanced specifications...')
      
      // Prepare enhanced specifications with actual data
      const enhancedSpecifications = {
        ...specifications,
        project_description: projectData.description,
        completion_date: new Date().toISOString(),
        total_cost: projectData.total_cost,
        progress: projectData.progress,
        materials_used: projectMaterials?.map(pm => ({
          id: pm.material_id,
          name: pm.material?.name || 'Unknown Material',
          type: pm.material?.type || 'Unknown',
          quantity_required: pm.quantity_required,
          quantity_consumed: pm.quantity_consumed,
          unit: pm.material?.unit || 'unit',
          carbon_footprint: pm.material?.carbon_footprint || 0,
          total_carbon_impact: (pm.material?.carbon_footprint || 0) * pm.quantity_consumed,
          cost_per_unit: pm.cost_per_unit,
          total_cost: pm.total_cost
        })) || [],
        manufacturing_stages: manufacturingStages?.map(stage => ({
          name: stage.name,
          status: stage.status,
          estimated_hours: stage.estimated_hours,
          actual_hours: stage.actual_hours,
          estimated_energy: stage.energy_estimate,
          actual_energy: stage.actual_energy,
          progress: stage.progress,
          start_date: stage.start_date,
          completed_date: stage.completed_date,
          workers: stage.workers,
          notes: stage.notes
        })) || [],
        carbon_breakdown: {
          materials_carbon: projectMaterials?.reduce((total, pm) => 
            total + ((pm.material?.carbon_footprint || 0) * pm.quantity_consumed), 0) || 0,
          manufacturing_carbon: 0, // Could be calculated from energy consumption
          total_carbon: finalCarbonFootprint
        }
      }
      
      console.log('🎯 Step 4: Creating product passport database record...')
      console.log('📝 Passport data:', {
        id: tempId,
        project_id: projectId,
        product_name: productName,
        product_type: productType,
        quantity_produced: quantityProduced,
        total_carbon_footprint: finalCarbonFootprint,
        qr_code: qrData,
        qr_image_url: qrImageUrl,
        image_url: productImageUrl, // Store image in the correct field
        specifications: enhancedSpecifications
      })
      
      // Create product passport
      const { data, error } = await supabase
        .from('product_passports')
        .insert([{
          id: tempId,
          project_id: projectId,
          product_name: productName,
          product_type: productType,
          quantity_produced: quantityProduced,
          total_carbon_footprint: finalCarbonFootprint,
          qr_code: qrData,
          qr_image_url: qrImageUrl,
          image_url: productImageUrl, // Store image in the correct field
          specifications: enhancedSpecifications,
          production_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Database insert error:', error)
        console.error('Error details:', { 
          message: error.message, 
          code: error.code, 
          details: error.details,
          hint: error.hint 
        })
        throw new Error(`Failed to create product passport: ${error.message}`)
      }

      console.log('✅ Product passport created successfully in database:', data.id)
      console.log('🔄 Refreshing product passports list...')
      await fetchProductPassports()
      
      toast({
        title: "Success",
        description: `Product passport generated for "${productName}"`,
      })
      
      console.log('🎉 Product passport generation completed successfully')
      return data
    } catch (error) {
      console.error('💥 CRITICAL ERROR in generateProductPassport:', error)
      console.error('Error stack trace:', error.stack)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Processed error message:', errorMessage)
      
      toast({
        title: "Product Passport Generation Error",
        description: `Failed to generate product passport: ${errorMessage}`,
        variant: "destructive"
      })
      throw error // Re-throw so calling code can handle it
    } finally {
      console.log('🏁 generateProductPassport finally block executed')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductPassports()
  }, [])

  return {
    productPassports,
    loading,
    generateProductPassport,
    refreshProductPassports: fetchProductPassports
  }
}

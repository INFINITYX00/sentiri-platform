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
    specifications: Record<string, any> = {}
  ) => {
    setLoading(true)
    console.log('🔧 useProductPassports: generateProductPassport called')
    console.log('📋 Parameters:', { projectId, productName, productType, quantityProduced, totalCarbonFootprint })
    
    try {
      console.log('🎯 Step 1: Generating QR package...')
      
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

      console.log('🎯 Step 2: Creating product passport database record...')
      console.log('📝 Passport data:', {
        id: tempId,
        project_id: projectId,
        product_name: productName,
        product_type: productType,
        quantity_produced: quantityProduced,
        total_carbon_footprint: totalCarbonFootprint,
        qr_code: qrData,
        qr_image_url: qrImageUrl,
        specifications
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
          total_carbon_footprint: totalCarbonFootprint,
          qr_code: qrData,
          qr_image_url: qrImageUrl,
          specifications,
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

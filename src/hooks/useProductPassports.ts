
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
    try {
      console.log('Generating product passport for project:', projectId)
      
      // Generate QR package
      const tempId = crypto.randomUUID()
      let qrData: string
      let qrImageUrl: string | null = null
      
      try {
        const qrPackage = await generateCompleteQRPackage(tempId)
        qrData = qrPackage.qrData
        
        // Convert QR code to file and upload
        const response = await fetch(qrPackage.qrCodeDataURL)
        const blob = await response.blob()
        const qrFile = new File([blob], `product-qr-${tempId}.png`, { type: 'image/png' })
        
        const uploadResult = await uploadFile(qrFile, 'material-images', 'product-qr-codes')
        
        if (uploadResult.error) {
          console.warn('QR code upload failed:', uploadResult.error)
        } else {
          qrImageUrl = uploadResult.url
          console.log('Product QR code uploaded successfully:', qrImageUrl)
        }
      } catch (qrError) {
        console.error('QR generation failed:', qrError)
        qrData = `${window.location.origin}/product/${tempId}`
      }

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

      if (error) throw error

      console.log('Product passport created:', data.id)
      await fetchProductPassports()
      
      toast({
        title: "Success",
        description: `Product passport generated for "${productName}"`,
      })
      
      return data
    } catch (error) {
      console.error('Error generating product passport:', error)
      toast({
        title: "Error",
        description: "Failed to generate product passport",
        variant: "destructive"
      })
      return null
    } finally {
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

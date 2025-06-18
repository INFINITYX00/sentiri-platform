import { generateCompleteQRPackage } from '@/utils/qrGenerator'
import { uploadFile } from '@/utils/fileUpload'
import { supabase, type Material } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { useCompanyData } from '@/hooks/useCompanyData'

export function useMaterialsOperations() {
  const { toast } = useToast()
  const { companyId } = useCompanyData()

  const addMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'qr_code' | 'qr_image_url' | 'company_id'>) => {
    try {
      console.log('Starting material creation with data:', materialData);
      
      if (!companyId) {
        throw new Error('No company ID found. Please ensure you are logged in.');
      }
      
      if (!materialData.name || !materialData.type || !materialData.quantity || !materialData.unit) {
        throw new Error('Missing required fields: name, type, quantity, or unit');
      }
      
      const tempId = crypto.randomUUID();
      let qrData: string;
      let qrImageUrl: string | null = null;
      let simpleQRCode: string;
      
      try {
        const qrPackage = await generateCompleteQRPackage(tempId);
        qrData = qrPackage.qrData;
        simpleQRCode = qrPackage.simpleCode;
        
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
        qrData = `${window.location.origin}/material/${tempId}`;
        simpleQRCode = `QR${tempId.slice(-6).toUpperCase()}`;
      }

      let totalCarbonFootprint = 0;
      const carbonFactor = materialData.carbon_footprint || 0;
      const quantity = Number(materialData.quantity);

      if (['m³', 'cm³', 'mm³'].includes(materialData.unit)) {
        totalCarbonFootprint = carbonFactor * quantity;
      } else {
        totalCarbonFootprint = carbonFactor * quantity;
      }

      const completeData = {
        id: tempId,
        name: materialData.name,
        type: materialData.type,
        specific_material: materialData.specific_material || null,
        origin: materialData.origin || null,
        quantity: Number(materialData.quantity),
        unit: materialData.unit,
        unit_count: materialData.unit_count || 1,
        cost_per_unit: materialData.cost_per_unit ? Number(materialData.cost_per_unit) : null,
        carbon_footprint: totalCarbonFootprint,
        carbon_source: materialData.carbon_source || null,
        description: materialData.description || null,
        dimensions: materialData.dimensions || null,
        length: materialData.length ? Number(materialData.length) : null,
        width: materialData.width ? Number(materialData.width) : null,
        thickness: materialData.thickness ? Number(materialData.thickness) : null,
        dimension_unit: materialData.dimension_unit || 'mm',
        density: materialData.density ? Number(materialData.density) : null,
        image_url: materialData.image_url || null,
        qr_code: qrData,
        qr_image_url: qrImageUrl,
        company_id: companyId, // Add company_id for multi-tenancy
        ai_carbon_confidence: materialData.ai_carbon_confidence || null,
        ai_carbon_source: materialData.ai_carbon_source || null,
        ai_carbon_updated_at: materialData.ai_carbon_updated_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Inserting material with complete data:', completeData);
      
      const { data: newMaterial, error: insertError } = await supabase
        .from('materials')
        .insert([completeData])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }
      
      console.log('Material created successfully:', newMaterial);
      
      const costText = materialData.cost_per_unit ? ` at $${materialData.cost_per_unit}/${materialData.unit}` : '';
      
      toast({
        title: "Success",
        description: `Material "${materialData.name}" (${materialData.quantity} ${materialData.unit}) added successfully${costText}`,
      });

      return newMaterial;
      
    } catch (error) {
      console.error('Error adding material:', error)
      toast({
        title: "Error",
        description: `Failed to add material: ${error.message}`,
        variant: "destructive"
      })
      return null
    }
  }

  const generateQRCodeForMaterial = async (materialId: string) => {
    try {
      const qrPackage = await generateCompleteQRPackage(materialId);
      
      const response = await fetch(qrPackage.qrCodeDataURL);
      const blob = await response.blob();
      
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
    try {
      const { data: currentMaterial } = await supabase
        .from('materials')
        .select('image_url')
        .eq('id', materialId)
        .single()

      const qrPackage = await generateCompleteQRPackage(materialId);
      
      const response = await fetch(qrPackage.qrCodeDataURL);
      const blob = await response.blob();
      const qrFile = new File([blob], `qr-${materialId}.png`, { type: 'image/png' });
      
      const uploadResult = await uploadFile(qrFile, 'material-images', 'qr-codes');
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      
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
    }
  }

  return {
    addMaterial,
    generateQRCodeForMaterial,
    regenerateQRCode
  }
}

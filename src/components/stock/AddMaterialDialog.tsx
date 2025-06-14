
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMaterials } from '@/hooks/useMaterials'
import { Material } from '@/lib/supabase'
import { MaterialImageUpload } from './MaterialImageUpload'
import { BasicInformationForm } from './forms/BasicInformationForm'
import { QuantityForm } from './forms/QuantityForm'
import { DimensionsForm } from './forms/DimensionsForm'
import { CarbonDataForm } from './forms/CarbonDataForm'
import { Loader2, Edit, QrCode } from 'lucide-react'

interface AddMaterialDialogProps {
  open: boolean
  onClose: () => void
  materialToEdit?: Material | null
}

export function AddMaterialDialog({ open, onClose, materialToEdit }: AddMaterialDialogProps) {
  const { addMaterial, updateMaterial } = useMaterials()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [aiCarbonData, setAiCarbonData] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specific_material: '',
    origin: '',
    quantity: 0,
    unit: '',
    unit_count: 1,
    carbon_factor: 0,
    carbon_footprint: 0,
    carbon_source: '',
    cost_per_unit: 0,
    description: '',
    dimensions: '',
    length: 0,
    width: 0,
    thickness: 0,
    dimension_unit: 'mm',
    density: 500,
    image_url: ''
  })

  const isEditing = !!materialToEdit

  // Populate form when editing
  useEffect(() => {
    if (materialToEdit) {
      setFormData({
        name: materialToEdit.name || '',
        type: materialToEdit.type || '',
        specific_material: materialToEdit.specific_material || '',
        origin: materialToEdit.origin || '',
        quantity: materialToEdit.quantity || 0,
        unit: materialToEdit.unit || '',
        unit_count: materialToEdit.unit_count || 1,
        carbon_factor: 0, // We'll calculate this from total/weight
        carbon_footprint: materialToEdit.carbon_footprint || 0,
        carbon_source: materialToEdit.carbon_source || '',
        cost_per_unit: materialToEdit.cost_per_unit || 0,
        description: materialToEdit.description || '',
        dimensions: materialToEdit.dimensions || '',
        length: materialToEdit.length || 0,
        width: materialToEdit.width || 0,
        thickness: materialToEdit.thickness || 0,
        dimension_unit: materialToEdit.dimension_unit || 'mm',
        density: materialToEdit.density || 500,
        image_url: materialToEdit.image_url || ''
      })
    }
  }, [materialToEdit])

  const calculateWeight = () => {
    if (formData.length && formData.width && formData.thickness && formData.density) {
      let volumeInM3 = 0
      switch (formData.dimension_unit) {
        case 'mm':
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000000
          break
        case 'cm':
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000
          break
        case 'm':
          volumeInM3 = formData.length * formData.width * formData.thickness
          break
        default:
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000000
      }
      
      const totalVolume = volumeInM3 * formData.unit_count
      return totalVolume * formData.density
    }
    return 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      specific_material: '',
      origin: '',
      quantity: 0,
      unit: '',
      unit_count: 1,
      carbon_factor: 0,
      carbon_footprint: 0,
      carbon_source: '',
      cost_per_unit: 0,
      description: '',
      dimensions: '',
      length: 0,
      width: 0,
      thickness: 0,
      dimension_unit: 'mm',
      density: 500,
      image_url: ''
    })
    setAiCarbonData(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.type || !formData.quantity || !formData.unit) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }

      let dimensionsString = formData.dimensions
      if (formData.length && formData.width && formData.thickness) {
        dimensionsString = `${formData.length}×${formData.width}×${formData.thickness}${formData.dimension_unit}`
      }

      const materialData = {
        name: formData.name,
        type: formData.type,
        specific_material: formData.specific_material || undefined,
        origin: formData.origin || undefined,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_count: formData.unit_count,
        carbon_footprint: formData.carbon_footprint,
        carbon_source: formData.carbon_source || undefined,
        cost_per_unit: formData.cost_per_unit,
        description: formData.description || undefined,
        dimensions: dimensionsString || undefined,
        length: formData.length || undefined,
        width: formData.width || undefined,
        thickness: formData.thickness || undefined,
        dimension_unit: formData.dimension_unit || undefined,
        density: formData.density,
        image_url: formData.image_url || undefined,
        ai_carbon_confidence: aiCarbonData?.confidence || undefined,
        ai_carbon_source: aiCarbonData?.source || undefined,
        ai_carbon_updated_at: aiCarbonData ? new Date().toISOString() : undefined
      }

      if (isEditing && materialToEdit) {
        await updateMaterial(materialToEdit.id, materialData)
        toast({
          title: "Success",
          description: "Material updated successfully!",
        })
      } else {
        await addMaterial(materialData)
        toast({
          title: "Success",
          description: "Material added successfully with QR code generated!",
        })
      }

      resetForm()
      onClose()
    } catch (error) {
      console.error("Error saving material:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} material.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleTypeSelected = (carbonFactor: number, density: number) => {
    setFormData(prev => ({ 
      ...prev, 
      carbon_factor: carbonFactor,
      density: density
    }))
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const calculatedWeight = calculateWeight()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
            {isEditing ? 'Edit Material' : 'Add New Material'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <MaterialImageUpload
            imageUrl={formData.image_url}
            onImageUpload={(url) => handleFormDataChange({ image_url: url })}
            onImageRemove={() => handleFormDataChange({ image_url: '' })}
          />

          <BasicInformationForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onTypeSelected={handleTypeSelected}
          />

          <QuantityForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

          <DimensionsForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            calculatedWeight={calculatedWeight}
          />

          <CarbonDataForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            calculatedWeight={calculatedWeight}
            onAiDataReceived={setAiCarbonData}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit className="h-4 w-4 mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Update Material' : 'Add Material'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

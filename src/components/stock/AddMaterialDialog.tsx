
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMaterialsOperations } from '@/hooks/useMaterialsOperations'
import { BasicInformationForm } from './forms/BasicInformationForm'
import { QuantityForm } from './forms/QuantityForm'
import { DimensionsForm } from './forms/DimensionsForm'
import { CarbonDataForm } from './forms/CarbonDataForm'

interface MaterialFormData {
  name: string
  type: string
  specific_material: string
  origin: string
  quantity: number
  unit: string
  unit_count: number
  carbon_footprint: number
  carbon_factor: number
  carbon_source: string
  cost_per_unit: number
  description: string
  image_url: string
  length: number | null
  width: number | null
  thickness: number | null
  dimension_unit: string
  dimensions: string
  density: number | null
  ai_carbon_confidence: number | null
  ai_carbon_source: string
  ai_carbon_updated_at: string
}

const initialFormData: MaterialFormData = {
  name: '',
  type: '',
  specific_material: '',
  origin: '',
  quantity: 0,
  unit: 'pieces',
  unit_count: 1,
  carbon_footprint: 0,
  carbon_factor: 0,
  carbon_source: 'estimated',
  cost_per_unit: 0,
  description: '',
  image_url: '',
  length: null,
  width: null,
  thickness: null,
  dimension_unit: 'mm',
  dimensions: '',
  density: null,
  ai_carbon_confidence: null,
  ai_carbon_source: '',
  ai_carbon_updated_at: ''
}

interface AddMaterialDialogProps {
  open?: boolean
  onClose?: () => void
  materialToEdit?: any
}

export function AddMaterialDialog({ open, onClose, materialToEdit }: AddMaterialDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData)
  const { addMaterial, loading } = useMaterialsOperations()

  const isOpen = open !== undefined ? open : internalOpen
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose) {
      if (!newOpen) onClose()
    } else {
      setInternalOpen(newOpen)
    }
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFormChange = (updates: Partial<MaterialFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    try {
      // Generate a basic QR code string for the material
      const qrCode = `material:${Date.now()}`
      
      const materialData = {
        ...formData,
        qr_code: qrCode // Include the required qr_code field
      }
      
      const result = await addMaterial(materialData)
      if (result) {
        handleOpenChange(false)
        setCurrentStep(1)
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error submitting material:', error)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.type.trim()
      case 2:
        return formData.quantity > 0 && formData.unit.trim()
      case 3:
        return true // Dimensions are optional
      case 4:
        return true // Carbon data has defaults
      default:
        return false
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
  }

  const calculateWeight = () => {
    if (formData.length && formData.width && formData.thickness && formData.density) {
      // Convert dimensions to meters based on unit
      let lengthM = formData.length
      let widthM = formData.width
      let thicknessM = formData.thickness

      switch (formData.dimension_unit) {
        case 'mm':
          lengthM = formData.length / 1000
          widthM = formData.width / 1000
          thicknessM = formData.thickness / 1000
          break
        case 'cm':
          lengthM = formData.length / 100
          widthM = formData.width / 100
          thicknessM = formData.thickness / 100
          break
        case 'in':
          lengthM = formData.length * 0.0254
          widthM = formData.width * 0.0254
          thicknessM = formData.thickness * 0.0254
          break
        case 'ft':
          lengthM = formData.length * 0.3048
          widthM = formData.width * 0.3048
          thicknessM = formData.thickness * 0.3048
          break
      }

      const volumeM3 = lengthM * widthM * thicknessM * formData.unit_count
      return volumeM3 * formData.density
    }
    return 0
  }

  const handleTypeSelected = (carbonFactor: number, density: number) => {
    setFormData(prev => ({
      ...prev,
      carbon_factor: carbonFactor,
      density: density
    }))
  }

  const handleAiDataReceived = (data: any) => {
    // Handle AI carbon data
    console.log('AI data received:', data)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationForm
            formData={formData}
            onFormDataChange={handleFormChange}
            onTypeSelected={handleTypeSelected}
          />
        )
      case 2:
        return (
          <QuantityForm
            formData={formData}
            onFormDataChange={handleFormChange}
          />
        )
      case 3:
        return (
          <DimensionsForm
            formData={formData}
            onFormDataChange={handleFormChange}
            calculatedWeight={calculateWeight()}
          />
        )
      case 4:
        return (
          <CarbonDataForm
            formData={formData}
            onFormDataChange={handleFormChange}
            calculatedWeight={calculateWeight()}
            onAiDataReceived={handleAiDataReceived}
          />
        )
      default:
        return null
    }
  }

  const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
    if (open !== undefined) {
      // Controlled mode
      return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {children}
          </DialogContent>
        </Dialog>
      )
    }

    // Uncontrolled mode with trigger
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button onClick={resetForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DialogWrapper>
      <DialogHeader>
        <DialogTitle>Add New Material - Step {currentStep} of 4</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : step < currentStep
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Form content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
              >
                {loading ? 'Adding...' : 'Add Material'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DialogWrapper>
  )
}

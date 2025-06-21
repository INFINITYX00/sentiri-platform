
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
  carbon_source: string
  cost_per_unit: number
  description: string
  image_url: string
  length: number | null
  width: number | null
  thickness: number | null
  dimension_unit: string
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
  carbon_source: 'estimated',
  cost_per_unit: 0,
  description: '',
  image_url: '',
  length: null,
  width: null,
  thickness: null,
  dimension_unit: 'mm',
  density: null,
  ai_carbon_confidence: null,
  ai_carbon_source: '',
  ai_carbon_updated_at: ''
}

export function AddMaterialDialog() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData)
  const { addMaterial, loading } = useMaterialsOperations()

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
        setOpen(false)
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformationForm
            formData={formData}
            onChange={handleFormChange}
          />
        )
      case 2:
        return (
          <QuantityForm
            formData={formData}
            onChange={handleFormChange}
          />
        )
      case 3:
        return (
          <DimensionsForm
            formData={formData}
            onChange={handleFormChange}
          />
        )
      case 4:
        return (
          <CarbonDataForm
            formData={formData}
            onChange={handleFormChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      </DialogContent>
    </Dialog>
  )
}

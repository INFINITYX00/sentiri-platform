
import React, { useState } from 'react'
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMaterialsOperations } from '@/hooks/useMaterialsOperations'
import { DialogWrapper } from './components/DialogWrapper'
import { ProgressIndicator } from './components/ProgressIndicator'
import { NavigationButtons } from './components/NavigationButtons'
import { FormStepRenderer } from './components/FormStepRenderer'
import { useMaterialForm } from './hooks/useMaterialForm'

interface AddMaterialDialogProps {
  open?: boolean
  onClose?: () => void
  materialToEdit?: any
}

export function AddMaterialDialog({ open, onClose, materialToEdit }: AddMaterialDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { addMaterial, loading } = useMaterialsOperations()
  
  const {
    currentStep,
    formData,
    handleNext,
    handlePrevious,
    handleFormChange,
    resetForm,
    canProceed,
    calculateWeight
  } = useMaterialForm()

  // Explicit boolean conversion to fix TypeScript error
  const isControlled = open !== undefined
  const dialogOpen: boolean = isControlled ? (open === true) : internalOpen
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && onClose) {
      if (!newOpen) onClose()
    } else {
      setInternalOpen(newOpen)
    }
  }

  const handleSubmit = async () => {
    try {
      const qrCode = `material:${Date.now()}`
      
      const materialData = {
        ...formData,
        qr_code: qrCode
      }
      
      const result = await addMaterial(materialData)
      if (result) {
        handleOpenChange(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error submitting material:', error)
    }
  }

  const handleTypeSelected = (carbonFactor: number, density: number) => {
    handleFormChange({
      carbon_factor: carbonFactor,
      density: density
    })
  }

  const handleAiDataReceived = (data: any) => {
    console.log('AI data received:', data)
  }

  return (
    <DialogWrapper 
      open={dialogOpen}
      onOpenChange={handleOpenChange} 
      resetForm={resetForm}
    >
      <DialogHeader>
        <DialogTitle>Add New Material - Step {currentStep} of 4</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        <FormStepRenderer
          currentStep={currentStep}
          formData={formData}
          onFormDataChange={handleFormChange}
          calculatedWeight={calculateWeight()}
          onTypeSelected={handleTypeSelected}
          onAiDataReceived={handleAiDataReceived}
        />

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={4}
          canProceed={canProceed() as boolean}
          loading={loading}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </div>
    </DialogWrapper>
  )
}


import { useState } from 'react'
import { MaterialFormData, initialFormData } from '../types/MaterialFormData'

export function useMaterialForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData)

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleFormChange = (updates: Partial<MaterialFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
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

  return {
    currentStep,
    formData,
    handleNext,
    handlePrevious,
    handleFormChange,
    resetForm,
    canProceed,
    calculateWeight
  }
}

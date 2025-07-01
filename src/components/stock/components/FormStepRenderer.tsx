
import React from 'react'
import { BasicInformationForm } from '../forms/BasicInformationForm'
import { QuantityForm } from '../forms/QuantityForm'
import { DimensionsForm } from '../forms/DimensionsForm'
import { CarbonDataForm } from '../forms/CarbonDataForm'
import { MaterialFormData } from '../types/MaterialFormData'

interface FormStepRendererProps {
  currentStep: number
  formData: MaterialFormData
  onFormDataChange: (updates: Partial<MaterialFormData>) => void
  calculatedWeight: number
  onTypeSelected: (carbonFactor: number, density: number) => void
  onAiDataReceived: (data: any) => void
}

export function FormStepRenderer({
  currentStep,
  formData,
  onFormDataChange,
  calculatedWeight,
  onTypeSelected,
  onAiDataReceived
}: FormStepRendererProps) {
  switch (currentStep) {
    case 1:
      return (
        <BasicInformationForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          onTypeSelected={onTypeSelected}
        />
      )
    case 2:
      return (
        <QuantityForm
          formData={formData}
          onFormDataChange={onFormDataChange}
        />
      )
    case 3:
      return (
        <DimensionsForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          calculatedWeight={calculatedWeight}
        />
      )
    case 4:
      return (
        <CarbonDataForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          calculatedWeight={calculatedWeight}
          onAiDataReceived={onAiDataReceived}
        />
      )
    default:
      return null
  }
}

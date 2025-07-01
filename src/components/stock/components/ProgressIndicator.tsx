
import React from 'react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex justify-between items-center">
      {Array.from({ length: totalSteps }, (_, index) => index + 1).map((step) => (
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
  )
}

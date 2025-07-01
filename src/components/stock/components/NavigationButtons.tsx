
import React from 'react'
import { Button } from "@/components/ui/button"

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canProceed: boolean
  loading: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  loading,
  onPrevious,
  onNext,
  onSubmit
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            disabled={!canProceed}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={loading || !canProceed}
          >
            {loading ? 'Adding...' : 'Add Material'}
          </Button>
        )}
      </div>
    </div>
  )
}

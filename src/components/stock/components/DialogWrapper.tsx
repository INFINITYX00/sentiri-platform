
import React from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface DialogWrapperProps {
  open?: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  resetForm: () => void
}

export function DialogWrapper({ open, onOpenChange, children, resetForm }: DialogWrapperProps) {
  if (open !== undefined) {
    // Controlled mode
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  // Uncontrolled mode with trigger
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

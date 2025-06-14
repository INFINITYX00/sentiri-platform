
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Plus, Merge } from "lucide-react"
import { DuplicateMaterial } from "@/hooks/useDuplicateDetection"

interface DuplicateResolutionDialogProps {
  open: boolean
  onClose: () => void
  duplicates: DuplicateMaterial[]
  newMaterialName: string
  onMerge: (existingMaterial: DuplicateMaterial) => void
  onCreateSeparate: () => void
}

export function DuplicateResolutionDialog({
  open,
  onClose,
  duplicates,
  newMaterialName,
  onMerge,
  onCreateSeparate
}: DuplicateResolutionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Potential Duplicate Materials Found
          </DialogTitle>
          <DialogDescription>
            We found similar materials that might be the same as "{newMaterialName}". 
            Would you like to merge quantities or create a separate material?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Similar Materials Found:</h3>
            
            {duplicates.map((duplicate) => (
              <Card key={duplicate.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{duplicate.name}</h4>
                        <Badge variant="secondary">
                          {duplicate.similarity}% match
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Type:</span> {duplicate.type}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {duplicate.quantity} {duplicate.unit}
                        </div>
                        {duplicate.specific_material && (
                          <div>
                            <span className="font-medium">Material:</span> {duplicate.specific_material}
                          </div>
                        )}
                        {duplicate.origin && (
                          <div>
                            <span className="font-medium">Origin:</span> {duplicate.origin}
                          </div>
                        )}
                      </div>
                      
                      {duplicate.cost_per_unit && (
                        <div className="text-sm">
                          <span className="font-medium">Cost:</span> ${duplicate.cost_per_unit.toFixed(2)} per {duplicate.unit}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMerge(duplicate)}
                      className="ml-4"
                    >
                      <Merge className="h-4 w-4 mr-1" />
                      Merge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onCreateSeparate}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Separate Material
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

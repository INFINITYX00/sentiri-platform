import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMaterials } from '@/hooks/useMaterials'

interface AddMaterialDialogProps {
  open: boolean
  onClose: () => void
}

export function AddMaterialDialog({ open, onClose }: AddMaterialDialogProps) {
  const { addMaterial } = useMaterials()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: 0,
    unit: '',
    carbon_footprint: 0,
    unit_count: 1,
    display_unit: 'units',
    cost_per_unit: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.type || !formData.quantity || !formData.unit || !formData.carbon_footprint) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive"
        })
        return
      }

      await addMaterial({
        name: formData.name,
        type: formData.type,
        quantity: formData.quantity,
        unit: formData.unit,
        carbon_footprint: formData.carbon_footprint,
        unit_count: formData.unit_count,
        display_unit: formData.display_unit,
        cost_per_unit: formData.cost_per_unit
      })

      toast({
        title: "Success",
        description: "Material added successfully.",
      })
      onClose()
    } catch (error) {
      console.error("Error adding material:", error)
      toast({
        title: "Error",
        description: "Failed to add material.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
              placeholder="Material Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="col-span-3"
              placeholder="Material Type"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              className="col-span-3"
              placeholder="Quantity"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              className="col-span-3"
              placeholder="Unit"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carbon_footprint" className="text-right">
              Carbon Footprint
            </Label>
            <Input
              id="carbon_footprint"
              type="number"
              value={formData.carbon_footprint}
              onChange={(e) => setFormData(prev => ({ ...prev, carbon_footprint: parseFloat(e.target.value) || 0 }))}
              className="col-span-3"
              placeholder="Carbon Footprint"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_count">Quantity/Units</Label>
              <Input
                id="unit_count"
                type="number"
                min="1"
                value={formData.unit_count || 1}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  unit_count: parseInt(e.target.value) || 1 
                }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="display_unit">Unit Type</Label>
              <Select 
                value={formData.display_unit || 'units'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, display_unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="boards">Boards</SelectItem>
                  <SelectItem value="sheets">Sheets</SelectItem>
                  <SelectItem value="rolls">Rolls</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
            <Input
              id="cost_per_unit"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost_per_unit || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                cost_per_unit: parseFloat(e.target.value) || 0 
              }))}
              placeholder="10.00"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Material"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuantityFormProps {
  formData: {
    quantity: number
    unit: string
    unit_count: number
    cost_per_unit: number
  }
  onFormDataChange: (updates: Partial<any>) => void
}

const units = [
  'kg', 'g', 'tons', 'm', 'cm', 'mm', 'm²', 'cm²', 
  'mm²', 'm³', 'cm³', 'mm³', 'pieces', 'boards', 
  'sheets', 'rolls', 'units'
]

export function QuantityForm({ formData, onFormDataChange }: QuantityFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Quantity & Cost</h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => onFormDataChange({ quantity: parseFloat(e.target.value) || 0 })}
            placeholder="100"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="unit">Unit *</Label>
          <Select value={formData.unit} onValueChange={(value) => onFormDataChange({ unit: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="unit_count">Unit Count</Label>
          <Input
            id="unit_count"
            type="number"
            min="1"
            value={formData.unit_count}
            onChange={(e) => onFormDataChange({ unit_count: parseInt(e.target.value) || 1 })}
            placeholder="1"
          />
        </div>
        
        <div>
          <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
          <Input
            id="cost_per_unit"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_per_unit}
            onChange={(e) => onFormDataChange({ cost_per_unit: parseFloat(e.target.value) || 0 })}
            placeholder="10.00"
          />
        </div>
      </div>
    </div>
  )
}

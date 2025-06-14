
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DimensionsFormProps {
  formData: {
    length: number
    width: number
    thickness: number
    dimension_unit: string
    density: number
    dimensions: string
  }
  onFormDataChange: (updates: Partial<any>) => void
  calculatedWeight: number
}

export function DimensionsForm({ formData, onFormDataChange, calculatedWeight }: DimensionsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Dimensions (Optional)</h3>
      
      <div className="grid grid-cols-5 gap-4">
        <div>
          <Label htmlFor="length">Length</Label>
          <Input
            id="length"
            type="number"
            step="0.01"
            value={formData.length}
            onChange={(e) => onFormDataChange({ length: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div>
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            step="0.01"
            value={formData.width}
            onChange={(e) => onFormDataChange({ width: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div>
          <Label htmlFor="thickness">Thickness</Label>
          <Input
            id="thickness"
            type="number"
            step="0.01"
            value={formData.thickness}
            onChange={(e) => onFormDataChange({ thickness: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div>
          <Label htmlFor="dimension_unit">Unit</Label>
          <Select 
            value={formData.dimension_unit} 
            onValueChange={(value) => onFormDataChange({ dimension_unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">mm</SelectItem>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="m">m</SelectItem>
              <SelectItem value="in">inches</SelectItem>
              <SelectItem value="ft">feet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="density">Density (kg/m³)</Label>
          <Input
            id="density"
            type="number"
            value={formData.density}
            onChange={(e) => onFormDataChange({ density: parseFloat(e.target.value) || 500 })}
            placeholder="500"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dimensions">Or Custom Dimensions</Label>
        <Input
          id="dimensions"
          value={formData.dimensions}
          onChange={(e) => onFormDataChange({ dimensions: e.target.value })}
          placeholder="e.g., 2400×1200×18mm"
        />
      </div>

      {calculatedWeight > 0 && (
        <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
          Estimated weight: <span className="font-medium">{calculatedWeight.toFixed(2)}kg</span>
        </div>
      )}
    </div>
  )
}

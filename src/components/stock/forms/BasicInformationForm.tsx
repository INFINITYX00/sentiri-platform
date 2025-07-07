
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MaterialTypeManager } from "../MaterialTypeManager"
import { MaterialImageUpload } from "../MaterialImageUpload"

interface BasicInformationFormProps {
  formData: {
    name: string
    origin: string
    type: string
    specific_material: string
    description: string
    image_url: string
  }
  onFormDataChange: (updates: Partial<any>) => void
  onTypeSelected: (carbonFactor: number, density: number) => void
}

export function BasicInformationForm({
  formData,
  onFormDataChange,
  onTypeSelected
}: BasicInformationFormProps) {
  const handleImageUpload = (url: string) => {
    onFormDataChange({ image_url: url })
  }

  const handleImageRemove = () => {
    onFormDataChange({ image_url: '' })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ name: e.target.value })}
            placeholder="e.g., Oak Wood Board"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="origin">Origin/Source</Label>
          <Input
            id="origin"
            value={formData.origin}
            onChange={(e) => onFormDataChange({ origin: e.target.value })}
            placeholder="e.g., Local Forest, China"
          />
        </div>
      </div>

      <MaterialTypeManager
        selectedCategory={formData.type}
        selectedSpecificType={formData.specific_material}
        onCategoryChange={(category) => onFormDataChange({ type: category })}
        onSpecificTypeChange={(specificType) => onFormDataChange({ specific_material: specificType })}
        onTypeSelected={onTypeSelected}
      />

      <MaterialImageUpload
        imageUrl={formData.image_url}
        onImageUpload={handleImageUpload}
        onImageRemove={handleImageRemove}
      />

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Additional details about this material..."
          rows={2}
        />
      </div>
    </div>
  )
}

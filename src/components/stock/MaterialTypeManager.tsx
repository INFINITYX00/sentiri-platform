
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMaterialTypes } from '@/hooks/useMaterialTypes'
import { Plus, Trash2, Loader2 } from 'lucide-react'

interface MaterialTypeManagerProps {
  selectedCategory: string
  selectedSpecificType: string
  onCategoryChange: (category: string) => void
  onSpecificTypeChange: (specificType: string) => void
  onTypeSelected: (carbonFactor: number, density: number) => void
}

export function MaterialTypeManager({ 
  selectedCategory, 
  selectedSpecificType, 
  onCategoryChange, 
  onSpecificTypeChange,
  onTypeSelected 
}: MaterialTypeManagerProps) {
  const { materialTypes, loading, addMaterialType, deleteMaterialType, addCategory } = useMaterialTypes()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newSpecificType, setNewSpecificType] = useState('')
  const [newDensity, setNewDensity] = useState(500)
  const [newCarbonFactor, setNewCarbonFactor] = useState(2.0)

  const categories = [...new Set(materialTypes.map(mt => mt.category))].sort()
  const specificTypes = materialTypes.filter(mt => mt.category === selectedCategory)

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category)
    // Auto-select first specific type if available
    const typesInCategory = materialTypes.filter(mt => mt.category === category)
    if (typesInCategory.length > 0) {
      const firstType = typesInCategory[0]
      onSpecificTypeChange(firstType.specific_type)
      onTypeSelected(firstType.carbon_factor || 2.0, firstType.density || 500)
    }
  }

  const handleSpecificTypeChange = (specificType: string) => {
    onSpecificTypeChange(specificType)
    const type = materialTypes.find(mt => mt.specific_type === specificType)
    if (type) {
      onTypeSelected(type.carbon_factor || 2.0, type.density || 500)
    }
  }

  const handleAddMaterialType = async () => {
    if (!newCategory || !newSpecificType) return

    const result = await addMaterialType({
      category: newCategory,
      specific_type: newSpecificType,
      density: newDensity,
      carbon_factor: newCarbonFactor
    })

    if (result) {
      setShowAddDialog(false)
      setNewCategory('')
      setNewSpecificType('')
      setNewDensity(500)
      setNewCarbonFactor(2.0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="category">Material Category *</Label>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Material Type</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g., wood, metal, plastic"
                    />
                  </div>
                  <div>
                    <Label>Specific Type</Label>
                    <Input
                      value={newSpecificType}
                      onChange={(e) => setNewSpecificType(e.target.value)}
                      placeholder="e.g., Oak, Steel Grade 304"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Density (kg/m³)</Label>
                      <Input
                        type="number"
                        value={newDensity}
                        onChange={(e) => setNewDensity(parseFloat(e.target.value) || 500)}
                      />
                    </div>
                    <div>
                      <Label>Carbon Factor (kg CO₂e)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newCarbonFactor}
                        onChange={(e) => setNewCarbonFactor(parseFloat(e.target.value) || 2.0)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddMaterialType} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Material Type
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="specific_type">Specific Material</Label>
          <Select value={selectedSpecificType} onValueChange={handleSpecificTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select specific type" />
            </SelectTrigger>
            <SelectContent>
              {specificTypes.map(type => (
                <SelectItem key={type.id} value={type.specific_type}>
                  <div className="flex items-center justify-between w-full">
                    <span>{type.specific_type}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMaterialType(type.id)
                      }}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMaterialTypes } from '@/hooks/useMaterialTypes'
import { useAICarbonLookup } from '@/hooks/useAICarbonLookup'
import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react'

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
  const { materialTypes, loading, addMaterialType, deleteMaterialType } = useMaterialTypes()
  const { lookupCarbonData, loading: aiLoading } = useAICarbonLookup()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newSpecificType, setNewSpecificType] = useState('')
  const [newDensity, setNewDensity] = useState(500)
  const [newCarbonFactor, setNewCarbonFactor] = useState(2.0)
  const [useAILookup, setUseAILookup] = useState(false)

  console.log('MaterialTypeManager props:', { selectedCategory, selectedSpecificType })
  console.log('Available material types:', materialTypes)

  const categories = [...new Set(materialTypes.map(mt => mt.category))].sort()
  const specificTypes = materialTypes.filter(mt => mt.category === selectedCategory)

  console.log('Categories:', categories)
  console.log('Specific types for category:', selectedCategory, specificTypes)

  const handleCategoryChange = (category: string) => {
    console.log('Category changed to:', category)
    onCategoryChange(category)
    // Auto-select first specific type if available
    const typesInCategory = materialTypes.filter(mt => mt.category === category)
    if (typesInCategory.length > 0) {
      const firstType = typesInCategory[0]
      console.log('Auto-selecting first type:', firstType.specific_type)
      onSpecificTypeChange(firstType.specific_type)
      onTypeSelected(firstType.carbon_factor || 2.0, firstType.density || 500)
    } else {
      // Clear specific type if no types available for this category
      onSpecificTypeChange('')
    }
  }

  const handleSpecificTypeChange = (specificType: string) => {
    console.log('Specific type changed to:', specificType)
    onSpecificTypeChange(specificType)
    const type = materialTypes.find(mt => mt.specific_type === specificType)
    if (type) {
      console.log('Found type data:', type)
      onTypeSelected(type.carbon_factor || 2.0, type.density || 500)
    }
  }

  const handleAILookup = async () => {
    if (!newCategory || !newSpecificType) return

    try {
      const aiData = await lookupCarbonData(newCategory, newSpecificType)
      if (aiData) {
        setNewCarbonFactor(aiData.carbonFactor)
        setNewDensity(aiData.density)
      }
    } catch (error) {
      console.error('AI lookup failed:', error)
    }
  }

  const handleAddMaterialType = async () => {
    if (!newCategory || !newSpecificType) return

    const result = await addMaterialType({
      category: newCategory,
      specific_type: newSpecificType,
      density: newDensity,
      carbon_factor: newCarbonFactor,
      ai_sourced: useAILookup,
      confidence_score: useAILookup ? 0.8 : null,
      data_source: useAILookup ? 'AI lookup' : 'Manual entry'
    })

    if (result) {
      setShowAddDialog(false)
      setNewCategory('')
      setNewSpecificType('')
      setNewDensity(500)
      setNewCarbonFactor(2.0)
      setUseAILookup(false)
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

                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleAILookup}
                      disabled={aiLoading || !newCategory || !newSpecificType}
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      AI Lookup
                    </Button>
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
          <Select value={selectedCategory || ""} onValueChange={handleCategoryChange}>
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
          <Select value={selectedSpecificType || ""} onValueChange={handleSpecificTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select specific type" />
            </SelectTrigger>
            <SelectContent>
              {specificTypes.map(type => (
                <SelectItem key={type.id} value={type.specific_type}>
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      {type.specific_type}
                      {type.ai_sourced && (
                        <Sparkles className="h-3 w-3 text-purple-500" />
                      )}
                    </span>
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


import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMaterialTypes } from '@/hooks/useMaterialTypes'
import { useAICarbonLookup } from '@/hooks/useAICarbonLookup'
import { Plus, Trash2, Loader2, Sparkles, PlusCircle, FolderPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const { materialTypes, loading, addMaterialType, deleteMaterialType, deleteCategory } = useMaterialTypes()
  const { lookupCarbonData, loading: aiLoading } = useAICarbonLookup()
  const { toast } = useToast()
  
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addMode, setAddMode] = useState<'category' | 'specific'>('category')
  const [newCategory, setNewCategory] = useState('')
  const [newSpecificType, setNewSpecificType] = useState('')
  const [newDensity, setNewDensity] = useState(500)
  const [newCarbonFactor, setNewCarbonFactor] = useState(2.0)

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
      const aiData = await lookupCarbonData({
        materialType: newCategory,
        specificMaterial: newSpecificType,
        quantity: 1,
        unit: 'kg',
        unitCount: 1,
        weight: 1
      })
      
      if (aiData) {
        setNewCarbonFactor(aiData.carbonFactor)
        setNewDensity(aiData.density)
      }
    } catch (error) {
      console.error('AI lookup failed:', error)
    }
  }

  const handleAddMaterialType = async () => {
    if (addMode === 'category' && !newCategory) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      })
      return
    }
    
    if (addMode === 'specific' && (!selectedCategory || !newSpecificType)) {
      toast({
        title: "Error", 
        description: "Please select a category and enter a specific material name",
        variant: "destructive"
      })
      return
    }

    const categoryToUse = addMode === 'category' ? newCategory : selectedCategory
    const specificTypeToUse = addMode === 'category' ? `Default ${newCategory}` : newSpecificType

    const result = await addMaterialType({
      category: categoryToUse,
      specific_type: specificTypeToUse,
      density: newDensity,
      carbon_factor: newCarbonFactor,
      ai_sourced: false,
      confidence_score: null,
      data_source: 'Manual entry'
    })

    if (result) {
      setShowAddDialog(false)
      setNewCategory('')
      setNewSpecificType('')
      setNewDensity(500)
      setNewCarbonFactor(2.0)
      setAddMode('category')
      
      // Auto-select the new category/type
      if (addMode === 'category') {
        onCategoryChange(categoryToUse)
        onSpecificTypeChange(specificTypeToUse)
        onTypeSelected(newCarbonFactor, newDensity)
      } else {
        onSpecificTypeChange(specificTypeToUse)
        onTypeSelected(newCarbonFactor, newDensity)
      }
    }
  }

  const handleDeleteCategory = async (category: string) => {
    const typesInCategory = materialTypes.filter(mt => mt.category === category)
    if (typesInCategory.length > 1) {
      toast({
        title: "Cannot Delete Category",
        description: `Category "${category}" contains ${typesInCategory.length} material types. Delete the individual types first.`,
        variant: "destructive"
      })
      return
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete the category "${category}" and all its material types?`)
    if (confirmed) {
      const success = await deleteCategory(category)
      if (success && selectedCategory === category) {
        onCategoryChange('')
        onSpecificTypeChange('')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="category">Material Category *</Label>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={addMode === 'category' ? 'default' : 'outline'}
                      onClick={() => setAddMode('category')}
                      className="flex items-center gap-2"
                    >
                      <FolderPlus className="h-4 w-4" />
                      New Category
                    </Button>
                    <Button
                      type="button"
                      variant={addMode === 'specific' ? 'default' : 'outline'}
                      onClick={() => setAddMode('specific')}
                      className="flex items-center gap-2"
                      disabled={!selectedCategory}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add to {selectedCategory || 'Category'}
                    </Button>
                  </div>

                  {addMode === 'category' ? (
                    <div>
                      <Label>New Category Name</Label>
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g., wood, metal, plastic"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label>Specific Material (in {selectedCategory})</Label>
                      <Input
                        value={newSpecificType}
                        onChange={(e) => setNewSpecificType(e.target.value)}
                        placeholder="e.g., Oak, Steel Grade 304"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleAILookup}
                      disabled={aiLoading || (addMode === 'category' ? !newCategory : !newSpecificType)}
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
                      <Label>Carbon Factor (kg CO₂e/kg)</Label>
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
                    Add {addMode === 'category' ? 'Category' : 'Material Type'}
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
                  <div className="flex items-center justify-between w-full">
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCategory(category)
                      }}
                      className="ml-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="specific_type" className="mb-2 block">Specific Material</Label>
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
                      className="ml-2 h-6 w-6 p-0 opacity-50 hover:opacity-100"
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

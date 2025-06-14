
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMaterialTypes } from '@/hooks/useMaterialTypes'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Database, Sparkles, Loader2 } from 'lucide-react'

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
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newSpecificType, setNewSpecificType] = useState('')
  const [newCarbonFactor, setNewCarbonFactor] = useState<number>(2.0)
  const [newDensity, setNewDensity] = useState<number>(500)
  const [isAddingToExisting, setIsAddingToExisting] = useState(false)
  const [targetCategory, setTargetCategory] = useState('')

  // Get unique categories
  const categories = Array.from(new Set(materialTypes.map(type => type.category)))
  
  // Get specific types for selected category
  const specificTypes = materialTypes
    .filter(type => type.category === selectedCategory)
    .sort((a, b) => a.specific_type.localeCompare(b.specific_type))

  // Get selected material type data
  const selectedMaterialType = materialTypes.find(
    type => type.category === selectedCategory && type.specific_type === selectedSpecificType
  )

  useEffect(() => {
    if (selectedMaterialType) {
      onTypeSelected(selectedMaterialType.carbon_factor || 2.0, selectedMaterialType.density || 500)
    }
  }, [selectedMaterialType, onTypeSelected])

  const handleAddMaterialType = async () => {
    try {
      const category = isAddingToExisting ? targetCategory : newCategory
      const specificType = newSpecificType

      if (!category || !specificType) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Check for duplicates
      const exists = materialTypes.some(
        type => type.category === category && type.specific_type === specificType
      )

      if (exists) {
        toast({
          title: "Already Exists",
          description: "This material type already exists",
          variant: "destructive"
        })
        return
      }

      await addMaterialType({
        category,
        specific_type: specificType,
        carbon_factor: newCarbonFactor,
        density: newDensity,
        data_source: 'Manual Entry'
      })

      // Reset form
      setNewCategory('')
      setNewSpecificType('')
      setNewCarbonFactor(2.0)
      setNewDensity(500)
      setIsAddingToExisting(false)
      setTargetCategory('')
      setDialogOpen(false)

      toast({
        title: "Success",
        description: `Material type "${specificType}" added to "${category}"`,
      })
    } catch (error) {
      console.error('Error adding material type:', error)
      toast({
        title: "Error",
        description: "Failed to add material type",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMaterialType = async (id: string, category: string, specificType: string) => {
    try {
      await deleteMaterialType(id)
      toast({
        title: "Success",
        description: `"${specificType}" removed from "${category}"`,
      })
    } catch (error) {
      console.error('Error deleting material type:', error)
      toast({
        title: "Error",
        description: "Failed to delete material type",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCategory = async (category: string) => {
    try {
      const typesToDelete = materialTypes.filter(type => type.category === category)
      
      if (typesToDelete.length === 0) {
        toast({
          title: "Nothing to Delete",
          description: "This category has no materials to remove",
          variant: "destructive"
        })
        return
      }

      // Delete all types in this category
      await Promise.all(
        typesToDelete.map(type => deleteMaterialType(type.id))
      )

      // Clear selection if it was in the deleted category
      if (selectedCategory === category) {
        onCategoryChange('')
        onSpecificTypeChange('')
      }

      toast({
        title: "Success",
        description: `Category "${category}" and all its materials deleted`,
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Selection with Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="category">Material Category *</Label>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0 bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <Plus className="h-4 w-4 text-green-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Material Type</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="new-category"
                      name="add-type"
                      checked={!isAddingToExisting}
                      onChange={() => setIsAddingToExisting(false)}
                    />
                    <Label htmlFor="new-category">Create New Category</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="existing-category"
                      name="add-type"
                      checked={isAddingToExisting}
                      onChange={() => setIsAddingToExisting(true)}
                    />
                    <Label htmlFor="existing-category">Add to Existing Category</Label>
                  </div>

                  {!isAddingToExisting ? (
                    <div>
                      <Label htmlFor="new-category-name">New Category Name</Label>
                      <Input
                        id="new-category-name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g., Wood, Metal, Plastic"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="target-category">Select Category</Label>
                      <Select value={targetCategory} onValueChange={setTargetCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose existing category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="new-specific-type">Specific Material</Label>
                    <Input
                      id="new-specific-type"
                      value={newSpecificType}
                      onChange={(e) => setNewSpecificType(e.target.value)}
                      placeholder="e.g., Oak, Pine, Aluminum"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-carbon-factor">Carbon Factor (kg CO₂/kg)</Label>
                      <Input
                        id="new-carbon-factor"
                        type="number"
                        step="0.01"
                        value={newCarbonFactor}
                        onChange={(e) => setNewCarbonFactor(parseFloat(e.target.value) || 2.0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-density">Density (kg/m³)</Label>
                      <Input
                        id="new-density"
                        type="number"
                        value={newDensity}
                        onChange={(e) => setNewDensity(parseFloat(e.target.value) || 500)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddMaterialType}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Material Type'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select material category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                <div className="flex items-center justify-between w-full">
                  <span>{category}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Specific Material Selection */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="specific-material">Specific Material</Label>
          <Select value={selectedSpecificType} onValueChange={onSpecificTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select specific material" />
            </SelectTrigger>
            <SelectContent>
              {specificTypes.map(type => (
                <SelectItem key={type.id} value={type.specific_type}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{type.specific_type}</span>
                      {type.ai_sourced && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <Sparkles className="h-2 w-2 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMaterialType(type.id, type.category, type.specific_type)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Material Type Details */}
      {selectedMaterialType && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Material Information</span>
                <div className="flex items-center gap-2">
                  {selectedMaterialType.ai_sourced && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                  {selectedMaterialType.data_source && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <Database className="h-3 w-3 mr-1" />
                      {selectedMaterialType.data_source}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Carbon Factor:</span>
                  <div className="font-semibold">{selectedMaterialType.carbon_factor?.toFixed(2)} kg CO₂/kg</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Density:</span>
                  <div className="font-semibold">{selectedMaterialType.density} kg/m³</div>
                </div>
              </div>

              {selectedMaterialType.confidence_score && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Confidence: </span>
                  <span className="font-semibold">{Math.round(selectedMaterialType.confidence_score * 100)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4" /> {/* Extra spacing below */}
    </div>
  )
}

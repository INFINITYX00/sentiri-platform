import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useMaterials } from '@/hooks/useMaterials'
import { useAICarbonLookup } from '@/hooks/useAICarbonLookup'
import { Material } from '@/lib/supabase'
import { MaterialImageUpload } from './MaterialImageUpload'
import { MaterialTypeManager } from './MaterialTypeManager'
import { Sparkles, QrCode, Loader2, Edit } from 'lucide-react'

interface AddMaterialDialogProps {
  open: boolean
  onClose: () => void
  materialToEdit?: Material | null
}

export function AddMaterialDialog({ open, onClose, materialToEdit }: AddMaterialDialogProps) {
  const { addMaterial, updateMaterial } = useMaterials()
  const { lookupCarbonData, loading: aiLoading } = useAICarbonLookup()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specific_material: '',
    origin: '',
    quantity: 0,
    unit: '',
    unit_count: 1,
    carbon_footprint: 0,
    carbon_source: '',
    cost_per_unit: 0,
    description: '',
    dimensions: '',
    length: 0,
    width: 0,
    thickness: 0,
    dimension_unit: 'mm',
    density: 500,
    image_url: ''
  })

  const isEditing = !!materialToEdit

  const units = [
    'kg', 'g', 'tons', 'm', 'cm', 'mm', 'm²', 'cm²', 
    'mm²', 'm³', 'cm³', 'mm³', 'pieces', 'boards', 
    'sheets', 'rolls', 'units'
  ]

  const carbonSources = [
    'Supplier Documentation',
    'Industry Database',
    'Third-party Certification',
    'Life Cycle Assessment',
    'AI Estimation',
    'Manual Calculation',
    'Environmental Product Declaration',
    'Other'
  ]

  // Populate form when editing
  useEffect(() => {
    if (materialToEdit) {
      setFormData({
        name: materialToEdit.name || '',
        type: materialToEdit.type || '',
        specific_material: materialToEdit.specific_material || '',
        origin: materialToEdit.origin || '',
        quantity: materialToEdit.quantity || 0,
        unit: materialToEdit.unit || '',
        unit_count: materialToEdit.unit_count || 1,
        carbon_footprint: materialToEdit.carbon_footprint || 0,
        carbon_source: materialToEdit.carbon_source || '',
        cost_per_unit: materialToEdit.cost_per_unit || 0,
        description: materialToEdit.description || '',
        dimensions: materialToEdit.dimensions || '',
        length: materialToEdit.length || 0,
        width: materialToEdit.width || 0,
        thickness: materialToEdit.thickness || 0,
        dimension_unit: materialToEdit.dimension_unit || 'mm',
        density: materialToEdit.density || 500,
        image_url: materialToEdit.image_url || ''
      })
    }
  }, [materialToEdit])

  const calculateWeight = () => {
    if (formData.length && formData.width && formData.thickness && formData.density) {
      // Convert dimensions to m³
      let volumeInM3 = 0
      switch (formData.dimension_unit) {
        case 'mm':
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000000
          break
        case 'cm':
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000
          break
        case 'm':
          volumeInM3 = formData.length * formData.width * formData.thickness
          break
        default:
          volumeInM3 = (formData.length * formData.width * formData.thickness) / 1000000000
      }
      
      // Calculate total weight including unit count
      const totalVolume = volumeInM3 * formData.unit_count
      return totalVolume * formData.density
    }
    return 0
  }

  const handleAILookup = async () => {
    if (!formData.type || !formData.specific_material) {
      toast({
        title: "Missing Information",
        description: "Please select a material type and specify the material before using AI lookup.",
        variant: "destructive"
      })
      return
    }

    try {
      const estimatedWeight = calculateWeight() || 1
      const dimensionsString = formData.length && formData.width && formData.thickness 
        ? `${formData.length}×${formData.width}×${formData.thickness}${formData.dimension_unit}`
        : formData.dimensions

      const carbonData = await lookupCarbonData({
        materialType: formData.type,
        specificMaterial: formData.specific_material,
        origin: formData.origin,
        dimensions: dimensionsString,
        quantity: formData.quantity,
        unit: formData.unit,
        unitCount: formData.unit_count,
        weight: estimatedWeight
      })

      if (carbonData) {
        setFormData(prev => ({
          ...prev,
          carbon_footprint: carbonData.totalCarbonFootprint, // Use total carbon footprint
          carbon_source: 'AI Estimation',
          density: carbonData.density
        }))
        
        toast({
          title: "AI Carbon Data Applied",
          description: `Total carbon footprint: ${carbonData.totalCarbonFootprint.toFixed(2)}kg CO₂e`,
        })
      }
    } catch (error) {
      console.error('AI lookup failed:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      specific_material: '',
      origin: '',
      quantity: 0,
      unit: '',
      unit_count: 1,
      carbon_footprint: 0,
      carbon_source: '',
      cost_per_unit: 0,
      description: '',
      dimensions: '',
      length: 0,
      width: 0,
      thickness: 0,
      dimension_unit: 'mm',
      density: 500,
      image_url: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.type || !formData.quantity || !formData.unit) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }

      // Prepare dimensions string if length, width, thickness are provided
      let dimensionsString = formData.dimensions
      if (formData.length && formData.width && formData.thickness) {
        dimensionsString = `${formData.length}×${formData.width}×${formData.thickness}${formData.dimension_unit}`
      }

      const materialData = {
        name: formData.name,
        type: formData.type,
        specific_material: formData.specific_material || undefined,
        origin: formData.origin || undefined,
        quantity: formData.quantity,
        unit: formData.unit,
        unit_count: formData.unit_count,
        carbon_footprint: formData.carbon_footprint,
        carbon_source: formData.carbon_source || undefined,
        cost_per_unit: formData.cost_per_unit,
        description: formData.description || undefined,
        dimensions: dimensionsString || undefined,
        length: formData.length || undefined,
        width: formData.width || undefined,
        thickness: formData.thickness || undefined,
        dimension_unit: formData.dimension_unit || undefined,
        density: formData.density,
        image_url: formData.image_url || undefined
      }

      if (isEditing && materialToEdit) {
        await updateMaterial(materialToEdit.id, materialData)
        toast({
          title: "Success",
          description: "Material updated successfully!",
        })
      } else {
        await addMaterial(materialData)
        toast({
          title: "Success",
          description: "Material added successfully with QR code generated!",
        })
      }

      resetForm()
      onClose()
    } catch (error) {
      console.error("Error saving material:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} material.`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }))
  }

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  const handleTypeSelected = (carbonFactor: number, density: number) => {
    setFormData(prev => ({ 
      ...prev, 
      carbon_footprint: carbonFactor,
      density: density
    }))
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
            {isEditing ? 'Edit Material' : 'Add New Material'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Image */}
          <MaterialImageUpload
            imageUrl={formData.image_url}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Material Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Oak Wood Board"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="origin">Origin/Source</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g., Local Forest, China"
                />
              </div>
            </div>

            {/* Material Type Manager */}
            <MaterialTypeManager
              selectedCategory={formData.type}
              selectedSpecificType={formData.specific_material}
              onCategoryChange={(category) => setFormData(prev => ({ ...prev, type: category }))}
              onSpecificTypeChange={(specificType) => setFormData(prev => ({ ...prev, specific_material: specificType }))}
              onTypeSelected={handleTypeSelected}
            />

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this material..."
                rows={2}
              />
            </div>
          </div>

          {/* Quantity & Cost */}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  placeholder="100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_count: parseInt(e.target.value) || 1 }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                  placeholder="10.00"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="thickness">Thickness</Label>
                <Input
                  id="thickness"
                  type="number"
                  step="0.01"
                  value={formData.thickness}
                  onChange={(e) => setFormData(prev => ({ ...prev, thickness: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="dimension_unit">Unit</Label>
                <Select 
                  value={formData.dimension_unit} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dimension_unit: value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, density: parseFloat(e.target.value) || 500 }))}
                  placeholder="500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dimensions">Or Custom Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 2400×1200×18mm"
              />
            </div>

            {formData.length && formData.width && formData.thickness && (
              <div className="text-sm text-muted-foreground">
                Estimated weight: {calculateWeight().toFixed(2)}kg
              </div>
            )}
          </div>

          {/* Carbon Footprint with AI */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Carbon Footprint</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAILookup}
                disabled={aiLoading || !formData.type || !formData.specific_material}
                className="gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI Lookup Total
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carbon_footprint">Total Carbon Footprint (kg CO₂e)</Label>
                <Input
                  id="carbon_footprint"
                  type="number"
                  step="0.01"
                  value={formData.carbon_footprint}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbon_footprint: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="carbon_source">Carbon Data Source</Label>
                <Select 
                  value={formData.carbon_source} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, carbon_source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {carbonSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit className="h-4 w-4 mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Update Material' : 'Add Material'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

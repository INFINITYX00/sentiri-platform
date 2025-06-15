import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Trash2, Calculator, Leaf, AlertCircle, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMaterials } from '@/hooks/useMaterials'
import { useProjects } from '@/hooks/useProjects'
import { supabase } from '@/lib/supabase'

interface DesignBOMManagerProps {
  projectId: string
  onBOMComplete?: () => void
}

interface BOMItem {
  id: string
  material_id: string
  quantity_required: number
  cost_per_unit: number
  total_cost: number
  material?: {
    id: string
    name: string
    type: string
    unit: string
    carbon_footprint: number
    quantity: number
  }
}

export function DesignBOMManager({ projectId, onBOMComplete }: DesignBOMManagerProps) {
  const [bomItems, setBomItems] = useState<BOMItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [costPerUnit, setCostPerUnit] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [bomCompleted, setBomCompleted] = useState(false)
  
  const { materials } = useMaterials()
  const { updateProject, projects } = useProjects()
  const { toast } = useToast()

  const currentProject = projects.find(p => p.id === projectId)

  useEffect(() => {
    fetchBOMItems()
  }, [projectId])

  useEffect(() => {
    // Check if BOM is already completed (project status is 'design' or higher)
    if (currentProject && currentProject.status !== 'planning') {
      setBomCompleted(true)
    }
  }, [currentProject])

  const fetchBOMItems = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects_materials')
        .select(`
          *,
          material:materials(id, name, type, unit, carbon_footprint, quantity)
        `)
        .eq('project_id', projectId)

      if (error) throw error
      
      console.log('BOM items fetched:', data?.length || 0)
      setBomItems(data || [])
    } catch (error) {
      console.error('Error fetching BOM items:', error)
      toast({
        title: "Error",
        description: "Failed to load BOM items",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addBOMItem = async () => {
    if (!selectedMaterialId || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a material and enter a valid quantity",
        variant: "destructive"
      })
      return
    }

    setIsUpdating(true)
    try {
      // Check if material already exists in BOM
      const existingItem = bomItems.find(item => item.material_id === selectedMaterialId)
      if (existingItem) {
        toast({
          title: "Material Already Added",
          description: "This material is already in the BOM. Edit the existing entry instead.",
          variant: "destructive"
        })
        return
      }

      const selectedMaterial = materials.find(m => m.id === selectedMaterialId)
      if (!selectedMaterial) {
        throw new Error('Selected material not found')
      }

      // Calculate costs
      const finalCostPerUnit = costPerUnit > 0 ? costPerUnit : (selectedMaterial.cost_per_unit || 0)
      const totalCost = quantity * finalCostPerUnit

      console.log('Adding BOM item:', {
        project_id: projectId,
        material_id: selectedMaterialId,
        quantity_required: quantity,
        cost_per_unit: finalCostPerUnit,
        total_cost: totalCost
      })

      const { data, error } = await supabase
        .from('projects_materials')
        .insert([{
          project_id: projectId,
          material_id: selectedMaterialId,
          quantity_required: quantity,
          quantity_consumed: 0,
          cost_per_unit: finalCostPerUnit,
          total_cost: totalCost
        }])
        .select(`
          *,
          material:materials(id, name, type, unit, carbon_footprint, quantity)
        `)
        .single()

      if (error) throw error

      console.log('BOM item added successfully:', data)
      
      // Update local state
      setBomItems(prev => [...prev, data])
      
      // Update project totals
      await updateProjectTotals([...bomItems, data])
      
      // Reset form
      setSelectedMaterialId('')
      setQuantity(1)
      setCostPerUnit(0)
      setIsDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Material added to BOM successfully"
      })
    } catch (error) {
      console.error('Error adding BOM item:', error)
      toast({
        title: "Error",
        description: `Failed to add material: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const removeBOMItem = async (itemId: string) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('projects_materials')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      const updatedItems = bomItems.filter(item => item.id !== itemId)
      setBomItems(updatedItems)
      
      // Update project totals
      await updateProjectTotals(updatedItems)
      
      toast({
        title: "Success",
        description: "Material removed from BOM"
      })
    } catch (error) {
      console.error('Error removing BOM item:', error)
      toast({
        title: "Error",
        description: "Failed to remove material",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updateProjectTotals = async (currentBomItems: BOMItem[]) => {
    try {
      const totalCost = currentBomItems.reduce((sum, item) => sum + item.total_cost, 0)
      const totalCarbonFootprint = currentBomItems.reduce((sum, item) => {
        const carbonPerUnit = item.material?.carbon_footprint || 0
        return sum + (carbonPerUnit * item.quantity_required)
      }, 0)

      console.log('Updating project totals:', { totalCost, totalCarbonFootprint })

      await updateProject(projectId, {
        total_cost: totalCost,
        total_carbon_footprint: totalCarbonFootprint,
        allocated_materials: currentBomItems.map(item => item.material_id)
      })
    } catch (error) {
      console.error('Error updating project totals:', error)
      // Don't show error to user as this is a background operation
    }
  }

  const completeBOM = async () => {
    if (bomItems.length === 0) {
      toast({
        title: "No Materials",
        description: "Please add at least one material to complete the BOM",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUpdating(true)
      
      // Update project status to design phase
      await updateProject(projectId, { status: 'design' })
      setBomCompleted(true)
      
      toast({
        title: "BOM Complete",
        description: "Bill of Materials completed successfully. You can now proceed to Production Planning.",
      })
      
      onBOMComplete?.()
    } catch (error) {
      console.error('Error completing BOM:', error)
      toast({
        title: "Error",
        description: "Failed to complete BOM",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const totalCost = bomItems.reduce((sum, item) => sum + item.total_cost, 0)
  const totalCarbonFootprint = bomItems.reduce((sum, item) => {
    const carbonPerUnit = item.material?.carbon_footprint || 0
    return sum + (carbonPerUnit * item.quantity_required)
  }, 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading BOM...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bill of Materials</h2>
          <p className="text-muted-foreground">Define the materials needed for this project</p>
          {bomCompleted && (
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">BOM Completed</span>
            </div>
          )}
        </div>
        
        {!bomCompleted && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isUpdating}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Material to BOM</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>
                          {material.name} ({material.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity Required</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit (optional)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    placeholder="Leave blank to use material default"
                  />
                </div>
                <Button 
                  onClick={addBOMItem} 
                  className="w-full"
                  disabled={isUpdating || !selectedMaterialId || quantity <= 0}
                >
                  {isUpdating ? "Adding..." : "Add to BOM"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* BOM Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold">{bomItems.length}</p>
              </div>
              <Package className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <Calculator className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                <p className="text-2xl font-bold">{totalCarbonFootprint.toFixed(1)} kg</p>
              </div>
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BOM Items */}
      <Card>
        <CardHeader>
          <CardTitle>Materials List</CardTitle>
        </CardHeader>
        <CardContent>
          {bomItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Materials Added</h3>
              <p className="text-muted-foreground">Start building your BOM by adding materials</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bomItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.material?.name}</h4>
                      <Badge variant="secondary">{item.material?.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity_required} {item.material?.unit}</span>
                      <span>Cost/unit: ${item.cost_per_unit.toFixed(2)}</span>
                      <span>Total: ${item.total_cost.toFixed(2)}</span>
                      <span>Carbon: {((item.material?.carbon_footprint || 0) * item.quantity_required).toFixed(1)} kg</span>
                    </div>
                  </div>
                  {!bomCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBOMItem(item.id)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete BOM Button */}
      {bomItems.length > 0 && !bomCompleted && (
        <div className="flex justify-end">
          <Button 
            onClick={completeBOM}
            disabled={isUpdating}
            size="lg"
          >
            {isUpdating ? "Completing..." : "Complete BOM"}
          </Button>
        </div>
      )}

      {/* BOM Status Message */}
      {bomCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="text-sm font-medium text-green-800">BOM Completed Successfully</h4>
              <p className="text-sm text-green-600">
                Your Bill of Materials is complete. You can now proceed to Production Planning using the navigation controls above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

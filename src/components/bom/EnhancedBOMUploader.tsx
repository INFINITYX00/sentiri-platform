
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, Package, AlertTriangle, CheckCircle } from "lucide-react"
import { useMaterials } from '@/hooks/useMaterials'
import { useProjects } from '@/hooks/useProjects'

interface BOMItem {
  id: string
  material_id: string
  material_name: string
  quantity: number
  unit: string
  available_stock: number
  carbon_footprint: number
  cost_estimate: number
}

export function EnhancedBOMUploader() {
  const { materials } = useMaterials()
  const { projects, addProject, addMaterialToProject } = useProjects()
  const [bomItems, setBomItems] = useState<BOMItem[]>([])
  const [bomName, setBomName] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [showMaterialSelector, setShowMaterialSelector] = useState(false)

  const addMaterialToBOM = (materialId: string, quantity: number = 1) => {
    const material = materials.find(m => m.id === materialId)
    if (!material || bomItems.some(item => item.material_id === materialId)) return

    const newItem: BOMItem = {
      id: crypto.randomUUID(),
      material_id: materialId,
      material_name: material.name,
      quantity,
      unit: material.unit,
      available_stock: material.quantity,
      carbon_footprint: material.carbon_footprint,
      cost_estimate: 0 // Would be calculated from market data
    }

    setBomItems(prev => [...prev, newItem])
    setShowMaterialSelector(false)
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setBomItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const removeItem = (itemId: string) => {
    setBomItems(prev => prev.filter(item => item.id !== itemId))
  }

  const getStockStatus = (item: BOMItem) => {
    if (item.available_stock >= item.quantity) {
      return { status: 'available', color: 'bg-green-100 text-green-800' }
    } else if (item.available_stock > 0) {
      return { status: 'partial', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'unavailable', color: 'bg-red-100 text-red-800' }
    }
  }

  const calculateTotals = () => {
    const totalCarbonFootprint = bomItems.reduce((sum, item) => 
      sum + (item.carbon_footprint * item.quantity), 0
    )
    const totalCost = bomItems.reduce((sum, item) => 
      sum + (item.cost_estimate * item.quantity), 0
    )
    
    return { totalCarbonFootprint, totalCost }
  }

  const createProjectFromBOM = async () => {
    if (!bomName.trim() || bomItems.length === 0) return

    const { totalCarbonFootprint, totalCost } = calculateTotals()

    // Create new project
    const project = await addProject({
      name: bomName,
      description: `Project created from BOM with ${bomItems.length} materials`,
      status: 'planning',
      progress: 0,
      total_cost: totalCost,
      total_carbon_footprint: totalCarbonFootprint,
      allocated_materials: bomItems.map(item => item.material_id)
    })

    if (project) {
      // Add materials to project
      for (const item of bomItems) {
        await addMaterialToProject(
          project.id,
          item.material_id,
          item.quantity,
          item.cost_estimate
        )
      }

      // Reset form
      setBomItems([])
      setBomName('')
      setSelectedProject('')
    }
  }

  const availableMaterials = materials.filter(material => 
    !bomItems.some(item => item.material_id === material.id)
  )

  const { totalCarbonFootprint, totalCost } = calculateTotals()

  return (
    <div className="space-y-6">
      {/* BOM Header */}
      <Card>
        <CardHeader>
          <CardTitle>Create BOM from Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="BOM/Project name"
            value={bomName}
            onChange={(e) => setBomName(e.target.value)}
          />

          {/* Add Material Button */}
          {!showMaterialSelector && (
            <Button 
              onClick={() => setShowMaterialSelector(true)}
              disabled={availableMaterials.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material from Stock
            </Button>
          )}

          {/* Material Selector */}
          {showMaterialSelector && (
            <div className="flex gap-2">
              <Select onValueChange={(value) => addMaterialToBOM(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select material from stock" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} - {material.quantity} {material.unit} available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowMaterialSelector(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOM Items */}
      {bomItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>BOM Items ({bomItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bomItems.map((item) => {
              const stockStatus = getStockStatus(item)
              
              return (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{item.material_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.carbon_footprint} kg CO₂ per {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-sm text-muted-foreground">{item.unit}</span>

                    <Badge className={stockStatus.color}>
                      {stockStatus.status === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {stockStatus.status === 'partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {stockStatus.status === 'unavailable' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {item.available_stock} available
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Totals */}
            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Total Carbon Footprint:</span>
                <span className="text-primary font-medium">{totalCarbonFootprint.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Estimated Total Cost:</span>
                <span className="text-green-600 font-medium">${totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Create Project Button */}
            <Button 
              onClick={createProjectFromBOM}
              disabled={!bomName.trim() || bomItems.length === 0}
              className="w-full mt-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create Project from BOM
            </Button>
          </CardContent>
        </Card>
      )}

      {bomItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No materials added to BOM yet</p>
          <p className="text-sm">Add materials from your stock to create a Bill of Materials</p>
        </div>
      )}
    </div>
  )
}

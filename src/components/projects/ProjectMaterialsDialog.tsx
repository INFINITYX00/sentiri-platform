
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Package, AlertTriangle } from "lucide-react"
import { useProjects, type ProjectMaterial } from '@/hooks/useProjects'
import { useMaterials } from '@/hooks/useMaterials'

interface ProjectMaterialsDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
}

export function ProjectMaterialsDialog({ projectId, open, onClose }: ProjectMaterialsDialogProps) {
  const { addMaterialToProject, getProjectMaterials } = useProjects()
  const { materials } = useMaterials()
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    material_id: '',
    quantity_required: '',
    cost_per_unit: ''
  })

  useEffect(() => {
    if (open && projectId) {
      loadProjectMaterials()
    }
  }, [open, projectId])

  const loadProjectMaterials = async () => {
    const materials = await getProjectMaterials(projectId)
    setProjectMaterials(materials)
  }

  const handleAddMaterial = async () => {
    if (!formData.material_id || !formData.quantity_required || !formData.cost_per_unit) return

    await addMaterialToProject(
      projectId,
      formData.material_id,
      parseFloat(formData.quantity_required),
      parseFloat(formData.cost_per_unit)
    )

    setFormData({ material_id: '', quantity_required: '', cost_per_unit: '' })
    setShowAddForm(false)
    await loadProjectMaterials()
  }

  const availableMaterials = materials.filter(material => 
    !projectMaterials.some(pm => pm.material_id === material.id)
  )

  const checkStockAvailability = (material: ProjectMaterial) => {
    const stockMaterial = materials.find(m => m.id === material.material_id)
    if (!stockMaterial) return { available: false, shortage: material.quantity_required }
    
    const available = stockMaterial.quantity >= material.quantity_required
    const shortage = available ? 0 : material.quantity_required - stockMaterial.quantity
    
    return { available, shortage }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Materials</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Material Form */}
          {showAddForm && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <Select value={formData.material_id} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, material_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - {material.quantity} {material.unit} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Quantity required"
                    type="number"
                    value={formData.quantity_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity_required: e.target.value }))}
                  />
                  <Input
                    placeholder="Cost per unit"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddMaterial}>Add Material</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Material Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} disabled={availableMaterials.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          )}

          {/* Materials List */}
          <div className="space-y-2">
            {projectMaterials.map((projectMaterial) => {
              const stockCheck = checkStockAvailability(projectMaterial)
              
              return (
                <Card key={projectMaterial.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{projectMaterial.material?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {projectMaterial.material?.type} • {projectMaterial.material?.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {projectMaterial.quantity_required} required
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${projectMaterial.total_cost.toFixed(2)} total
                          </p>
                        </div>

                        {!stockCheck.available && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Short {stockCheck.shortage}
                          </Badge>
                        )}

                        {stockCheck.available && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {projectMaterials.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No materials added to this project yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

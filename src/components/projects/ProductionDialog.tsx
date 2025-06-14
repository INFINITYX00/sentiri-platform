
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Square, CheckCircle, Package, Leaf } from "lucide-react"
import { useProjects, type ProjectMaterial } from '@/hooks/useProjects'
import { useProductPassports } from '@/hooks/useProductPassports'
import { useMaterials } from '@/hooks/useMaterials'

interface ProductionDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
}

export function ProductionDialog({ projectId, open, onClose }: ProductionDialogProps) {
  const { projects, getProjectMaterials, updateProject } = useProjects()
  const { generateProductPassport } = useProductPassports()
  const { updateMaterial } = useMaterials()
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([])
  const [productionForm, setProductionForm] = useState({
    product_name: '',
    product_type: 'manufactured',
    quantity_produced: '1',
    specifications: ''
  })

  const project = projects.find(p => p.id === projectId)

  useEffect(() => {
    if (open && projectId) {
      loadProjectMaterials()
      if (project) {
        setProductionForm(prev => ({
          ...prev,
          product_name: project.name || ''
        }))
      }
    }
  }, [open, projectId, project])

  const loadProjectMaterials = async () => {
    const materials = await getProjectMaterials(projectId)
    setProjectMaterials(materials)
  }

  const startProduction = async () => {
    if (!project) return

    // Update project status to in_progress
    await updateProject(projectId, {
      status: 'in_progress',
      progress: 25
    })

    onClose()
  }

  const completeProduction = async () => {
    if (!project || !productionForm.product_name.trim()) return

    try {
      // Calculate total carbon footprint from materials
      const totalCarbonFootprint = projectMaterials.reduce((sum, pm) => {
        const materialCarbon = pm.material?.carbon_footprint || 0
        return sum + (materialCarbon * pm.quantity_required)
      }, 0)

      // Calculate total cost
      const totalCost = projectMaterials.reduce((sum, pm) => sum + pm.total_cost, 0)

      // Consume materials from stock
      for (const projectMaterial of projectMaterials) {
        const stockMaterial = projectMaterial.material
        if (stockMaterial) {
          const newQuantity = Math.max(0, stockMaterial.quantity - projectMaterial.quantity_required)
          await updateMaterial(stockMaterial.id, { quantity: newQuantity })
        }
      }

      // Generate product passport
      const specifications = productionForm.specifications 
        ? JSON.parse(productionForm.specifications) 
        : {}

      await generateProductPassport(
        projectId,
        productionForm.product_name,
        productionForm.product_type,
        parseInt(productionForm.quantity_produced),
        totalCarbonFootprint,
        {
          ...specifications,
          materials_used: projectMaterials.map(pm => ({
            name: pm.material?.name,
            quantity: pm.quantity_required,
            unit: pm.material?.unit,
            carbon_footprint: pm.material?.carbon_footprint
          }))
        }
      )

      // Update project as completed
      await updateProject(projectId, {
        status: 'completed',
        progress: 100,
        completion_date: new Date().toISOString().split('T')[0],
        total_cost: totalCost,
        total_carbon_footprint: totalCarbonFootprint
      })

      onClose()
    } catch (error) {
      console.error('Error completing production:', error)
    }
  }

  if (!project) return null

  const canStartProduction = projectMaterials.length > 0 && project.status === 'planning'
  const canCompleteProduction = project.status === 'in_progress' && productionForm.product_name.trim()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production Control - {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Status */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={
                    project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {project.progress}% complete
                  </span>
                </div>
              </div>
              <Progress value={project.progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Materials Summary */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Materials Required ({projectMaterials.length})
              </h3>
              <div className="space-y-2">
                {projectMaterials.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between text-sm">
                    <span>{pm.material?.name}</span>
                    <span>{pm.quantity_required} {pm.material?.unit}</span>
                  </div>
                ))}
              </div>
              {projectMaterials.length === 0 && (
                <p className="text-muted-foreground text-sm">No materials added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Production Form (for in_progress status) */}
          {project.status === 'in_progress' && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <h3 className="font-medium">Complete Production</h3>
                
                <Input
                  placeholder="Product name"
                  value={productionForm.product_name}
                  onChange={(e) => setProductionForm(prev => ({ ...prev, product_name: e.target.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Product type"
                    value={productionForm.product_type}
                    onChange={(e) => setProductionForm(prev => ({ ...prev, product_type: e.target.value }))}
                  />
                  <Input
                    placeholder="Quantity produced"
                    type="number"
                    value={productionForm.quantity_produced}
                    onChange={(e) => setProductionForm(prev => ({ ...prev, quantity_produced: e.target.value }))}
                  />
                </div>

                <Textarea
                  placeholder="Specifications (JSON format)"
                  value={productionForm.specifications}
                  onChange={(e) => setProductionForm(prev => ({ ...prev, specifications: e.target.value }))}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canStartProduction && (
              <Button onClick={startProduction} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Production
              </Button>
            )}

            {canCompleteProduction && (
              <Button onClick={completeProduction} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete & Generate Passport
              </Button>
            )}

            {project.status === 'completed' && (
              <div className="flex-1 text-center py-2 text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Production Completed
              </div>
            )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

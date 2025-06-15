
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Square, CheckCircle, Package, Leaf, Clock, Zap, Users } from "lucide-react"
import { useProjects, type ProjectMaterial } from '@/hooks/useProjects'
import { useProductPassports } from '@/hooks/useProductPassports'
import { useMaterials } from '@/hooks/useMaterials'
import { useManufacturingStages } from '@/hooks/useManufacturingStages'

interface ProductionDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
}

export function ProductionDialog({ projectId, open, onClose }: ProductionDialogProps) {
  const { projects, getProjectMaterials, updateProject } = useProjects()
  const { generateProductPassport } = useProductPassports()
  const { updateMaterial } = useMaterials()
  const { stages, createDefaultStages, updateStage, fetchStages } = useManufacturingStages()
  const [projectMaterials, setProjectMaterials] = useState<ProjectMaterial[]>([])
  const [productionForm, setProductionForm] = useState({
    product_name: '',
    product_type: 'manufactured',
    quantity_produced: '1',
    specifications: ''
  })

  const project = projects.find(p => p.id === projectId)
  const projectStages = stages.filter(s => s.project_id === projectId)

  useEffect(() => {
    if (open && projectId) {
      loadProjectMaterials()
      fetchStages(projectId)
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

    // Create default manufacturing stages if none exist
    if (projectStages.length === 0) {
      await createDefaultStages(projectId)
    }

    // Update project status to in_progress
    await updateProject(projectId, {
      status: 'in_progress',
      progress: 10
    })

    // Start the first stage
    if (projectStages.length > 0) {
      await updateStage(projectStages[0].id, {
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0]
      })
    }

    onClose()
  }

  const completeStage = async (stageId: string) => {
    const stage = projectStages.find(s => s.id === stageId)
    if (!stage) return

    await updateStage(stageId, {
      status: 'completed',
      progress: 100,
      completed_date: new Date().toISOString().split('T')[0]
    })

    // Check if all stages are completed
    const updatedStages = projectStages.map(s => 
      s.id === stageId ? { ...s, status: 'completed' } : s
    )
    const allCompleted = updatedStages.every(s => s.status === 'completed')

    if (allCompleted) {
      // All stages completed, ready for final production
      await updateProject(projectId, {
        status: 'ready_for_completion',
        progress: 95
      })
    } else {
      // Start next stage
      const currentIndex = updatedStages.findIndex(s => s.id === stageId)
      if (currentIndex < updatedStages.length - 1) {
        const nextStage = updatedStages[currentIndex + 1]
        await updateStage(nextStage.id, {
          status: 'in_progress',
          start_date: new Date().toISOString().split('T')[0]
        })
      }

      // Update project progress
      const completedStages = updatedStages.filter(s => s.status === 'completed').length
      const progressPercentage = Math.round((completedStages / updatedStages.length) * 90) + 10 // 10-100%
      
      await updateProject(projectId, {
        progress: progressPercentage
      })
    }
  }

  const completeProduction = async () => {
    if (!project || !productionForm.product_name.trim()) return

    try {
      // Calculate total carbon footprint from materials + energy consumption
      const materialCarbon = projectMaterials.reduce((sum, pm) => {
        const materialCarbon = pm.material?.carbon_footprint || 0
        return sum + (materialCarbon * pm.quantity_required)
      }, 0)

      const energyCarbon = projectStages.reduce((sum, stage) => sum + stage.actual_energy * 0.5, 0) // 0.5 kg CO2 per kWh
      const totalCarbonFootprint = materialCarbon + energyCarbon

      // Calculate total cost including labor
      const materialCost = projectMaterials.reduce((sum, pm) => sum + pm.total_cost, 0)
      const laborCost = projectStages.reduce((sum, stage) => sum + stage.actual_hours * 25, 0) // $25/hour
      const totalCost = materialCost + laborCost

      // Consume materials from stock
      for (const projectMaterial of projectMaterials) {
        const stockMaterial = projectMaterial.material
        if (stockMaterial) {
          const newQuantity = Math.max(0, stockMaterial.quantity - projectMaterial.quantity_required)
          await updateMaterial(stockMaterial.id, { quantity: newQuantity })
        }
      }

      // Generate comprehensive specifications
      const specifications = {
        ...(productionForm.specifications ? JSON.parse(productionForm.specifications) : {}),
        materials_used: projectMaterials.map(pm => ({
          name: pm.material?.name,
          quantity: pm.quantity_required,
          unit: pm.material?.unit,
          carbon_footprint: pm.material?.carbon_footprint
        })),
        manufacturing_stages: projectStages.map(stage => ({
          name: stage.name,
          duration_hours: stage.actual_hours,
          energy_consumed: stage.actual_energy,
          workers: stage.workers,
          start_date: stage.start_date,
          completed_date: stage.completed_date
        })),
        production_metrics: {
          total_manufacturing_time: projectStages.reduce((sum, s) => sum + s.actual_hours, 0),
          total_energy_consumed: projectStages.reduce((sum, s) => sum + s.actual_energy, 0),
          material_carbon: materialCarbon,
          energy_carbon: energyCarbon,
          labor_cost: laborCost,
          material_cost: materialCost
        }
      }

      // Generate product passport
      await generateProductPassport(
        projectId,
        productionForm.product_name,
        productionForm.product_type,
        parseInt(productionForm.quantity_produced),
        totalCarbonFootprint,
        specifications
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

  const updateStageProgress = async (stageId: string, actualHours: number, actualEnergy: number) => {
    await updateStage(stageId, {
      actual_hours: actualHours,
      actual_energy: actualEnergy
    })
  }

  if (!project) return null

  const canStartProduction = projectMaterials.length > 0 && project.status === 'planning'
  const canCompleteProduction = (project.status === 'ready_for_completion' || project.status === 'in_progress') && productionForm.product_name.trim()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Production Control - {project.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Manufacturing Stages</TabsTrigger>
            <TabsTrigger value="completion">Complete Production</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Project Status */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'ready_for_completion' ? 'bg-orange-100 text-orange-800' :
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Materials Required ({projectMaterials.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
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

            {/* Production Metrics */}
            {projectStages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total Hours</p>
                        <p className="text-lg font-bold">
                          {projectStages.reduce((sum, s) => sum + s.actual_hours, 0).toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Energy Used</p>
                        <p className="text-lg font-bold">
                          {projectStages.reduce((sum, s) => sum + s.actual_energy, 0).toFixed(1)} kWh
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Workers</p>
                        <p className="text-lg font-bold">
                          {[...new Set(projectStages.flatMap(s => s.workers))].length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">CO₂ Impact</p>
                        <p className="text-lg font-bold">
                          {(projectStages.reduce((sum, s) => sum + s.actual_energy * 0.5, 0)).toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stages" className="space-y-4">
            {projectStages.length > 0 ? (
              <div className="space-y-4">
                {projectStages.map((stage, index) => (
                  <Card key={stage.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                        <Badge className={getStatusColor(stage.status)}>
                          {stage.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Est. Hours</p>
                          <p>{stage.estimated_hours}h</p>
                        </div>
                        <div>
                          <p className="font-medium">Actual Hours</p>
                          <p>{stage.actual_hours}h</p>
                        </div>
                        <div>
                          <p className="font-medium">Est. Energy</p>
                          <p>{stage.energy_estimate} kWh</p>
                        </div>
                        <div>
                          <p className="font-medium">Actual Energy</p>
                          <p>{stage.actual_energy} kWh</p>
                        </div>
                      </div>

                      {stage.status === 'in_progress' && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="number"
                            placeholder="Actual hours"
                            step="0.1"
                            onChange={(e) => updateStageProgress(stage.id, parseFloat(e.target.value) || 0, stage.actual_energy)}
                          />
                          <Input
                            type="number"
                            placeholder="Actual energy (kWh)"
                            step="0.1"
                            onChange={(e) => updateStageProgress(stage.id, stage.actual_hours, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {stage.status === 'in_progress' && (
                        <Button onClick={() => completeStage(stage.id)} className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Stage
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-muted-foreground">
                    No manufacturing stages created yet. Start production to create default stages.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completion" className="space-y-4">
            {(project.status === 'in_progress' || project.status === 'ready_for_completion') && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Production & Generate Passport</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    placeholder="Additional specifications (JSON format)"
                    value={productionForm.specifications}
                    onChange={(e) => setProductionForm(prev => ({ ...prev, specifications: e.target.value }))}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

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
      </DialogContent>
    </Dialog>
  )
}

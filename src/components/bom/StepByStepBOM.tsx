
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Package, Calculator, Play, ArrowRight } from "lucide-react"
import { useMaterials } from '@/hooks/useMaterials'
import { useProjects } from '@/hooks/useProjects'

interface StepProps {
  stepNumber: number
  title: string
  description: string
  isActive: boolean
  isCompleted: boolean
  children?: React.ReactNode
}

function Step({ stepNumber, title, description, isActive, isCompleted, children }: StepProps) {
  return (
    <Card className={`${isActive ? 'ring-2 ring-primary' : ''} ${isCompleted ? 'bg-green-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
          <div>
            <CardTitle className="text-lg">Step {stepNumber}: {title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      {(isActive || isCompleted) && children && (
        <CardContent>{children}</CardContent>
      )}
    </Card>
  )
}

export function StepByStepBOM() {
  const { materials } = useMaterials()
  const { projects, addProject, addMaterialToProject } = useProjects()
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [bomItems, setBomItems] = useState<Array<{
    id: string
    material_id: string
    material_name: string
    quantity: number
    display_unit: string
    cost_per_unit: number
    total_cost: number
    carbon_footprint: number
  }>>([])

  const getDisplayUnit = (material: any) => {
    if (material.display_unit) return material.display_unit
    if (material.unit_count && material.unit_count > 1) return 'pieces'
    if (material.type === 'wood') return 'boards'
    if (material.type === 'metal') return 'sheets'
    return 'units'
  }

  const getDisplayQuantity = (material: any) => {
    if (material.unit_count && material.unit_count > 1) return material.unit_count
    return 1
  }

  const createProject = async () => {
    if (!projectName.trim()) return

    const project = await addProject({
      name: projectName,
      description: projectDescription,
      status: 'planning',
      progress: 0,
      total_cost: 0,
      total_carbon_footprint: 0,
      allocated_materials: []
    })

    if (project) {
      setSelectedProject(project.id)
      setCurrentStep(2)
    }
  }

  const addMaterialToBOM = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    if (!material || bomItems.some(item => item.material_id === materialId)) return

    const displayUnit = getDisplayUnit(material)
    const quantity = 1
    const costPerUnit = material.cost_per_unit || 10 // Default cost if not set
    
    const newItem = {
      id: crypto.randomUUID(),
      material_id: materialId,
      material_name: material.name,
      quantity,
      display_unit: displayUnit,
      cost_per_unit: costPerUnit,
      total_cost: quantity * costPerUnit,
      carbon_footprint: material.carbon_footprint
    }

    setBomItems(prev => [...prev, newItem])
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setBomItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total_cost: quantity * item.cost_per_unit }
        : item
    ))
  }

  const removeItem = (itemId: string) => {
    setBomItems(prev => prev.filter(item => item.id !== itemId))
  }

  const finalizeBOM = async () => {
    if (!selectedProject || bomItems.length === 0) return

    const totalCost = bomItems.reduce((sum, item) => sum + item.total_cost, 0)
    const totalCarbon = bomItems.reduce((sum, item) => sum + (item.carbon_footprint * item.quantity), 0)

    // Add materials to project
    for (const item of bomItems) {
      await addMaterialToProject(
        selectedProject,
        item.material_id,
        item.quantity,
        item.cost_per_unit
      )
    }

    setCurrentStep(3)
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create Project & BOM</h2>
          <p className="text-muted-foreground">Follow these steps to create your manufacturing project</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Progress</div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-32" />
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Step 1: Create Project */}
        <Step
          stepNumber={1}
          title="Create Project"
          description="Set up your manufacturing project details"
          isActive={currentStep === 1}
          isCompleted={currentStep > 1}
        >
          <div className="space-y-4">
            <Input
              placeholder="Project name (e.g., 'Custom Table Build')"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              placeholder="Project description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <Button 
              onClick={createProject}
              disabled={!projectName.trim()}
              className="w-full"
            >
              <Package className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </Step>

        {/* Step 2: Build BOM */}
        <Step
          stepNumber={2}
          title="Build Bill of Materials"
          description="Select materials from your stock and specify quantities"
          isActive={currentStep === 2}
          isCompleted={currentStep > 2}
        >
          <div className="space-y-4">
            {/* Available Materials */}
            <div>
              <h4 className="font-medium mb-3">Available Materials</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {materials
                  .filter(m => !bomItems.some(item => item.material_id === m.id))
                  .map((material) => {
                    const displayUnit = getDisplayUnit(material)
                    const availableQty = getDisplayQuantity(material)
                    const cost = material.cost_per_unit || 10
                    
                    return (
                      <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h5 className="font-medium">{material.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {availableQty} {displayUnit} available • ${cost}/{displayUnit}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addMaterialToBOM(material.id)}
                        >
                          Add
                        </Button>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* BOM Items */}
            {bomItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">BOM Items ({bomItems.length})</h4>
                <div className="space-y-2">
                  {bomItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.material_name}</h5>
                        <p className="text-sm text-muted-foreground">
                          ${item.cost_per_unit}/{item.display_unit} • ${item.total_cost.toFixed(2)} total
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          step="1"
                        />
                        <span className="text-sm text-muted-foreground">{item.display_unit}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-medium text-green-600">
                        ${bomItems.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Carbon:</span>
                      <span className="font-medium text-blue-600">
                        {bomItems.reduce((sum, item) => sum + (item.carbon_footprint * item.quantity), 0).toFixed(2)} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={finalizeBOM}
                  disabled={bomItems.length === 0}
                  className="w-full mt-4"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Finalize BOM & Reserve Materials
                </Button>
              </div>
            )}
          </div>
        </Step>

        {/* Step 3: Start Production */}
        <Step
          stepNumber={3}
          title="Start Production"
          description="Your project is ready - begin manufacturing"
          isActive={currentStep === 3}
          isCompleted={false}
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">BOM Created Successfully!</span>
            </div>
            <p className="text-muted-foreground">
              Your project is now set up with all materials reserved. 
              Go to the Projects tab to manage production stages.
            </p>
            <Button 
              onClick={() => window.location.hash = '#bom'}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Go to Projects Manager
            </Button>
          </div>
        </Step>
      </div>
    </div>
  )
}

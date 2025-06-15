import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Settings, CheckCircle, Package, DollarSign, Leaf, ArrowLeft } from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { useManufacturingStages } from '@/hooks/useManufacturingStages'
import { ManufacturingStages } from '@/components/project/ManufacturingStages'

interface ProductionManagerProps {
  projectId?: string;
  onProductionStart?: () => Promise<void>;
  onManufacturingComplete?: () => Promise<void>;
}

export function ProductionManager({ 
  projectId: providedProjectId, 
  onProductionStart, 
  onManufacturingComplete 
}: ProductionManagerProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(providedProjectId || null)
  const { projects, updateProject } = useProjects()
  const { createDefaultStages } = useManufacturingStages()

  // Use provided projectId if available
  const currentProjectId = providedProjectId || selectedProject

  // Filter projects that are ready for production (have BOMs)
  const readyForProduction = projects.filter(project => 
    project.status === 'design' && project.allocated_materials.length > 0
  )
  
  // Projects currently in production
  const inProduction = projects.filter(project => project.status === 'in_progress')

  const productionStats = [
    { 
      label: "Ready for Production", 
      value: readyForProduction.length.toString(), 
      icon: Package, 
      color: "text-blue-400" 
    },
    { 
      label: "In Production", 
      value: inProduction.length.toString(), 
      icon: Settings, 
      color: "text-yellow-400" 
    },
    { 
      label: "Completed Today", 
      value: "3", 
      icon: CheckCircle, 
      color: "text-green-400" 
    },
    { 
      label: "Total Value", 
      value: `$${projects.reduce((sum, p) => sum + p.total_cost, 0).toFixed(0)}`, 
      icon: DollarSign, 
      color: "text-purple-400" 
    }
  ];

  const handleStartProduction = useCallback(async (projectId: string) => {
    setSelectedProject(projectId)
    await updateProject(projectId, { 
      status: 'in_progress',
      progress: 0
    })
    // Create default manufacturing stages for the project
    await createDefaultStages(projectId)
    
    // Notify parent component that production has started
    if (onProductionStart) {
      await onProductionStart()
    }
  }, [updateProject, createDefaultStages, onProductionStart])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'design': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  const selectedProjectData = currentProjectId ? projects.find(p => p.id === currentProjectId) : null

  const handleStageUpdate = useCallback(async (stages: any[]) => {
    if (!currentProjectId) return
    
    // Calculate overall progress from stages
    const overallProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length
    
    // Update project progress
    await updateProject(currentProjectId, { 
      progress: Math.round(overallProgress),
      status: overallProgress === 100 ? 'completed' : 'in_progress'
    })

    // If manufacturing is complete, notify parent
    if (overallProgress === 100 && onManufacturingComplete) {
      await onManufacturingComplete()
    }
  }, [currentProjectId, updateProject, onManufacturingComplete])

  // If projectId is provided via props, show production view for that project
  if (providedProjectId) {
    const project = projects.find(p => p.id === providedProjectId)
    
    // If project is ready for production, show start production interface
    if (project?.status === 'design' && project.allocated_materials.length > 0) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Start Production for {project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This project is ready for production. Click below to create manufacturing stages and begin production.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${project.total_cost.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span>{project.total_carbon_footprint.toFixed(1)} kg CO₂</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span>{project.allocated_materials.length} materials</span>
                  </div>
                </div>
                <Button onClick={() => handleStartProduction(providedProjectId)} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Production
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // If project is in production, show manufacturing stages
    if (project?.status === 'in_progress') {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Progress for {project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    in progress
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {project.progress}% complete
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <ManufacturingStages 
            projectId={providedProjectId} 
            onStageUpdate={handleStageUpdate}
          />
        </div>
      )
    }
    
    // If project is completed
    if (project?.status === 'completed') {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Production Complete!</h3>
              <p className="text-muted-foreground">
                {project.name} has been successfully manufactured and is ready for quality control.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Default case for projects not ready for production
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Not Ready</h3>
            <p className="text-muted-foreground">
              This project needs a completed BOM before production can begin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Original standalone production manager view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Production</h1>
            <p className="text-muted-foreground">Manage manufacturing and track progress</p>
          </div>
          {selectedProject && (
            <Button variant="outline" onClick={() => setSelectedProject(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Production
            </Button>
          )}
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6 ml-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {productionStats.map((stat) => (
              <Card key={stat.label} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!currentProjectId ? (
            <>
              {/* Ready for Production */}
              <Card>
                <CardHeader>
                  <CardTitle>Projects Ready for Production</CardTitle>
                </CardHeader>
                <CardContent>
                  {readyForProduction.length > 0 ? (
                    <div className="grid gap-4">
                      {readyForProduction.map((project) => (
                        <Card key={project.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className={getStatusColor(project.status)}>
                                    {project.status}
                                  </Badge>
                                  <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span>${project.total_cost.toFixed(0)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Leaf className="h-4 w-4 text-primary" />
                                    <span>{project.total_carbon_footprint.toFixed(1)} kg CO₂</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <span>{project.allocated_materials.length} materials</span>
                                  </div>
                                </div>
                              </div>
                              <Button onClick={() => handleStartProduction(project.id)} className="ml-4">
                                <Play className="h-4 w-4 mr-2" />
                                Start Production
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Projects Ready</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete BOMs in the Design section before starting production
                      </p>
                      <Button onClick={() => window.location.hash = 'design-bom'} variant="outline">
                        Go to Design & BOM
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* In Production */}
              {inProduction.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Currently in Production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {inProduction.map((project) => (
                        <Card key={project.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={getStatusColor(project.status)}>
                                    in progress
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {project.progress}% complete
                                  </span>
                                </div>
                                <Progress value={project.progress} className="h-2 mt-2" />
                              </div>
                              <Button onClick={() => setSelectedProject(project.id)} variant="outline" className="ml-4">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            // Production Detail View with Manufacturing Stages
            <ManufacturingStages 
              projectId={selectedProject} 
              onStageUpdate={handleStageUpdate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

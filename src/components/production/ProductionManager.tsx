
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Factory, Clock, Zap, Recycle, QrCode, Play, Pause, CheckCircle, Package } from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { useManufacturingStages } from '@/hooks/useManufacturingStages'
import { ProductionDialog } from '../projects/ProductionDialog'

export function ProductionManager() {
  const [activeSection, setActiveSection] = useState<'overview' | 'stages' | 'tracking'>('overview')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { projects } = useProjects()
  const { stages } = useManufacturingStages()

  // Filter projects ready for production (design status) and in production
  const readyForProduction = projects.filter(project => project.status === 'design')
  const inProduction = projects.filter(project => project.status === 'in_progress')
  const activeStages = stages.filter(stage => stage.status === 'in_progress')

  const productionStats = [
    { 
      label: "Ready for Production", 
      value: readyForProduction.length.toString(), 
      icon: Factory, 
      color: "text-blue-400" 
    },
    { 
      label: "In Production", 
      value: inProduction.length.toString(), 
      icon: Clock, 
      color: "text-purple-400" 
    },
    { 
      label: "Active Stages", 
      value: activeStages.length.toString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Completed Today", 
      value: "0", 
      icon: CheckCircle, 
      color: "text-green-400" 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'design': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'finishing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Production</h1>
            <p className="text-muted-foreground">Monitor manufacturing progress, track time and energy consumption</p>
          </div>
          <Button className="gap-2">
            <QrCode className="h-4 w-4" />
            Generate Time Tracking QR
          </Button>
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

          {/* Navigation Tabs */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  variant={activeSection === 'overview' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('overview')}
                  className="flex-1 min-w-[120px]"
                >
                  <Factory className="h-4 w-4 mr-2" />
                  Production Queue
                </Button>
                <Button
                  variant={activeSection === 'stages' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('stages')}
                  className="flex-1 min-w-[120px]"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Active Productions
                </Button>
                <Button
                  variant={activeSection === 'tracking' ? 'default' : 'outline'}
                  onClick={() => setActiveSection('tracking')}
                  className="flex-1 min-w-[120px]"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Time Tracking
                </Button>
              </div>

              {/* Production Queue */}
              {activeSection === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Projects Ready for Production</h3>
                  {readyForProduction.length > 0 ? (
                    <div className="grid gap-4">
                      {readyForProduction.map((project) => (
                        <Card key={project.id} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{project.name}</h4>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground">{project.description}</p>
                                )}
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                BOM Ready
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between text-sm text-muted-foreground mb-3">
                              <span>Materials: {project.allocated_materials?.length || 0} types</span>
                              <span>Est. Carbon: {project.total_carbon_footprint.toFixed(1)} kg CO₂</span>
                            </div>

                            <Button 
                              onClick={() => setSelectedProject(project.id)} 
                              className="w-full"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Production
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Projects Ready</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete BOMs in Design & BOM section first
                      </p>
                      <Button onClick={() => window.location.hash = 'design-bom'} variant="outline">
                        Go to Design & BOM
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Productions */}
              {activeSection === 'stages' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Active Productions</h3>
                  {inProduction.length > 0 ? (
                    <div className="grid gap-4">
                      {inProduction.map((project) => (
                        <Card key={project.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{project.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Started: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                In Progress
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Progress</span>
                                <span className="text-muted-foreground">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedProject(project.id)}
                                className="flex-1"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Productions</h3>
                      <p className="text-muted-foreground">Start production from the queue above</p>
                    </div>
                  )}
                </div>
              )}

              {/* Time Tracking */}
              {activeSection === 'tracking' && (
                <div className="text-center py-12">
                  <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">QR Time Tracking</h3>
                  <p className="text-muted-foreground">Generate QR codes for workers to track time and stage completion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production Dialog */}
      {selectedProject && (
        <ProductionDialog
          projectId={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

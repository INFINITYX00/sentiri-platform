
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Settings, CheckCircle, Package, DollarSign, Leaf, ArrowLeft } from "lucide-react"
import { useProjects } from '@/hooks/useProjects'

export function ProductionManager() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { projects, updateProject } = useProjects()

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

  const handleStartProduction = async (projectId: string) => {
    setSelectedProject(projectId)
    await updateProject(projectId, { 
      status: 'in_progress',
      progress: 0
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'design': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null

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

          {!selectedProject ? (
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
            // Production Detail View
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Production Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Production tracking interface for {selectedProjectData?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Detailed production management features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

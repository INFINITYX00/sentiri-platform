import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Workflow, Package, Lightbulb, Play, ArrowLeft } from "lucide-react"
import { EnhancedBOMUploader } from "../bom/EnhancedBOMUploader"
import { StepByStepBOM } from "../bom/StepByStepBOM"
import { useProjects } from '@/hooks/useProjects'

interface DesignBOMManagerProps {
  projectId?: string
  onBOMComplete?: () => void
}

export function DesignBOMManager({ projectId: providedProjectId, onBOMComplete }: DesignBOMManagerProps) {
  const [activeTab, setActiveTab] = useState<'guided' | 'upload' | 'templates'>('guided')
  const [selectedProject, setSelectedProject] = useState<string | null>(providedProjectId || null)
  const { projects, updateProject } = useProjects()

  // Use provided projectId if available
  const currentProjectId = providedProjectId || selectedProject

  // Filter projects that are in planning status (ready for BOM creation)
  const planningProjects = projects.filter(project => project.status === 'planning')

  const designStats = [
    { 
      label: "Projects Ready for BOM", 
      value: planningProjects.length.toString(), 
      icon: FileText, 
      color: "text-blue-400" 
    },
    { 
      label: "BOMs in Progress", 
      value: projects.filter(p => p.status === 'design').length.toString(), 
      icon: Package, 
      color: "text-purple-400" 
    },
    { 
      label: "Templates Available", 
      value: "5", 
      icon: Lightbulb, 
      color: "text-green-400" 
    },
    { 
      label: "Ready for Production", 
      value: projects.filter(p => p.status === 'design' && p.allocated_materials.length > 0).length.toString(), 
      icon: Workflow, 
      color: "text-orange-400" 
    }
  ];

  const handleStartBOM = async (projectId: string) => {
    setSelectedProject(projectId)
    // Move project to design status when BOM creation starts
    await updateProject(projectId, { status: 'design' })
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
    setActiveTab('guided')
  }

  const handleBOMSaved = () => {
    // Callback to notify wizard that BOM is complete
    if (onBOMComplete) {
      onBOMComplete()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'design': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const selectedProjectData = currentProjectId ? projects.find(p => p.id === currentProjectId) : null

  // If projectId is provided via props, skip project selection
  if (providedProjectId) {
    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {designStats.map((stat) => (
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

        {/* BOM Creation for Selected Project */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Creating BOM for: {selectedProjectData?.name}
                </h2>
                {selectedProjectData?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedProjectData.description}</p>
                )}
              </div>
              <Badge className={getStatusColor(selectedProjectData?.status || 'design')}>
                {selectedProjectData?.status?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={activeTab === 'guided' ? 'default' : 'outline'}
                onClick={() => setActiveTab('guided')}
                className="flex-1 min-w-[120px]"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Guided BOM Creation
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => setActiveTab('upload')}
                className="flex-1 min-w-[120px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Advanced BOM Upload
              </Button>
              <Button
                variant={activeTab === 'templates' ? 'default' : 'outline'}
                onClick={() => setActiveTab('templates')}
                className="flex-1 min-w-[120px]"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Design Templates
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'guided' && (
              <StepByStepBOM 
                projectId={providedProjectId} 
                onBOMComplete={handleBOMSaved}
              />
            )}
            {activeTab === 'upload' && (
              <EnhancedBOMUploader 
                projectId={providedProjectId} 
                onBOMComplete={handleBOMSaved}
              />
            )}
            {activeTab === 'templates' && (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Design Templates</h3>
                <p className="text-muted-foreground">Pre-built BOM templates for common furniture designs coming soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Original project selection flow when no projectId provided
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Design & BOM</h1>
            <p className="text-muted-foreground">Create Bills of Materials for existing projects</p>
          </div>
          {selectedProject && (
            <Button variant="outline" onClick={handleBackToProjects} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          )}
        </div>
      </div>
      
      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6 ml-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {designStats.map((stat) => (
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
            // Project Selection View
            <Card>
              <CardHeader>
                <CardTitle>Select a Project for BOM Creation</CardTitle>
              </CardHeader>
              <CardContent>
                {planningProjects.length > 0 ? (
                  <div className="grid gap-4">
                    {planningProjects.map((project) => (
                      <Card key={project.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              {project.description && (
                                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getStatusColor(project.status)}>
                                  {project.status}
                                </Badge>
                                {project.start_date && (
                                  <span className="text-sm text-muted-foreground">
                                    Created: {new Date(project.start_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button onClick={() => handleStartBOM(project.id)} className="ml-4">
                              <Play className="h-4 w-4 mr-2" />
                              Create BOM
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Ready for BOM</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a project first in the Projects section before designing a BOM
                    </p>
                    <Button onClick={() => window.location.hash = 'projects'} variant="outline">
                      Go to Projects
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // BOM Creation View (same as above but duplicated for standalone mode)
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Creating BOM for: {selectedProjectData?.name}
                    </h2>
                    {selectedProjectData?.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedProjectData.description}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(selectedProjectData?.status || 'design')}>
                    {selectedProjectData?.status?.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                  <Button
                    variant={activeTab === 'guided' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('guided')}
                    className="flex-1 min-w-[120px]"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Guided BOM Creation
                  </Button>
                  <Button
                    variant={activeTab === 'upload' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('upload')}
                    className="flex-1 min-w-[120px]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Advanced BOM Upload
                  </Button>
                  <Button
                    variant={activeTab === 'templates' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('templates')}
                    className="flex-1 min-w-[120px]"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Design Templates
                  </Button>
                </div>

                {/* Tab Content */}
                {activeTab === 'guided' && (
                  <StepByStepBOM 
                    projectId={providedProjectId} 
                    onBOMComplete={handleBOMSaved}
                  />
                )}
                {activeTab === 'upload' && (
                  <EnhancedBOMUploader 
                    projectId={providedProjectId} 
                    onBOMComplete={handleBOMSaved}
                  />
                )}
                {activeTab === 'templates' && (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Design Templates</h3>
                    <p className="text-muted-foreground">Pre-built BOM templates for common furniture designs coming soon</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

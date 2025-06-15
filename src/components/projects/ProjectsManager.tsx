import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Package, Calendar, DollarSign, Leaf, Play, CheckCircle, Clock } from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { ProjectMaterialsDialog } from './ProjectMaterialsDialog'
import { ProductionDialog } from './ProductionDialog'

export function ProjectsManager() {
  const { projects, loading, addProject } = useProjects()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showProduction, setShowProduction] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: ''
  })

  const handleCreateProject = async () => {
    if (!formData.name.trim()) return

    const result = await addProject({
      name: formData.name,
      description: formData.description,
      status: 'planning',
      progress: 0,
      total_cost: 0,
      total_carbon_footprint: 0,
      start_date: formData.start_date || undefined,
      allocated_materials: []
    })

    if (result) {
      setFormData({ name: '', description: '', start_date: '' })
      setShowCreateForm(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'on_hold': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="h-3 w-3" />
      case 'in_progress': return <Play className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      default: return null
    }
  }

  const getNextAction = (project: any) => {
    switch (project.status) {
      case 'planning':
        return 'Start Production'
      case 'in_progress':
        return 'View Progress'
      case 'completed':
        return 'View Results'
      default:
        return 'Manage'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage manufacturing projects and track progress</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6 ml-4">
          {/* Create Project Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Project name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Textarea
                  placeholder="Project description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
                <Input
                  type="date"
                  placeholder="Start date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateProject} disabled={!formData.name.trim()}>
                    Create Project
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(project.status)} ml-2 flex items-center gap-1`}>
                      {getStatusIcon(project.status)}
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">${project.total_cost.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Total Cost</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{project.total_carbon_footprint.toFixed(1)} kg</p>
                        <p className="text-xs text-muted-foreground">CO₂ Impact</p>
                      </div>
                    </div>
                  </div>

                  {project.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Started {new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProject(project.id)}
                      className="flex-1"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Materials
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowProduction(project.id)}
                      className="flex-1"
                      variant={project.status === 'completed' ? 'secondary' : 'default'}
                      disabled={project.status === 'completed'}
                    >
                      {project.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          {getNextAction(project)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {projects.length === 0 && !loading && (
              <Card className="col-span-full border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first project to start tracking manufacturing progress
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {selectedProject && (
        <ProjectMaterialsDialog
          projectId={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {showProduction && (
        <ProductionDialog
          projectId={showProduction}
          open={!!showProduction}
          onClose={() => setShowProduction(null)}
        />
      )}
    </div>
  )
}

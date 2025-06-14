
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Calendar, DollarSign, Leaf } from "lucide-react"
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
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">Manage manufacturing projects and track material usage</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Project name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Project description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground">{project.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>${project.total_cost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span>{project.total_carbon_footprint.toFixed(1)} kg CO₂</span>
                </div>
                {project.start_date && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
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
                  disabled={project.status === 'completed'}
                >
                  {project.status === 'completed' ? 'Completed' : 'Start Production'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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

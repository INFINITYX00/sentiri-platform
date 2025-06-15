
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Calendar, DollarSign, Leaf, CheckCircle, Settings, Wrench } from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { ProjectMaterialsDialog } from './ProjectMaterialsDialog'
import { ProductionDialog } from './ProductionDialog'
import { ProjectActions } from './ProjectActions'

interface ProjectsManagerProps {
  onProjectSelect?: (projectId: string) => void
}

export function ProjectsManager({ onProjectSelect }: ProjectsManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [productionDialogOpen, setProductionDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    progress: 0,
    total_cost: 0,
    total_carbon_footprint: 0,
    allocated_materials: []
  })

  const { projects, loading, addProject, refreshProjects } = useProjects()

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    setIsCreatingProject(true)
    try {
      const created = await addProject(newProject)
      if (created) {
        setIsCreateDialogOpen(false)
        setNewProject({
          name: '',
          description: '',
          status: 'planning',
          progress: 0,
          total_cost: 0,
          total_carbon_footprint: 0,
          allocated_materials: []
        })
        
        // Force refresh and wait for it to complete
        await refreshProjects()
        
        // Use setTimeout to ensure the projects list is fully updated in the UI
        setTimeout(() => {
          if (onProjectSelect) {
            console.log('Selecting newly created project:', created.id)
            onProjectSelect(created.id)
          }
        }, 100)
      }
    } finally {
      setIsCreatingProject(false)
    }
  }

  const openMaterialsDialog = (projectId: string) => {
    setSelectedProjectId(projectId)
    setMaterialDialogOpen(true)
  }

  const openProductionDialog = (projectId: string) => {
    setSelectedProjectId(projectId)
    setProductionDialogOpen(true)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      default: return Package
    }
  }

  const projectStats = [
    { 
      label: "Total Projects", 
      value: projects.length.toString(), 
      icon: Package, 
      color: "text-blue-400" 
    },
    { 
      label: "In Progress", 
      value: projects.filter(p => p.status === 'in_progress').length.toString(), 
      icon: Calendar, 
      color: "text-yellow-400" 
    },
    { 
      label: "Completed", 
      value: projects.filter(p => p.status === 'completed').length.toString(), 
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your furniture manufacturing projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isCreatingProject}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreatingProject ? "Creating..." : "New Project"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project"
                />
              </div>
              <Button 
                onClick={handleCreateProject} 
                className="w-full"
                disabled={isCreatingProject || !newProject.name.trim()}
              >
                {isCreatingProject ? "Creating Project..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {projectStats.map((stat) => (
          <Card key={stat.label}>
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

      {/* Projects Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to start manufacturing
              </p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const StatusIcon = getStatusIcon(project.status)
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {project.description && (
                        <p className="text-muted-foreground mb-4">{project.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span>{project.allocated_materials.length} materials</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>${project.total_cost.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-primary" />
                          <span>{project.total_carbon_footprint.toFixed(1)} kg CO₂</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>{project.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4 flex-wrap">
                      {onProjectSelect && (
                        <Button 
                          variant="outline" 
                          onClick={() => onProjectSelect(project.id)}
                        >
                          Select
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => openMaterialsDialog(project.id)}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Materials
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openProductionDialog(project.id)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Production
                      </Button>
                      <ProjectActions 
                        project={project} 
                        onProjectUpdate={refreshProjects}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialogs */}
      {selectedProjectId && (
        <>
          <ProjectMaterialsDialog 
            projectId={selectedProjectId}
            open={materialDialogOpen}
            onClose={() => setMaterialDialogOpen(false)}
          />
          <ProductionDialog 
            projectId={selectedProjectId}
            open={productionDialogOpen}
            onClose={() => setProductionDialogOpen(false)}
          />
        </>
      )}
    </div>
  )
}

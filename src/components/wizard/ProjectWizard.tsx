
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Workflow,
  Factory,
  ClipboardCheck,
  Award,
  User
} from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { ProjectsManager } from '@/components/projects/ProjectsManager'
import { DesignBOMManager } from '@/components/design/DesignBOMManager'
import { ProductionManager } from '@/components/production/ProductionManager'

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  status: 'completed' | 'current' | 'upcoming'
  allowAccess: boolean
}

export function ProjectWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { projects, updateProject } = useProjects()

  const getProjectSteps = (): WizardStep[] => {
    const project = selectedProject ? projects.find(p => p.id === selectedProject) : null
    
    return [
      {
        id: 'project-setup',
        title: 'Project Setup',
        description: 'Create and configure your project',
        icon: User,
        status: project ? 'completed' : 'current',
        allowAccess: true
      },
      {
        id: 'bom-creation',
        title: 'BOM Creation',
        description: 'Design your Bill of Materials',
        icon: FileText,
        status: project?.status === 'planning' ? 'current' : 
               (project?.status === 'design' || project?.status === 'in_progress' || project?.status === 'completed') ? 'completed' : 'upcoming',
        allowAccess: !!project
      },
      {
        id: 'production-planning',
        title: 'Production Planning',
        description: 'Plan manufacturing stages',
        icon: Workflow,
        status: project?.status === 'design' ? 'current' :
               (project?.status === 'in_progress' || project?.status === 'completed') ? 'completed' : 'upcoming',
        allowAccess: project?.status === 'design' || project?.status === 'in_progress' || project?.status === 'completed'
      },
      {
        id: 'manufacturing',
        title: 'Manufacturing',
        description: 'Execute production stages',
        icon: Factory,
        status: project?.status === 'in_progress' ? 'current' :
               project?.status === 'completed' ? 'completed' : 'upcoming',
        allowAccess: project?.status === 'in_progress' || project?.status === 'completed'
      },
      {
        id: 'quality-control',
        title: 'Quality Control',
        description: 'Final inspection and testing',
        icon: ClipboardCheck,
        status: project?.status === 'completed' && project?.progress === 100 ? 'current' : 'upcoming',
        allowAccess: project?.status === 'completed' && project?.progress === 100
      },
      {
        id: 'product-passport',
        title: 'Product Passport',
        description: 'Generate digital passport',
        icon: Award,
        status: 'upcoming',
        allowAccess: false
      }
    ]
  }

  const steps = getProjectSteps()
  const currentStepData = steps[currentStep]

  // Auto-advance based on project status
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject)
      if (project) {
        if (project.status === 'planning' && currentStep < 1) {
          setCurrentStep(1) // BOM Creation
        } else if (project.status === 'design' && currentStep < 2) {
          setCurrentStep(2) // Production Planning
        } else if (project.status === 'in_progress' && currentStep < 3) {
          setCurrentStep(3) // Manufacturing
        } else if (project.status === 'completed' && currentStep < 4) {
          setCurrentStep(4) // Quality Control
        }
      }
    }
  }, [selectedProject, projects, currentStep])

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId)
    const project = projects.find(p => p.id === projectId)
    if (project) {
      // Update project status to planning if it's new
      if (project.status === 'planning') {
        await updateProject(projectId, { status: 'planning' })
      }
      setCurrentStep(1) // Move to BOM creation
    }
  }

  const goToStep = (stepIndex: number) => {
    if (steps[stepIndex].allowAccess) {
      setCurrentStep(stepIndex)
    }
  }

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'project-setup':
        return <ProjectsManager onProjectSelect={handleProjectSelect} />
      case 'bom-creation':
        return selectedProject ? <DesignBOMManager /> : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a project first</p>
          </div>
        )
      case 'production-planning':
      case 'manufacturing':
        return selectedProject ? <ProductionManager /> : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a project first</p>
          </div>
        )
      case 'quality-control':
        return (
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
            <p className="text-muted-foreground">Final inspection and quality assurance</p>
            {selectedProject && (
              <Button 
                className="mt-4"
                onClick={() => setCurrentStep(5)}
              >
                Complete Quality Control
              </Button>
            )}
          </div>
        )
      case 'product-passport':
        return (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Passport Generated!</h3>
            <p className="text-muted-foreground">Your product passport has been created successfully</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Wizard</h1>
            <p className="text-muted-foreground">Complete workflow from concept to product passport</p>
            {selectedProject && (
              <p className="text-sm text-primary mt-1">
                Current Project: {projects.find(p => p.id === selectedProject)?.name}
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Progress</h3>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  return (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => goToStep(index)}
                        disabled={!step.allowAccess}
                        className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                          step.allowAccess 
                            ? 'hover:bg-gray-100 cursor-pointer' 
                            : 'cursor-not-allowed opacity-50'
                        } ${
                          index === currentStep ? 'bg-primary/10 border-2 border-primary' : 'border-2 border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-full mb-2 ${
                          step.status === 'completed' 
                            ? 'bg-green-500 text-white' 
                            : step.status === 'current'
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-center max-w-20">
                          {step.title}
                        </span>
                        <Badge 
                          variant={step.status === 'completed' ? 'default' : 'secondary'}
                          className={`mt-1 text-xs ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'current' ? 'bg-primary' : ''
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </button>
                      
                      {index < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
              
              <Progress 
                value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100} 
                className="mt-4"
              />
            </CardContent>
          </Card>

          {/* Current Step Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <currentStepData.icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>{currentStepData.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1 || !steps[currentStep + 1]?.allowAccess}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

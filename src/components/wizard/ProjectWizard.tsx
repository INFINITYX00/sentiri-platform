
import React, { useState, useEffect } from 'react'
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
  User,
  ExternalLink,
  QrCode
} from "lucide-react"
import { useProjects } from '@/hooks/useProjects'
import { useProductPassports } from '@/hooks/useProductPassports'
import { ProjectsManager } from '@/components/projects/ProjectsManager'
import { DesignBOMManager } from '@/components/design/DesignBOMManager'
import { ProductionManager } from '@/components/production/ProductionManager'
import { useToast } from '@/hooks/use-toast'

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
  const [generatedPassportId, setGeneratedPassportId] = useState<string | null>(null)
  const [isGeneratingPassport, setIsGeneratingPassport] = useState(false)
  const { projects, updateProject } = useProjects()
  const { generateProductPassport, productPassports } = useProductPassports()
  const { toast } = useToast()

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
        status: project && project.status !== 'planning' ? 'completed' : 
               project ? 'current' : 'upcoming',
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
        status: project?.status === 'completed' && project?.progress === 100 && !generatedPassportId ? 'current' : 
               generatedPassportId ? 'completed' : 'upcoming',
        allowAccess: project?.status === 'completed' && project?.progress === 100
      },
      {
        id: 'product-passport',
        title: 'Product Passport',
        description: 'Generated digital passport',
        icon: Award,
        status: generatedPassportId ? 'current' : 'upcoming',
        allowAccess: !!generatedPassportId
      }
    ]
  }

  const steps = getProjectSteps()

  // Check if a product passport exists for the current project
  useEffect(() => {
    if (selectedProject && productPassports.length > 0) {
      const existingPassport = productPassports.find(p => p.project_id === selectedProject)
      if (existingPassport && !generatedPassportId) {
        setGeneratedPassportId(existingPassport.id)
        setCurrentStep(5) // Move to product passport step
      }
    }
  }, [selectedProject, productPassports, generatedPassportId])

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProject(projectId)
    const project = projects.find(p => p.id === projectId)
    
    if (project) {
      // Check if product passport already exists
      const existingPassport = productPassports.find(p => p.project_id === projectId)
      if (existingPassport) {
        setGeneratedPassportId(existingPassport.id)
        setCurrentStep(5) // Product passport step
        return
      }

      // Navigate to appropriate step based on project status
      if (project.status === 'planning') {
        setCurrentStep(1) // BOM creation
      } else if (project.status === 'design') {
        setCurrentStep(2) // Production planning
      } else if (project.status === 'in_progress') {
        setCurrentStep(3) // Manufacturing
      } else if (project.status === 'completed' && project.progress === 100) {
        setCurrentStep(4) // Quality control
      }
    }
  }

  const handleBOMComplete = async () => {
    if (selectedProject) {
      await updateProject(selectedProject, { status: 'design' })
      setCurrentStep(2) // Move to production planning
    }
  }

  const handleProductionStart = async () => {
    if (selectedProject) {
      setCurrentStep(3) // Move to manufacturing
    }
  }

  const handleManufacturingComplete = async () => {
    if (selectedProject) {
      setCurrentStep(4) // Move to quality control
    }
  }

  const handleQualityControlComplete = async () => {
    if (!selectedProject) return

    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    setIsGeneratingPassport(true)
    try {
      // Generate product passport
      const passport = await generateProductPassport(
        selectedProject,
        project.name,
        'manufactured',
        1,
        project.total_carbon_footprint,
        {
          project_description: project.description,
          completion_date: new Date().toISOString(),
          total_cost: project.total_cost,
          progress: project.progress
        }
      )

      if (passport) {
        setGeneratedPassportId(passport.id)
        setCurrentStep(5) // Move to product passport step
        toast({
          title: "Success",
          description: "Product passport generated successfully!",
        })
      }
    } catch (error) {
      console.error('Error generating product passport:', error)
      toast({
        title: "Error",
        description: "Failed to generate product passport",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPassport(false)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (steps[stepIndex].allowAccess) {
      setCurrentStep(stepIndex)
    }
  }

  const renderStepContent = () => {
    const currentStepData = steps[currentStep]
    
    switch (currentStepData.id) {
      case 'project-setup':
        return <ProjectsManager onProjectSelect={handleProjectSelect} />
      case 'bom-creation':
        return selectedProject ? (
          <DesignBOMManager 
            projectId={selectedProject} 
            onBOMComplete={handleBOMComplete}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a project first</p>
            <Button 
              onClick={() => setCurrentStep(0)} 
              className="mt-4"
              variant="outline"
            >
              Go Back to Project Setup
            </Button>
          </div>
        )
      case 'production-planning':
      case 'manufacturing':
        return selectedProject ? (
          <ProductionManager 
            projectId={selectedProject}
            onProductionStart={handleProductionStart}
            onManufacturingComplete={handleManufacturingComplete}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please select a project first</p>
            <Button 
              onClick={() => setCurrentStep(0)} 
              className="mt-4"
              variant="outline"
            >
              Go Back to Project Setup
            </Button>
          </div>
        )
      case 'quality-control':
        return (
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
            <p className="text-muted-foreground mb-6">
              Final inspection and quality assurance completed. Ready to generate your product passport.
            </p>
            {selectedProject && !generatedPassportId && (
              <Button 
                className="mt-4"
                onClick={handleQualityControlComplete}
                disabled={isGeneratingPassport}
              >
                {isGeneratingPassport ? (
                  <>
                    <ClipboardCheck className="h-4 w-4 mr-2 animate-spin" />
                    Generating Passport...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Generate Product Passport
                  </>
                )}
              </Button>
            )}
          </div>
        )
      case 'product-passport':
        const passport = generatedPassportId ? productPassports.find(p => p.id === generatedPassportId) : null
        return (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Passport Generated!</h3>
            <p className="text-muted-foreground mb-6">
              Your product passport has been created successfully
            </p>
            
            {passport && (
              <div className="max-w-md mx-auto bg-muted/20 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  {passport.qr_image_url ? (
                    <img 
                      src={passport.qr_image_url} 
                      alt="Product QR Code"
                      className="w-24 h-24 object-contain border rounded bg-white p-1"
                    />
                  ) : (
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  )}
                </div>
                <h4 className="font-semibold mb-2">{passport.product_name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Carbon Footprint: {passport.total_carbon_footprint.toFixed(2)} kg CO₂
                </p>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date(passport.production_date).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.hash = '#passport'}
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Passports
              </Button>
              {passport && (
                <Button 
                  onClick={() => {
                    if (passport.qr_code) {
                      window.open(passport.qr_code, '_blank')
                    }
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  View Passport Details
                </Button>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Wizard</h1>
            <p className="text-muted-foreground">Complete workflow from concept to product passport</p>
            {selectedProject && (
              <div className="mt-2 flex items-center gap-4">
                <p className="text-sm text-primary">
                  Current Project: {projects.find(p => p.id === selectedProject)?.name}
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedProject(null)
                    setGeneratedPassportId(null)
                    setCurrentStep(0)
                  }}
                >
                  Change Project
                </Button>
              </div>
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
                  {React.createElement(steps[currentStep].icon, { className: "h-6 w-6 text-primary" })}
                  <div>
                    <CardTitle>{steps[currentStep].title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {steps[currentStep].description}
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

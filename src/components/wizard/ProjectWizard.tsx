
import React, { useState, useEffect, useCallback } from 'react'
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
import { useManufacturingStages } from '@/hooks/useManufacturingStages'
import { ProjectsManager } from '@/components/projects/ProjectsManager'
import { DesignBOMManager } from '@/components/design/DesignBOMManager'
import { ProductionManager } from '@/components/production/ProductionManager'
import { QualityControlStep } from './steps/QualityControlStep'
import { ProductPassportStep } from './steps/ProductPassportStep'
import { ProductPassportDetailView } from '@/components/passport/ProductPassportDetailView'
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
  const [showPassportDetail, setShowPassportDetail] = useState(false)
  const [isSelectingProject, setIsSelectingProject] = useState(false)
  
  const { projects, updateProject, refreshProjects } = useProjects()
  const { generateProductPassport, productPassports } = useProductPassports()
  const { stages, fetchStages } = useManufacturingStages()
  const { toast } = useToast()

  const getProjectSteps = (): WizardStep[] => {
    const project = selectedProject ? projects.find(p => p.id === selectedProject) : null
    
    // Check if all manufacturing stages are completed
    const allStagesCompleted = stages.length > 0 && stages.every(stage => stage.status === 'completed' && stage.progress === 100)
    
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
        status: project?.status === 'in_progress' && !allStagesCompleted ? 'current' :
               allStagesCompleted ? 'completed' : 'upcoming',
        allowAccess: project?.status === 'in_progress' || project?.status === 'completed' || allStagesCompleted
      },
      {
        id: 'quality-control',
        title: 'Quality Control',
        description: 'Final inspection and testing',
        icon: ClipboardCheck,
        status: allStagesCompleted && !generatedPassportId ? 'current' : 
               generatedPassportId ? 'completed' : 'upcoming',
        allowAccess: allStagesCompleted
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

  useEffect(() => {
    if (selectedProject && productPassports.length > 0) {
      const existingPassport = productPassports.find(p => p.project_id === selectedProject)
      if (existingPassport && !generatedPassportId) {
        setGeneratedPassportId(existingPassport.id)
        setCurrentStep(5)
      }
    }
  }, [selectedProject, productPassports, generatedPassportId])

  useEffect(() => {
    if (selectedProject) {
      fetchStages(selectedProject)
    }
  }, [selectedProject, fetchStages])

  const handleProjectSelect = async (projectId: string) => {
    setIsSelectingProject(true)
    console.log('ProjectWizard: Selecting project:', projectId)
    
    try {
      // Force refresh projects to ensure latest data
      console.log('ProjectWizard: Refreshing projects list...')
      await refreshProjects()
      
      // Add a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Check current projects state and log for debugging
      console.log('ProjectWizard: Current projects in state:', projects.map(p => ({ id: p.id, name: p.name })))
      
      // Try to find the project with additional debugging
      let project = projects.find(p => p.id === projectId)
      let retryCount = 0
      const maxRetries = 5 // Increased retries
      
      while (!project && retryCount < maxRetries) {
        console.log(`ProjectWizard: Project not found, retrying... (${retryCount + 1}/${maxRetries})`)
        console.log(`ProjectWizard: Looking for project ID: ${projectId}`)
        console.log(`ProjectWizard: Available project IDs: ${projects.map(p => p.id).join(', ')}`)
        
        await new Promise(resolve => setTimeout(resolve, 500)) // Increased delay
        await refreshProjects()
        project = projects.find(p => p.id === projectId)
        retryCount++
      }
      
      if (!project) {
        console.error('ProjectWizard: Project not found after retries:', projectId)
        console.error('ProjectWizard: Available projects:', projects)
        
        // Try one final refresh with longer delay
        console.log('ProjectWizard: Attempting final refresh...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        await refreshProjects()
        project = projects.find(p => p.id === projectId)
        
        if (!project) {
          toast({
            title: "Error",
            description: "Project not found. The project may have been created but not yet synchronized. Please try refreshing the page.",
            variant: "destructive"
          })
          return
        }
      }

      console.log('ProjectWizard: Project found successfully:', project.name, 'Status:', project.status)
      setSelectedProject(projectId)
      
      // Check if product passport already exists
      const existingPassport = productPassports.find(p => p.project_id === projectId)
      if (existingPassport) {
        setGeneratedPassportId(existingPassport.id)
        setCurrentStep(5) // Product passport step
        console.log('ProjectWizard: Found existing passport, moving to step 5')
        return
      }

      // No automatic step progression - user controls navigation
      console.log('ProjectWizard: Project selected successfully, staying on current step')
      
      toast({
        title: "Project Selected",
        description: `${project.name} is now active in the wizard`,
      })
    } catch (error) {
      console.error('ProjectWizard: Error selecting project:', error)
      toast({
        title: "Error",
        description: "Failed to select project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSelectingProject(false)
    }
  }

  const handleBOMComplete = async () => {
    if (selectedProject) {
      await updateProject(selectedProject, { status: 'design' })
      toast({
        title: "BOM Complete",
        description: "Bill of Materials completed successfully. You can now proceed to Production Planning.",
      })
    }
  }

  const handleProductionStart = async () => {
    if (selectedProject) {
      setCurrentStep(3)
    }
  }

  const handleManufacturingComplete = async () => {
    if (selectedProject) {
      const allStagesCompleted = stages.every(stage => stage.status === 'completed' && stage.progress === 100)
      if (allStagesCompleted) {
        await updateProject(selectedProject, { status: 'completed', progress: 100 })
        setCurrentStep(4)
        toast({
          title: "Manufacturing Complete",
          description: "All manufacturing stages have been completed successfully!"
        })
      }
    }
  }

  const handleQualityControlComplete = async (productImageUrl?: string) => {
    if (!selectedProject) return

    const project = projects.find(p => p.id === selectedProject)
    if (!project) return

    setIsGeneratingPassport(true)
    try {
      const projectMaterials = project.allocated_materials || []
      const materialsData = projectMaterials.map(materialId => {
        return { id: materialId, name: 'Material', type: 'Unknown', quantity: 1, unit: 'unit', carbon_footprint: 0 }
      })

      const manufacturingStages = stages.map(stage => ({
        name: stage.name,
        estimated_hours: stage.estimated_hours,
        actual_hours: stage.actual_hours,
        energy_consumed: stage.actual_energy,
        completed_date: stage.completed_date
      }))

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
          progress: project.progress,
          materials_used: materialsData,
          manufacturing_stages: manufacturingStages,
          product_image_url: productImageUrl
        }
      )

      if (passport) {
        if (productImageUrl) {
          console.log('Product image URL:', productImageUrl)
        }

        setGeneratedPassportId(passport.id)
        setCurrentStep(5)
        toast({
          title: "Success",
          description: "Product passport generated successfully!"
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

  const handleViewPassportDetails = () => {
    setShowPassportDetail(true)
  }

  const handleDownloadQR = async () => {
    const passport = generatedPassportId ? productPassports.find(p => p.id === generatedPassportId) : null
    if (passport?.qr_image_url) {
      try {
        const response = await fetch(passport.qr_image_url)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `product-qr-${passport.product_name}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading QR code:', error)
        toast({
          title: "Error",
          description: "Failed to download QR code",
          variant: "destructive"
        })
      }
    }
  }

  const goToStep = (stepIndex: number) => {
    if (steps[stepIndex].allowAccess) {
      setCurrentStep(stepIndex)
    }
  }

  const canAdvanceToNext = () => {
    const currentStepData = steps[currentStep]
    const nextStep = steps[currentStep + 1]
    
    if (!nextStep) return false
    
    return nextStep.allowAccess
  }

  const currentPassport = generatedPassportId ? productPassports.find(p => p.id === generatedPassportId) : null

  if (showPassportDetail && currentPassport) {
    return (
      <ProductPassportDetailView 
        productPassport={currentPassport}
        onBack={() => setShowPassportDetail(false)}
        onDownloadQR={handleDownloadQR}
      />
    )
  }

  const renderStepContent = () => {
    const currentStepData = steps[currentStep]
    
    switch (currentStepData.id) {
      case 'project-setup':
        return (
          <div>
            {isSelectingProject && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">Selecting project...</p>
              </div>
            )}
            <ProjectsManager onProjectSelect={handleProjectSelect} />
          </div>
        )
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
          <QualityControlStep
            selectedProject={selectedProject}
            generatedPassportId={generatedPassportId}
            isGeneratingPassport={isGeneratingPassport}
            onQualityControlComplete={handleQualityControlComplete}
          />
        )
      case 'product-passport':
        return (
          <ProductPassportStep
            passport={currentPassport}
            onViewDetails={handleViewPassportDetails}
            onDownloadQR={handleDownloadQR}
          />
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
                    setShowPassportDetail(false)
                  }}
                >
                  Change Project
                </Button>
              </div>
            )}
          </div>

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
                    disabled={currentStep === steps.length - 1 || !canAdvanceToNext()}
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

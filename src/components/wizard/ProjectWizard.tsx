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
import { supabase } from '@/integrations/supabase/client'
import type { Project } from '@/hooks/useProjects'

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
  const [bomCompleted, setBomCompleted] = useState(false)
  
  const { projects, updateProject, refreshProjects } = useProjects()
  const { generateProductPassport, productPassports } = useProductPassports()
  const { stages, fetchStages } = useManufacturingStages()
  const { toast } = useToast()

  // Direct database query function to fetch project by ID
  const fetchProjectById = async (projectId: string): Promise<Project | null> => {
    try {
      console.log('ProjectWizard: Fetching project directly from database:', projectId)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('deleted', false)
        .maybeSingle()
      if (error) {
        console.error('ProjectWizard: Database query error:', error)
        return null
      }
      if (!data) {
        console.log('ProjectWizard: No project found for id:', projectId)
        return null
      }
      // Return the data as a Project type, ensuring all fields are properly typed
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        status: data.status || 'planning',
        progress: data.progress || 0,
        total_cost: data.total_cost || 0,
        total_carbon_footprint: data.total_carbon_footprint || 0,
        start_date: data.start_date,
        completion_date: data.completion_date,
        allocated_materials: data.allocated_materials || [],
        deleted: data.deleted || false,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      } as Project
    } catch (error) {
      console.error('ProjectWizard: Error fetching project from database:', error)
      return null
    }
  }

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
        status: project && (project.status === 'design' || project.status === 'in_progress' || project.status === 'completed') ? 'completed' : 
               project && currentStep === 1 ? 'current' : 'upcoming',
        allowAccess: !!project
      },
      {
        id: 'production-planning',
        title: 'Production Planning',
        description: 'Plan manufacturing stages',
        icon: Workflow,
        status: project?.status === 'design' && currentStep === 2 ? 'current' :
               project?.status === 'design' ? 'current' :
               (project?.status === 'in_progress' || project?.status === 'completed') ? 'completed' : 'upcoming',
        allowAccess: project && (project.status === 'design' || project.status === 'in_progress' || project.status === 'completed') || bomCompleted
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

  // Effect to listen for project status changes
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject)
      if (project) {
        // Update bomCompleted state based on project status
        if (project.status === 'design' || project.status === 'in_progress' || project.status === 'completed') {
          setBomCompleted(true)
        }
      }
    }
  }, [selectedProject, projects])

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
      // First, try to get the project directly from the database
      let project = await fetchProjectById(projectId)
      // If not found in database, refresh local state and try local state
      if (!project) {
        console.log('ProjectWizard: Project not found in database, refreshing local state...')
        await refreshProjects()
        await new Promise(resolve => setTimeout(resolve, 500))
        project = projects.find(p => p.id === projectId)
        if (!project) {
          // Try database one more time
          project = await fetchProjectById(projectId)
        }
      }
      if (!project) {
        console.error('ProjectWizard: Project not found:', projectId)
        toast({
          title: "Error",
          description: "Project not found. The project may have been deleted or there was an error during creation.",
          variant: "destructive"
        })
        return
      }
      console.log('ProjectWizard: Project found successfully:', project.name, 'Status:', project.status)
      setSelectedProject(projectId)
      
      // Check if product passport already exists
      const existingPassport = productPassports.find(p => p.project_id === projectId)
      if (existingPassport) {
        setGeneratedPassportId(existingPassport.id)
        setCurrentStep(5) // Product passport step
        console.log('ProjectWizard: Found existing passport, moving to step 5')
        toast({
          title: "Project Selected",
          description: `${project.name} is active. Viewing existing product passport.`,
        })
        return
      }

      // Check if BOM is already completed
      if (project.status === 'design' || project.status === 'in_progress' || project.status === 'completed') {
        setBomCompleted(true)
      }

      // Smart auto-progression based on project status
      let targetStep = 0
      let progressMessage = ""

      switch (project.status) {
        case 'planning':
          targetStep = 1 // BOM Creation
          progressMessage = `${project.name} is active. Moving to BOM Creation.`
          break
        case 'design':
          targetStep = 2 // Production Planning
          progressMessage = `${project.name} is active. Moving to Production Planning.`
          break
        case 'in_progress':
          targetStep = 3 // Manufacturing
          progressMessage = `${project.name} is active. Moving to Manufacturing.`
          break
        case 'completed':
          targetStep = 4 // Quality Control
          progressMessage = `${project.name} is active. Moving to Quality Control.`
          break
        default:
          targetStep = 1 // Default to BOM Creation for unknown status
          progressMessage = `${project.name} is active. Moving to BOM Creation.`
      }

      setCurrentStep(targetStep)
      console.log(`ProjectWizard: Auto-advancing to step ${targetStep} based on project status: ${project.status}`)
      
      toast({
        title: "Project Selected",
        description: progressMessage,
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
      setBomCompleted(true)
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
    
    // Special case for BOM Creation step - enable next if BOM is completed
    if (currentStep === 1 && bomCompleted) {
      return true
    }
    
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
                    setBomCompleted(false)
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

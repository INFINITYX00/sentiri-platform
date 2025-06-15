
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Workflow, Package, Lightbulb } from "lucide-react"
import { EnhancedBOMUploader } from "../bom/EnhancedBOMUploader"
import { StepByStepBOM } from "../bom/StepByStepBOM"

export function DesignBOMManager() {
  const [activeTab, setActiveTab] = useState<'guided' | 'upload' | 'templates'>('guided')

  const designStats = [
    { label: "Active BOMs", value: "12", icon: FileText, color: "text-blue-400" },
    { label: "Material Types", value: "8", icon: Package, color: "text-purple-400" },
    { label: "Templates", value: "5", icon: Lightbulb, color: "text-green-400" },
    { label: "In Progress", value: "3", icon: Workflow, color: "text-orange-400" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Design & BOM</h1>
            <p className="text-muted-foreground">Create Bills of Materials and design manufacturing workflows</p>
          </div>
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

          {/* Navigation Tabs */}
          <Card>
            <CardContent className="p-6">
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
              {activeTab === 'guided' && <StepByStepBOM />}
              {activeTab === 'upload' && <EnhancedBOMUploader />}
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
      </div>
    </div>
  )
}


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Workflow, Package } from "lucide-react";
import { EnhancedBOMUploader } from "./EnhancedBOMUploader";
import { StepByStepBOM } from "./StepByStepBOM";

export function BOMManager() {
  const [activeTab, setActiveTab] = useState<'guided' | 'upload'>('guided');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const bomStats = [
    { label: "Active BOMs", value: "12", icon: FileText, color: "text-blue-400" },
    { label: "Total Materials", value: "156", icon: Package, color: "text-purple-400" },
    { label: "Completed BOMs", value: "28", icon: Workflow, color: "text-green-400" },
    { label: "Templates", value: "8", icon: Upload, color: "text-orange-400" }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient">Bill of Materials</h1>
          <p className="text-muted-foreground">Create and manage Bills of Materials for your projects</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bomStats.map((stat) => (
          <Card key={stat.label} className="professional-card hover-lift">
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

      {!selectedProjectId ? (
        <Card className="professional-card">
          <CardContent className="p-6 text-center space-y-6">
            <Package className="h-16 w-16 text-muted-foreground mx-auto animate-fade-in" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gradient">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please go to the Design & BOM section to select a project and create a BOM
              </p>
            </div>
            <Button onClick={() => window.location.hash = 'design-bom'} className="hover-lift">
              Go to Design & BOM
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="professional-card">
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={activeTab === 'guided' ? 'default' : 'outline'}
                onClick={() => setActiveTab('guided')}
                className="flex-1 min-w-[120px]"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Guided Setup
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'outline'}
                onClick={() => setActiveTab('upload')}
                className="flex-1 min-w-[120px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Advanced BOM
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'guided' && <StepByStepBOM projectId={selectedProjectId} />}
            {activeTab === 'upload' && <EnhancedBOMUploader projectId={selectedProjectId} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

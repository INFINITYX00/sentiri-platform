
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FolderOpen, Workflow, Package } from "lucide-react";
import { EnhancedBOMUploader } from "./EnhancedBOMUploader";
import { StepByStepBOM } from "./StepByStepBOM";
import { ProjectsManager } from "../projects/ProjectsManager";

export function BOMManager() {
  const [activeTab, setActiveTab] = useState<'projects' | 'guided' | 'upload'>('guided');

  const projectStats = [
    { label: "Active Projects", value: "8", icon: FolderOpen, color: "text-blue-400" },
    { label: "Total Materials", value: "156", icon: Package, color: "text-purple-400" },
    { label: "Completed BOMs", value: "12", icon: FileText, color: "text-green-400" },
    { label: "In Progress", value: "5", icon: Workflow, color: "text-orange-400" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage projects, create BOMs and track manufacturing</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {projectStats.map((stat) => (
          <Card key={stat.label} className="sentiri-card">
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
      <Card className="sentiri-card">
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
              variant={activeTab === 'projects' ? 'default' : 'outline'}
              onClick={() => setActiveTab('projects')}
              className="flex-1 min-w-[120px]"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
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
          {activeTab === 'guided' && <StepByStepBOM />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'upload' && <EnhancedBOMUploader />}
        </CardContent>
      </Card>
    </div>
  );
}

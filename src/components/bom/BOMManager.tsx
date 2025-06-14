
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, TrendingUp, Leaf, FolderOpen } from "lucide-react";
import { CarbonCalculator } from "./CarbonCalculator";
import { CarbonJourney } from "./CarbonJourney";
import { EnhancedBOMUploader } from "./EnhancedBOMUploader";
import { ProjectsManager } from "../projects/ProjectsManager";

export function BOMManager() {
  const [activeTab, setActiveTab] = useState<'projects' | 'upload' | 'calculate' | 'journey'>('projects');

  const bomStats = [
    { label: "Active Projects", value: "8", icon: FolderOpen, color: "text-blue-400" },
    { label: "Avg Carbon Impact", value: "12.3 kg CO₂", icon: Leaf, color: "text-primary" },
    { label: "Cost Savings", value: "$2,340", icon: TrendingUp, color: "text-green-400" },
    { label: "Materials Tracked", value: "156", icon: Upload, color: "text-purple-400" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BOM & Carbon Journey</h1>
          <p className="text-muted-foreground mt-1">Manage projects, track materials and calculate carbon footprint</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bomStats.map((stat) => (
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
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'projects' ? 'default' : 'outline'}
              onClick={() => setActiveTab('projects')}
              className="flex-1"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
            <Button
              variant={activeTab === 'upload' ? 'default' : 'outline'}
              onClick={() => setActiveTab('upload')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Create BOM
            </Button>
            <Button
              variant={activeTab === 'calculate' ? 'default' : 'outline'}
              onClick={() => setActiveTab('calculate')}
              className="flex-1"
            >
              <Leaf className="h-4 w-4 mr-2" />
              Carbon Calculator
            </Button>
            <Button
              variant={activeTab === 'journey' ? 'default' : 'outline'}
              onClick={() => setActiveTab('journey')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Carbon Journey
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'upload' && <EnhancedBOMUploader />}
          {activeTab === 'calculate' && <CarbonCalculator />}
          {activeTab === 'journey' && <CarbonJourney />}
        </CardContent>
      </Card>
    </div>
  );
}

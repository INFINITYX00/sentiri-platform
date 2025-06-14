
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PenTool, 
  Wrench, 
  Hammer, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap
} from "lucide-react";

interface Stage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  energyEstimate: number; // kWh
  actualEnergy: number;
  workers: string[];
  startDate?: string;
  completedDate?: string;
  notes: string;
}

interface ManufacturingStagesProps {
  projectId: string;
  onStageUpdate: (stages: Stage[]) => void;
}

export function ManufacturingStages({ projectId, onStageUpdate }: ManufacturingStagesProps) {
  const [stages, setStages] = useState<Stage[]>([
    {
      id: "design",
      name: "Design & Planning",
      status: "completed",
      progress: 100,
      estimatedHours: 6,
      actualHours: 5.5,
      energyEstimate: 2.2,
      actualEnergy: 2.0,
      workers: ["Sarah Chen"],
      startDate: "2024-01-15",
      completedDate: "2024-01-15",
      notes: "CAD modeling and material optimization completed"
    },
    {
      id: "machining",
      name: "Machining & Cutting",
      status: "in-progress",
      progress: 75,
      estimatedHours: 8,
      actualHours: 6.0,
      energyEstimate: 15.5,
      actualEnergy: 12.3,
      workers: ["Mike Rodriguez", "David Wilson"],
      startDate: "2024-01-16",
      notes: "Table saw and planer operations in progress"
    },
    {
      id: "assembly",
      name: "Assembly",
      status: "pending",
      progress: 0,
      estimatedHours: 4,
      actualHours: 0,
      energyEstimate: 3.2,
      actualEnergy: 0,
      workers: ["Anna Thompson"],
      notes: "Waiting for machining completion"
    },
    {
      id: "finishing",
      name: "Finishing & QC",
      status: "pending",
      progress: 0,
      estimatedHours: 6,
      actualHours: 0,
      energyEstimate: 8.8,
      actualEnergy: 0,
      workers: ["Emma Davis", "Sarah Chen"],
      notes: "Sanding, oiling, and quality control"
    }
  ]);

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'design': return PenTool;
      case 'machining': return Wrench;
      case 'assembly': return Hammer;
      case 'finishing': return Sparkles;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'blocked': return AlertCircle;
      default: return Clock;
    }
  };

  const updateStageProgress = (stageId: string, progress: number) => {
    const updatedStages = stages.map(stage => 
      stage.id === stageId 
        ? { ...stage, progress, status: progress === 100 ? 'completed' as const : 'in-progress' as const }
        : stage
    );
    setStages(updatedStages);
    onStageUpdate(updatedStages);
  };

  const totalEstimatedHours = stages.reduce((sum, stage) => sum + stage.estimatedHours, 0);
  const totalActualHours = stages.reduce((sum, stage) => sum + stage.actualHours, 0);
  const totalEstimatedEnergy = stages.reduce((sum, stage) => sum + stage.energyEstimate, 0);
  const totalActualEnergy = stages.reduce((sum, stage) => sum + stage.actualEnergy, 0);
  const overallProgress = stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Progress</p>
                <p className="text-xl font-bold">{totalActualHours}h / {totalEstimatedHours}h</p>
              </div>
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Used</p>
                <p className="text-xl font-bold">{totalActualEnergy}kWh / {totalEstimatedEnergy}kWh</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="sentiri-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{Math.round((totalEstimatedHours / Math.max(totalActualHours, 1)) * 100)}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturing Timeline */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hammer className="h-5 w-5 text-primary" />
            <span>Manufacturing Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.map((stage, index) => {
            const StageIcon = getStageIcon(stage.id);
            const StatusIcon = getStatusIcon(stage.status);
            
            return (
              <div key={stage.id} className="relative">
                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                )}
                
                <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg border">
                  <div className={`p-3 rounded-full ${getStatusColor(stage.status)} text-white`}>
                    <StageIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{stage.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(stage.status)} text-white border-0`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {stage.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {stage.actualHours}h / {stage.estimatedHours}h • {stage.actualEnergy}kWh / {stage.energyEstimate}kWh
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{stage.progress}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Workers: </span>
                          <span>{stage.workers.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timeline: </span>
                          <span>
                            {stage.startDate && new Date(stage.startDate).toLocaleDateString()}
                            {stage.completedDate && ` - ${new Date(stage.completedDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{stage.notes}</p>
                      
                      {stage.status === 'in-progress' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStageProgress(stage.id, Math.min(100, stage.progress + 25))}
                          >
                            +25% Progress
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => updateStageProgress(stage.id, 100)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

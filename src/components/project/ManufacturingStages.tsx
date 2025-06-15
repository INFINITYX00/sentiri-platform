import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  PenTool, 
  Wrench, 
  Hammer, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Play,
  Pause,
  Plus
} from "lucide-react";
import { useManufacturingStages, ManufacturingStage } from '@/hooks/useManufacturingStages';
import { ManufacturingStagesSkeleton } from '@/components/manufacturing/ManufacturingStagesSkeleton';

interface ManufacturingStagesProps {
  projectId: string;
  onStageUpdate: (stages: ManufacturingStage[]) => void;
}

export function ManufacturingStages({ projectId, onStageUpdate }: ManufacturingStagesProps) {
  const { stages, loading, updateStage, fetchStages, createDefaultStages } = useManufacturingStages();
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [isCreatingStages, setIsCreatingStages] = useState(false);
  const [editForm, setEditForm] = useState({
    actual_hours: 0,
    actual_energy: 0,
    notes: '',
    workers: [] as string[]
  });

  // Memoized debounced stage update callback
  const debouncedOnStageUpdate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (stages: ManufacturingStage[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => onStageUpdate(stages), 300);
      };
    })(),
    [onStageUpdate]
  );

  // Fetch stages only when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchStages(projectId);
    }
  }, [projectId, fetchStages]);

  // Update parent component when stages change (debounced)
  useEffect(() => {
    if (stages.length > 0) {
      debouncedOnStageUpdate(stages);
    }
  }, [stages, debouncedOnStageUpdate]);

  const handleCreateDefaultStages = async () => {
    setIsCreatingStages(true);
    try {
      await createDefaultStages(projectId);
      await fetchStages(projectId); // Refresh the stages list
    } finally {
      setIsCreatingStages(false);
    }
  };

  // Memoized calculations to prevent unnecessary re-renders
  const stageMetrics = useMemo(() => {
    const totalEstimatedHours = stages.reduce((sum, stage) => sum + stage.estimated_hours, 0);
    const totalActualHours = stages.reduce((sum, stage) => sum + stage.actual_hours, 0);
    const totalEstimatedEnergy = stages.reduce((sum, stage) => sum + stage.energy_estimate, 0);
    const totalActualEnergy = stages.reduce((sum, stage) => sum + stage.actual_energy, 0);
    const overallProgress = stages.length > 0 ? stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length : 0;
    const efficiency = Math.round((totalEstimatedHours / Math.max(totalActualHours, 1)) * 100);

    return {
      totalEstimatedHours,
      totalActualHours,
      totalEstimatedEnergy,
      totalActualEnergy,
      overallProgress,
      efficiency
    };
  }, [stages]);

  const getStageIcon = useCallback((stageId: string) => {
    switch (stageId) {
      case 'planning': return PenTool;
      case 'material_prep': return Wrench;
      case 'manufacturing': return Hammer;
      case 'assembly': return Hammer;
      case 'quality_control': return CheckCircle;
      case 'finishing': return Sparkles;
      default: return Clock;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'blocked': return AlertCircle;
      default: return Clock;
    }
  }, []);

  const handleStartStage = useCallback(async (stage: ManufacturingStage) => {
    await updateStage(stage.id, {
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0]
    });
  }, [updateStage]);

  const handleCompleteStage = useCallback(async (stage: ManufacturingStage) => {
    await updateStage(stage.id, {
      status: 'completed',
      progress: 100,
      completed_date: new Date().toISOString().split('T')[0]
    });
  }, [updateStage]);

  const handleProgressUpdate = useCallback(async (stage: ManufacturingStage, progress: number) => {
    const newProgress = Math.min(100, Math.max(0, progress));
    await updateStage(stage.id, {
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : 'in_progress'
    });
  }, [updateStage]);

  const handleEditStage = useCallback((stage: ManufacturingStage) => {
    setEditingStage(stage.id);
    setEditForm({
      actual_hours: stage.actual_hours,
      actual_energy: stage.actual_energy,
      notes: stage.notes || '',
      workers: stage.workers
    });
  }, []);

  const handleSaveEdit = useCallback(async (stageId: string) => {
    await updateStage(stageId, editForm);
    setEditingStage(null);
  }, [updateStage, editForm]);

  // Show skeleton while loading
  if (loading) {
    return <ManufacturingStagesSkeleton />;
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Manufacturing Stages</h3>
        <p className="text-muted-foreground mb-6">
          Create manufacturing stages to start tracking your production process.
        </p>
        <Button 
          onClick={handleCreateDefaultStages}
          disabled={isCreatingStages}
          size="lg"
        >
          {isCreatingStages ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Stages...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Manufacturing Stages
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{Math.round(stageMetrics.overallProgress)}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Progress</p>
                <p className="text-xl font-bold">{stageMetrics.totalActualHours}h / {stageMetrics.totalEstimatedHours}h</p>
              </div>
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Used</p>
                <p className="text-xl font-bold">{stageMetrics.totalActualEnergy}kWh / {stageMetrics.totalEstimatedEnergy}kWh</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{stageMetrics.efficiency}%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturing Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hammer className="h-5 w-5 text-primary" />
            <span>Manufacturing Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stages.map((stage, index) => {
            const StageIcon = getStageIcon(stage.stage_id);
            const StatusIcon = getStatusIcon(stage.status);
            const isEditing = editingStage === stage.id;
            
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
                        {stage.actual_hours}h / {stage.estimated_hours}h • {stage.actual_energy}kWh / {stage.energy_estimate}kWh
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
                      
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Actual Hours</label>
                            <Input
                              type="number"
                              value={editForm.actual_hours}
                              onChange={(e) => setEditForm({ ...editForm, actual_hours: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Actual Energy (kWh)</label>
                            <Input
                              type="number"
                              value={editForm.actual_energy}
                              onChange={(e) => setEditForm({ ...editForm, actual_energy: Number(e.target.value) })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Workers: </span>
                            <span>{stage.workers.join(', ') || 'None assigned'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeline: </span>
                            <span>
                              {stage.start_date && new Date(stage.start_date).toLocaleDateString()}
                              {stage.completed_date && ` - ${new Date(stage.completed_date).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {stage.notes && !isEditing && (
                        <p className="text-sm text-muted-foreground">{stage.notes}</p>
                      )}
                      
                      <div className="flex gap-2 flex-wrap">
                        {stage.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartStage(stage)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Stage
                          </Button>
                        )}
                        
                        {stage.status === 'in_progress' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleProgressUpdate(stage, stage.progress + 25)}
                            >
                              +25% Progress
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteStage(stage)}
                            >
                              Mark Complete
                            </Button>
                          </>
                        )}
                        
                        {isEditing ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveEdit(stage.id)}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingStage(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditStage(stage)}
                          >
                            Edit Details
                          </Button>
                        )}
                      </div>
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

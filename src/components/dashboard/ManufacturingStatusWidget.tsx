
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight, Users } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface ManufacturingStage {
  id: string
  name: string
  project_name: string
  status: string
  progress: number
  workers: string[]
}

interface ManufacturingStatusWidgetProps {
  stages: ManufacturingStage[]
}

export function ManufacturingStatusWidget({ stages }: ManufacturingStatusWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  };

  const handleViewProduction = () => {
    window.location.hash = '#production';
  };

  return (
    <DashboardWidget title="Manufacturing Status" icon={<Settings className="h-4 w-4" />}>
      <div className="space-y-3">
        {stages.length > 0 ? (
          <>
            {stages.map((stage) => (
              <div key={stage.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{stage.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{stage.project_name}</p>
                  </div>
                  <Badge className={getStatusColor(stage.status)} variant="outline">
                    {stage.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {stage.status === 'in_progress' && (
                  <Progress value={stage.progress} className="h-2" />
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {stage.status === 'in_progress' && (
                    <span>{stage.progress}% complete</span>
                  )}
                  {stage.workers.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{stage.workers.length} worker{stage.workers.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={handleViewProduction}
            >
              View Production <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active manufacturing stages</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}


import { Button } from "@/components/ui/button";
import { Plus, Package, Zap } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

export function QuickActionsWidget() {
  const handleNewProject = () => {
    window.location.hash = '#wizard';
  };

  const handleAddMaterial = () => {
    window.location.hash = '#stock';
  };

  return (
    <DashboardWidget title="Quick Actions" icon={<Zap className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-auto p-3 flex flex-col gap-1"
          onClick={handleNewProject}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">New Project</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-auto p-3 flex flex-col gap-1"
          onClick={handleAddMaterial}
        >
          <Package className="h-4 w-4" />
          <span className="text-xs">Add Material</span>
        </Button>
      </div>
    </DashboardWidget>
  )
}

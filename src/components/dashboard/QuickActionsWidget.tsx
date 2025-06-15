
import { Button } from "@/components/ui/button";
import { Plus, Upload, Zap, Package } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

export function QuickActionsWidget() {
  return (
    <DashboardWidget title="Quick Actions" icon={<Zap className="h-4 w-4" />}>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
          <Plus className="h-4 w-4" />
          <span className="text-xs">New Project</span>
        </Button>
        <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
          <Package className="h-4 w-4" />
          <span className="text-xs">Add Material</span>
        </Button>
        <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1 col-span-2">
          <Upload className="h-4 w-4" />
          <span className="text-xs">Import BOM</span>
        </Button>
      </div>
    </DashboardWidget>
  )
}

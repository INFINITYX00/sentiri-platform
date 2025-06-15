
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  type: string
}

interface StockAlertsWidgetProps {
  stockAlerts: StockItem[]
}

export function StockAlertsWidget({ stockAlerts }: StockAlertsWidgetProps) {
  const handleManageStock = () => {
    window.location.hash = '#stock';
  };

  return (
    <DashboardWidget title="Stock Alerts" icon={<AlertTriangle className="h-4 w-4" />}>
      <div className="space-y-3">
        {stockAlerts.length > 0 ? (
          <>
            {stockAlerts.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-xs">
                    {item.quantity} {item.unit} available
                  </Badge>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground px-2">
              Showing materials with &lt; 10 available units (after allocations)
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={handleManageStock}
            >
              Manage Stock <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All stock levels healthy</p>
            <p className="text-xs mt-1">No materials below 10 available units</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Leaf, Package } from "lucide-react";
import { DashboardWidget } from "./DashboardWidget";

interface Passport {
  id: string
  product_name: string
  total_carbon_footprint: number
  production_date: string
  image_url?: string
  specifications?: any
}

interface RecentPassportsWidgetProps {
  passports: Passport[]
}

export function RecentPassportsWidget({ passports }: RecentPassportsWidgetProps) {
  return (
    <DashboardWidget title="Recent Passports" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-3">
        {passports.length > 0 ? (
          <>
            {passports.map((passport) => (
              <div key={passport.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Product Image */}
                  {passport.image_url ? (
                    <img 
                      src={passport.image_url} 
                      alt={passport.product_name}
                      className="w-8 h-8 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{passport.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(passport.production_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Leaf className="h-3 w-3 text-primary" />
                  <span>{passport.total_carbon_footprint.toFixed(1)} kg</span>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.hash = '#passport'}
            >
              View All Passports <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No passports generated yet</p>
          </div>
        )}
      </div>
    </DashboardWidget>
  )
}


import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Eye, 
  QrCode, 
  Trash2, 
  Edit,
  DollarSign, 
  Database,
  Sparkles,
  Boxes,
  Users
} from "lucide-react"
import { Material } from "@/lib/supabase"
import { MaterialAllocation } from "@/hooks/useStockAllocations"
import { generateSimpleQRCode } from "@/utils/qrGenerator"
import { StockStatusBadge } from "./StockStatusBadge"

interface MaterialStockCardProps {
  material: Material
  allocation?: MaterialAllocation
  onViewQR: (material: Material) => void
  onViewMaterial: (materialId: string) => void
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

export function MaterialStockCard({ 
  material, 
  allocation, 
  onViewQR, 
  onViewMaterial, 
  onEdit,
  onDelete 
}: MaterialStockCardProps) {
  const unitsTotal = material.unit_count || 1
  const unitsAllocated = allocation?.total_allocated || 0
  const unitsAvailable = Math.max(0, unitsTotal - unitsAllocated)

  return (
    <Card className="sentiri-card hover:border-accent/30 transition-all duration-200 group">
      <div className="relative">
        {material.image_url ? (
          <img 
            src={material.image_url} 
            alt={material.name}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-48 bg-muted rounded-t-xl flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <StockStatusBadge unitsTotal={unitsTotal} unitsAvailable={unitsAvailable} />
        </div>
        
        {/* QR Code Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {generateSimpleQRCode(material.id)}
          </Badge>
        </div>
        
        {/* AI Data Indicator */}
        {material.ai_carbon_confidence && (
          <div className="absolute bottom-3 left-3">
            <Badge 
              variant="secondary" 
              className="h-6 px-2 bg-purple-100 text-purple-700 border-purple-200"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI {Math.round(material.ai_carbon_confidence * 100)}%
            </Badge>
          </div>
        )}
        
        {/* QR Code Button */}
        {material.qr_image_url && (
          <div className="absolute bottom-3 right-3">
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
              onClick={() => onViewQR(material)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-semibold text-lg">{material.name}</h3>
            <p className="text-sm text-muted-foreground">
              {material.specific_material || material.type.charAt(0).toUpperCase() + material.type.slice(1)}
            </p>
          </div>
          
          {/* Stock Overview */}
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-1">
                <Boxes className="h-4 w-4" />
                Stock Overview
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Units</span>
                <div className="font-semibold text-lg">{unitsTotal}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Available</span>
                <div className="font-semibold text-lg text-green-600">{unitsAvailable}</div>
              </div>
            </div>
            
            {unitsAllocated > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Allocated: </span>
                <span className="font-medium text-orange-600">{unitsAllocated} units</span>
              </div>
            )}
          </div>
          
          {/* Cost Information */}
          {material.cost_per_unit && (
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Cost per Unit
              </span>
              <span className="font-semibold text-green-700">
                ${material.cost_per_unit.toFixed(2)}
              </span>
            </div>
          )}
          
          {/* Project Allocations */}
          {allocation && allocation.projects.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Used in Projects
              </span>
              <div className="space-y-1">
                {allocation.projects.slice(0, 2).map(project => (
                  <div key={project.id} className="text-xs bg-blue-50 rounded px-2 py-1">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {Math.max(0, project.quantity_required - project.quantity_consumed)} units
                    </span>
                  </div>
                ))}
                {allocation.projects.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{allocation.projects.length - 2} more projects
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Info */}
          <div className="space-y-2 pt-2 border-t">
            {material.origin && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Origin:</span>
                <span className="font-medium text-xs">{material.origin}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Carbon:</span>
              <span className="font-medium text-primary text-xs">
                {material.carbon_footprint.toFixed(1)} kg CO₂
              </span>
            </div>

            {material.carbon_source && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Source:
                </span>
                <span className="font-medium text-xs text-green-600">
                  {material.carbon_source}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewMaterial(material.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(material)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewQR(material)}
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(material)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

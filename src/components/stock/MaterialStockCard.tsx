
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
  Users,
  Brain,
  AlertTriangle
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
  const unitsTotal = material.quantity || 0
  const unitsAllocated = allocation?.total_allocated || 0
  const unitsAvailable = Math.max(0, unitsTotal - unitsAllocated)

  // Calculate per-unit carbon factor if we have total carbon and weight
  const estimatedWeight = material.weight || 1
  const carbonFactor = material.carbon_footprint && estimatedWeight 
    ? material.carbon_footprint / estimatedWeight 
    : 0

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-700 border-green-200"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

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
        
        <div className="absolute top-3 right-3">
          <StockStatusBadge unitsTotal={unitsTotal} unitsAvailable={unitsAvailable} />
        </div>
        
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {generateSimpleQRCode(material.id)}
          </Badge>
        </div>
        
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          {material.ai_carbon_confidence && (
            <Badge 
              variant="secondary" 
              className={`h-6 px-2 ${getConfidenceBadgeColor(material.ai_carbon_confidence)}`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI {Math.round(material.ai_carbon_confidence * 100)}%
              {material.ai_carbon_confidence < 0.6 && (
                <>
                  <AlertTriangle className="h-3 w-3 ml-1" />
                </>
              )}
            </Badge>
          )}
        </div>
        
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
          {/* Header Section */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">{material.name}</h3>
            <p className="text-sm text-muted-foreground">
              {material.specific_material || material.type.charAt(0).toUpperCase() + material.type.slice(1)}
            </p>
          </div>
          
          {/* Stock Overview Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Boxes className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Stock Overview</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Total Stock</div>
                <div className="font-bold text-lg text-foreground">{unitsTotal}</div>
                <div className="text-xs text-muted-foreground">{material.unit}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Available</div>
                <div className="font-bold text-lg text-green-600">{unitsAvailable}</div>
                <div className="text-xs text-muted-foreground">{material.unit}</div>
              </div>
            </div>
            
            {unitsAllocated > 0 && (
              <div className="text-center pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground mb-1">Allocated</div>
                <div className="font-semibold text-orange-600">{unitsAllocated} {material.unit}</div>
              </div>
            )}
          </div>
          
          {/* Cost Section */}
          {material.cost_per_unit && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Cost per {material.unit}</span>
                </div>
                <span className="font-bold text-green-700">${material.cost_per_unit.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Projects Section */}
          {allocation && allocation.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Active Projects</span>
              </div>
              <div className="space-y-2">
                {allocation.projects.slice(0, 2).map(project => (
                  <div key={project.id} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900 text-sm">{project.name}</span>
                      <span className="text-xs text-blue-600 font-medium">
                        {Math.max(0, project.quantity_required - project.quantity_consumed)} {material.unit}
                      </span>
                    </div>
                  </div>
                ))}
                {allocation.projects.length > 2 && (
                  <div className="text-center text-xs text-muted-foreground py-1">
                    +{allocation.projects.length - 2} more projects
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Carbon Impact Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Carbon Impact</span>
              </div>
              {material.ai_carbon_confidence && (
                <Badge 
                  variant="outline" 
                  className={`h-5 px-2 text-xs ${getConfidenceBadgeColor(material.ai_carbon_confidence)}`}
                >
                  <Sparkles className="h-2 w-2 mr-1" />
                  {Math.round(material.ai_carbon_confidence * 100)}%
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {carbonFactor > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Carbon Factor</span>
                  <span className="font-semibold text-blue-600 text-sm">
                    {carbonFactor.toFixed(3)} kg CO₂/kg
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Carbon</span>
                <span className="font-semibold text-primary text-sm">
                  {material.carbon_footprint.toFixed(1)} kg CO₂e
                </span>
              </div>

              {(material.carbon_source || material.ai_carbon_source) && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {material.ai_carbon_source ? (
                      <Brain className="h-3 w-3 text-blue-600" />
                    ) : (
                      <Database className="h-3 w-3 text-green-600" />
                    )}
                    <span className="text-sm text-muted-foreground">Data Source</span>
                  </div>
                  <span className={`font-medium text-sm ${material.ai_carbon_source ? 'text-blue-600' : 'text-green-600'}`}>
                    {material.ai_carbon_source || material.carbon_source}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Origin Section */}
          {material.origin && (
            <div className="flex justify-between items-center pt-3 border-t border-muted">
              <span className="text-sm text-muted-foreground">Origin</span>
              <span className="font-medium text-sm text-foreground">{material.origin}</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-muted">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewMaterial(material.id)}
              className="h-9"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(material)}
              className="h-9"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewQR(material)}
              className="h-9"
            >
              <QrCode className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(material)}
              className="hover:bg-destructive hover:text-destructive-foreground h-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

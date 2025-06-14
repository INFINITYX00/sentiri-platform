
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, Calendar, Leaf, Download, Eye } from "lucide-react"
import type { ProductPassport } from '@/hooks/useProductPassports'

interface ProductPassportCardProps {
  productPassport: ProductPassport
  onViewDetails?: (id: string) => void
  onDownloadQR?: (id: string) => void
}

export function ProductPassportCard({ 
  productPassport, 
  onViewDetails, 
  onDownloadQR 
}: ProductPassportCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{productPassport.product_name}</CardTitle>
          <Badge variant="secondary">{productPassport.product_type}</Badge>
        </div>
        {productPassport.project?.name && (
          <p className="text-sm text-muted-foreground">
            Project: {productPassport.project.name}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* QR Code Preview */}
        {productPassport.qr_image_url && (
          <div className="flex justify-center">
            <img 
              src={productPassport.qr_image_url} 
              alt="Product QR Code"
              className="w-24 h-24 border rounded"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span>{productPassport.quantity_produced} units</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span>{productPassport.total_carbon_footprint.toFixed(1)} kg CO₂</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span>Produced {formatDate(productPassport.production_date)}</span>
          </div>
        </div>

        {/* Material Composition */}
        {productPassport.specifications?.materials_used && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Materials Used:</h4>
            <div className="space-y-1">
              {productPassport.specifications.materials_used.slice(0, 3).map((material: any, index: number) => (
                <div key={index} className="text-xs text-muted-foreground flex justify-between">
                  <span>{material.name}</span>
                  <span>{material.quantity} {material.unit}</span>
                </div>
              ))}
              {productPassport.specifications.materials_used.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{productPassport.specifications.materials_used.length - 3} more materials
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewDetails && (
            <Button size="sm" variant="outline" onClick={() => onViewDetails(productPassport.id)}>
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
          )}
          {onDownloadQR && (
            <Button size="sm" variant="outline" onClick={() => onDownloadQR(productPassport.id)}>
              <Download className="h-4 w-4 mr-1" />
              QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

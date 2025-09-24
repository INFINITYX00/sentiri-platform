
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, Calendar, Leaf, Download, Eye, Factory, DollarSign } from "lucide-react"
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
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
        {/* Product Image */}
        {productPassport.image_url && (
          <div className="flex justify-center">
            <img 
              src={productPassport.image_url} 
              alt={productPassport.product_name}
              className="w-24 h-24 object-cover rounded border"
            />
          </div>
        )}

        {/* QR Code Preview */}
        {productPassport.qr_image_url && (
          <div className="flex justify-center">
            <img 
              src={productPassport.qr_image_url} 
              alt="Product QR Code"
              className="w-20 h-20 border rounded bg-white p-1"
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

        {/* Enhanced Information */}
        {productPassport.specifications && (
          <div className="border-t pt-3 space-y-2">
            {/* Total Cost */}
            {productPassport.specifications.total_cost && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Production Cost</span>
                </div>
                <span className="font-medium">{formatCurrency(productPassport.specifications.total_cost)}</span>
              </div>
            )}

            {/* Materials Count */}
            {productPassport.specifications.materials_used && productPassport.specifications.materials_used.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Materials Used</span>
                <span className="font-medium">{productPassport.specifications.materials_used.length} types</span>
              </div>
            )}

            {/* Manufacturing Stages */}
            {productPassport.specifications.manufacturing_stages && productPassport.specifications.manufacturing_stages.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-blue-600" />
                  <span>Manufacturing Stages</span>
                </div>
                <span className="font-medium">{productPassport.specifications.manufacturing_stages.length} completed</span>
              </div>
            )}

            {/* Carbon Breakdown Preview */}
            {productPassport.specifications.carbon_breakdown && (
              <div className="text-xs text-muted-foreground">
                Materials: {productPassport.specifications.carbon_breakdown.materials_carbon?.toFixed(1) || 0} kg CO₂
              </div>
            )}
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

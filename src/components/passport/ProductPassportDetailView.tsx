
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, Calendar, Leaf, ArrowLeft, Download } from "lucide-react"
import type { ProductPassport } from '@/hooks/useProductPassports'

interface ProductPassportDetailViewProps {
  productPassport: ProductPassport
  onBack: () => void
  onDownloadQR?: () => void
}

export function ProductPassportDetailView({ 
  productPassport, 
  onBack, 
  onDownloadQR 
}: ProductPassportDetailViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{productPassport.product_name}</h1>
          {onDownloadQR && (
            <Button onClick={onDownloadQR}>
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            {productPassport.image_url && (
              <Card>
                <CardContent className="p-6">
                  <img 
                    src={productPassport.image_url} 
                    alt={productPassport.product_name}
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Product Type</span>
                    <p className="font-medium">{productPassport.product_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Quantity Produced</span>
                    <p className="font-medium">{productPassport.quantity_produced} units</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Production Date</span>
                    <p className="font-medium">{formatDate(productPassport.production_date)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                    <p className="font-medium text-green-600">{productPassport.total_carbon_footprint.toFixed(2)} kg CO₂</p>
                  </div>
                </div>

                {productPassport.project && (
                  <div className="border-t pt-4">
                    <span className="text-sm text-muted-foreground">Source Project</span>
                    <p className="font-medium">{productPassport.project.name}</p>
                    {productPassport.project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{productPassport.project.description}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materials Used */}
            {productPassport.specifications?.materials_used && (
              <Card>
                <CardHeader>
                  <CardTitle>Materials Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {productPassport.specifications.materials_used.map((material: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-muted-foreground">{material.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{material.quantity} {material.unit}</p>
                          {material.carbon_footprint && (
                            <p className="text-sm text-green-600">{material.carbon_footprint.toFixed(2)} kg CO₂</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manufacturing Stages */}
            {productPassport.specifications?.manufacturing_stages && (
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {productPassport.specifications.manufacturing_stages.map((stage: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{stage.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {stage.actual_hours || stage.estimated_hours} hours
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {productPassport.qr_image_url ? (
                  <img 
                    src={productPassport.qr_image_url} 
                    alt="Product QR Code"
                    className="w-32 h-32 mx-auto border rounded bg-white p-2"
                  />
                ) : (
                  <QrCode className="w-32 h-32 mx-auto text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Scan to view this passport
                </p>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Carbon Footprint</span>
                  <span className="font-medium text-green-600">
                    {productPassport.total_carbon_footprint.toFixed(2)} kg CO₂
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Carbon per Unit</span>
                  <span className="font-medium">
                    {(productPassport.total_carbon_footprint / productPassport.quantity_produced).toFixed(2)} kg CO₂
                  </span>
                </div>
                {productPassport.specifications?.total_cost && (
                  <div className="flex justify-between">
                    <span className="text-sm">Production Cost</span>
                    <span className="font-medium">
                      ${productPassport.specifications.total_cost.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Specifications */}
            {productPassport.specifications && Object.keys(productPassport.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(productPassport.specifications).map(([key, value]) => {
                    if (key === 'materials_used' || key === 'manufacturing_stages') return null
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

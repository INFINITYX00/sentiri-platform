
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Package, Calendar, Leaf, ArrowLeft, Download, Factory, DollarSign, Clock, Zap } from "lucide-react"
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
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

                {/* Enhanced Project Information */}
                {productPassport.specifications && (
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    {productPassport.specifications.total_cost && (
                      <div>
                        <span className="text-sm text-muted-foreground">Production Cost</span>
                        <p className="font-medium">{formatCurrency(productPassport.specifications.total_cost)}</p>
                      </div>
                    )}
                    {productPassport.specifications.progress !== undefined && (
                      <div>
                        <span className="text-sm text-muted-foreground">Project Progress</span>
                        <p className="font-medium">{productPassport.specifications.progress}%</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Materials Used */}
            {productPassport.specifications?.materials_used && productPassport.specifications.materials_used.length > 0 && (
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
                          {material.total_cost && (
                            <p className="text-sm text-blue-600">{formatCurrency(material.total_cost)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{material.quantity_consumed || material.quantity} {material.unit}</p>
                          {material.carbon_footprint && (
                            <p className="text-sm text-green-600">{(material.total_carbon_impact || material.carbon_footprint).toFixed(2)} kg CO₂</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Manufacturing Stages */}
            {productPassport.specifications?.manufacturing_stages && productPassport.specifications.manufacturing_stages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturing Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {productPassport.specifications.manufacturing_stages.map((stage: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{stage.name}</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {stage.status || 'Completed'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {stage.actual_hours && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span>{stage.actual_hours}h actual</span>
                            </div>
                          )}
                          {stage.actual_energy && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-yellow-600" />
                              <span>{stage.actual_energy} kWh</span>
                            </div>
                          )}
                          {stage.progress !== undefined && (
                            <div className="text-muted-foreground">
                              Progress: {stage.progress}%
                            </div>
                          )}
                          {stage.completed_date && (
                            <div className="text-muted-foreground">
                              Completed: {formatDate(stage.completed_date)}
                            </div>
                          )}
                        </div>
                        {stage.workers && stage.workers.length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Workers: {stage.workers.join(', ')}
                          </div>
                        )}
                        {stage.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Notes: {stage.notes}
                          </div>
                        )}
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

            {/* Enhanced Environmental Impact */}
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
                
                {/* Enhanced Carbon Breakdown */}
                {productPassport.specifications?.carbon_breakdown && (
                  <>
                    <div className="border-t pt-2">
                      <h4 className="text-sm font-medium mb-2">Carbon Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Materials</span>
                          <span>{productPassport.specifications.carbon_breakdown.materials_carbon?.toFixed(2) || 0} kg CO₂</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Manufacturing</span>
                          <span>{productPassport.specifications.carbon_breakdown.manufacturing_carbon?.toFixed(2) || 0} kg CO₂</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {productPassport.specifications?.total_cost && (
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Production Cost</span>
                      <span className="font-medium">
                        {formatCurrency(productPassport.specifications.total_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost per Unit</span>
                      <span>
                        {formatCurrency(productPassport.specifications.total_cost / productPassport.quantity_produced)}
                      </span>
                    </div>
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
                    if (['materials_used', 'manufacturing_stages', 'carbon_breakdown', 'total_cost', 'progress'].includes(key)) return null
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

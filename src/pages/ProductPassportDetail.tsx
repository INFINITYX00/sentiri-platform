
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Leaf, QrCode, Download, Home, Factory, DollarSign } from "lucide-react";
import { generateSimpleQRCode } from '@/utils/qrGenerator';
import { QRCodeViewer } from '@/components/qr/QRCodeViewer';
import type { ProductPassport } from '@/hooks/useProductPassports';

export default function ProductPassportDetail() {
  const { id } = useParams<{ id: string }>();
  const [productPassport, setProductPassport] = useState<ProductPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrViewerOpen, setQrViewerOpen] = useState(false);

  useEffect(() => {
    const fetchProductPassport = async () => {
      if (!id) {
        setError('Product passport ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('product_passports')
          .select(`
            *,
            project:projects(id, name, description)
          `)
          .eq('id', id)
          .single();

        if (error) {
          setError('Product passport not found');
        } else {
          setProductPassport(data);
        }
      } catch (err) {
        setError('Failed to load product passport');
      } finally {
        setLoading(false);
      }
    };

    fetchProductPassport();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading product passport...</p>
        </div>
      </div>
    );
  }

  if (error || !productPassport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Product Passport Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const simpleQRCode = generateSimpleQRCode(productPassport.id);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header with navigation */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="mb-4"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <Card className="sentiri-card border shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {productPassport.image_url ? (
                    <img 
                      src={productPassport.image_url} 
                      alt={productPassport.product_name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{productPassport.product_name}</CardTitle>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">{productPassport.product_type}</Badge>
                  <Badge variant="outline">{simpleQRCode}</Badge>
                  {productPassport.qr_image_url && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setQrViewerOpen(true)}>
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Available
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* QR Code Section */}
                {productPassport.qr_image_url && (
                  <div className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <img 
                        src={productPassport.qr_image_url} 
                        alt="Product QR Code"
                        className="w-20 h-20 object-contain border rounded bg-white p-1"
                      />
                      <div className="text-left">
                        <p className="font-medium">Scannable QR Code</p>
                        <p className="text-sm text-muted-foreground">
                          Scan to view this product passport
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setQrViewerOpen(true)}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Quantity Produced</span>
                    </div>
                    <p className="font-medium">{productPassport.quantity_produced} units</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span>Carbon Footprint</span>
                    </div>
                    <p className="font-medium text-primary">{productPassport.total_carbon_footprint.toFixed(1)} kg CO₂</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Production Date</span>
                    </div>
                    <p className="font-medium">{formatDate(productPassport.production_date)}</p>
                  </div>

                  {productPassport.specifications?.total_cost && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Production Cost</span>
                      </div>
                      <p className="font-medium">{formatCurrency(productPassport.specifications.total_cost)}</p>
                    </div>
                  )}
                </div>

                {productPassport.project && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Source Project</h3>
                    <p className="font-medium">{productPassport.project.name}</p>
                    {productPassport.project.description && (
                      <p className="text-muted-foreground text-sm">{productPassport.project.description}</p>
                    )}
                  </div>
                )}

                {/* Materials Used */}
                {productPassport.specifications?.materials_used && productPassport.specifications.materials_used.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Materials Used</h3>
                    <div className="space-y-2">
                      {productPassport.specifications.materials_used.map((material: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">{material.type}</p>
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
                  </div>
                )}

                {/* Manufacturing Stages */}
                {productPassport.specifications?.manufacturing_stages && productPassport.specifications.manufacturing_stages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Manufacturing Process</h3>
                    <div className="space-y-2">
                      {productPassport.specifications.manufacturing_stages.map((stage: any, index: number) => (
                        <div key={index} className="p-3 bg-muted/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{stage.name}</h4>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {stage.status || 'Completed'}
                            </Badge>
                          </div>
                          {stage.actual_hours && (
                            <p className="text-sm text-muted-foreground">Duration: {stage.actual_hours}h</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This product passport contains verified manufacturing data and carbon footprint tracking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Viewer - Create a mock material object for the viewer */}
      {productPassport && (
        <QRCodeViewer
          material={{
            id: productPassport.id,
            name: productPassport.product_name,
            qr_code: productPassport.qr_code,
            qr_image_url: productPassport.qr_image_url,
            // Add other required fields with defaults
            type: productPassport.product_type,
            quantity: productPassport.quantity_produced,
            unit: 'units',
            carbon_footprint: productPassport.total_carbon_footprint,
            created_at: productPassport.created_at,
            updated_at: productPassport.updated_at
          } as any}
          isOpen={qrViewerOpen}
          onClose={() => setQrViewerOpen(false)}
        />
      )}
    </>
  );
}

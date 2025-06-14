
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Material } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Calendar, Leaf, QrCode, Download, Home } from "lucide-react";
import { generateSimpleQRCode } from '@/utils/qrGenerator';
import { QRCodeViewer } from '@/components/qr/QRCodeViewer';
import { useMaterials } from '@/hooks/useMaterials';

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrViewerOpen, setQrViewerOpen] = useState(false);
  const { regenerateQRCode } = useMaterials();

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!id) {
        setError('Material ID not provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError('Material not found');
        } else {
          setMaterial(data);
        }
      } catch (err) {
        setError('Failed to load material');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading material details...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Material Not Found</h2>
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

  const simpleQRCode = generateSimpleQRCode(material.id);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
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
                  {material.image_url ? (
                    <img 
                      src={material.image_url} 
                      alt={material.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold">{material.name}</CardTitle>
                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">{material.type}</Badge>
                  <Badge variant="outline">{simpleQRCode}</Badge>
                  {material.qr_image_url && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setQrViewerOpen(true)}>
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Available
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* QR Code Section */}
                {material.qr_image_url && (
                  <div className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <img 
                        src={material.qr_image_url} 
                        alt="QR Code"
                        className="w-20 h-20 object-contain border rounded bg-white p-1"
                      />
                      <div className="text-left">
                        <p className="font-medium">Scannable QR Code</p>
                        <p className="text-sm text-muted-foreground">
                          Scan to view this material
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
                      <span>Quantity</span>
                    </div>
                    <p className="font-medium">{material.quantity} {material.unit}</p>
                  </div>

                  {material.dimensions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Dimensions</span>
                      </div>
                      <p className="font-medium">{material.dimensions}</p>
                    </div>
                  )}

                  {material.origin && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Origin</span>
                      </div>
                      <p className="font-medium">{material.origin}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4" />
                      <span>Carbon Footprint</span>
                    </div>
                    <p className="font-medium text-primary">{material.carbon_footprint.toFixed(1)} kg CO₂</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Added</span>
                    </div>
                    <p className="font-medium">{new Date(material.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {material.description && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground">{material.description}</p>
                  </div>
                )}

                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    This material is tracked with sustainable sourcing practices and carbon footprint monitoring.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Viewer */}
      <QRCodeViewer
        material={material}
        isOpen={qrViewerOpen}
        onClose={() => setQrViewerOpen(false)}
        onRegenerate={regenerateQRCode}
      />
    </>
  );
}

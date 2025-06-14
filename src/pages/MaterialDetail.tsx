
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Material } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, Leaf } from "lucide-react";

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">{material.type}</Badge>
                <Badge variant="outline">{material.qr_code}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
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
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Eye, Package, ExternalLink, Trash2, Loader2, Ruler, Weight, Sparkles, Hash } from "lucide-react";
import { Material } from "@/lib/supabase";
import { useMaterials } from "@/hooks/useMaterials";
import { useState } from "react";
import { QRCodeViewer } from "@/components/qr/QRCodeViewer";
import { generateSimpleQRCode } from "@/utils/qrGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StockGridProps {
  searchQuery: string;
  selectedType: string;
}

export function StockGrid({ searchQuery, selectedType }: StockGridProps) {
  const { materials, loading, regenerateQRCode, deleteMaterial } = useMaterials();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [qrViewerOpen, setQrViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  console.log('StockGrid rendering with materials:', materials.length, materials);
  console.log('Search query:', searchQuery, 'Selected type:', selectedType);

  const filteredItems = materials.filter(item => {
    console.log('Filtering item:', item.name, 'Type:', item.type);
    
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.specific_material || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Fix type matching - make it case insensitive and handle underscore variations
    const itemType = item.type.toLowerCase().replace(/_/g, ' ');
    const selectedTypeNormalized = selectedType.toLowerCase().replace(/_/g, ' ');
    const matchesType = selectedType === 'all' || itemType === selectedTypeNormalized || item.type.toLowerCase() === selectedType.toLowerCase();
    
    console.log(`Item ${item.name}: type="${item.type}", normalized="${itemType}", selected="${selectedType}", matchesSearch=${matchesSearch}, matchesType=${matchesType}`);
    
    const result = matchesSearch && matchesType;
    return result;
  });

  console.log('Filtered items:', filteredItems.length, filteredItems.map(item => ({ name: item.name, type: item.type })));

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground">Loading materials...</p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          {materials.length === 0 
            ? "No materials found. Add your first material to get started!" 
            : `No materials found matching your criteria. Total materials: ${materials.length}`
          }
        </p>
        {materials.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Click the "Add Material" button above to create your first material.
          </p>
        )}
        {materials.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filter criteria.
          </p>
        )}
      </div>
    );
  }

  const handleViewQR = (material: Material) => {
    setSelectedMaterial(material);
    setQrViewerOpen(true);
  };

  const handleViewMaterial = (materialId: string) => {
    // Navigate to material detail page
    window.open(`/material/${materialId}`, '_blank');
  };

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (materialToDelete) {
      await deleteMaterial(materialToDelete.id);
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  const formatVolume = (quantity: number) => {
    if (quantity >= 1000000) {
      return `${(quantity / 1000000).toFixed(2)} L`;
    } else if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} cm³`;
    } else {
      return `${quantity.toFixed(0)} mm³`;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" key={`materials-${materials.length}-${Date.now()}`}>
        {filteredItems.map((item) => (
          <Card key={`${item.id}-${item.updated_at}`} className="sentiri-card hover:border-accent/30 transition-all duration-200 group">
            <div className="relative">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded-t-xl flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge 
                  variant={item.volume && item.volume < 0.001 ? 'destructive' : 'default'}
                  className={item.volume && item.volume < 0.001 ? '' : 'bg-primary'}
                >
                  {item.volume && item.volume < 0.001 ? 'Low Volume' : 'In Stock'}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {generateSimpleQRCode(item.id)}
                </Badge>
              </div>
              {/* AI Data Indicator */}
              {item.ai_carbon_confidence && (
                <div className="absolute bottom-3 left-3">
                  <Badge 
                    variant="secondary" 
                    className="h-6 px-2 bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI {Math.round(item.ai_carbon_confidence * 100)}%
                  </Badge>
                </div>
              )}
              {/* QR Code Indicator */}
              {item.qr_image_url && (
                <div className="absolute bottom-3 right-3">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                    onClick={() => handleViewQR(item)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.specific_material || item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {item.unit_count && item.unit_count > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Units:
                      </span>
                      <span className="font-medium">{item.unit_count}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      Volume:
                    </span>
                    <span className="font-medium">{formatVolume(item.quantity)}</span>
                  </div>
                  
                  {item.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        Weight:
                      </span>
                      <span className="font-medium">{item.weight.toFixed(2)} kg</span>
                    </div>
                  )}
                  
                  {item.dimensions && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium text-xs">{item.dimensions}</span>
                    </div>
                  )}
                  
                  {item.origin && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Origin:</span>
                      <span className="font-medium text-xs">{item.origin}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Carbon:</span>
                    <span className="font-medium text-primary text-xs">{item.carbon_footprint.toFixed(1)} kg CO₂</span>
                  </div>

                  {item.ai_carbon_source && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI Source:</span>
                      <span className="font-medium text-xs text-purple-600">{item.ai_carbon_source}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewMaterial(item.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewQR(item)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteClick(item)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Viewer Dialog */}
      <QRCodeViewer
        material={selectedMaterial}
        isOpen={qrViewerOpen}
        onClose={() => {
          setQrViewerOpen(false);
          setSelectedMaterial(null);
        }}
        onRegenerate={regenerateQRCode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{materialToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMaterialToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

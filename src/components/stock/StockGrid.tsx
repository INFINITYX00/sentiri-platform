
import { QRCodeViewer } from "@/components/qr/QRCodeViewer";
import { Material } from "@/lib/supabase";
import { useMaterials } from "@/hooks/useMaterials";
import { useStockAllocations } from "@/hooks/useStockAllocations";
import { useState, useEffect } from "react";
import { Package, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaterialStockCard } from "./MaterialStockCard";
import { AddMaterialDialog } from "./AddMaterialDialog";
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
  const { materials, loading, regenerateQRCode, deleteMaterial, refreshMaterials, subscriptionStatus } = useMaterials();
  const { allocations, refreshAllocations } = useStockAllocations();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [qrViewerOpen, setQrViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🎯 StockGrid - materials count:', materials.length, 'subscription:', subscriptionStatus);

  // Listen for project changes to refresh allocations
  useEffect(() => {
    const interval = setInterval(refreshAllocations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshAllocations]);

  // Filter materials based on search and type
  const filteredItems = materials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.specific_material || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const itemType = item.type.toLowerCase().replace(/_/g, ' ');
    const selectedTypeNormalized = selectedType.toLowerCase().replace(/_/g, ' ');
    const matchesType = selectedType === 'all' || itemType === selectedTypeNormalized || item.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  console.log('🔍 Filtered items count:', filteredItems.length);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Manual refresh triggered');
    await Promise.all([refreshMaterials(), refreshAllocations()]);
    setIsRefreshing(false);
  };

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
        <div className="mt-4 flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-xs text-muted-foreground flex items-center">
            Status: {subscriptionStatus}
          </div>
        </div>
      </div>
    );
  }

  const handleViewQR = (material: Material) => {
    setSelectedMaterial(material);
    setQrViewerOpen(true);
  };

  const handleViewMaterial = (materialId: string) => {
    window.open(`/material/${materialId}`, '_blank');
  };

  const handleEditMaterial = (material: Material) => {
    setMaterialToEdit(material);
    setEditDialogOpen(true);
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

  return (
    <>
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {materials.length} materials
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Real-time: {subscriptionStatus}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const allocation = allocations.find(a => a.material_id === item.id);
          
          return (
            <MaterialStockCard
              key={`${item.id}-${item.updated_at}`}
              material={item}
              allocation={allocation}
              onViewQR={handleViewQR}
              onViewMaterial={handleViewMaterial}
              onEdit={handleEditMaterial}
              onDelete={handleDeleteClick}
            />
          );
        })}
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

      {/* Edit Material Dialog */}
      <AddMaterialDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setMaterialToEdit(null);
        }}
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

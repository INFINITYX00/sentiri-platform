
import { QRCodeViewer } from "@/components/qr/QRCodeViewer";
import { Material } from "@/lib/supabase";
import { useMaterials } from "@/hooks/useMaterials";
import { useStockAllocations } from "@/hooks/useStockAllocations";
import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
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
  const { materials, loading, regenerateQRCode, deleteMaterial } = useMaterials();
  const { allocations } = useStockAllocations();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [qrViewerOpen, setQrViewerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [renderTimestamp, setRenderTimestamp] = useState(Date.now());

  // Debug: Log materials received by StockGrid
  console.log('🎯 StockGrid received materials from hook:', materials.length, materials.map(m => ({ 
    id: m.id, 
    name: m.name, 
    updated_at: m.updated_at 
  })));

  // Force re-render when materials change with a timestamp-based approach
  useEffect(() => {
    console.log('📊 StockGrid materials changed, forcing re-render. Count:', materials.length)
    setRenderTimestamp(Date.now());
  }, [materials])

  // Direct filtering without useMemo to ensure fresh data on every render
  const filteredItems = materials.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.specific_material || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const itemType = item.type.toLowerCase().replace(/_/g, ' ');
    const selectedTypeNormalized = selectedType.toLowerCase().replace(/_/g, ' ');
    const matchesType = selectedType === 'all' || itemType === selectedTypeNormalized || item.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  console.log('🔍 Filtered items after direct filter:', filteredItems.length, filteredItems.map(item => ({ 
    id: item.id, 
    name: item.name, 
    updated_at: item.updated_at 
  })));

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
      <div key={`grid-${renderTimestamp}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const allocation = allocations.find(a => a.material_id === item.id);
          
          // Use timestamp-based key to guarantee uniqueness and force re-render
          const cardKey = `${item.id}-${item.updated_at}-${renderTimestamp}-${index}`;
          console.log(`🔍 Rendering card ${index + 1}/${filteredItems.length}:`, { 
            id: item.id, 
            name: item.name, 
            updated_at: item.updated_at,
            key: cardKey,
            renderTimestamp
          });
          
          return (
            <MaterialStockCard
              key={cardKey}
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
        materialToEdit={materialToEdit}
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

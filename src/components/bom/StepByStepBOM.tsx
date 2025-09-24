
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Package, Calculator, Leaf, FileText } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useProjects } from '@/hooks/useProjects';
import { useToast } from "@/hooks/use-toast";

interface StepByStepBOMProps {
  projectId: string;
  onBOMComplete?: () => void;
}

interface BOMItem {
  material_id: string;
  quantity: number;
  unit: string;
  carbon_per_unit: number;
  cost_per_unit: number;
  material_name: string;
}

export function StepByStepBOM({ projectId, onBOMComplete }: StepByStepBOMProps) {
  const { materials } = useMaterials();
  const { addMaterialToProject, updateProject } = useProjects();
  const { toast } = useToast();
  
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMaterialToBOM = () => {
    if (!selectedMaterial || !quantity) {
      toast({
        title: "Missing Information",
        description: "Please select a material and enter quantity",
        variant: "destructive"
      });
      return;
    }

    const material = materials.find(m => m.id === selectedMaterial);
    if (!material) return;

    const existingItemIndex = bomItems.findIndex(item => item.material_id === selectedMaterial);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...bomItems];
      updatedItems[existingItemIndex].quantity += Number(quantity);
      setBomItems(updatedItems);
    } else {
      // Add new item
      const newItem: BOMItem = {
        material_id: selectedMaterial,
        quantity: Number(quantity),
        unit: material.unit,
        carbon_per_unit: material.carbon_footprint,
        cost_per_unit: material.cost_per_unit || 0,
        material_name: material.name
      };
      setBomItems([...bomItems, newItem]);
    }

    setSelectedMaterial('');
    setQuantity('');
  };

  const removeMaterialFromBOM = (materialId: string) => {
    setBomItems(bomItems.filter(item => item.material_id !== materialId));
  };

  const updateItemQuantity = (materialId: string, newQuantity: number) => {
    setBomItems(bomItems.map(item =>
      item.material_id === materialId
        ? { ...item, quantity: Math.max(0, newQuantity) }
        : item
    ));
  };

  const calculateTotals = () => {
    const totalCost = bomItems.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);
    const totalCarbon = bomItems.reduce((sum, item) => sum + (item.quantity * item.carbon_per_unit), 0);
    return { totalCost, totalCarbon };
  };

  const saveBOMToProject = async () => {
    if (bomItems.length === 0) {
      toast({
        title: "Empty BOM",
        description: "Please add materials to the BOM before saving",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add each material to the project
      for (const item of bomItems) {
        await addMaterialToProject(
          projectId,
          item.material_id,
          item.quantity,
          item.cost_per_unit
        );
      }

      const { totalCost, totalCarbon } = calculateTotals();
      
      // Update project with totals and move to design status
      await updateProject(projectId, {
        total_cost: totalCost,
        total_carbon_footprint: totalCarbon,
        status: 'design',
        allocated_materials: bomItems.map(item => item.material_id)
      });

      toast({
        title: "BOM Saved",
        description: "Bill of Materials has been saved to the project",
      });

      // Clear the BOM
      setBomItems([]);
      
      // Notify parent component that BOM is complete
      if (onBOMComplete) {
        onBOMComplete();
      }
    } catch (error) {
      console.error('Error saving BOM:', error);
      toast({
        title: "Error",
        description: "Failed to save BOM to project",
        variant: "destructive"
      });
    }
  };

  const { totalCost, totalCarbon } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Materials to BOM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Materials</label>
              <Input
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Material</label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose material..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      <div className="flex flex-col">
                        <span>{material.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {material.type} • {material.quantity} {material.unit} available
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity Required</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  step="0.1"
                />
                <Button onClick={addMaterialToBOM} disabled={!selectedMaterial || !quantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOM Items List */}
      {bomItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill of Materials ({bomItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bomItems.map((item, index) => (
              <div key={item.material_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.material_name}</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Carbon: {(item.quantity * item.carbon_per_unit).toFixed(2)} kg CO₂</span>
                    <span>Cost: £{(item.quantity * item.cost_per_unit).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.material_id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-20 text-center">
                    {item.quantity} {item.unit}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.material_id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeMaterialFromBOM(item.material_id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Separator />

            {/* Totals */}
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="font-medium">Total Cost: £{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  <span className="font-medium">Total Carbon: {totalCarbon.toFixed(2)} kg CO₂</span>
                </div>
              </div>
              
              <Button onClick={saveBOMToProject} className="ml-4">
                Save BOM to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {bomItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Materials Added</h3>
            <p className="text-muted-foreground">Start by selecting materials from your stock above</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

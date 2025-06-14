
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Calculator, Plus } from "lucide-react";
import { useMaterials } from '@/hooks/useMaterials';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { uploadFile } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaterialDialog({ open, onOpenChange }: AddMaterialDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specific_material: '',
    length: '',
    width: '',
    thickness: '',
    dimension_unit: 'mm',
    origin: '',
    description: '',
    image: null as File | null,
    density: '',
    custom_density: false
  });
  
  const [uploading, setUploading] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    volume: 0,
    quantity: 0,
    weight: 0,
    carbonFootprint: 0
  });
  
  const { addMaterial } = useMaterials();
  const { materialTypes, getCategories, getTypesByCategory, getMaterialTypeBySpecific, addMaterialType } = useMaterialTypes();
  const { toast } = useToast();

  // Calculate metrics when dimensions or material type changes
  useEffect(() => {
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const thickness = parseFloat(formData.thickness) || 0;
    
    if (length > 0 && width > 0 && thickness > 0) {
      let volumeInM3 = 0;
      
      // Convert to m³ based on unit
      switch (formData.dimension_unit) {
        case 'mm':
          volumeInM3 = (length * width * thickness) / 1000000000;
          break;
        case 'cm':
          volumeInM3 = (length * width * thickness) / 1000000;
          break;
        case 'm':
          volumeInM3 = length * width * thickness;
          break;
        default:
          volumeInM3 = (length * width * thickness) / 1000000000;
      }
      
      const quantityInMm3 = volumeInM3 * 1000000000; // Convert back to mm³ for display
      
      // Get density from material type or custom input
      let density = 0;
      if (formData.custom_density) {
        density = parseFloat(formData.density) || 0;
      } else {
        const materialType = getMaterialTypeBySpecific(formData.specific_material);
        density = materialType?.density || 0;
      }
      
      const weight = volumeInM3 * density; // kg
      
      // Calculate carbon footprint
      const materialType = getMaterialTypeBySpecific(formData.specific_material);
      const carbonFactor = materialType?.carbon_factor || 2.0;
      const carbonFootprint = weight * carbonFactor;
      
      setCalculatedMetrics({
        volume: volumeInM3,
        quantity: quantityInMm3,
        weight,
        carbonFootprint
      });
    } else {
      setCalculatedMetrics({ volume: 0, quantity: 0, weight: 0, carbonFootprint: 0 });
    }
  }, [formData.length, formData.width, formData.thickness, formData.dimension_unit, formData.specific_material, formData.density, formData.custom_density, getMaterialTypeBySpecific]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;
      
      if (formData.image) {
        const uploadResult = await uploadFile(formData.image, 'material-images', 'materials');
        if (uploadResult.error) {
          toast({
            title: "Warning",
            description: `Image upload failed: ${uploadResult.error}. Material will be added without image.`,
            variant: "destructive"
          });
        } else {
          imageUrl = uploadResult.url;
        }
      }

      // Get material type data
      const materialType = getMaterialTypeBySpecific(formData.specific_material);
      const density = formData.custom_density ? parseFloat(formData.density) : materialType?.density;

      const result = await addMaterial({
        name: formData.name,
        type: formData.type,
        specific_material: formData.specific_material,
        length: parseFloat(formData.length) || undefined,
        width: parseFloat(formData.width) || undefined,
        thickness: parseFloat(formData.thickness) || undefined,
        dimension_unit: formData.dimension_unit,
        density: density || undefined,
        origin: formData.origin,
        description: formData.description,
        image_url: imageUrl,
        quantity: calculatedMetrics.quantity,
        unit: 'mm³',
        carbon_footprint: calculatedMetrics.carbonFootprint
      });

      if (result) {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: '',
          specific_material: '',
          length: '',
          width: '',
          thickness: '',
          dimension_unit: 'mm',
          origin: '',
          description: '',
          image: null,
          density: '',
          custom_density: false
        });
        
        toast({
          title: "Success",
          description: "Material added successfully with automatic calculations!",
        });
      }
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Error",
        description: "Failed to add material. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleAddCustomMaterialType = async () => {
    if (formData.type && formData.specific_material) {
      const density = formData.custom_density ? parseFloat(formData.density) : undefined;
      await addMaterialType({
        category: formData.type,
        specific_type: formData.specific_material,
        density: density,
        carbon_factor: 2.0 // Default carbon factor
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] sentiri-card border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary" />
            <span>Add New Material</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Material Photo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="image" className="cursor-pointer">
                <Upload className={`h-8 w-8 mx-auto mb-2 text-muted-foreground ${uploading ? 'animate-pulse' : ''}`} />
                <p className="text-sm text-muted-foreground">
                  {formData.image ? formData.image.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB • JPG, PNG, WebP, GIF
                </p>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Material Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pine Slats"
                  required
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Category</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, specific_material: '' }))}
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific_material">Specific Material</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.specific_material} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, specific_material: value }))}
                    disabled={uploading || !formData.type}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select specific material" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTypesByCategory(formData.type).map((materialType) => (
                        <SelectItem key={materialType.id} value={materialType.specific_type}>
                          {materialType.specific_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCustomMaterialType}
                    disabled={!formData.type || !formData.specific_material}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Or enter custom material type"
                  value={formData.specific_material}
                  onChange={(e) => setFormData(prev => ({ ...prev, specific_material: e.target.value }))}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin/Source</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g., Local Demolition, Certified Forest"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes about the material..."
                  rows={3}
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Right Column - Dimensions & Calculations */}
            <div className="space-y-4">
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4" />
                  <Label className="text-sm font-medium">Dimensions</Label>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Length</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.length}
                      onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                      placeholder="0"
                      disabled={uploading}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.width}
                      onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="0"
                      disabled={uploading}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Thickness</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.thickness}
                      onChange={(e) => setFormData(prev => ({ ...prev, thickness: e.target.value }))}
                      placeholder="0"
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Unit</Label>
                  <Select 
                    value={formData.dimension_unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dimension_unit: value }))}
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">Millimeters (mm)</SelectItem>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="m">Meters (m)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Density Override */}
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="custom_density"
                    checked={formData.custom_density}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_density: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="custom_density" className="text-sm">Custom Density (kg/m³)</Label>
                </div>
                {formData.custom_density && (
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.density}
                    onChange={(e) => setFormData(prev => ({ ...prev, density: e.target.value }))}
                    placeholder="e.g., 500"
                    disabled={uploading}
                  />
                )}
              </div>

              {/* Calculated Results */}
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium">Calculated Metrics</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span>{calculatedMetrics.volume.toFixed(6)} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{calculatedMetrics.quantity.toFixed(0)} mm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span>{calculatedMetrics.weight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbon Footprint:</span>
                    <span>{calculatedMetrics.carbonFootprint.toFixed(2)} kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={uploading || calculatedMetrics.quantity === 0}
            >
              {uploading ? "Adding Material..." : "Add Material & Generate QR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

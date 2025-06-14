
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Plus, Minus } from "lucide-react";
import { useMaterials } from '@/hooks/useMaterials';
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
    quantity: '',
    unit: '',
    dimensions: '',
    origin: '',
    description: '',
    image: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [customType, setCustomType] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [showCustomUnit, setShowCustomUnit] = useState(false);
  
  // Default options that can be extended
  const [materialTypes, setMaterialTypes] = useState([
    'wood', 'metal', 'composite', 'textile', 'bio-material', 'plastic', 'glass', 'ceramic', 'fabric'
  ]);
  
  const [unitTypes, setUnitTypes] = useState([
    'boards', 'sheets', 'rolls', 'tubes', 'kg', 'm', 'm²', 'm³', 'pieces', 'liters'
  ]);
  
  const { addMaterial } = useMaterials();
  const { toast } = useToast();

  const calculateCarbonFootprint = (type: string, quantity: number): number => {
    const carbonFactors: Record<string, number> = {
      wood: 0.5,
      metal: 8.2,
      composite: 3.1,
      textile: 2.3,
      'bio-material': 0.1,
      plastic: 2.8,
      glass: 1.2,
      ceramic: 1.8,
      fabric: 2.1
    };
    return (carbonFactors[type.toLowerCase()] || 2.0) * quantity;
  };

  const handleAddCustomType = () => {
    if (customType.trim() && !materialTypes.includes(customType.trim().toLowerCase())) {
      const newType = customType.trim().toLowerCase();
      setMaterialTypes(prev => [...prev, newType]);
      setFormData(prev => ({ ...prev, type: newType }));
      setCustomType('');
      setShowCustomType(false);
      
      toast({
        title: "Success",
        description: `Added new material type: ${newType}`,
      });
    }
  };

  const handleAddCustomUnit = () => {
    if (customUnit.trim() && !unitTypes.includes(customUnit.trim())) {
      const newUnit = customUnit.trim();
      setUnitTypes(prev => [...prev, newUnit]);
      setFormData(prev => ({ ...prev, unit: newUnit }));
      setCustomUnit('');
      setShowCustomUnit(false);
      
      toast({
        title: "Success",
        description: `Added new unit: ${newUnit}`,
      });
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
    setMaterialTypes(prev => prev.filter(type => type !== typeToRemove));
    if (formData.type === typeToRemove) {
      setFormData(prev => ({ ...prev, type: '' }));
    }
  };

  const handleRemoveUnit = (unitToRemove: string) => {
    setUnitTypes(prev => prev.filter(unit => unit !== unitToRemove));
    if (formData.unit === unitToRemove) {
      setFormData(prev => ({ ...prev, unit: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;
      
      if (formData.image) {
        console.log('Uploading material image:', formData.image.name, formData.image.size);
        
        toast({
          title: "Uploading",
          description: "Uploading material image...",
        });

        const uploadResult = await uploadFile(formData.image, 'material-images', 'materials');
        
        console.log('Material image upload result:', uploadResult);
        
        if (uploadResult.error) {
          console.error('Material image upload failed:', uploadResult.error);
          toast({
            title: "Warning",
            description: `Image upload failed: ${uploadResult.error}. Material will be added without image.`,
            variant: "destructive"
          });
        } else {
          imageUrl = uploadResult.url;
          console.log('Material image uploaded successfully:', imageUrl);
        }
      }

      const quantity = parseFloat(formData.quantity);
      const carbonFootprint = calculateCarbonFootprint(formData.type, quantity);

      console.log('Adding material with data:', {
        name: formData.name,
        type: formData.type,
        quantity,
        unit: formData.unit,
        dimensions: formData.dimensions,
        origin: formData.origin,
        description: formData.description,
        image_url: imageUrl,
        carbon_footprint: carbonFootprint
      });

      const result = await addMaterial({
        name: formData.name,
        type: formData.type,
        quantity,
        unit: formData.unit,
        dimensions: formData.dimensions,
        origin: formData.origin,
        description: formData.description,
        image_url: imageUrl,
        carbon_footprint: carbonFootprint
      });

      console.log('Add material result:', result);

      if (result) {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: '',
          quantity: '',
          unit: '',
          dimensions: '',
          origin: '',
          description: '',
          image: null
        });
        
        toast({
          title: "Success",
          description: "Material added successfully with QR code generated!",
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
      console.log('Selected file:', file.name, file.size, file.type);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image file size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] sentiri-card border max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Reclaimed Oak Boards"
                required
                disabled={uploading}
              />
            </div>

            {/* Material Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Material Type</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomType(true);
                    } else {
                      setFormData(prev => ({ ...prev, type: value }));
                    }
                  }}
                  disabled={uploading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or add type" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
                      <SelectItem key={type} value={type} className="flex items-center justify-between">
                        <span className="flex-1">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveType(type);
                          }}
                        >
                          <Minus className="h-3 w-3 text-destructive" />
                        </Button>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">+ Add Custom Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showCustomType && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter custom type"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddCustomType}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCustomType(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
                required
                disabled={uploading}
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setShowCustomUnit(true);
                    } else {
                      setFormData(prev => ({ ...prev, unit: value }));
                    }
                  }}
                  disabled={uploading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or add unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit} value={unit} className="flex items-center justify-between">
                        <span className="flex-1">{unit}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-2 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveUnit(unit);
                          }}
                        >
                          <Minus className="h-3 w-3 text-destructive" />
                        </Button>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">+ Add Custom Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showCustomUnit && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter custom unit"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddCustomUnit}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCustomUnit(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Dimensions */}
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
              placeholder="e.g., 2000x200x25mm or 1.2m x 0.8m x 3mm"
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Enter custom dimensions (length x width x thickness with units)
            </p>
          </div>

          {/* Origin */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes about the material..."
              rows={3}
              disabled={uploading}
            />
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
              disabled={uploading}
            >
              {uploading ? "Adding Material..." : "Add Material & Generate QR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera } from "lucide-react";
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
    origin: '',
    description: '',
    image: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  
  const { addMaterial } = useMaterials();
  const { toast } = useToast();

  const calculateCarbonFootprint = (type: string, quantity: number): number => {
    const carbonFactors: Record<string, number> = {
      wood: 0.5,
      metal: 8.2,
      composite: 3.1,
      textile: 2.3,
      'bio-material': 0.1
    };
    return (carbonFactors[type] || 2.0) * quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = null;
      
      if (formData.image) {
        toast({
          title: "Uploading",
          description: "Uploading material image...",
        });

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

      const quantity = parseFloat(formData.quantity);
      const carbonFootprint = calculateCarbonFootprint(formData.type, quantity);

      const result = await addMaterial({
        name: formData.name,
        type: formData.type,
        quantity,
        unit: formData.unit,
        origin: formData.origin,
        description: formData.description,
        image_url: imageUrl,
        carbon_footprint: carbonFootprint
      });

      if (result) {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: '',
          quantity: '',
          unit: '',
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
      <DialogContent className="sm:max-w-[600px] sentiri-card border">
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
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wood">Wood</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="composite">Composite</SelectItem>
                  <SelectItem value="textile">Textile</SelectItem>
                  <SelectItem value="bio-material">Bio-material</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
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
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boards">Boards</SelectItem>
                  <SelectItem value="sheets">Sheets</SelectItem>
                  <SelectItem value="rolls">Rolls</SelectItem>
                  <SelectItem value="tubes">Tubes</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="m">Meters</SelectItem>
                  <SelectItem value="m²">Square Meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Calculator, Plus, Sparkles, AlertCircle, Trash2 } from "lucide-react";
import { useMaterials } from '@/hooks/useMaterials';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { useAICarbonLookup } from '@/hooks/useAICarbonLookup';
import { uploadFile } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaterialDialog({ open, onOpenChange }: AddMaterialDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    specific_material: '',
    custom_specific_material: '',
    use_custom_material: false,
    length: '',
    width: '',
    thickness: '',
    dimension_unit: 'mm',
    unit_count: '1',
    origin: '',
    description: '',
    image: null as File | null,
    density: '',
    carbon_factor: '',
    custom_density: false,
    custom_carbon: false
  });
  
  const [uploading, setUploading] = useState(false);
  const [aiCarbonData, setAiCarbonData] = useState<any>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddMaterialType, setShowAddMaterialType] = useState(false);
  const [newMaterialTypeName, setNewMaterialTypeName] = useState('');
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    volume: 0,
    quantity: 0,
    weight: 0,
    carbonFootprint: 0
  });
  
  const { addMaterial } = useMaterials();
  const { materialTypes, getCategories, getTypesByCategory, getMaterialTypeBySpecific, addMaterialType, deleteMaterialType, deleteCategory, addCategory } = useMaterialTypes();
  const { lookupCarbonData, loading: aiLoading } = useAICarbonLookup();
  const { toast } = useToast();

  const memoizedGetMaterialTypeBySpecific = useMemo(() => getMaterialTypeBySpecific, [materialTypes]);

  useEffect(() => {
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const thickness = parseFloat(formData.thickness) || 0;
    const unitCount = parseInt(formData.unit_count) || 1;
    
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
      
      // Calculate total volume for all units
      const totalVolumeInM3 = volumeInM3 * unitCount;
      const quantityInMm3 = totalVolumeInM3 * 1000000000; // Convert back to mm³ for display
      
      // Get the effective material name for lookup
      const effectiveMaterial = formData.use_custom_material ? formData.custom_specific_material : formData.specific_material;
      
      // Get density with proper priority: custom input > AI data > material type > default
      let density = 0;
      if (formData.custom_density && formData.density) {
        density = parseFloat(formData.density);
      } else if (aiCarbonData?.density) {
        density = aiCarbonData.density;
      } else {
        const materialType = memoizedGetMaterialTypeBySpecific(effectiveMaterial);
        density = materialType?.density || 500; // Default to wood density if nothing else
      }
      
      const weight = totalVolumeInM3 * density; // kg
      
      // Get carbon factor with proper priority: custom input > AI data > material type > default
      let carbonFactorPerKg = 0;
      if (formData.custom_carbon && formData.carbon_factor) {
        carbonFactorPerKg = parseFloat(formData.carbon_factor);
      } else if (aiCarbonData?.carbonFactor) {
        carbonFactorPerKg = aiCarbonData.carbonFactor;
      } else {
        const materialType = memoizedGetMaterialTypeBySpecific(effectiveMaterial);
        carbonFactorPerKg = materialType?.carbon_factor || 2.0;
      }
      
      const carbonFootprint = weight * carbonFactorPerKg;
      
      setCalculatedMetrics({
        volume: totalVolumeInM3,
        quantity: quantityInMm3,
        weight,
        carbonFootprint
      });
    } else {
      setCalculatedMetrics({ volume: 0, quantity: 0, weight: 0, carbonFootprint: 0 });
    }
  }, [formData.length, formData.width, formData.thickness, formData.dimension_unit, formData.unit_count, formData.specific_material, formData.custom_specific_material, formData.use_custom_material, formData.density, formData.carbon_factor, formData.custom_density, formData.custom_carbon, aiCarbonData, memoizedGetMaterialTypeBySpecific]);

  const handleAICarbonLookup = async () => {
    if (!formData.type) {
      toast({
        title: "Missing Information",
        description: "Please select material type first",
        variant: "destructive"
      });
      return;
    }

    const effectiveMaterial = formData.use_custom_material ? formData.custom_specific_material : formData.specific_material;
    
    if (!effectiveMaterial) {
      toast({
        title: "Missing Information",
        description: "Please enter or select a specific material first",
        variant: "destructive"
      });
      return;
    }

    const dimensions = formData.length && formData.width && formData.thickness 
      ? `${formData.length}${formData.dimension_unit} × ${formData.width}${formData.dimension_unit} × ${formData.thickness}${formData.dimension_unit}`
      : undefined;

    const data = await lookupCarbonData(
      formData.type,
      effectiveMaterial,
      formData.origin,
      dimensions
    );

    if (data) {
      setAiCarbonData(data);
      // Auto-update form fields with AI data if not using custom values
      if (!formData.custom_density) {
        setFormData(prev => ({ ...prev, density: data.density?.toString() || '' }));
      }
      if (!formData.custom_carbon) {
        setFormData(prev => ({ ...prev, carbon_factor: data.carbonFactor?.toString() || '' }));
      }
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    const result = await addCategory(newCategoryName.trim());
    if (result) {
      setFormData(prev => ({ ...prev, type: newCategoryName.trim() }));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleAddNewMaterialType = async () => {
    if (!newMaterialTypeName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a material type name",
        variant: "destructive"
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: "Missing Information",
        description: "Please select a category first",
        variant: "destructive"
      });
      return;
    }

    // Check if this material type already exists
    const existingMaterialType = memoizedGetMaterialTypeBySpecific(newMaterialTypeName.trim());
    if (existingMaterialType) {
      toast({
        title: "Already Exists",
        description: "This material type already exists in the database",
        variant: "destructive"
      });
      return;
    }

    const result = await addMaterialType({
      category: formData.type,
      specific_type: newMaterialTypeName.trim(),
      density: undefined,
      carbon_factor: 2.0 // Default carbon factor
    });

    if (result) {
      setFormData(prev => ({ 
        ...prev, 
        specific_material: newMaterialTypeName.trim(),
        use_custom_material: false
      }));
      setNewMaterialTypeName('');
      setShowAddMaterialType(false);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    const result = await deleteCategory(category);
    if (result) {
      // Clear the form field if the deleted category was selected
      if (formData.type === category) {
        setFormData(prev => ({ 
          ...prev, 
          type: '', 
          specific_material: '', 
          custom_specific_material: '',
          use_custom_material: false
        }));
      }
    }
  };

  const handleAddCustomMaterialType = async () => {
    const effectiveMaterial = formData.use_custom_material ? formData.custom_specific_material : formData.specific_material;
    
    if (!formData.type || !effectiveMaterial) {
      toast({
        title: "Missing Information",
        description: "Please select a category and material type first",
        variant: "destructive"
      });
      return;
    }

    // Check if this material type already exists
    const existingMaterialType = memoizedGetMaterialTypeBySpecific(effectiveMaterial);
    if (existingMaterialType) {
      toast({
        title: "Already Exists",
        description: "This material type already exists in the database",
        variant: "destructive"
      });
      return;
    }

    try {
      const density = formData.custom_density ? parseFloat(formData.density) : undefined;
      const result = await addMaterialType({
        category: formData.type,
        specific_type: effectiveMaterial,
        density: density,
        carbon_factor: 2.0 // Default carbon factor
      });

      if (result) {
        toast({
          title: "Success",
          description: "Material type added to database",
        });
      }
    } catch (error) {
      console.error('Error adding material type:', error);
      toast({
        title: "Error",
        description: "Failed to add material type",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMaterialType = async (materialType: any) => {
    const result = await deleteMaterialType(materialType.id);
    if (result) {
      // Clear the form field if the deleted item was selected
      if (formData.specific_material === materialType.specific_type) {
        setFormData(prev => ({ ...prev, specific_material: '' }));
      }
    }
  };

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

      // Get the effective material name
      const effectiveMaterial = formData.use_custom_material ? formData.custom_specific_material : formData.specific_material;

      // Use the calculated density from AI or fallback chain
      let finalDensity = 0;
      if (formData.custom_density && formData.density) {
        finalDensity = parseFloat(formData.density);
      } else if (aiCarbonData?.density) {
        finalDensity = aiCarbonData.density;
      } else {
        const materialType = memoizedGetMaterialTypeBySpecific(effectiveMaterial);
        finalDensity = materialType?.density || 500;
      }

      const result = await addMaterial({
        name: formData.name,
        type: formData.type,
        specific_material: effectiveMaterial,
        length: parseFloat(formData.length) || undefined,
        width: parseFloat(formData.width) || undefined,
        thickness: parseFloat(formData.thickness) || undefined,
        dimension_unit: formData.dimension_unit,
        unit_count: parseInt(formData.unit_count) || 1,
        density: finalDensity,
        origin: formData.origin,
        description: formData.description,
        image_url: imageUrl,
        quantity: calculatedMetrics.quantity,
        unit: 'mm³',
        carbon_footprint: calculatedMetrics.carbonFootprint,
        ai_carbon_confidence: aiCarbonData?.confidence,
        ai_carbon_source: aiCarbonData?.source,
        ai_carbon_updated_at: aiCarbonData ? new Date().toISOString() : undefined
      });

      if (result) {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: '',
          specific_material: '',
          custom_specific_material: '',
          use_custom_material: false,
          length: '',
          width: '',
          thickness: '',
          dimension_unit: 'mm',
          unit_count: '1',
          origin: '',
          description: '',
          image: null,
          density: '',
          carbon_factor: '',
          custom_density: false,
          custom_carbon: false
        });
        setAiCarbonData(null);
        
        const densitySource = formData.custom_density ? 'custom' : 
                            aiCarbonData?.density ? 'AI' : 'database';
        
        toast({
          title: "Success",
          description: `Material added! Weight: ${calculatedMetrics.weight.toFixed(2)} kg (${densitySource} density), Carbon: ${calculatedMetrics.carbonFootprint.toFixed(2)} kg CO₂`,
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
                onChange={(e) => {
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
                }}
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
                <div className="flex gap-2">
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      type: value, 
                      specific_material: '',
                      custom_specific_material: '',
                      use_custom_material: false
                    }))}
                    disabled={uploading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategories().map((category) => (
                        <div key={category} className="flex items-center group">
                          <SelectItem value={category} className="flex-1">
                            {category.replace('_', ' ')}
                          </SelectItem>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteCategory(category);
                            }}
                            title={`Delete "${category}" category`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddCategory(true)}
                    title="Add new category"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Add Category Input */}
                {showAddCategory && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter new category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                        if (e.key === 'Escape') {
                          setShowAddCategory(false);
                          setNewCategoryName('');
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddNewCategory}
                    >
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Specific Material</Label>
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
                        <div key={materialType.id} className="flex items-center group">
                          <SelectItem value={materialType.specific_type} className="flex-1">
                            {materialType.specific_type}
                          </SelectItem>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteMaterialType(materialType);
                            }}
                            title={`Delete "${materialType.specific_type}"`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddMaterialType(true)}
                    disabled={!formData.type}
                    title="Add new material type"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Add Material Type Input */}
                {showAddMaterialType && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter new material type name"
                      value={newMaterialTypeName}
                      onChange={(e) => setNewMaterialTypeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewMaterialType();
                        }
                        if (e.key === 'Escape') {
                          setShowAddMaterialType(false);
                          setNewMaterialTypeName('');
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddNewMaterialType}
                    >
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowAddMaterialType(false);
                        setNewMaterialTypeName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
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

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4" />
                  <Label className="text-sm font-medium">Dimensions & Quantity</Label>
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

                <div className="grid grid-cols-2 gap-2">
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
                  <div className="space-y-2">
                    <Label className="text-xs">Number of Units</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.unit_count}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_count: e.target.value }))}
                      placeholder="1"
                      disabled={uploading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Material Data
                  </Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAICarbonLookup}
                    disabled={aiLoading || !formData.type || (!formData.specific_material && !formData.custom_specific_material)}
                    className="gap-2"
                  >
                    {aiLoading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Get AI Data
                      </>
                    )}
                  </Button>
                </div>

                {aiCarbonData && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>AI Data Retrieved:</strong><br/>
                      <strong>Density:</strong> {aiCarbonData.density} kg/m³<br/>
                      <strong>Carbon Factor:</strong> {aiCarbonData.carbonFactor} kg CO₂/kg<br/>
                      <strong>Confidence:</strong> {Math.round(aiCarbonData.confidence * 100)}%<br/>
                      <strong>Source:</strong> {aiCarbonData.source}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="custom_density"
                        checked={formData.custom_density}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_density: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="custom_density" className="text-xs">Override Density</Label>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.density}
                      onChange={(e) => setFormData(prev => ({ ...prev, density: e.target.value }))}
                      placeholder={aiCarbonData?.density?.toString() || "kg/m³"}
                      disabled={uploading || !formData.custom_density}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="custom_carbon"
                        checked={formData.custom_carbon}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_carbon: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="custom_carbon" className="text-xs">Override Carbon</Label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.carbon_factor}
                      onChange={(e) => setFormData(prev => ({ ...prev, carbon_factor: e.target.value }))}
                      placeholder={aiCarbonData?.carbonFactor?.toString() || "kg CO₂/kg"}
                      disabled={uploading || !formData.custom_carbon}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium">Calculated Metrics</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Units:</span>
                    <span>{formData.unit_count || 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Volume:</span>
                    <span>{calculatedMetrics.volume.toFixed(6)} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Density Used:</span>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        const effectiveMaterial = formData.use_custom_material ? formData.custom_specific_material : formData.specific_material;
                        if (formData.custom_density && formData.density) {
                          return `${formData.density} kg/m³ (custom)`;
                        } else if (aiCarbonData?.density) {
                          return `${aiCarbonData.density} kg/m³ (AI)`;
                        } else {
                          return `${memoizedGetMaterialTypeBySpecific(effectiveMaterial)?.density || 500} kg/m³ (default)`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Weight:</span>
                    <span className="font-medium">{calculatedMetrics.weight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Carbon:</span>
                    <span className="font-medium text-primary">{calculatedMetrics.carbonFootprint.toFixed(2)} kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
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


import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Plus, Trash2, FileText } from "lucide-react";
import { uploadFile } from '@/utils/fileUpload';
import { parseCSVFile, parseExcelFile } from '@/utils/csvParser';
import { useToast } from '@/hooks/use-toast';

interface BOMItem {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
}

export function BOMUploader() {
  const [bomItems, setBomItems] = useState<BOMItem[]>([
    {
      id: '1',
      material: 'Reclaimed Oak',
      quantity: 8,
      unit: 'boards',
      supplier: 'Sustainable Lumber Co.',
      cost: 320
    }
  ]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addBOMItem = () => {
    const newItem: BOMItem = {
      id: Date.now().toString(),
      material: '',
      quantity: 0,
      unit: 'pieces',
      supplier: '',
      cost: 0
    };
    setBomItems([...bomItems, newItem]);
  };

  const removeBOMItem = (id: string) => {
    setBomItems(bomItems.filter(item => item.id !== id));
  };

  const updateBOMItem = (id: string, field: keyof BOMItem, value: any) => {
    setBomItems(bomItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      toast({
        title: "Processing File",
        description: `Uploading and parsing ${file.name}...`,
      });

      // Upload file to storage
      const uploadResult = await uploadFile(file, 'bom-files', 'uploads');
      
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      // Parse the file content
      let parsedData;
      if (file.name.endsWith('.csv')) {
        parsedData = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedData = await parseExcelFile(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      // Convert parsed data to BOM items
      const newItems = parsedData.map((item, index) => ({
        id: (Date.now() + index).toString(),
        material: item.material,
        quantity: item.quantity,
        unit: item.unit,
        supplier: item.supplier,
        cost: item.cost
      }));

      setBomItems([...bomItems, ...newItems]);
      
      toast({
        title: "Success",
        description: `Successfully imported ${newItems.length} items from ${file.name}`,
      });

      // Clear the input
      e.target.value = '';
      
    } catch (error) {
      console.error('File upload/parsing error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const calculateTotal = () => {
    return bomItems.reduce((total, item) => total + item.cost, 0);
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card className="sentiri-card border-dashed border-2 hover:border-accent/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="bom-upload"
              disabled={uploading}
            />
            <label htmlFor="bom-upload" className="cursor-pointer">
              <Upload className={`h-12 w-12 mx-auto mb-4 text-muted-foreground ${uploading ? 'animate-pulse' : ''}`} />
              <h3 className="text-lg font-semibold mb-2">
                {uploading ? 'Processing File...' : 'Upload BOM File'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {uploading 
                  ? 'Please wait while we process your file'
                  : 'Drag and drop your CSV or Excel file here, or click to browse'
                }
              </p>
              <Button variant="outline" disabled={uploading}>
                <FileText className="h-4 w-4 mr-2" />
                {uploading ? 'Processing...' : 'Choose File'}
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Expected format: Material, Quantity, Unit, Supplier, Cost
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bill of Materials</span>
            <Button onClick={addBOMItem} size="sm" variant="outline" disabled={uploading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bomItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-muted/20 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-xs">Material</Label>
                <Input
                  value={item.material}
                  onChange={(e) => updateBOMItem(item.id, 'material', e.target.value)}
                  placeholder="Material name"
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateBOMItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Unit</Label>
                <Select value={item.unit} onValueChange={(value) => updateBOMItem(item.id, 'unit', value)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="boards">Boards</SelectItem>
                    <SelectItem value="sheets">Sheets</SelectItem>
                    <SelectItem value="rolls">Rolls</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="L">Liters</SelectItem>
                    <SelectItem value="m">Meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Supplier</Label>
                <Input
                  value={item.supplier}
                  onChange={(e) => updateBOMItem(item.id, 'supplier', e.target.value)}
                  placeholder="Supplier name"
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Cost ($)</Label>
                <Input
                  type="number"
                  value={item.cost}
                  onChange={(e) => updateBOMItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                  className="bg-background/50"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBOMItem(item.id)}
                  className="w-full"
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Summary */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-lg font-semibold">
              Total Items: {bomItems.length}
            </div>
            <div className="text-lg font-semibold text-primary">
              Total Cost: £{calculateTotal().toFixed(2)}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-primary hover:bg-primary/90" disabled={uploading}>
              Calculate Carbon Footprint
            </Button>
            <Button variant="outline" className="flex-1" disabled={uploading}>
              Save BOM
            </Button>
            <Button variant="outline" className="flex-1" disabled={uploading}>
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

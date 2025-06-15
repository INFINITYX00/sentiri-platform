
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSVToBOM } from "@/utils/csvParser";
import { useProjects } from '@/hooks/useProjects';
import { useToast } from "@/hooks/use-toast";

interface EnhancedBOMUploaderProps {
  projectId: string;
  onBOMComplete?: () => void;
}

export function EnhancedBOMUploader({ projectId, onBOMComplete }: EnhancedBOMUploaderProps) {
  const [bomName, setBomName] = useState('');
  const [bomDescription, setBomDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMaterialToProject, updateProject } = useProjects();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !bomName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a BOM name and select a CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const result = await parseCSVToBOM(file);
      
      if (result.success && result.materials) {
        // Add materials to project
        let totalCost = 0;
        let totalCarbon = 0;
        
        for (const material of result.materials) {
          await addMaterialToProject(
            projectId,
            material.material_id,
            material.quantity,
            material.cost_per_unit || 0
          );
          
          totalCost += (material.quantity * (material.cost_per_unit || 0));
          totalCarbon += (material.quantity * (material.carbon_footprint || 0));
        }

        // Update project
        await updateProject(projectId, {
          total_cost: totalCost,
          total_carbon_footprint: totalCarbon,
          status: 'design',
          allocated_materials: result.materials.map(m => m.material_id)
        });

        setUploadResult(result);
        toast({
          title: "BOM Uploaded Successfully",
          description: `${result.materials.length} materials added to project`,
        });

        // Notify parent component that BOM is complete
        if (onBOMComplete) {
          onBOMComplete();
        }
      } else {
        setUploadResult(result);
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to process CSV file",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An error occurred while processing the file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `material_name,quantity,unit,cost_per_unit,carbon_footprint
Oak Wood Board,10,pieces,25.00,5.2
Steel Screws,50,pieces,0.50,0.1
Wood Stain,1,liter,15.00,2.3`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bom_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* BOM Information */}
      <Card>
        <CardHeader>
          <CardTitle>BOM Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bom-name">BOM Name *</Label>
            <Input
              id="bom-name"
              placeholder="Enter BOM name (e.g., Dining Table BOM)"
              value={bomName}
              onChange={(e) => setBomName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bom-description">Description</Label>
            <Textarea
              id="bom-description"
              placeholder="Optional description of this BOM"
              value={bomDescription}
              onChange={(e) => setBomDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <span className="text-sm text-muted-foreground">
              Required format: CSV with headers
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 text-green-600 mx-auto" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-muted-foreground">
                  Click to select a CSV file or drag and drop
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Select CSV File
                </Button>
              </div>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!file || !bomName.trim() || uploading}
            className="w-full"
          >
            {uploading ? 'Processing...' : 'Upload BOM to Project'}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardContent className="pt-6">
            {uploadResult.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  BOM uploaded successfully! {uploadResult.materials?.length || 0} materials added to project.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadResult.error || 'Upload failed. Please check your CSV format.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Required columns:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code>material_name</code> - Name of the material</li>
              <li><code>quantity</code> - Amount needed</li>
              <li><code>unit</code> - Unit of measurement (pieces, kg, m³, etc.)</li>
              <li><code>cost_per_unit</code> - Cost per unit (optional)</li>
              <li><code>carbon_footprint</code> - CO₂ per unit (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

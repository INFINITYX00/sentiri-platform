
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, RefreshCw, Copy, ExternalLink } from "lucide-react";
import { Material } from "@/lib/supabase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateCompleteQRPackage, generateSimpleQRCode } from "@/utils/qrGenerator";

interface QRCodeViewerProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate?: (materialId: string) => void;
}

export function QRCodeViewer({ material, isOpen, onClose, onRegenerate }: QRCodeViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  if (!material) return null;

  const simpleQRCode = generateSimpleQRCode(material.id);
  const qrUrl = material.qr_code;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const qrPackage = await generateCompleteQRPackage(material.id);
      
      // Convert to downloadable blob
      const response = await fetch(qrPackage.qrCodeDataURL)
      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${material.name}-qr-${qrPackage.simpleCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      })
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    toast({
      title: "Copied",
      description: "QR code URL copied to clipboard",
    });
  };

  const handleOpenUrl = () => {
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sentiri-card border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span>QR Code - {material.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            {material.qr_image_url ? (
              <img 
                src={material.qr_image_url} 
                alt={`QR Code for ${material.name}`}
                className="w-48 h-48 object-contain border rounded-lg bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">QR Code Image Not Available</p>
                </div>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <Badge variant="outline" className="font-mono">{simpleQRCode}</Badge>
              <p className="text-xs text-muted-foreground">Material ID: {material.id}</p>
            </div>
          </div>

          {/* QR Code Data */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code URL:</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={qrUrl} 
                  readOnly 
                  className="flex-1 px-3 py-2 text-xs bg-muted rounded border font-mono"
                />
                <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleOpenUrl}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Link
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleDownload} 
              disabled={downloading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {downloading ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </>
              )}
            </Button>
            
            {onRegenerate && (
              <Button 
                variant="outline" 
                onClick={() => onRegenerate(material.id)}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Usage Instructions:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Print this QR code and attach it to the physical material</li>
              <li>• Scanning will open the material detail page directly</li>
              <li>• Works with any QR code scanner or camera app</li>
              <li>• QR code is web-linkable and mobile-friendly</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

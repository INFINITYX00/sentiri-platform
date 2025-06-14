
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, Type, Search } from "lucide-react";
import { useState } from "react";
import { parseQRCode } from "@/utils/qrGenerator";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onMaterialFound?: (material: any) => void;
}

export function QRScanner({ isOpen, onClose, onMaterialFound }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const searchMaterial = async (qrCode: string) => {
    setSearching(true);
    try {
      // First try to parse as structured QR data
      const parsed = parseQRCode(qrCode);
      let material = null;

      if (parsed && parsed.type === 'material') {
        // Search by material ID
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('id', parsed.id)
          .single();
        
        if (!error && data) {
          material = data;
        }
      }

      // If not found by ID, try searching by QR code URL
      if (!material && qrCode.includes('/material/')) {
        const materialId = qrCode.split('/material/')[1];
        if (materialId) {
          const { data, error } = await supabase
            .from('materials')
            .select('*')
            .eq('id', materialId)
            .single();
          
          if (!error && data) {
            material = data;
          }
        }
      }

      // If still not found, search by QR code string in the qr_code field
      if (!material) {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('qr_code', qrCode)
          .single();
        
        if (!error && data) {
          material = data;
        }
      }

      // Last resort: search for materials where qr_code contains the input
      if (!material) {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .ilike('qr_code', `%${qrCode}%`)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          material = data[0];
        }
      }

      if (material) {
        toast({
          title: "Material Found!",
          description: `Found: ${material.name} (${material.type})`,
        });
        
        if (onMaterialFound) {
          onMaterialFound(material);
        }
        
        onClose();
      } else {
        toast({
          title: "Material Not Found",
          description: `No material found for QR code: ${qrCode}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching material:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for material",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleScan = () => {
    // Simulate QR code scanning - in real implementation this would use camera
    const mockCodes = ['QR001', 'QR002', 'QR003'];
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    console.log('Simulated scan result:', randomCode);
    searchMaterial(randomCode);
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      searchMaterial(manualCode.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sentiri-card border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span>Scan Material QR Code</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setScanMode('camera')}
              className="flex-1"
              disabled={searching}
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
              disabled={searching}
            >
              <Type className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {scanMode === 'camera' ? (
            <div className="space-y-4">
              {/* Camera View Simulation */}
              <div className="aspect-square bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <div className="text-center">
                  <Camera className={`h-12 w-12 mx-auto mb-3 text-muted-foreground ${searching ? 'animate-pulse' : ''}`} />
                  <p className="text-sm text-muted-foreground">
                    Position QR code within the frame
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Camera will automatically detect and scan
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleScan} 
                disabled={searching}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {searching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Simulate Scan'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">Enter QR Code or URL</Label>
                <Input
                  id="qr-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g., QR001, material ID, or full URL..."
                  className="bg-background/50"
                  disabled={searching}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && manualCode.trim()) {
                      handleManualEntry();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Enter QR code, material ID, or the full URL from scanning
                </p>
              </div>
              
              <Button 
                onClick={handleManualEntry} 
                disabled={!manualCode.trim() || searching}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {searching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Look Up Material'
                )}
              </Button>
            </div>
          )}

          {/* Recent Scans */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Access</h4>
            <div className="space-y-1">
              {['QR001 - Reclaimed Oak', 'QR002 - Aluminum Composite', 'QR003 - Hemp Fiber'].map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm bg-muted/20 rounded border hover:bg-muted/30 transition-colors disabled:opacity-50"
                  disabled={searching}
                  onClick={() => {
                    const code = item.split(' - ')[0];
                    setManualCode(code);
                    setScanMode('manual');
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Usage Note */}
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Supported formats:</strong> QR codes with URLs, material IDs, or legacy QR codes. The scanner will try multiple search methods to find your material.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

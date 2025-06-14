
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, Type } from "lucide-react";
import { useState } from "react";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScanner({ isOpen, onClose }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');

  const handleScan = () => {
    // Simulate QR code scanning
    const mockCodes = ['QR001', 'QR002', 'QR003'];
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    console.log('Scanned QR code:', randomCode);
    
    // Simulate finding material passport
    alert(`Found material passport for code: ${randomCode}`);
    onClose();
  };

  const handleManualEntry = () => {
    if (manualCode) {
      console.log('Manual QR code entry:', manualCode);
      alert(`Looking up material passport for code: ${manualCode}`);
      onClose();
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
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera Scan
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setScanMode('manual')}
              className="flex-1"
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
                  <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
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
                className="w-full bg-primary hover:bg-primary/90"
              >
                Simulate Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-code">Enter QR Code</Label>
                <Input
                  id="qr-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g., QR001, QR002, QR003..."
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the QR code printed on the material label
                </p>
              </div>
              
              <Button 
                onClick={handleManualEntry} 
                disabled={!manualCode}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Look Up Material
              </Button>
            </div>
          )}

          {/* Recent Scans */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Scans</h4>
            <div className="space-y-1">
              {['QR001 - Reclaimed Oak', 'QR002 - Aluminum Composite', 'QR003 - Hemp Fiber'].map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm bg-muted/20 rounded border hover:bg-muted/30 transition-colors"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

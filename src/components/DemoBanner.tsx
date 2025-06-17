
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DemoBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo-banner-dismissed");
    setOpen(!dismissed);
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem("demo-banner-dismissed", "true");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleDismiss(); }}>
      <DialogContent className="max-w-xs md:max-w-md p-4 md:p-6 rounded-lg flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
        <button
          aria-label="Dismiss"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:bg-white/20 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-2 items-center">
          <span className="text-2xl mb-1">🚀</span>
          <span className="text-sm text-center font-medium leading-snug">
            Demo Mode<br />
            <span className="block font-normal text-xs mt-1">
              This is a demonstration platform. Data is shared and may be reset.<br />
              In production, this would require user authentication.
            </span>
          </span>
        </div>
        <Button
          onClick={handleDismiss}
          size="sm"
          variant="secondary"
          className="mt-2"
        >
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  );
};


import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DemoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('demo-banner-dismissed');
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('demo-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 md:px-4 md:py-3 relative z-50 w-full">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className="text-base md:text-lg flex-shrink-0">🚀</span>
          <span className="font-medium text-xs md:text-sm leading-tight">
            Demo Mode - This is a demonstration platform. Data is shared and may be reset. In production, this would require user authentication.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-white hover:bg-white/20 p-1 h-6 w-6 md:h-8 md:w-8 flex-shrink-0 ml-2"
        >
          <X className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  );
};

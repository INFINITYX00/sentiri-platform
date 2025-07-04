
import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
        <p className="text-xs text-muted-foreground/70 mt-2">Setting up your workspace</p>
      </div>
    </div>
  );
}

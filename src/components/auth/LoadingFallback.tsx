import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function LoadingFallback() {
  const { signOut, user, loading, profile, company, isCreatingProfile } = useAuth();

  const handleSignOut = async () => {
    console.log('🔄 Sign out button clicked');
    try {
      await signOut();
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
        <p className="text-xs text-muted-foreground/70 mt-2">Setting up your workspace</p>
        
        {/* Emergency logout button - only show if loading for too long */}
        {loading && (
          <div className="mt-8 space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Sign Out
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

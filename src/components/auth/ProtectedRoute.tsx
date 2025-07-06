import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { LoadingFallback } from './LoadingFallback';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, profile, company, createProfileNow, signOut, isCreatingProfile } = useAuth();

  // Auto-create profile if user exists but no profile
  useEffect(() => {
    if (user && !profile && !loading && !isCreatingProfile) {
      console.log('🔄 Auto-creating profile for user:', user.id);
      // Add a small delay to ensure any pending operations complete
      setTimeout(() => {
        if (!profile && !isCreatingProfile) {
          createProfileNow();
        }
      }, 1000);
    }
  }, [user, profile, loading, isCreatingProfile, createProfileNow]);

  // Additional fallback: if user exists but no profile after a longer delay
  useEffect(() => {
    if (user && !profile && !loading && !isCreatingProfile) {
      const fallbackTimeout = setTimeout(() => {
        if (!profile && !isCreatingProfile) {
          console.log('🔄 Fallback profile creation for user:', user.id);
          createProfileNow();
        }
      }, 3000); // 3 second fallback

      return () => clearTimeout(fallbackTimeout);
    }
  }, [user, profile, loading, isCreatingProfile, createProfileNow]);

  // Emergency timeout: if stuck in loading for too long, force refresh
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ ProtectedRoute: Loading timeout, forcing page refresh');
        window.location.reload();
      }, 15000); // 15 seconds

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <AuthPage />;
  }

  // If user exists but no profile or company, show loading while auto-creating
  if (user && (!profile || !company)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium mb-2">Setting up your workspace...</p>
          <p className="text-muted-foreground text-sm">
            This should only take a moment.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

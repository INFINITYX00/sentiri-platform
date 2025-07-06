
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { LoadingFallback } from './LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, profile, company } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <AuthPage />;
  }

  // If user exists but no profile after a reasonable time, show setup needed message
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Account Setup Required</h2>
          <p className="text-muted-foreground mb-4">
            Your account needs to be set up. This usually happens automatically during signup.
          </p>
          <p className="text-sm text-muted-foreground">
            If this persists, please try signing out and signing in again, or contact support.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // If user exists but no company, show a setup message
  if (user && profile && !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-lg font-medium mb-2">Setting up your workspace...</p>
          <p className="text-muted-foreground text-sm">
            We're preparing your company dashboard. This should only take a moment.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

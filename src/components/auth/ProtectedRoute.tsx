
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { LoadingFallback } from './LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, profile, company, createProfileNow, signOut } = useAuth();

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
          <div className="space-y-3">
            <button 
              onClick={createProfileNow}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Complete Setup Now
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh Page
            </button>
            <button 
              onClick={signOut}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
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

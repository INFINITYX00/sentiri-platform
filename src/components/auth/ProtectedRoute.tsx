
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

  // Show loading while profile/company is being fetched
  if (user && !profile) {
    return <LoadingFallback />;
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

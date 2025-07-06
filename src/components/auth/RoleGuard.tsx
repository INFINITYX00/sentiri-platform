import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { profile } = useAuth();

  if (!profile) {
    return fallback || <div>Access denied. Please contact your administrator.</div>;
  }

  if (!allowedRoles.includes(profile.role)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this feature. 
            Required role: {allowedRoles.join(' or ')}
          </p>
          <p className="text-sm text-gray-500">
            Your current role: {profile.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for common roles
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']} fallback={fallback}>{children}</RoleGuard>;
}

export function ManagerOrAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'manager']} fallback={fallback}>{children}</RoleGuard>;
}

export function UserOrAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin', 'manager', 'user']} fallback={fallback}>{children}</RoleGuard>;
} 
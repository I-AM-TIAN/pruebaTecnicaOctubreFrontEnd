'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import type { Role } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    console.log('RoleGuard check:', { 
      isLoading, 
      isAuthenticated, 
      userRole: user?.role,
      userRoleType: typeof user?.role,
      allowedRoles,
      allowedRolesTypes: allowedRoles.map(r => typeof r),
      userObject: user
    });

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to /login');
        router.push('/login');
        return;
      }

      if (user?.role === 'admin') {
        console.log('Admin user - access granted');
        return;
      }

      const hasAccess = allowedRoles.includes(user?.role as Role);
      console.log('Role check:', {
        userRole: user?.role,
        allowedRoles,
        hasAccess,
        comparison: allowedRoles.map(r => ({ role: r, matches: r === user?.role }))
      });
      
      if (user && !hasAccess) {
        console.log('Role not allowed, redirecting to /403');
        router.replace('/403');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    console.log('RoleGuard: Loading...');
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === 'admin') {
    console.log('RoleGuard: Rendering children for admin');
    return <>{children}</>;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    console.log('RoleGuard: Access denied, returning null');
    return null;
  }

  console.log('RoleGuard: Rendering children for allowed role');
  return <>{children}</>;
}

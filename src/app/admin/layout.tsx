'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { LayoutDashboard, Users, FileText } from 'lucide-react';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
  { label: 'Prescripciones', href: '/admin/prescriptions', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar items={adminMenuItems} />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

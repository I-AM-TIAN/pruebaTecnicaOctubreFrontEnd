'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FileText, Plus } from 'lucide-react';

const doctorMenuItems = [
  { label: 'Prescripciones', href: '/doctor/prescriptions', icon: FileText },
  { label: 'Nueva Prescripción', href: '/doctor/prescriptions/new', icon: Plus },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['doctor']}>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar items={doctorMenuItems} />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

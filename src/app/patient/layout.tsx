'use client';

import { RoleGuard } from '@/components/guards/RoleGuard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { FileText } from 'lucide-react';

const patientMenuItems = [
  { label: 'Mis Prescripciones', href: '/patient/prescriptions', icon: FileText },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar items={patientMenuItems} />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { prescriptionService } from '@/lib/api-services';
import type { Prescription, PaginatedResponse, PrescriptionStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') as PrescriptionStatus | '' || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    loadPrescriptions();
  }, [filters]);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading doctor prescriptions...');
      
      const response = await prescriptionService.getMyPrescriptions({
        status: (filters.status as PrescriptionStatus) || undefined,
        patientId: undefined,
      });

      console.log('✅ Doctor prescriptions loaded:', response);

      const prescriptionsArray = (response as any).data || response;
      const isArray = Array.isArray(prescriptionsArray);
      
      setPrescriptions(isArray ? prescriptionsArray : []);
      
      const meta = (response as any).meta;
      if (meta) {
        setPagination({
          page: meta.page || 1,
          totalPages: meta.totalPages || 1,
          total: meta.total || prescriptionsArray.length,
        });
      } else {
        setPagination({
          page: 1,
          totalPages: 1,
          total: isArray ? prescriptionsArray.length : 0,
        });
      }
    } catch (err: any) {
      console.error('❌ Error loading prescriptions:', err);
      setError(err.message || 'Error al cargar prescripciones');
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.status) params.set('status', updated.status);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const columns: Column<Prescription>[] = [
    {
      key: 'code',
      label: 'Código',
      render: (item) => (
        <span className="font-mono font-semibold text-primary-600">{item.code}</span>
      ),
    },
    {
      key: 'patient',
      label: 'Paciente',
      render: (item) => {
        const patientName = item.patient?.user?.name || 'N/A';
        return (
          <div>
            <div className="font-medium">{patientName}</div>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            item.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {item.status === 'pending' ? 'Pendiente' : 'Consumida'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (item) => format(new Date(item.createdAt), 'PPP', { locale: es }),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prescripciones creadas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus prescripciones médicas</p>
        </div>
        <Link
          href="/doctor/prescriptions/new"
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva Prescripción
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value as PrescriptionStatus | '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="consumed">Consumida</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilters({ from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilters({ to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={prescriptions}
        columns={columns}
        isLoading={isLoading}
        error={error || undefined}
        emptyMessage="No se encontraron prescripciones"
        onRetry={loadPrescriptions}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          onPageChange: (page) => {
            const updated = { ...filters, page };
            setFilters(updated);
            
            const params = new URLSearchParams();
            if (updated.status) params.set('status', updated.status);
            if (updated.from) params.set('from', updated.from);
            if (updated.to) params.set('to', updated.to);
            params.set('page', page.toString());
            
            router.push(`?${params.toString()}`, { scroll: false });
          },
        }}
        actions={(item) => (
          <Link
            href={`/doctor/prescriptions/${item.id}`}
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Link>
        )}
      />
    </div>
  );
}

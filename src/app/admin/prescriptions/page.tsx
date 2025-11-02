'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable, Column } from '@/components/ui/DataTable';
import apiClient from '@/lib/api-client';
import type { Prescription, PaginatedResponse, Doctor, Patient } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    doctorId: searchParams.get('doctorId') || '',
    patientId: searchParams.get('patientId') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    loadDoctorsAndPatients();
  }, []);

  useEffect(() => {
    loadPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadDoctorsAndPatients = async () => {
    try {
      const [doctorsData, patientsData] = await Promise.all([
        apiClient<PaginatedResponse<Doctor>>('/doctors?limit=100'),
        apiClient<PaginatedResponse<Patient>>('/patients?limit=100'),
      ]);
      
      setDoctors(doctorsData.data);
      setPatients(patientsData.data);
    } catch (err: any) {
      console.error('Error loading doctors/patients:', err);
    }
  };

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '10',
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.doctorId) params.append('doctorId', filters.doctorId);
      if (filters.patientId) params.append('patientId', filters.patientId);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      
      const data = await apiClient<PaginatedResponse<Prescription>>(`/prescriptions/admin/prescriptions?${params}`);
      
      setPrescriptions(data.data);
      setPagination({
        page: data.meta.page,
        totalPages: data.meta.totalPages,
        total: data.meta.total,
      });
    } catch (err: any) {
      console.error('Error loading prescriptions:', err);
      setError(err.message || 'Error al cargar prescripciones');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    // Solo resetear a página 1 si se cambia algo diferente a la página
    const shouldResetPage = !('page' in newFilters);
    const updated = { 
      ...filters, 
      ...newFilters, 
      ...(shouldResetPage && { page: 1 })
    };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.status) params.set('status', updated.status);
    if (updated.doctorId) params.set('doctorId', updated.doctorId);
    if (updated.patientId) params.set('patientId', updated.patientId);
    if (updated.from) params.set('from', updated.from);
    if (updated.to) params.set('to', updated.to);
    if (updated.page > 1) params.set('page', updated.page.toString());

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
      key: 'doctor',
      label: 'Doctor',
      render: (item) => {
        const doctorEmail = (item as any).author?.user?.email;
        const doctorId = (item as any).authorId;
        
        return (
          <div>
            <div className="font-medium text-gray-900">{doctorEmail || 'N/A'}</div>
            <div className="text-xs text-gray-500">ID: {doctorId?.substring(0, 8) || 'N/A'}...</div>
          </div>
        );
      },
    },
    {
      key: 'patient',
      label: 'Paciente',
      render: (item) => {
        const patientEmail = (item.patient as any)?.user?.email;
        
        return (
          <div>
            <div className="font-medium text-gray-900">{patientEmail || 'N/A'}</div>
            <div className="text-xs text-gray-500">ID: {item.patientId?.substring(0, 8) || 'N/A'}...</div>
          </div>
        );
      },
    },
    {
      key: 'medications',
      label: 'Medicamentos',
      render: (item) => (
        <div className="text-sm text-gray-700">
          {item.items?.length || 0} medicamento(s)
        </div>
      ),
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
      render: (item) => (
        <div className="text-sm text-gray-700">
          {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: es })}
        </div>
      ),
    },
    {
      key: 'consumedAt',
      label: 'Fecha de Consumo',
      render: (item) => (
        <div className="text-sm text-gray-700">
          {item.consumedAt ? format(new Date(item.consumedAt), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescripciones</h1>
        <p className="text-gray-600 mt-1">Gestión de todas las prescripciones del sistema</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="consumed">Consumida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={filters.doctorId}
              onChange={(e) => updateFilters({ doctorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Todos los doctores</option>
              {doctors.map((doctor) => {
                const doctorObj = doctor as any;
                const name = doctorObj.name || doctorObj.email || 'Sin nombre';
                const specialty = doctorObj.doctor?.specialty || '';
                // El userId correcto está en doctor.id (ID del registro Doctor, no del User)
                const doctorId = doctorObj.doctor?.id || doctorObj.id;
                return (
                  <option key={doctorObj.id} value={doctorId}>
                    {name}{specialty ? ` - ${specialty}` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
            <select
              value={filters.patientId}
              onChange={(e) => updateFilters({ patientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Todos los pacientes</option>
              {patients.map((patient) => {
                const patientObj = patient as any;
                const name = patientObj.name || patientObj.email || 'Sin nombre';
                // El patientId correcto está en patient.id (similar a doctor.id)
                const patientId = patientObj.patient?.id || patientObj.id;
                return (
                  <option key={patientObj.id} value={patientId}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilters({ from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilters({ to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        data={prescriptions}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No se encontraron prescripciones"
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-900 font-medium">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateFilters({ page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300"
            >
              Anterior
            </button>
            <button
              onClick={() => updateFilters({ page: filters.page + 1 })}
              disabled={filters.page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:border-gray-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

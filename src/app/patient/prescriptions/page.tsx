'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, Download, CheckCircle, Loader2 } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { patientPrescriptionService, downloadPrescriptionPDF } from '@/lib/api-services';
import type { Prescription, PrescriptionStatus } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consumeDialog, setConsumeDialog] = useState<{ isOpen: boolean; prescription: Prescription | null }>({
    isOpen: false,
    prescription: null,
  });
  const [isConsuming, setIsConsuming] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') as PrescriptionStatus | '' || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    loadPrescriptions();
  }, [filters]);

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await patientPrescriptionService.getMyPrescriptions({
        status: (filters.status as PrescriptionStatus) || undefined,
        page: filters.page,
        limit: 10,
      });

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
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.status) params.set('status', updated.status);
    if (updated.page > 1) params.set('page', updated.page.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleConsume = async () => {
    if (!consumeDialog.prescription) return;

    setIsConsuming(true);
    try {
      await patientPrescriptionService.consume(consumeDialog.prescription.id);

      toast.success('Prescripción marcada como consumida');
      setConsumeDialog({ isOpen: false, prescription: null });
      loadPrescriptions();
    } catch (error: any) {
      console.error('Error consuming prescription:', error);
      toast.error(error.message || 'Error al consumir prescripción');
    } finally {
      setIsConsuming(false);
    }
  };

  const handleDownloadPDF = async (prescription: Prescription) => {
    setDownloadingPDF(prescription.id);
    try {
      await downloadPrescriptionPDF(prescription.id, prescription.code);
      toast.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Error al descargar el PDF');
    } finally {
      setDownloadingPDF(null);
    }
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
      key: 'doctorName',
      label: 'Doctor',
      render: (item) => {
        const doctorName = item.author?.user?.name || 'N/A';
        const specialty = item.author?.specialty || '';
        return (
          <div>
            <div className="font-medium">{doctorName}</div>
            {specialty && <div className="text-xs text-gray-500">{specialty}</div>}
          </div>
        );
      },
    },
    {
      key: 'diagnosis',
      label: 'Diagnóstico',
      render: (item) => (
        <span className="text-gray-700">{item.diagnosis}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => (
        <span
          className={'inline-flex px-2 py-1 text-xs font-semibold rounded-full ' + (
            item.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          )}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Prescripciones</h1>
        <p className="text-gray-600 mt-2">Consulta y gestiona tus prescripciones médicas</p>
      </div>

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
        </div>
      </div>

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
            params.set('page', page.toString());
            
            router.push(`?${params.toString()}`, { scroll: false });
          },
        }}
        actions={(item) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/patient/prescriptions/${item.id}`}
              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium"
            >
              <Eye className="w-4 h-4" />
              Ver
            </Link>
            {item.status === 'pending' && (
              <button
                onClick={() => setConsumeDialog({ isOpen: true, prescription: item })}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Consumir
              </button>
            )}
            <button
              onClick={() => handleDownloadPDF(item)}
              disabled={downloadingPDF === item.id}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            >
              {downloadingPDF === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </button>
          </div>
        )}
      />

      <ConfirmDialog
        isOpen={consumeDialog.isOpen}
        onCancel={() => setConsumeDialog({ isOpen: false, prescription: null })}
        onConfirm={handleConsume}
        title="Confirmar Consumo"
        message={`¿Estás seguro que deseas marcar la prescripción ${consumeDialog.prescription?.code || ''} como consumida? Esta acción no se puede deshacer.`}
        confirmText="Sí, consumir"
        cancelText="Cancelar"
      />
    </div>
  );
}

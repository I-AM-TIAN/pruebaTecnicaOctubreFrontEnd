'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Download, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import apiClient from '@/lib/api-client';
import type { Prescription } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientPrescriptionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const toast = useToast();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [consumeDialog, setConsumeDialog] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setPrescriptionId(resolvedParams.id);
    });
  }, [params]);

  const loadPrescription = async () => {
    if (!prescriptionId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient<Prescription>(`/prescriptions/${prescriptionId}`);
      setPrescription(data);
    } catch (err: any) {
      console.error('Error loading prescription:', err);
      setError(err.message || 'Error al cargar prescripción');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (prescriptionId) {
      loadPrescription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId]);

  const handleConsume = async () => {
    if (!prescription) return;

    setIsConsuming(true);
    try {
      await apiClient(`/prescriptions/${prescription.id}/consume`, {
        method: 'PUT',
      });

      toast.success('Prescripción marcada como consumida');
      setConsumeDialog(false);
      loadPrescription();
    } catch (error: any) {
      console.error('Error consuming prescription:', error);
      toast.error(error.message || 'Error al consumir prescripción');
    } finally {
      setIsConsuming(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!prescription) return;

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('No estás autenticado');
        router.push('/login');
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
      
      toast.success('Descargando PDF...');

      const response = await fetch(
        `${apiBaseUrl}/prescriptions/${prescription.id}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              localStorage.setItem('accessToken', data.accessToken);
              localStorage.setItem('refreshToken', data.refreshToken);
              return handleDownloadPDF();
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
          }
        }
        
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.clear();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al descargar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        };
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `prescription-${prescription.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Error al descargar PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <p className="text-red-800 font-medium mb-2">Error al cargar prescripción</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadPrescription}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!prescription) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Prescripción #{prescription.code}
            </h1>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                prescription.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {prescription.status === 'pending' ? 'Pendiente' : 'Consumida'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {prescription.status === 'pending' && (
              <button
                onClick={() => setConsumeDialog(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como Consumida
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Doctor</p>
              <p className="font-medium text-gray-900">
                {(prescription as any).author?.user?.email || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">ID: {(prescription as any).authorId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="font-medium text-gray-900">
                {format(new Date(prescription.createdAt), 'PPP', { locale: es })}
              </p>
              {prescription.consumedAt && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Fecha de Consumo</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(prescription.consumedAt), 'PPP', { locale: es })}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Medications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Medicamentos Recetados</h2>
        
        <div className="space-y-4">
          {prescription.items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {item.dosage && (
                  <div>
                    <span className="text-gray-500">Dosis:</span>
                    <span className="ml-2 text-gray-900 font-medium">{item.dosage}</span>
                  </div>
                )}
                
                {item.quantity && (
                  <div>
                    <span className="text-gray-500">Cantidad:</span>
                    <span className="ml-2 text-gray-900 font-medium">{item.quantity}</span>
                  </div>
                )}

                {item.instructions && (
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-gray-500">Instrucciones:</span>
                    <p className="text-gray-900 mt-1">{item.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consume Dialog */}
      <ConfirmDialog
        isOpen={consumeDialog && !isConsuming}
        title="Marcar como Consumida"
        message={`¿Estás seguro de que deseas marcar esta prescripción como consumida? Esta acción no se puede deshacer.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="primary"
        onConfirm={handleConsume}
        onCancel={() => setConsumeDialog(false)}
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { Prescription } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DoctorPrescriptionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setPrescriptionId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (prescriptionId) {
      loadPrescription();
    }
  }, [prescriptionId]);

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Paciente</p>
              <p className="font-medium text-gray-900">
                {(prescription.patient as any)?.user?.email || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">ID: {prescription.patientId}</p>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Medicamentos</h2>
        
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
    </div>
  );
}

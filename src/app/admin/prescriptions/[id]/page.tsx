'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Download, Loader2, UserCog, Mail } from 'lucide-react';
import apiClient from '@/lib/api-client';
import type { Prescription } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPrescriptionDetailPage({ params }: PageProps) {
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

  const handleDownloadPDF = async () => {
    if (!prescription) return;

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

      const response = await fetch(
        `${apiBaseUrl}/prescriptions/${prescription.id}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al descargar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescripcion-${prescription.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Error</p>
          <p className="text-red-600 text-sm mb-4">{error || 'Prescripción no encontrada'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Prescripción {prescription.code}
            </h1>
            <p className="text-gray-600 mt-2">Detalle completo de la prescripción</p>
          </div>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            prescription.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {prescription.status === 'consumed' && <CheckCircle className="w-4 h-4" />}
          {prescription.status === 'pending' ? 'Pendiente' : 'Consumida'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Medicamentos
            </h2>
            
            <div className="space-y-4">
              {prescription.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{item.medication}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.dosage && (
                      <div>
                        <span className="text-gray-600">Dosis:</span>
                        <p className="text-gray-900 font-medium">{item.dosage}</p>
                      </div>
                    )}
                    
                    {item.quantity && (
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <p className="text-gray-900 font-medium">{item.quantity}</p>
                      </div>
                    )}
                  </div>
                  
                  {item.duration && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Duración:</span>
                      <p className="text-sm text-gray-900 mt-1">{item.duration}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Doctor
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {(prescription as any).author?.user?.name || 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-sm text-gray-900 font-medium flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {(prescription as any).author?.user?.email || 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">ID:</span>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {(prescription as any).authorId || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Paciente
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {(prescription.patient as any)?.user?.name || 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-sm text-gray-900 font-medium flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {(prescription.patient as any)?.user?.email || 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Fecha de Nacimiento:</span>
                <p className="text-sm text-gray-900 mt-1">
                  {(prescription.patient as any)?.birthDate 
                    ? format(new Date((prescription.patient as any).birthDate), 'dd/MM/yyyy', { locale: es })
                    : 'N/A'}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">ID:</span>
                <p className="text-xs text-gray-500 font-mono mt-1">{prescription.patientId}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Fechas
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Creada:</span>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {format(new Date(prescription.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(prescription.createdAt), 'HH:mm', { locale: es })}
                </p>
              </div>
              
              {prescription.consumedAt && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Consumida:</span>
                  <p className="text-sm text-gray-900 font-medium mt-1">
                    {format(new Date(prescription.consumedAt), "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(prescription.consumedAt), 'HH:mm', { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Código:</span>
                <span className="font-mono font-medium text-gray-900">{prescription.code}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Medicamentos:</span>
                <span className="font-medium text-gray-900">{prescription.items.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">ID Prescripción:</span>
                <span className="text-xs font-mono text-gray-500">{prescription.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { prescriptionService, patientService } from '@/lib/api-services';
import type { PrescriptionItem, CreatePrescriptionDto, Patient } from '@/types';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [formData, setFormData] = useState({
    patientId: '',
  });
  const [items, setItems] = useState<PrescriptionItem[]>([
    { name: '', dosage: '', quantity: 1, instructions: '' },
  ]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await patientService.getPatients({ limit: 100 });
      console.log('Patients loaded:', data);
      console.log('First patient sample:', data.data[0]);
      setPatients(data.data);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Error al cargar lista de pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', dosage: '', quantity: 1, instructions: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.patientId.trim()) {
      toast.error('El ID del paciente es requerido');
      return;
    }

    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      toast.error('Debe agregar al menos un medicamento');
      return;
    }

    setIsLoading(true);

    try {
      const dto: CreatePrescriptionDto = {
        patientId: formData.patientId.trim(),
        items: validItems.map(item => ({
          name: item.name,
          dosage: item.dosage,
          quantity: item.quantity,
          instructions: item.instructions || undefined,
        })),
      };

      console.log('Creating prescription with DTO:', dto);
      console.log('Selected patient from state:', patients.find(p => (p as any).id === formData.patientId));

      await prescriptionService.create(dto);

      toast.success('Prescripción creada exitosamente');
      router.push('/doctor/prescriptions');
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      console.error('Error details:', { message: error.message, status: error.status, data: error.data });
      
      // Manejo específico de errores comunes
      if (error.message?.includes('Patient not found') || error.message?.includes('not found')) {
        toast.error('Paciente no encontrado. Verifica que el ID sea correcto y que el usuario tenga rol de paciente.');
      } else if (error.message?.includes('items')) {
        toast.error('Error en los medicamentos: ' + error.message);
      } else {
        toast.error(error.message || 'Error al crear prescripción');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Prescripción</h1>
        <p className="text-gray-600 mt-2">Crea una nueva prescripción médica para un paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Paciente</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente <span className="text-red-500">*</span>
              </label>
              {loadingPatients ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Cargando pacientes...</span>
                </div>
              ) : (
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                >
                  <option value="">Selecciona un paciente</option>
                  {patients.map((patient) => {
                    // El backend puede devolver la estructura de diferentes formas
                    // Intentar acceder a los datos de múltiples formas posibles
                    const patientData = patient as any;
                    
                    // Buscar el nombre en diferentes ubicaciones
                    const name = patientData.name || 
                                patientData.user?.name || 
                                patientData.user?.email?.split('@')[0] || 
                                'Paciente';
                    
                    // Buscar el email
                    const email = patientData.email || patientData.user?.email || '';
                    
                    // IMPORTANTE: El backend espera el ID interno del patient (patient.patient.id)
                    // no el ID del registro principal (patient.id)
                    const patientId = patientData.patient?.id || patientData.id;
                    
                    return (
                      <option key={patientData.id} value={patientId}>
                        {name} {email ? `- ${email}` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Selecciona el paciente para quien será la prescripción.
              </p>
            </div>
          </div>
        </div>

        {/* Prescription Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Medicamentos</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicamento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      placeholder="ej: Paracetamol 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.dosage}
                      onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      placeholder="ej: 1 tableta cada 8 horas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      placeholder="ej: 20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones
                    </label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      placeholder="ej: Tomar después de las comidas"
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 self-start text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Prescripción'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { prescriptionService } from '@/lib/api-services';
import type { PrescriptionItem, CreatePrescriptionDto } from '@/types';

export default function NewPrescriptionPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    notes: '',
  });
  const [items, setItems] = useState<PrescriptionItem[]>([
    { medication: '', dosage: '', quantity: 1, duration: '' },
  ]);

  const addItem = () => {
    setItems([...items, { medication: '', dosage: '', quantity: 1, duration: '' }]);
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

    if (!formData.diagnosis.trim()) {
      toast.error('El diagnóstico es requerido');
      return;
    }

    const validItems = items.filter((item) => item.medication.trim());
    if (validItems.length === 0) {
      toast.error('Debe agregar al menos un medicamento');
      return;
    }

    setIsLoading(true);

    try {
      const dto: CreatePrescriptionDto = {
        patientId: formData.patientId.trim(),
        diagnosis: formData.diagnosis.trim(),
        notes: formData.notes || undefined,
        items: validItems.map(item => ({
          medication: item.medication,
          dosage: item.dosage,
          quantity: item.quantity,
          duration: item.duration || undefined,
        })),
      };

      await prescriptionService.create(dto);

      toast.success('Prescripción creada exitosamente');
      router.push('/doctor/prescriptions');
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      
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
                ID del Paciente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 font-mono"
                placeholder="ej: cm2xzy6e40003u2k6xyz"
              />
              <p className="mt-1 text-sm text-gray-500">
                Ingresa el ID del paciente (patient ID).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                placeholder="ej: Gripe común, Hipertensión arterial..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Generales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                placeholder="Notas adicionales sobre la prescripción..."
              />
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
                      value={item.medication}
                      onChange={(e) => updateItem(index, 'medication', e.target.value)}
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
                      Duración
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => updateItem(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                      placeholder="ej: 5 días, 2 semanas"
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


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Play, Pause, Trash2, Upload, Loader2, Check, FileAudio } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAudioRecorder } from '@/hooks';
import { prescriptionService, patientService } from '@/lib/api-services';
import type { Patient } from '@/types';

export default function NewAudioPrescriptionPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error: recorderError,
  } = useAudioRecorder();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      console.log('🔍 Loading patients...');
      const data = await patientService.getPatients({ limit: 100 });
      console.log('✅ Patients loaded:', data);
      
      // Verificar si data.data existe, sino usar data directamente
      const patientsList = data.data || data;
      console.log('📋 Patients list:', patientsList);
      
      setPatients(Array.isArray(patientsList) ? patientsList : []);
    } catch (error: any) {
      console.error('❌ Error loading patients:', error);
      toast.error('Error al cargar lista de pacientes: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recorderError) {
      toast.error(recorderError);
    }
  }, [recorderError, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/mp4'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|webm)$/i)) {
        toast.error('Formato de audio no válido. Usa MP3, WAV, OGG, M4A o WEBM');
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB');
        return;
      }

      setUploadedFile(file);
      clearRecording(); // Limpiar grabación si existe
      toast.success('Audio cargado correctamente');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      toast.error('Por favor selecciona un paciente');
      return;
    }

    const audioToUse = uploadedFile || (audioBlob ? new File([audioBlob], 'prescription-audio.webm', { type: audioBlob.type }) : null);

    if (!audioToUse) {
      toast.error('Por favor graba o sube un audio con la prescripción');
      return;
    }

    console.log('📤 Enviando prescripción con patientId:', selectedPatientId);
    console.log('🎤 Audio file:', audioToUse);
    
    setIsSubmitting(true);

    try {
      const prescription = await prescriptionService.createFromAudio(audioToUse, selectedPatientId);

      console.log('✅ Prescripción creada:', prescription);
      toast.success(`¡Prescripción creada! Código: ${prescription.code}`);
      
      // Redirigir a la lista de prescripciones después de 1 segundo
      setTimeout(() => {
        router.push('/doctor/prescriptions');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error creating prescription:', error);
      toast.error(error.message || 'Error al crear la prescripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    clearRecording();
    setUploadedFile(null);
  };

  const hasAudio = audioBlob || uploadedFile;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Prescripción por Audio
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Graba o sube un audio dictando los medicamentos y el sistema creará la prescripción automáticamente
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Selección de Paciente */}
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-2">
              Paciente *
            </label>
          {loadingPatients ? (
            <div className="flex items-center text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cargando pacientes...
            </div>
          ) : patients.length === 0 ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              ⚠️ No hay pacientes disponibles. Asegúrate de que existen pacientes en el sistema.
            </div>
          ) : (
            <select
              id="patient"
              value={selectedPatientId}
              onChange={(e) => {
                console.log('👤 Paciente seleccionado ID:', e.target.value);
                setSelectedPatientId(e.target.value);
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900"
              disabled={isSubmitting}
            >
              <option value="">-- Seleccionar Paciente --</option>
              {patients.map((item: any) => {
                // Estructura: { id, patient: { id, name, email, ... }, ... }
                const patientData = item.patient || item;
                const patientId = patientData.id || item.id;
                
                // Buscar nombre en múltiples ubicaciones
                const name = patientData.name || 
                             patientData.user?.name || 
                             item.name || 
                             item.user?.name || 
                             'Paciente sin nombre';
                
                // Buscar email en múltiples ubicaciones
                const email = patientData.email || 
                              patientData.user?.email || 
                              item.email || 
                              item.user?.email || 
                              '';
                
                const displayText = email ? `${name} - ${email}` : name;
                
                // Log completo para debugging
                console.log('📋 Patient:', { 
                  patientId, 
                  name, 
                  email,
                  hasPatientNested: !!item.patient,
                  itemKeys: Object.keys(item)
                });
                
                return (
                  <option key={patientId} value={patientId}>
                    {displayText}
                  </option>
                );
              })}
            </select>
          )}
          {!loadingPatients && patients.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} disponible{patients.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Instrucciones para grabar:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Habla claro y despacio</li>
            <li>Menciona: nombre del medicamento, dosis, cantidad e instrucciones</li>
            <li>Ejemplo: "Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada 8 horas"</li>
            <li>Graba en un lugar silencioso</li>
            <li>Duración recomendada: 10-60 segundos</li>
          </ul>
        </div>

        {/* Grabación de Audio */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isRecording ? (
                <div className="relative">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-12 h-12 text-red-600" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {formatTime(recordingTime)}
                  </div>
                </div>
              ) : hasAudio ? (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mic className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Controles de Grabación */}
            <div className="flex justify-center gap-3">
              {!isRecording && !hasAudio && (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
                  disabled={isSubmitting}
                >
                  <Mic className="w-5 h-5" />
                  Iniciar Grabación
                </button>
              )}

              {isRecording && !isPaused && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Pause className="w-5 h-5" />
                    Pausar
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Square className="w-5 h-5" />
                    Detener
                  </button>
                </>
              )}

              {isRecording && isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Play className="w-5 h-5" />
                    Reanudar
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <Square className="w-5 h-5" />
                    Detener
                  </button>
                </>
              )}

              {hasAudio && !isRecording && (
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-semibold"
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-5 h-5" />
                  Limpiar
                </button>
              )}
            </div>

            {/* Reproductor de Audio */}
            {audioUrl && !isRecording && (
              <div className="mt-4">
                <audio
                  src={audioUrl}
                  controls
                  className="mx-auto"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}

            {/* Info del archivo subido */}
            {uploadedFile && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-700">
                <FileAudio className="w-5 h-5" />
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({(uploadedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
            )}

            {/* Separador */}
            {!isRecording && !hasAudio && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>
            )}

            {/* Subir Archivo */}
            {!isRecording && !hasAudio && (
              <div>
                <label
                  htmlFor="audioUpload"
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  Subir Audio
                </label>
                <input
                  id="audioUpload"
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formatos: MP3, WAV, OGG, M4A, WEBM (máx. 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting || isRecording}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedPatientId || !hasAudio || isSubmitting || isRecording}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Crear Prescripción
              </>
            )}
          </button>
        </div>

        {/* Mensaje de Procesamiento */}
        {isSubmitting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              ⏳ Procesando audio... Esto puede tardar 10-30 segundos mientras transcribimos y extraemos la información.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

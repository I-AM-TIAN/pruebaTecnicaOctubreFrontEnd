# Changelog

## [1.1.0] - 2025-11-06

### ✨ Added - Audio Prescription Feature

#### New Pages
- **`/doctor/prescriptions/new-audio`** - Nueva página para crear prescripciones por audio
  - Interfaz de grabación en tiempo real
  - Opción de subir archivos de audio
  - Selección de paciente
  - Vista previa de audio

#### New Hooks
- **`useAudioRecorder`** - Custom hook para manejo de grabación de audio
  - Control de MediaRecorder API
  - Estados: recording, paused, stopped
  - Timer en tiempo real
  - Manejo de errores y permisos

#### New API Methods
- **`prescriptionService.createFromAudio(audioFile, patientId)`** - Crear prescripción desde audio
- **`prescriptionService.getMyPrescriptions(filters)`** - Obtener prescripciones del doctor

#### New Types
- Agregado `transcription?: string` a interfaz `Prescription`
- Agregado `aiProcessed?: boolean` a interfaz `Prescription`

#### UI Improvements
- Botón "Crear por Audio" en lista de prescripciones del doctor
- Sección de transcripción en vista de detalle de prescripciones
- Badge especial para prescripciones creadas con IA
- Animaciones y feedback visual durante grabación

#### Documentation
- **`AUDIO_PRESCRIPTION_GUIDE.md`** - Guía completa de uso para usuarios
- **`AUDIO_PRESCRIPTION_TECHNICAL.md`** - Documentación técnica para desarrolladores
- **`IMPLEMENTATION_SUMMARY.md`** - Resumen de implementación
- Actualizado **`README.md`** con información de nueva funcionalidad

### 🔧 Technical Details

#### Features
- ✅ Grabación de audio en tiempo real
- ✅ Pause/Resume durante grabación
- ✅ Subida de archivos de audio (MP3, WAV, OGG, M4A, WEBM)
- ✅ Validación de formato y tamaño (máx 10MB)
- ✅ Transcripción automática con ElevenLabs API
- ✅ Extracción de datos con OpenAI GPT-4
- ✅ Manejo de permisos de micrófono
- ✅ Estados de carga durante procesamiento (10-30s)
- ✅ Mensajes de error informativos

#### Browser Support
- ✅ Chrome/Edge (Windows, macOS, Linux)
- ✅ Firefox (Windows, macOS, Linux)
- ✅ Safari (macOS, iOS)
- ✅ Mobile browsers (Android, iOS)

#### Security
- ✅ Autenticación JWT requerida
- ✅ Verificación de rol (solo doctores)
- ✅ Validación de entrada en cliente y servidor
- ✅ HTTPS requerido en producción (para micrófono)

### 📊 Performance
- Tiempo de procesamiento: 10-30 segundos
- Costo por prescripción: ~$0.05 USD
- Tamaño promedio de audio: 500KB - 1MB

### 🐛 Known Issues
- Ninguno reportado

### 🔜 Future Enhancements
- Compresión de audio antes de subir
- Transcripción en tiempo real
- Visualización de forma de onda
- Soporte multi-idioma
- Comandos de voz

---

## [1.0.0] - 2025-11-01

### Initial Release

#### Features
- Dashboard de administrador con métricas
- Gestión de usuarios (CRUD)
- Gestión de prescripciones
- Roles: Admin, Doctor, Paciente
- Autenticación JWT
- Auto-refresh de tokens
- Descarga de PDF de prescripciones
- Filtros y paginación
- Diseño responsive

#### Tech Stack
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS 4
- Zustand
- Zod
- Recharts
- Lucide React
- date-fns

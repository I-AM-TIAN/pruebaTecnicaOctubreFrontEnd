# 🎤 Audio Prescription Feature - Technical Documentation

## Overview

This feature allows doctors to create medical prescriptions by recording or uploading audio files. The system uses AI to transcribe and structure the data automatically.

---

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js 14)   │
└────────┬────────┘
         │
         │ FormData (audio + patientId)
         │
         ▼
┌─────────────────┐
│   API Backend   │
│   (NestJS)      │
└────────┬────────┘
         │
         ├──► ElevenLabs API (Transcription)
         │
         ├──► OpenAI API (Data Extraction)
         │
         └──► Database (Prescription Storage)
```

---

## Files Created/Modified

### New Files

1. **`src/hooks/useAudioRecorder.ts`**
   - Custom hook for audio recording
   - Handles MediaRecorder API
   - Recording states: recording, paused, stopped
   - Returns: audioBlob, audioUrl, controls

2. **`src/app/doctor/prescriptions/new-audio/page.tsx`**
   - UI page for audio prescription creation
   - Audio recording interface
   - File upload functionality
   - Patient selection
   - Submit logic

3. **`AUDIO_PRESCRIPTION_GUIDE.md`**
   - User guide documentation
   - Usage examples
   - Troubleshooting

### Modified Files

1. **`src/hooks/index.ts`**
   - Added: `export { useAudioRecorder } from './useAudioRecorder'`

2. **`src/lib/api-services.ts`**
   - Added: `prescriptionService.createFromAudio()`
   - Added: `prescriptionService.getMyPrescriptions()` (for doctors)

3. **`src/types/index.ts`**
   - Updated: `Prescription` interface
   - Added fields: `transcription?`, `aiProcessed?`

4. **`src/app/doctor/prescriptions/page.tsx`**
   - Added: "Crear por Audio" button
   - Imports: `Mic` icon from lucide-react

5. **`src/app/doctor/prescriptions/[id]/page.tsx`**
   - Added: Transcription display section
   - Shows when `aiProcessed === true`

---

## API Integration

### Endpoint
```
POST /prescriptions/from-audio
```

### Request
```typescript
// FormData
{
  audio: File,      // Audio file (MP3, WAV, OGG, M4A, WEBM)
  patientId: string // Patient UUID
}
```

### Response
```typescript
interface AudioPrescriptionResponse {
  id: string;
  code: string; // e.g., "RX-ABC123"
  status: "pending" | "consumed";
  notes?: string;
  createdAt: string;
  consumedAt?: string | null;
  patientId: string;
  authorId: string;
  items: Array<{
    id: string;
    name: string;
    dosage: string;
    quantity: number;
    instructions?: string;
  }>;
  patient: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  author: {
    id: string;
    specialty: string;
    user: {
      name: string;
      email: string;
    };
  };
  transcription: string; // ✨ Audio transcription
  aiProcessed: boolean;  // ✨ AI flag
}
```

---

## Hook: useAudioRecorder

### Usage
```typescript
import { useAudioRecorder } from '@/hooks';

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
  error,
} = useAudioRecorder();
```

### State Management
```typescript
interface UseAudioRecorderReturn {
  isRecording: boolean;      // Currently recording
  isPaused: boolean;         // Recording paused
  recordingTime: number;     // Seconds elapsed
  audioBlob: Blob | null;    // Recorded audio blob
  audioUrl: string | null;   // Object URL for playback
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  error: string | null;      // Error messages
}
```

### Features
- ✅ Microphone permission handling
- ✅ Real-time timer
- ✅ Pause/resume capability
- ✅ Audio format selection (WEBM/MP4)
- ✅ Memory cleanup
- ✅ Error handling

---

## Service: createFromAudio

### Implementation
```typescript
// src/lib/api-services.ts
export const prescriptionService = {
  createFromAudio: async (
    audioFile: File, 
    patientId: string
  ): Promise<Prescription> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('patientId', patientId);

    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/from-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  },
};
```

### Why not use apiClient?
- `apiClient` helper doesn't support `FormData` natively
- Need to send multipart/form-data
- Manual fetch with proper headers

---

## UI Components

### Page Structure
```tsx
<div>
  {/* Patient Selection */}
  <select>...</select>

  {/* Instructions Card */}
  <div className="bg-blue-50">...</div>

  {/* Audio Recording Area */}
  <div className="border-dashed">
    {isRecording ? (
      <RecordingControls />
    ) : hasAudio ? (
      <AudioPlayback />
    ) : (
      <RecordOrUpload />
    )}
  </div>

  {/* Action Buttons */}
  <button onClick={handleSubmit}>
    Crear Prescripción
  </button>
</div>
```

### State Flow
```
1. Page Load → Load patients
2. Select patient
3. Record/Upload audio
4. Submit → Show loader (10-30s)
5. Success → Redirect to /doctor/prescriptions
```

---

## Validation

### Client-Side
```typescript
// File type validation
const validTypes = [
  'audio/mp3', 'audio/mpeg', 'audio/wav', 
  'audio/ogg', 'audio/webm', 'audio/m4a'
];

// File size validation
if (file.size > 10 * 1024 * 1024) {
  // Error: Max 10MB
}

// Required fields
if (!selectedPatientId || !audioFile) {
  // Error: Missing data
}
```

### Server-Side
- Patient existence check
- Audio file validation
- Role verification (must be doctor)
- JWT authentication

---

## Error Handling

### Recorder Errors
```typescript
if (err.name === 'NotAllowedError') {
  return 'Permiso denegado. Permite el acceso al micrófono.';
}
if (err.name === 'NotFoundError') {
  return 'No se encontró micrófono.';
}
return 'Error al iniciar la grabación.';
```

### API Errors
```typescript
try {
  await prescriptionService.createFromAudio(audioFile, patientId);
  toast.success(`¡Prescripción creada! Código: ${code}`);
} catch (error: any) {
  toast.error(error.message || 'Error al crear la prescripción');
}
```

---

## Testing

### Manual Testing Checklist

#### Happy Path
- [ ] Select patient
- [ ] Record audio (10-30s)
- [ ] Click "Crear Prescripción"
- [ ] Wait for processing
- [ ] Verify redirect to list
- [ ] Check prescription detail shows transcription

#### Edge Cases
- [ ] Deny microphone permission → Should show upload option
- [ ] Upload invalid file type → Should show error
- [ ] Upload file > 10MB → Should show error
- [ ] Submit without patient → Should show error
- [ ] Submit without audio → Should show error
- [ ] Network error during submit → Should show error

#### Audio Quality
- [ ] Clear audio → Good transcription
- [ ] Noisy audio → May have errors
- [ ] Multiple medications → All extracted
- [ ] Different languages → May not work (English/Spanish only)

### Automated Testing
```typescript
// Example test (Jest + Testing Library)
describe('Audio Prescription Page', () => {
  it('should show microphone button', () => {
    render(<NewAudioPrescriptionPage />);
    expect(screen.getByText('Iniciar Grabación')).toBeInTheDocument();
  });

  it('should disable submit without patient', () => {
    render(<NewAudioPrescriptionPage />);
    const submitBtn = screen.getByText('Crear Prescripción');
    expect(submitBtn).toBeDisabled();
  });
});
```

---

## Performance Considerations

### Audio Processing Time
- Transcription: ~5-10 seconds
- AI extraction: ~5-10 seconds
- Database save: ~1-2 seconds
- **Total**: 10-30 seconds

### Optimization Tips
1. Show loading indicator
2. Disable navigation during processing
3. Compress audio before upload (optional)
4. Cache patient list

---

## Security

### Authentication
```typescript
// JWT token required
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### Authorization
- Only `doctor` role can create prescriptions
- Verified on backend

### Data Validation
- Audio format whitelist
- File size limit (10MB)
- Patient ID validation
- Sanitize transcription

---

## Browser Compatibility

| Browser | Recording | Upload | Notes |
|---------|-----------|--------|-------|
| Chrome  | ✅        | ✅     | Best support |
| Firefox | ✅        | ✅     | Full support |
| Safari  | ✅        | ✅     | Requires HTTPS |
| Edge    | ✅        | ✅     | Chromium-based |
| Mobile  | ✅        | ✅     | iOS/Android |

### MediaRecorder API
- Supported: Chrome 47+, Firefox 25+, Safari 14+
- Formats: WEBM (Chrome/Firefox), MP4 (Safari)

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
```

---

## Future Improvements

### Potential Features
1. ✨ Real-time transcription (live feedback)
2. ✨ Audio waveform visualization
3. ✨ Multi-language support
4. ✨ Voice commands (e.g., "new medication")
5. ✨ Audio editing (trim, enhance)
6. ✨ Batch audio processing
7. ✨ Prescription templates via audio

### Technical Debt
- [ ] Add unit tests for useAudioRecorder
- [ ] Add integration tests for API service
- [ ] Implement retry logic for failed uploads
- [ ] Add audio compression before upload
- [ ] Implement WebSocket for real-time status

---

## Deployment Checklist

### Pre-deployment
- [ ] Test on staging environment
- [ ] Verify API endpoint is correct
- [ ] Check CORS settings
- [ ] Verify HTTPS (required for microphone)
- [ ] Test on multiple devices/browsers

### Post-deployment
- [ ] Monitor error rates
- [ ] Check audio processing times
- [ ] Review user feedback
- [ ] Monitor API costs (ElevenLabs/OpenAI)

---

## API Cost Estimation

### ElevenLabs (Transcription)
- ~$0.001 per second of audio
- Average 30s audio = $0.03

### OpenAI (GPT-4)
- ~$0.02 per request
- Average cost per prescription = $0.05

**Total cost per audio prescription**: ~$0.05-0.08

---

## Troubleshooting

### Common Issues

#### 1. "Property 'getMyPrescriptions' does not exist"
**Fix**: Added method to `prescriptionService`

#### 2. Microphone not detected
**Fix**: Check browser permissions, use HTTPS in production

#### 3. Audio too large
**Fix**: Implement compression or reduce quality

#### 4. Processing timeout
**Fix**: Increase timeout, check backend logs

#### 5. CORS errors
**Fix**: Configure backend CORS for FormData

---

## Contact

For questions or issues:
- Frontend: Check this documentation
- Backend: See `API-AUDIO-PRESCRIPTION-DOCS.md`
- Support: Contact development team

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Author**: Development Team

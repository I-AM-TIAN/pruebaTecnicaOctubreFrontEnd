# 📝 Guía de Actualización Manual

## Archivos Pendientes de Actualizar

### 1. `/src/app/patient/prescriptions/page.tsx`
Reemplazar imports y servicios:
```typescript
// Cambiar:
import apiClient from '@/lib/api-client';

// Por:
import { patientPrescriptionService, downloadPrescriptionPDF } from '@/lib/api-services';

// En loadPrescriptions:
const data = await patientPrescriptionService.getMyPrescriptions({
  status: (filters.status as PrescriptionStatus) || undefined,
  page: filters.page,
  limit: 10,
});

// En handleConsume:
await patientPrescriptionService.consume(prescription.id);

// En handleDownloadPDF:
await downloadPrescriptionPDF(prescription.id, prescription.code);
```

### 2. `/src/app/patient/prescriptions/[id]/page.tsx`
```typescript
import { patientPrescriptionService, downloadPrescriptionPDF } from '@/lib/api-services';

const data = await patientPrescriptionService.getById(prescriptionId);
```

### 3. `/src/app/doctor/prescriptions/[id]/page.tsx`
```typescript
import { prescriptionService } from '@/lib/api-services';

const data = await prescriptionService.getById(prescriptionId);
```

### 4. `/src/app/admin/prescriptions/page.tsx`
```typescript
import { adminPrescriptionService } from '@/lib/api-services';

const data = await adminPrescriptionService.getAllPrescriptions({
  status: filters.status || undefined,
  doctorId: filters.doctorId || undefined,
  patientId: filters.patientId || undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
  page: filters.page,
  limit: 10,
});
```

### 5. `/src/app/admin/prescriptions/[id]/page.tsx`
```typescript
import { adminPrescriptionService } from '@/lib/api-services';

const data = await adminPrescriptionService.getById(prescriptionId);
```

## Cambios en Tipos de Datos

### Status Values
- Cambiar `'PENDING'` → `'pending'`
- Cambiar `'CONSUMED'` → `'consumed'`

### PrescriptionItem Fields
- `name` → `medication`
- `instructions` → `duration`
- Añadir campo requerido: `diagnosis`

### AdminMetrics Structure
```typescript
// Antes:
metrics.overview.totalPrescriptions
metrics.prescriptions.byStatus.PENDING

// Ahora:
metrics.totals.prescriptions
metrics.byStatus.pending
```

### Pagination
```typescript
// Antes:
data.meta.pages

// Ahora:
data.meta.totalPages
```

## Patrones de Uso

### Cargar prescripciones (Doctor)
```typescript
const data = await prescriptionService.getMyPrescriptions({
  status: filters.status as PrescriptionStatus | undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
  page: filters.page,
  limit: 10,
});
```

### Cargar prescripciones (Patient)
```typescript
const data = await patientPrescriptionService.getMyPrescriptions({
  status: filters.status as PrescriptionStatus | undefined,
  page: filters.page,
  limit: 10,
});
```

### Crear prescripción
```typescript
await prescriptionService.create({
  patientId: formData.patientId,
  diagnosis: formData.diagnosis, // ⚠️ REQUERIDO
  notes: formData.notes || undefined,
  items: [{
    medication: 'Paracetamol 500mg',
    dosage: '1 tableta cada 8 horas',
    quantity: 20,
    duration: '5 días'
  }]
});
```

### Descargar PDF
```typescript
await downloadPrescriptionPDF(prescription.id, prescription.code);
```

## Testing

Después de actualizar, verifica:

1. **Login** - `admin@test.com` / `admin123`
2. **Dashboard Admin** - Métricas se cargan correctamente
3. **Crear Prescripción** - Como doctor, incluye diagnosis
4. **Ver Prescripciones** - Como paciente
5. **Consumir Prescripción** - Marca como consumida
6. **Descargar PDF** - Funciona correctamente

## Endpoints Correctos

- ✅ `POST /auth/login`
- ✅ `GET /auth/profile`
- ✅ `POST /auth/logout`
- ✅ `GET /admin/metrics`
- ✅ `GET /prescriptions` (doctor)
- ✅ `POST /prescriptions` (doctor)
- ✅ `GET /prescriptions/me/prescriptions` (patient)
- ✅ `PUT /prescriptions/:id/consume` (patient)
- ✅ `GET /prescriptions/:id/pdf` (patient)
- ✅ `GET /prescriptions/admin/prescriptions` (admin)

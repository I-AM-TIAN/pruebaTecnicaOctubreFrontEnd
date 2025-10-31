# 📘 Guía de Integración para Frontend

Esta guía contiene toda la información necesaria para consumir el backend de prescripciones médicas desde tu aplicación frontend.

## 🔗 Configuración Base

### URL Base del API
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

### Headers Comunes
```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}` // Para rutas protegidas
};
```

## 🔐 Autenticación

### 1. Registro de Usuario (Paciente)

**Endpoint:** `POST /auth/register`  
**Acceso:** Público

```typescript
// Request
interface RegisterRequest {
  email: string;      // Formato email válido
  password: string;   // Mínimo 8 caracteres, 1 mayúscula, 1 número
  name: string;       // Nombre completo
}

// Example
const registerUser = async (data: RegisterRequest) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Response (201 Created)
interface AuthResponse {
  accessToken: string;   // Token JWT (válido 15 minutos)
  refreshToken: string;  // Token de renovación (válido 7 días)
  user: {
    id: string;
    email: string;
    name: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    createdAt: string;
  };
}
```

### 2. Login

**Endpoint:** `POST /auth/login`  
**Acceso:** Público

```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Example
const login = async (data: LoginRequest) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Response (200 OK) - Mismo formato que AuthResponse
// Error (401 Unauthorized)
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### 3. Renovar Token

**Endpoint:** `POST /auth/refresh`  
**Acceso:** Público

```typescript
// Request
interface RefreshRequest {
  refreshToken: string;
}

// Example
const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  return response.json();
};

// Response (200 OK)
interface RefreshResponse {
  accessToken: string;   // Nuevo token de acceso
  refreshToken: string;  // Nuevo token de renovación
}
```

### 4. Obtener Perfil

**Endpoint:** `GET /auth/profile`  
**Acceso:** Requiere JWT

```typescript
// Example
const getProfile = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};

// Response (200 OK)
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  // Si es DOCTOR
  doctor?: {
    id: string;
    specialty: string | null;
  };
  // Si es PATIENT
  patient?: {
    id: string;
  };
}
```

### 5. Logout

**Endpoint:** `POST /auth/logout`  
**Acceso:** Requiere JWT

```typescript
// Example
const logout = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  return response.json();
};

// Response (200 OK)
{
  "message": "Logged out successfully"
}
```

## 💊 Prescripciones

### 1. Crear Prescripción (Solo DOCTOR)

**Endpoint:** `POST /prescriptions`  
**Acceso:** Requiere JWT + Role DOCTOR

```typescript
// Request
interface CreatePrescriptionRequest {
  patientId: string;  // UUID del paciente
  notes?: string;     // Notas opcionales
  items: PrescriptionItem[];
}

interface PrescriptionItem {
  name: string;           // Nombre del medicamento
  dosage?: string;        // Ej: "500mg", "10ml"
  quantity?: string;      // Ej: "30 comprimidos"
  instructions?: string;  // Ej: "Tomar 1 cada 8 horas"
}

// Example
const createPrescription = async (
  accessToken: string, 
  data: CreatePrescriptionRequest
) => {
  const response = await fetch(`${API_BASE_URL}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Response (201 Created)
interface Prescription {
  id: string;
  code: string;          // Ej: "RX-KZ1H2J3-A4B5"
  status: 'PENDING' | 'CONSUMED';
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  authorId: string;
  patientId: string;
  items: Array<{
    id: string;
    name: string;
    dosage: string | null;
    quantity: string | null;
    instructions: string | null;
  }>;
}
```

### 2. Listar Prescripciones

**Endpoint:** `GET /prescriptions`  
**Acceso:** Requiere JWT (filtrado automático por rol)

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` ('PENDING' | 'CONSUMED', opcional)

```typescript
// Example
const listPrescriptions = async (
  accessToken: string,
  params?: { page?: number; limit?: number; status?: string }
) => {
  const queryString = new URLSearchParams(
    params as Record<string, string>
  ).toString();
  
  const response = await fetch(
    `${API_BASE_URL}/prescriptions?${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};

// Response (200 OK)
interface PrescriptionsResponse {
  data: Prescription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filtrado automático por rol:
// - ADMIN: ve todas las prescripciones
// - DOCTOR: ve solo sus prescripciones
// - PATIENT: ve solo sus prescripciones
```

### 3. Obtener Prescripción por ID

**Endpoint:** `GET /prescriptions/:id`  
**Acceso:** Requiere JWT (verifica acceso)

```typescript
// Example
const getPrescription = async (
  accessToken: string,
  prescriptionId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/prescriptions/${prescriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};

// Response (200 OK)
interface PrescriptionDetail {
  id: string;
  code: string;
  status: 'PENDING' | 'CONSUMED';
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  author: {
    id: string;
    specialty: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  patient: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  items: Array<{
    id: string;
    name: string;
    dosage: string | null;
    quantity: string | null;
    instructions: string | null;
  }>;
}

// Error (404 Not Found)
{
  "statusCode": 404,
  "message": "Prescription not found"
}

// Error (403 Forbidden)
{
  "statusCode": 403,
  "message": "Access denied"
}
```

### 4. Consumir Prescripción (Solo PATIENT)

**Endpoint:** `PUT /prescriptions/:id/consume`  
**Acceso:** Requiere JWT + Role PATIENT

```typescript
// Example
const consumePrescription = async (
  accessToken: string,
  prescriptionId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/prescriptions/${prescriptionId}/consume`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};

// Response (200 OK)
{
  id: string;
  code: string;
  status: 'CONSUMED';
  consumedAt: string;  // Fecha de consumo
  // ... resto de campos
}

// Error (400 Bad Request)
{
  "statusCode": 400,
  "message": "Prescription already consumed"
}

// Error (403 Forbidden) - si no es el paciente de la prescripción
{
  "statusCode": 403,
  "message": "Access denied"
}
```

### 5. Descargar PDF

**Endpoint:** `GET /prescriptions/:id/pdf`  
**Acceso:** Requiere JWT (verifica acceso)

```typescript
// Example
const downloadPrescriptionPdf = async (
  accessToken: string,
  prescriptionId: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/prescriptions/${prescriptionId}/pdf`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  // Descargar como blob
  const blob = await response.blob();
  
  // Crear link de descarga
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prescripcion-${prescriptionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Response (200 OK)
// Content-Type: application/pdf
// Binary data (PDF file)
```

## 📊 Métricas Admin (Solo ADMIN)

### 1. Obtener Métricas del Sistema

**Endpoint:** `GET /admin/metrics`  
**Acceso:** Requiere JWT + Role ADMIN

**Query Params:**
- `startDate` (ISO date string, opcional)
- `endDate` (ISO date string, opcional)

```typescript
// Example
const getMetrics = async (
  accessToken: string,
  filters?: { startDate?: string; endDate?: string }
) => {
  const queryString = filters
    ? new URLSearchParams(filters).toString()
    : '';
  
  const response = await fetch(
    `${API_BASE_URL}/admin/metrics${queryString ? '?' + queryString : ''}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};

// Response (200 OK)
interface MetricsResponse {
  overview: {
    totalPrescriptions: number;
    totalDoctors: number;
    totalPatients: number;
    patientsWithPrescriptions: number;
  };
  prescriptions: {
    byStatus: {
      PENDING: number;
      CONSUMED: number;
    };
    byDay: Array<{
      date: string;  // ISO date
      count: number;
    }>;
  };
  topDoctors: Array<{
    id: string;
    name: string;
    email: string;
    specialty: string | null;
    prescriptionsCount: number;
  }>;
}

// Error (403 Forbidden)
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 2. Obtener Todas las Prescripciones con Filtros Avanzados

**Endpoint:** `GET /admin/prescriptions`  
**Acceso:** Requiere JWT + Role ADMIN

**Query Params:**
- `status` ('PENDING' | 'CONSUMED', opcional)
- `doctorId` (string, opcional) - UUID del doctor
- `patientId` (string, opcional) - UUID del paciente
- `from` (ISO date string, opcional) - Fecha desde
- `to` (ISO date string, opcional) - Fecha hasta
- `page` (number, default: 1)
- `limit` (number, default: 10)

```typescript
// Example
const getAllPrescriptions = async (
  accessToken: string,
  filters?: {
    status?: 'PENDING' | 'CONSUMED';
    doctorId?: string;
    patientId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
) => {
  const queryString = filters
    ? new URLSearchParams(
        Object.entries(filters)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString()
    : '';
  
  const response = await fetch(
    `${API_BASE_URL}/admin/prescriptions${queryString ? '?' + queryString : ''}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};

// Response (200 OK)
interface AdminPrescriptionsResponse {
  data: PrescriptionDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Ejemplos de uso:
// Ver todas las prescripciones pendientes
await getAllPrescriptions(token, { status: 'PENDING' });

// Ver prescripciones de un doctor específico
await getAllPrescriptions(token, { doctorId: 'doctor-uuid' });

// Ver prescripciones en un rango de fechas
await getAllPrescriptions(token, { 
  from: '2024-01-01', 
  to: '2024-12-31' 
});

// Combinar múltiples filtros
await getAllPrescriptions(token, { 
  status: 'CONSUMED',
  doctorId: 'doctor-uuid',
  from: '2024-01-01',
  page: 1,
  limit: 20
});

// Error (403 Forbidden)
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## 🔄 Manejo de Tokens en el Frontend

### Ejemplo de Servicio de Autenticación (TypeScript)

```typescript
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Cargar tokens del localStorage al iniciar
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setTokens(data.accessToken, data.refreshToken);
    return data;
  }

  async logout() {
    if (this.accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Uso
const authService = new AuthService();
```

### Interceptor HTTP para Auto-Refresh (Ejemplo con Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor - agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - manejar 401 y refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Reintentar request original con nuevo token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## 🎨 Interfaces TypeScript Completas

```typescript
// ========== TYPES ==========
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';
export type PrescriptionStatus = 'PENDING' | 'CONSUMED';

// ========== AUTH ==========
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Doctor {
  id: string;
  specialty: string | null;
}

export interface Patient {
  id: string;
}

// ========== PRESCRIPTIONS ==========
export interface PrescriptionItem {
  name: string;
  dosage?: string;
  quantity?: string;
  instructions?: string;
}

export interface CreatePrescriptionDTO {
  patientId: string;
  notes?: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItemResponse extends PrescriptionItem {
  id: string;
}

export interface Prescription {
  id: string;
  code: string;
  status: PrescriptionStatus;
  notes: string | null;
  createdAt: string;
  consumedAt: string | null;
  authorId: string;
  patientId: string;
  items: PrescriptionItemResponse[];
}

export interface PrescriptionDetail extends Prescription {
  author: {
    id: string;
    specialty: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  patient: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface PrescriptionsResponse {
  data: PrescriptionDetail[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FilterPrescriptionsDTO {
  status?: PrescriptionStatus;
  page?: number;
  limit?: number;
}

// ========== ADMIN ==========
export interface MetricsResponse {
  overview: {
    totalPrescriptions: number;
    totalDoctors: number;
    totalPatients: number;
    patientsWithPrescriptions: number;
  };
  prescriptions: {
    byStatus: {
      PENDING: number;
      CONSUMED: number;
    };
    byDay: Array<{
      date: string;
      count: number;
    }>;
  };
  topDoctors: Array<{
    id: string;
    name: string;
    email: string;
    specialty: string | null;
    prescriptionsCount: number;
  }>;
}

// ========== ERRORS ==========
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

## 🧪 Usuarios de Prueba

Para testing en desarrollo:

```typescript
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'ADMIN'
  },
  doctor1: {
    email: 'doctor1@test.com',
    password: 'Test123!',
    role: 'DOCTOR'
  },
  doctor2: {
    email: 'doctor2@test.com',
    password: 'Test123!',
    role: 'DOCTOR'
  },
  patient1: {
    email: 'patient1@test.com',
    password: 'Test123!',
    role: 'PATIENT'
  },
  patient2: {
    email: 'patient2@test.com',
    password: 'Test123!',
    role: 'PATIENT'
  },
  patient3: {
    email: 'patient3@test.com',
    password: 'Test123!',
    role: 'PATIENT'
  }
};
```

## ⚠️ Validaciones a Implementar en el Frontend

### Registro/Login
- Email debe ser válido (usar regex o validador)
- Password mínimo 8 caracteres, al menos 1 mayúscula, 1 número
- Name no puede estar vacío

### Crear Prescripción
- PatientId debe ser UUID válido
- Items array no puede estar vacío
- Cada item debe tener al menos `name`

### Consumir Prescripción
- Solo pacientes pueden consumir
- Verificar que el paciente sea el dueño de la prescripción
- No se puede consumir una prescripción ya consumida

## 🚨 Manejo de Errores Comunes

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

const handleApiError = (error: any) => {
  if (error.response) {
    const errorData: ErrorResponse = error.response.data;
    
    switch (errorData.statusCode) {
      case 400:
        return 'Datos inválidos: ' + 
          (Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message);
      
      case 401:
        return 'No autorizado. Por favor, inicia sesión nuevamente.';
      
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      
      case 404:
        return 'Recurso no encontrado.';
      
      case 429:
        return 'Demasiadas solicitudes. Intenta más tarde.';
      
      default:
        return 'Error del servidor. Intenta más tarde.';
    }
  }
  
  return 'Error de conexión. Verifica tu internet.';
};
```

## 📋 Flujos de Usuario Recomendados

### Flujo de Paciente
1. Registro → Automáticamente role PATIENT
2. Login → Recibe tokens
3. Ver mis prescripciones → `GET /prescriptions`
4. Ver detalle de prescripción → `GET /prescriptions/:id`
5. Consumir prescripción → `PUT /prescriptions/:id/consume`
6. Descargar PDF → `GET /prescriptions/:id/pdf`

### Flujo de Doctor
1. Login (cuenta creada por admin)
2. Ver lista de pacientes disponibles
3. Crear prescripción → `POST /prescriptions`
4. Ver mis prescripciones → `GET /prescriptions`
5. Ver detalle → `GET /prescriptions/:id`

### Flujo de Admin
1. Login
2. Ver métricas → `GET /admin/metrics`
3. Ver todas las prescripciones → `GET /prescriptions`
4. Filtrar por estado → `GET /prescriptions?status=PENDING`

## 🔗 Recursos Adicionales

- **Documentación Swagger**: `http://localhost:3000/docs`
- **Base URL**: `http://localhost:3000`
- **WebSocket**: No implementado en esta versión

## 📱 Ejemplo React Hooks

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { AuthResponse, User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token y cargar perfil
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: AuthResponse = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };
};
```

---

**¿Necesitas ayuda?** Consulta la documentación Swagger en `http://localhost:3000/docs` para ejemplos interactivos.

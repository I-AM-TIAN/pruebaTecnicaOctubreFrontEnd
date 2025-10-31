// ============================================
// ROLES Y USUARIOS
// ============================================
export type Role = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface AuthProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

// ============================================
// AUTENTICACIÓN
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse extends AuthTokens {
  user: User;
}

// ============================================
// DOCTORES
// ============================================
export interface Doctor {
  id: string;
  user?: User;
  specialty: string;
  licenseNumber: string;
}

// ============================================
// PACIENTES
// ============================================
export interface Patient {
  id: string;
  user?: User;
  birthDate: string;
  address?: string;
  phone?: string;
}

// ============================================
// PRESCRIPCIONES
// ============================================
export type PrescriptionStatus = 'pending' | 'consumed';

export interface PrescriptionItem {
  id?: string;
  medication: string;
  dosage: string;
  quantity: number;
  duration?: string;
}

export interface Prescription {
  id: string;
  code: string;
  patientId: string;
  authorId: string;
  diagnosis: string;
  notes?: string;
  status: PrescriptionStatus;
  createdAt: string;
  consumedAt?: string | null;
  items: PrescriptionItem[];
  // Relaciones expandidas
  patient?: {
    id: string;
    user?: User;
    birthDate?: string;
  };
  author?: {
    id: string;
    user?: User;
    specialty?: string;
  };
}

export interface CreatePrescriptionDto {
  patientId: string;
  diagnosis: string;
  notes?: string;
  items: Array<{
    medication: string;
    dosage: string;
    quantity: number;
    duration?: string;
  }>;
}

// ============================================
// FILTROS
// ============================================
export interface PrescriptionFilters {
  mine?: boolean;
  status?: PrescriptionStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminPrescriptionFilters {
  status?: PrescriptionStatus;
  doctorId?: string;
  patientId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: Role;
  page?: number;
  limit?: number;
}

export interface PatientFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorFilters {
  specialty?: string;
  page?: number;
  limit?: number;
}

// ============================================
// PAGINACIÓN
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// MÉTRICAS DE ADMIN
// ============================================
export interface AdminMetrics {
  totals: {
    doctors: number;
    patients: number;
    prescriptions: number;
  };
  byStatus: {
    pending: number;
    consumed: number;
  };
  byDay: Array<{
    date: string;
    count: number;
  }>;
  topDoctors: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    count: number;
  }>;
}

export interface MetricsFilters {
  from?: string;
  to?: string;
}

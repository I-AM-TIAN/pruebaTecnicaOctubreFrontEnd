/**
 * API Services - Organized API calls following the backend documentation
 * Base URL: http://localhost:4001
 */

import apiClient from './api-client';
import type {
  // Auth
  LoginCredentials,
  LoginResponse,
  AuthProfile,
  // Users
  User,
  UserFilters,
  // Patients
  Patient,
  PatientFilters,
  // Doctors
  Doctor,
  DoctorFilters,
  // Prescriptions
  Prescription,
  CreatePrescriptionDto,
  PrescriptionFilters,
  AdminPrescriptionFilters,
  // Metrics
  AdminMetrics,
  MetricsFilters,
  // Pagination
  PaginatedResponse,
} from '@/types';

// ============================================
// AUTHENTICATION SERVICES
// ============================================

export const authService = {
  /**
   * POST /auth/login
   * Login and get access tokens
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return apiClient('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  /**
   * GET /auth/profile
   * Get authenticated user profile
   */
  getProfile: async (): Promise<AuthProfile> => {
    return apiClient<AuthProfile>('/auth/profile');
  },

  /**
   * POST /auth/logout
   * Logout and invalidate current token
   */
  logout: async (): Promise<void> => {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },
};

// ============================================
// ADMIN SERVICES
// ============================================

export const adminService = {
  /**
   * GET /users
   * List system users with filters and pagination
   * Roles: admin
   */
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<User>>(`/users?${params.toString()}`);
  },

  /**
   * GET /admin/metrics
   * Get system metrics and statistics
   * Roles: admin
   */
  getMetrics: async (filters?: MetricsFilters): Promise<AdminMetrics> => {
    const params = new URLSearchParams();
    
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const endpoint = params.toString() ? `/admin/metrics?${params.toString()}` : '/admin/metrics';

    // Call the API and defensively unwrap common response wrappers like
    // { data: { ... } } or { data: { data: { ... } } } (some middlewares/clients
    // or the backend itself may wrap the payload). Return the actual AdminMetrics
    // object so callers don't have to handle different shapes.
    const raw: any = await apiClient(endpoint as any);
    let payload: any = raw;
    if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;
    if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;

    return payload as AdminMetrics;
  },
};

// ============================================
// PATIENT SERVICES
// ============================================

export const patientService = {
  /**
   * GET /patients
   * List patients
   * Roles: admin, doctor
   */
  getPatients: async (filters?: PatientFilters): Promise<PaginatedResponse<Patient>> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Patient>>(`/patients?${params.toString()}`);
  },
};

// ============================================
// DOCTOR SERVICES
// ============================================

export const doctorService = {
  /**
   * GET /doctors
   * List doctors
   * Roles: admin
   */
  getDoctors: async (filters?: DoctorFilters): Promise<PaginatedResponse<Doctor>> => {
    const params = new URLSearchParams();
    
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Doctor>>(`/doctors?${params.toString()}`);
  },
};

// ============================================
// PRESCRIPTION SERVICES (DOCTOR)
// ============================================

export const prescriptionService = {
  /**
   * POST /prescriptions
   * Create a new prescription
   * Roles: doctor
   */
  create: async (data: CreatePrescriptionDto): Promise<Prescription> => {
    return apiClient<Prescription>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /prescriptions
   * List doctor's prescriptions
   * Roles: doctor
   */
  getMyPrescriptions: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    // By default, mine=true for doctors
    if (filters?.mine !== undefined) params.append('mine', filters.mine.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions?${params.toString()}`);
  },

  /**
   * GET /prescriptions/:id
   * Get prescription detail
   * Roles: doctor
   */
  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },
};

// ============================================
// PRESCRIPTION SERVICES (PATIENT)
// ============================================

export const patientPrescriptionService = {
  /**
   * GET /prescriptions/me/prescriptions
   * Get my prescriptions as patient
   * Roles: patient
   */
  getMyPrescriptions: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions/me/prescriptions?${params.toString()}`);
  },

  /**
   * GET /prescriptions/:id
   * Get prescription detail (patient view)
   * Note: Uses different endpoint structure than doctor
   */
  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },

  /**
   * PUT /prescriptions/:id/consume
   * Mark prescription as consumed
   * Roles: patient
   */
  consume: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}/consume`, {
      method: 'PUT',
    });
  },

  /**
   * GET /prescriptions/:id/pdf
   * Download prescription as PDF
   * Roles: patient
   * Returns: Blob (binary PDF file)
   */
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/${id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el PDF');
    }

    return response.blob();
  },
};

// ============================================
// PRESCRIPTION SERVICES (ADMIN)
// ============================================

export const adminPrescriptionService = {
  /**
   * GET /prescriptions/admin/prescriptions
   * Get all system prescriptions
   * Roles: admin
   */
  getAllPrescriptions: async (filters?: AdminPrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions/admin/prescriptions?${params.toString()}`);
  },

  /**
   * GET /prescriptions/:id
   * Get prescription detail (admin view)
   */
  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper to download PDF prescription
 */
export const downloadPrescriptionPDF = async (id: string, code: string): Promise<void> => {
  try {
    const blob = await patientPrescriptionService.downloadPDF(id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescripcion-${code}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

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
  CreateUserDto,
  UpdateUserDto,
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
   * POST /api/auth/login
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
   * POST /api/auth/refresh
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
   * GET /api/auth/profile
   * Get authenticated user profile
   */
  getProfile: async (): Promise<AuthProfile> => {
    return apiClient<AuthProfile>('/auth/profile');
  },

  /**
   * POST /api/auth/logout
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
   * GET /api/admin/users
   * List system users with filters and pagination
   * Roles: admin
   */
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<User>>(`/admin/users?${params.toString()}`);
  },

  /**
   * GET /api/admin/users/:id
   * Get user by ID
   * Roles: admin
   */
  getUserById: async (id: string): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`);
  },

  /**
   * POST /api/admin/users
   * Create new user
   * Roles: admin
   */
  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiClient<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/admin/users/:id
   * Update user
   * Roles: admin
   */
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/admin/users/:id
   * Delete user
   * Roles: admin
   */
  deleteUser: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/admin/metrics
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
   * GET /api/patients
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
   * GET /api/doctors
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
   * POST /api/prescriptions
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
   * GET /api/prescriptions
   * List doctor's prescriptions
   * Roles: doctor
   * Returns: PaginatedResponse<Prescription> or Prescription[]
   */
  getMyPrescriptions: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription> | Prescription[]> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);

    const queryString = params.toString();
    return apiClient<any>(`/prescriptions${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * GET /api/prescriptions/:id
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
   * GET /api/prescriptions/me/prescriptions
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
   * GET /api/prescriptions/:id
   * Get prescription detail (patient view)
   * Note: Uses different endpoint structure than doctor
   */
  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },

  /**
   * PUT /api/prescriptions/:id/consume
   * Mark prescription as consumed
   * Roles: patient
   */
  consume: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}/consume`, {
      method: 'PUT',
    });
  },

  /**
   * GET /api/prescriptions/:id/pdf
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
   * GET /api/prescriptions/admin/prescriptions
   * Get all system prescriptions
   * Roles: admin
   * Returns: PaginatedResponse<Prescription> (formato paginado)
   */
  getAllPrescriptions: async (filters?: AdminPrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);

    const queryString = params.toString();
    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions/admin/prescriptions${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * GET /api/prescriptions/:id
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



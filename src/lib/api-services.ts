import apiClient from './api-client';
import type {
  LoginCredentials,
  LoginResponse,
  AuthProfile,
  User,
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
  Patient,
  PatientFilters,
  Doctor,
  DoctorFilters,
  Prescription,
  CreatePrescriptionDto,
  PrescriptionFilters,
  AdminPrescriptionFilters,
  AdminMetrics,
  MetricsFilters,
  PaginatedResponse,
} from '@/types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return apiClient('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  getProfile: async (): Promise<AuthProfile> => {
    return apiClient<AuthProfile>('/auth/profile');
  },

  logout: async (): Promise<void> => {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },
};

export const adminService = {
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<User>>(`/admin/users?${params.toString()}`);
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`);
  },

  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiClient<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  getMetrics: async (filters?: MetricsFilters): Promise<AdminMetrics> => {
    const params = new URLSearchParams();
    
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const queryString = params.toString();
    const endpoint = queryString ? `/metrics?${queryString}` : '/metrics';

    console.log('🔍 Fetching metrics from endpoint:', endpoint);
    const raw: any = await apiClient(endpoint);
    let payload: any = raw;
    if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;
    if (payload && typeof payload === 'object' && 'data' in payload) payload = payload.data;

    return payload as AdminMetrics;
  },
};

export const patientService = {
  getPatients: async (filters?: PatientFilters): Promise<PaginatedResponse<Patient>> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Patient>>(`/patients?${params.toString()}`);
  },
};

export const doctorService = {
  getDoctors: async (filters?: DoctorFilters): Promise<PaginatedResponse<Doctor>> => {
    const params = new URLSearchParams();
    
    if (filters?.specialty) params.append('specialty', filters.specialty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Doctor>>(`/doctors?${params.toString()}`);
  },
};

export const prescriptionService = {
  create: async (data: CreatePrescriptionDto): Promise<Prescription> => {
    return apiClient<Prescription>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createFromAudio: async (audioFile: File, patientId: string): Promise<Prescription> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('patientId', patientId);

    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/from-audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al crear prescripción' }));
      throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
  },

  getMine: async (filters?: PrescriptionFilters): Promise<any> => {
    const params = new URLSearchParams();

    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);

    const queryString = params.toString();
    return apiClient<any>(`/prescriptions${queryString ? `?${queryString}` : ''}`);
  },

  getMyPrescriptions: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions?${params.toString()}`);
  },

  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },
};

export const patientPrescriptionService = {
  getMyPrescriptions: async (filters?: PrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions/me/prescriptions?${params.toString()}`);
  },

  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },

  consume: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}/consume`, {
      method: 'PUT',
    });
  },

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

export const adminPrescriptionService = {
  getAllPrescriptions: async (filters?: AdminPrescriptionFilters): Promise<PaginatedResponse<Prescription>> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.doctorId) params.append('doctorId', filters.doctorId);
    if (filters?.patientId) params.append('patientId', filters.patientId);

    const queryString = params.toString();
    return apiClient<PaginatedResponse<Prescription>>(`/prescriptions/admin/prescriptions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Prescription> => {
    return apiClient<Prescription>(`/prescriptions/${id}`);
  },
};

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



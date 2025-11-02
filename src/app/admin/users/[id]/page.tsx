'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminService } from '@/lib/api-services';
import { useToast } from '@/hooks';
import { ArrowLeft, Mail, User as UserIcon, Shield, Calendar } from 'lucide-react';
import type { User } from '@/types';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserById(userId);
      setUser(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuario');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      doctor: 'bg-blue-100 text-blue-800',
      patient: 'bg-green-100 text-green-800',
    };
    const labels = {
      admin: 'Administrador',
      doctor: 'Doctor',
      patient: 'Paciente',
    };
    return { class: badges[role as keyof typeof badges], label: labels[role as keyof typeof labels] };
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Rol</p>
                <span className={`inline-flex mt-1 px-3 py-1 text-xs font-semibold rounded-full ${roleBadge.class}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Fecha de Creación</p>
                <p className="font-medium text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push(`/admin/users/${userId}/edit`)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Editar Usuario
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

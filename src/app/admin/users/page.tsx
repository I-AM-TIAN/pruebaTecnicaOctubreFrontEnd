'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/api-services';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks';
import { usePagination } from '@/hooks';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import type { User, Role } from '@/types';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const toast = useToast();
  const { page, limit, setPage, setLimit } = usePagination();

  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });

  useEffect(() => {
    loadUsers();
  }, [page, limit]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        page,
        limit,
      });

      // Handle different response formats
      if (Array.isArray(response)) {
        // Backend returned array directly
        setUsers(response);
        setTotalPages(1);
      } else if (response && response.data) {
        // Backend returned paginated response
        setUsers(response.data);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        // Unexpected format
        setUsers([]);
        setTotalPages(0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;

    try {
      await adminService.deleteUser(deleteDialog.userId);
      toast.success('Usuario eliminado exitosamente');
      setDeleteDialog({ isOpen: false, userId: null });
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
    }
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.email}</div>
          <div className="text-sm text-gray-500">{user.name}</div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      render: (user: User) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : user.role === 'doctor'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {user.role === 'admin' ? 'Administrador' : user.role === 'doctor' ? 'Doctor' : 'Paciente'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (user: User) =>
        user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A',
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (user: User) => (
        <div className="flex gap-2">
          <Link href={`/admin/users/${user.id}`}>
            <button
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <Link href={`/admin/users/${user.id}/edit`}>
            <button
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, userId: user.id })}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <Link href="/admin/users/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onCancel={() => setDeleteDialog({ isOpen: false, userId: null })}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}

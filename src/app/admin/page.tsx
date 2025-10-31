'use client';

import { useEffect, useState } from 'react';
import { Users, UserCog, FileText, Activity } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { adminService } from '@/lib/api-services';
import type { AdminMetrics } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981'];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading admin metrics...');
      const data = await adminService.getMetrics();
      console.log('✅ Metrics loaded:', data);
      setMetrics(data);
    } catch (err: any) {
      console.error('❌ Error loading metrics:', err);
      setError(err.message || 'Error al cargar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-2">Error al cargar métricas</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const statusData = metrics?.byStatus ? [
    { name: 'Pendientes', value: metrics.byStatus.pending, color: '#0ea5e9' },
    { name: 'Consumidas', value: metrics.byStatus.consumed, color: '#10b981' },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Métricas y estadísticas del sistema</p>
      </div>

      {/* KPI Cards - Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <KpiCard
          title="Total Prescripciones"
          value={metrics?.totals.prescriptions || 0}
          icon={FileText}
          description="Prescripciones creadas"
        />
        <KpiCard
          title="Total Doctores"
          value={metrics?.totals.doctors || 0}
          icon={UserCog}
          description="Doctores registrados"
        />
        <KpiCard
          title="Total Pacientes"
          value={metrics?.totals.patients || 0}
          icon={Users}
          description="Pacientes registrados"
        />
      </div>

      {/* Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <KpiCard
          title="Pendientes"
          value={metrics?.byStatus.pending || 0}
          icon={Activity}
          description="Por consumir"
        />
        <KpiCard
          title="Consumidas"
          value={metrics?.byStatus.consumed || 0}
          icon={Activity}
          description="Completadas"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Prescriptions by Day */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Prescripciones por Día</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics?.byDay || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return date.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric'
                  });
                }}
              />
              <Bar dataKey="count" fill="#0ea5e9" name="Prescripciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prescriptions by Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Prescripciones por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Doctors */}
      {metrics?.topDoctors && metrics.topDoctors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Top Doctores por Volumen</h3>
          <div className="space-y-3">
            {metrics.topDoctors.map((doctor, index) => (
              <div key={doctor.doctorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{doctor.doctorName}</p>
                    {doctor.specialty && (
                      <p className="text-xs text-gray-400 mt-0.5">{doctor.specialty}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {doctor.count}
                  </p>
                  <p className="text-xs text-gray-500">prescripciones</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

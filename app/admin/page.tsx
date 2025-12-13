"use client";

import { useEffect, useState } from 'react';
import { Eye, Users, FileText, TrendingUp, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DEMO_DOCUMENTOS_DOF, DEMO_USUARIOS } from '@/lib/demo-data';
import { AREAS_ARRAY } from '@/lib/areas';

export default function AdminPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_documentos: 0,
    alertas_enviadas: 0,
  });

  useEffect(() => {
    // Simular carga de estadísticas
    setStats({
      total_users: DEMO_USUARIOS.length,
      active_users: DEMO_USUARIOS.filter(u => u.status === 'active').length,
      total_documentos: DEMO_DOCUMENTOS_DOF.length,
      alertas_enviadas: DEMO_USUARIOS.length * 3,
    });
  }, []);

  const getAreaNombre = (codigo: string) => {
    return AREAS_ARRAY.find(a => a.codigo === codigo)?.nombre || codigo;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">PANEL DE ADMINISTRACIÓN</div>
                <h1 className="text-2xl font-bold text-gray-900">DOF Alertas Admin</h1>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Inicio
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border-2 border-dashed border-green-400">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Usuarios Totales</div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.total_users}</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-dashed border-green-400">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Usuarios Activos</div>
            </div>
            <div className="text-4xl font-bold text-green-600">{stats.active_users}</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-dashed border-green-400">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Documentos Hoy</div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.total_documentos}</div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-dashed border-green-400">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Alertas Enviadas</div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.alertas_enviadas}</div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ingresos Mensuales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Ingresos Brutos</div>
              <div className="text-3xl font-bold text-gray-900">
                ${(stats.active_users * 29).toFixed(2)} MXN
              </div>
              <div className="text-sm text-gray-500">
                ≈ ${(stats.active_users * 1.5).toFixed(2)} USD
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Costos Operativos</div>
              <div className="text-3xl font-bold text-gray-900">$2.50 USD</div>
              <div className="text-sm text-gray-500">Firebase + Stripe + APIs</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Ganancia Neta</div>
              <div className="text-3xl font-bold text-green-600">
                ${(stats.active_users * 1.5 - 2.5).toFixed(2)} USD
              </div>
              <div className="text-sm text-gray-500">Margen: {((1 - 2.5 / (stats.active_users * 1.5)) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Usuarios Registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Áreas</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USUARIOS.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.nombre}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {user.areas.map(area => (
                          <span
                            key={area}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {getAreaNombre(area)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Cancelado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentos Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Documentos del DOF (Hoy)</h3>
          <div className="space-y-4">
            {DEMO_DOCUMENTOS_DOF.map((doc) => (
              <div
                key={doc.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {doc.areas_detectadas.map(area => (
                    <span
                      key={area}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                    >
                      {getAreaNombre(area)}
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {doc.titulo}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {doc.resumen_ia}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Tipo: {doc.tipo_documento}</span>
                  <span>Edición: {doc.edicion}</span>
                  <span>Usuarios afectados: {DEMO_USUARIOS.filter(u => 
                    u.areas.some(a => doc.areas_detectadas.includes(a))
                  ).length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Áreas Distribution */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución por Área de Práctica</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {AREAS_ARRAY.map((area) => {
              const count = DEMO_USUARIOS.filter(u => u.areas.includes(area.codigo)).length;
              return (
                <div key={area.codigo} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">{area.emoji}</div>
                  <div className="text-sm font-medium text-gray-900 mb-1">{area.nombre}</div>
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-xs text-gray-500">usuarios</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

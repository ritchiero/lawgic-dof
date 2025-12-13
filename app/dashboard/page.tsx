"use client";

import { useEffect, useState } from 'react';
import { Eye, Mail, FileText, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AREAS_ARRAY } from '@/lib/areas';
import { DEMO_DOCUMENTOS_DOF } from '@/lib/demo-data';

interface DemoUser {
  email: string;
  nombre?: string;
  areas: string[];
  session_id: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [documentos, setDocumentos] = useState(DEMO_DOCUMENTOS_DOF);

  useEffect(() => {
    const userData = localStorage.getItem('demo_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No hay sesión activa</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const documentosRelevantes = documentos.filter(doc =>
    doc.areas_detectadas.some(area => user.areas.includes(area))
  );

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
                <div className="text-sm text-gray-500 uppercase tracking-wide">MONITOREO LEGAL</div>
                <h1 className="text-2xl font-bold text-gray-900">DOF Alertas</h1>
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
        {/* User Info */}
        <div className="bg-white rounded-lg border-2 border-dashed border-green-400 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.nombre || 'Usuario Demo'}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                {user.areas.map(area => (
                  <span
                    key={area}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {getAreaNombre(area)}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{documentosRelevantes.length}</div>
              <div className="text-sm text-gray-500">Documentos hoy</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Total Documentos</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{documentosRelevantes.length}</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Alertas Enviadas</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">3</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-gray-500 uppercase tracking-wide">Próxima Alerta</div>
            </div>
            <div className="text-lg font-bold text-gray-900">Mañana 7:00 AM</div>
          </div>
        </div>

        {/* Documentos Relevantes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Documentos Relevantes de Hoy
          </h3>

          {documentosRelevantes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay documentos relevantes para tus áreas de práctica hoy.
            </div>
          ) : (
            <div className="space-y-6">
              {documentosRelevantes.map((doc) => (
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {doc.titulo}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    {doc.resumen_ia}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Tipo: {doc.tipo_documento}</span>
                    <span>Edición: {doc.edicion}</span>
                    <a
                      href={doc.url_dof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver documento completo →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Email */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Preview del Email de Alerta
          </h3>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Asunto:</div>
              <div className="font-semibold">
                DOF Alertas - {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} - {documentosRelevantes.length} documento(s) relevante(s)
              </div>
            </div>
            <div className="border-t border-gray-300 pt-4">
              <p className="mb-4">Hola {user.nombre || 'Usuario'},</p>
              <p className="mb-4">
                Encontramos {documentosRelevantes.length} documentos relevantes para tus áreas de práctica en el DOF de hoy.
              </p>
              <div className="space-y-4">
                {documentosRelevantes.slice(0, 2).map((doc) => (
                  <div key={doc.id} className="border-l-2 border-blue-500 pl-3">
                    <div className="text-sm font-semibold text-blue-600 mb-1">
                      {doc.areas_detectadas.map(getAreaNombre).join(', ')}
                    </div>
                    <div className="font-semibold mb-1">{doc.titulo}</div>
                    <p className="text-sm text-gray-600 mb-2">{doc.resumen_ia}</p>
                    <div className="text-xs text-gray-500">
                      Tipo: {doc.tipo_documento} | Edición: {doc.edicion}
                    </div>
                  </div>
                ))}
              </div>
              {documentosRelevantes.length > 2 && (
                <p className="mt-4 text-sm text-gray-500">
                  ... y {documentosRelevantes.length - 2} documento(s) más
                </p>
              )}
              <p className="mt-6 text-sm text-gray-500">
                © 2025 DOF Alertas by Lawgic
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

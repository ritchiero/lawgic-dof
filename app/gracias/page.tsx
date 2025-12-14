"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Mail, Eye } from 'lucide-react';
import Link from 'next/link';

function GraciasContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">MONITOREO LEGAL</div>
              <h1 className="text-2xl font-bold text-gray-900">DOF Alertas</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            ¡Bienvenido a{' '}
            <span className="text-blue-600 italic">DOF Alertas!</span>
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            Tu suscripción ha sido activada exitosamente.
          </p>

          <div className="border-2 border-dashed border-green-400 rounded-lg p-8 bg-gray-50 mb-8">
            <div className="flex items-start gap-4 text-left">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">¿Qué sigue?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Recibirás un email de confirmación en los próximos minutos</li>
                  <li>✓ Tu primera alerta llegará mañana a las 7:00 AM (hora CDMX)</li>
                  <li>✓ Solo recibirás documentos relevantes a tus áreas de práctica</li>
                  <li>✓ Puedes cancelar tu suscripción en cualquier momento desde los emails</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              ID de sesión: {sessionId || 'Cargando...'}
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver mi Dashboard
              </Link>
              <Link
                href="/"
                className="inline-block bg-gray-200 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 DOF Alertas by Lawgic. Todos los derechos reservados.</p>
            <div className="mt-2 space-x-4">
              <a href="/metodologia" className="hover:text-blue-600">Metodología</a>
              <a href="/privacidad" className="hover:text-blue-600">Privacidad</a>
              <a href="/terminos" className="hover:text-blue-600">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-gray-600">Cargando...</div></div>}>
      <GraciasContent />
    </Suspense>
  );
}

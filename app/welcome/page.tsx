'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, ArrowRight, Sparkles, TrendingUp, Clock, Filter } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown automático
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/feed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleSkip = () => {
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a DOF Alertas!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            ¡Tu prueba gratis de 7 días ha comenzado!
          </p>
          <p className="text-sm text-gray-500">
            Sin tarjeta de crédito • Cancela cuando quieras
          </p>
        </div>

        {/* Features Preview */}
        <div className="backdrop-blur-sm bg-white/80 rounded-lg shadow-md border border-gray-100/50 p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
            ¿Qué puedes hacer ahora?
          </h2>
          
          <div className="grid gap-6 text-left">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Explorar el Feed
                </h3>
                <p className="text-sm text-gray-600">
                  Descubre documentos relevantes publicados en el DOF. Filtra por tus áreas de interés.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Recibir Alertas Diarias
                </h3>
                <p className="text-sm text-gray-600">
                  Recibirás emails a las 8:30 AM y 4:30 PM con documentos nuevos de tus áreas durante los próximos 7 días.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Guardar Favoritos
                </h3>
                <p className="text-sm text-gray-600">
                  Marca documentos importantes para consultarlos después en tu dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">
                  Análisis con IA
                </h3>
                <p className="text-sm text-gray-600">
                  Cada documento incluye un resumen generado por IA para lectura rápida.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <button
            onClick={handleSkip}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Ir al Feed
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-500">
            Redirigiendo automáticamente en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Consejos rápidos
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Usa los filtros por área para encontrar documentos específicos</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Haz clic en "Guardar" para marcar documentos importantes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Revisa tu dashboard para ver estadísticas y documentos guardados</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Puedes cambiar tus áreas de interés en cualquier momento desde tu perfil</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

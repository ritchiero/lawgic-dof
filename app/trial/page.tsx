'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Check, ArrowRight, Sparkles } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

interface OnboardingData {
  email: string;
  nombre: string;
  areas: string[];
}

export default function TrialPage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar datos del onboarding
    const data = localStorage.getItem('onboarding_data');
    if (data) {
      setOnboardingData(JSON.parse(data));
    } else {
      // Si no hay datos, redirigir al onboarding
      router.push('/onboarding');
    }
  }, [router]);

  const handleSubscribe = async () => {
    if (!onboardingData) return;

    setLoading(true);

    try {
      // Llamar al API de suscripción
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: onboardingData.email,
          nombre: onboardingData.nombre,
          areas: onboardingData.areas,
        }),
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        
        // Guardar datos para después del pago
        localStorage.setItem('post_payment_redirect', '/welcome');
        
        // Redirigir a Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        alert('Hubo un error al procesar tu suscripción. Intenta de nuevo.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar tu suscripción. Intenta de nuevo.');
      setLoading(false);
    }
  };

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const selectedAreasDetails = AREAS_35.filter(a => onboardingData.areas.includes(a.codigo));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-blue-600" />
            <h1 className="font-serif text-3xl font-bold text-gray-900">DOF Alertas</h1>
          </div>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            ¡Tu cuenta está casi lista!
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hemos preparado una muestra de cómo se verán tus alertas diarias. Revisa el valor que recibirás antes de suscribirte.
          </p>
        </div>

        {/* Resumen de configuración */}
        <div className="backdrop-blur-sm bg-white/80 rounded-lg shadow-md border border-gray-100/50 p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
            Tu configuración
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">CORREO</div>
              <div className="font-medium text-gray-900">{onboardingData.email}</div>
            </div>
            {onboardingData.nombre && (
              <div>
                <div className="text-sm text-gray-600 mb-1">NOMBRE</div>
                <div className="font-medium text-gray-900">{onboardingData.nombre}</div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              ÁREAS DE PRÁCTICA ({selectedAreasDetails.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAreasDetails.map(area => (
                <span
                  key={area.codigo}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <span>{area.emoji}</span>
                  <span>{area.nombre}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview del feed */}
        <div className="backdrop-blur-sm bg-white/80 rounded-lg shadow-md border border-gray-100/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Vista previa de documentos relevantes
            </h2>
            <span className="text-sm text-gray-600">Actualizado hoy</span>
          </div>

          <p className="text-gray-600 mb-6">
            Estos son ejemplos de documentos que recibirías basados en tus áreas de interés:
          </p>

          {/* Documento de ejemplo 1 */}
          <div className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg p-6 mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAreasDetails.slice(0, 2).map(area => (
                <span
                  key={area.codigo}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {area.emoji} {area.nombre}
                </span>
              ))}
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              DECRETO por el que se reforman diversas disposiciones de la Ley del Impuesto Sobre la Renta
            </h3>
            <p className="text-gray-700 mb-3">
              Se modifican las tasas de retención del ISR para personas morales y se actualizan los montos de deducciones autorizadas para el ejercicio fiscal 2026. Esta reforma impacta directamente a empresas con ingresos superiores a $5 millones de pesos anuales.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Publicado: 14 dic 2024</span>
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Ver en DOF →
              </a>
            </div>
          </div>

          {/* Documento de ejemplo 2 */}
          <div className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg p-6 mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAreasDetails.slice(0, 1).map(area => (
                <span
                  key={area.codigo}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {area.emoji} {area.nombre}
                </span>
              ))}
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              ACUERDO por el que se dan a conocer las cuotas obrero-patronales del IMSS para 2026
            </h3>
            <p className="text-gray-700 mb-3">
              Se publican las nuevas cuotas del IMSS aplicables a partir del 1 de enero de 2026, con incremento del 4.2% respecto al año anterior. Incluye tablas actualizadas para todos los ramos de aseguramiento.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Publicado: 14 dic 2024</span>
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Ver en DOF →
              </a>
            </div>
          </div>

          {/* Documento de ejemplo 3 */}
          <div className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedAreasDetails.slice(1, 3).map(area => (
                <span
                  key={area.codigo}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {area.emoji} {area.nombre}
                </span>
              ))}
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              RESOLUCIÓN que modifica las Reglas Generales de Comercio Exterior para 2025
            </h3>
            <p className="text-gray-700 mb-3">
              Se actualizan los procedimientos para importación y exportación de mercancías, incluyendo nuevos requisitos documentales para operaciones superiores a USD $50,000.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Publicado: 13 dic 2024</span>
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Ver en DOF →
              </a>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="backdrop-blur-sm bg-white/80 rounded-lg shadow-md border border-gray-100/50 p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
            ¿Qué incluye tu suscripción?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Alertas diarias</div>
                <div className="text-sm text-gray-600">8:30 AM y 4:30 PM, todos los días</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">100% personalizado</div>
                <div className="text-sm text-gray-600">Solo tus {selectedAreasDetails.length} área{selectedAreasDetails.length !== 1 ? 's' : ''} de práctica</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Resúmenes con IA</div>
                <div className="text-sm text-gray-600">Entendimiento rápido de cada documento</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Acceso al feed</div>
                <div className="text-sm text-gray-600">Consulta documentos históricos cuando quieras</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Sin permanencia</div>
                <div className="text-sm text-gray-600">Cancela cuando quieras, sin penalizaciones</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Soporte prioritario</div>
                <div className="text-sm text-gray-600">Respuesta en menos de 24 horas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing CTA */}
        <div className="backdrop-blur-sm bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg border border-blue-500/50 p-8 text-white text-center mb-8">
          <h2 className="font-serif text-2xl font-bold mb-2">
            Comienza hoy mismo
          </h2>
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-5xl font-bold">$49</span>
            <span className="text-xl text-blue-100">MXN/mes</span>
          </div>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Inversión mínima para mantenerte actualizado. Equivale a <strong>menos de $2 pesos por día</strong>.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full max-w-md mx-auto bg-white text-blue-600 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Procesando...
              </>
            ) : (
              <>
                Suscribirme ahora
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-blue-100 mt-4">
            Pago seguro procesado por Stripe. Cancela cuando quieras.
          </p>
        </div>

        {/* ROI */}
        <div className="backdrop-blur-sm bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-2">
            Retorno de inversión comprobado
          </h3>
          <p className="text-sm text-gray-700">
            En promedio, nuestros usuarios identifican <strong>1 oportunidad de negocio por semana</strong> gracias a las alertas. 
            Con un valor promedio de <strong>$42,500 MXN por caso</strong>, el ROI es de <strong>867:1</strong>.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Volver al onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

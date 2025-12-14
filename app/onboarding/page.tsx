'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Áreas sugeridas (las más populares)
  const areasPopulares = [
    'fiscal',
    'corporativo',
    'laboral',
    'civil',
    'mercantil',
    'administrativo'
  ];

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleNext = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && selectedAreas.length > 0) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStartTrial = () => {
    // Guardar datos en localStorage
    localStorage.setItem('onboarding_data', JSON.stringify({
      email,
      nombre,
      areas: selectedAreas
    }));
    
    // Redirigir a página de prueba
    router.push('/trial');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-blue-600" />
            <h1 className="font-serif text-3xl font-bold text-gray-900">DOF Alertas</h1>
          </div>
          <p className="text-gray-600">
            Configuremos tu cuenta en 3 simples pasos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Paso {step} de 3</span>
            <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="backdrop-blur-sm bg-white/80 rounded-lg shadow-md border border-gray-100/50 p-8">
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                  ¿Cuál es tu correo profesional?
                </h2>
                <p className="text-gray-600">
                  Aquí recibirás tus alertas diarias del DOF
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CORREO ELECTRÓNICO *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@despacho.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NOMBRE COMPLETO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Lic. Juan Pérez García"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!email}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 2: Areas */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                  ¿En qué áreas practicas?
                </h2>
                <p className="text-gray-600">
                  Selecciona al menos una. Solo recibirás documentos relevantes para estas áreas.
                </p>
              </div>

              {/* Áreas Populares */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  ÁREAS MÁS POPULARES
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {areasPopulares.map(areaId => {
                    const area = AREAS_35.find(a => a.codigo === areaId);
                    if (!area) return null;
                    
                    return (
                      <button
                        key={area.codigo}
                        onClick={() => handleAreaToggle(area.codigo)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${selectedAreas.includes(area.codigo)
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{area.emoji}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {area.nombre}
                            </div>
                          </div>
                          {selectedAreas.includes(area.codigo) && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ver todas las áreas */}
              <details className="border-t pt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Ver todas las áreas ({AREAS_35.length - areasPopulares.length} más)
                </summary>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {AREAS_35.filter(a => !areasPopulares.includes(a.codigo)).map(area => (
                    <button
                      key={area.codigo}
                      onClick={() => handleAreaToggle(area.codigo)}
                      className={`
                        p-3 rounded-lg border text-left transition-all text-sm
                        ${selectedAreas.includes(area.codigo)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span>{area.emoji}</span>
                        <span className="font-medium text-gray-900 flex-1">
                          {area.nombre}
                        </span>
                        {selectedAreas.includes(area.codigo) && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </details>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedAreas.length === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar →
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {selectedAreas.length} área{selectedAreas.length !== 1 ? 's' : ''} seleccionada{selectedAreas.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                  Así se verá en tu bandeja de entrada
                </h2>
                <p className="text-gray-600">
                  Ejemplo de alerta que recibirás cada mañana (8:30 AM) y tarde (4:30 PM)
                </p>
              </div>

              {/* Email Preview */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                  {/* Email Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Newspaper className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-900">DOF Alertas</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Para:</strong> {email}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Asunto:</strong> DOF Alertas - 14 dic 2024 - 2 documento(s) nuevo(s)
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Hola{nombre && ` ${nombre}`},
                    </p>
                    <p className="text-gray-700">
                      Hoy se publicaron <strong>2 documentos relevantes</strong> para tus áreas de práctica:
                    </p>

                    {/* Document Example */}
                    <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/50">
                      <div className="flex gap-2 mb-2">
                        {selectedAreas.slice(0, 2).map(areaId => {
                          const area = AREAS_35.find(a => a.codigo === areaId);
                          return area ? (
                            <span key={area.codigo} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {area.emoji} {area.nombre}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        DECRETO por el que se reforman diversas disposiciones de la Ley del Impuesto Sobre la Renta
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Se modifican las tasas de retención del ISR para personas morales y se actualizan los montos de deducciones autorizadas para el ejercicio fiscal 2026.
                      </p>
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Ver documento completo en DOF →
                      </a>
                    </div>

                    <div className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/50">
                      <div className="flex gap-2 mb-2">
                        {selectedAreas.slice(0, 1).map(areaId => {
                          const area = AREAS_35.find(a => a.codigo === areaId);
                          return area ? (
                            <span key={area.codigo} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {area.emoji} {area.nombre}
                            </span>
                          ) : null;
                        })}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        ACUERDO por el que se dan a conocer las cuotas obrero-patronales del IMSS para 2026
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Se publican las nuevas cuotas del IMSS aplicables a partir del 1 de enero de 2026, con incremento del 4.2% respecto al año anterior.
                      </p>
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Ver documento completo en DOF →
                      </a>
                    </div>

                    <p className="text-sm text-gray-600 border-t pt-4">
                      Este email fue generado automáticamente. Solo recibes documentos relevantes para tus {selectedAreas.length} área{selectedAreas.length !== 1 ? 's' : ''} de práctica.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">
                  ¿Quieres recibir estas alertas?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Solo $49 MXN/mes. Cancela cuando quieras.
                </p>
                <button
                  onClick={handleStartTrial}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sí, quiero suscribirme
                </button>
              </div>

              <button
                onClick={handleBack}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ← Cambiar áreas
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda? <a href="mailto:contacto@dofalertas.mx" className="text-blue-600 hover:underline">contacto@dofalertas.mx</a>
        </p>
      </div>
    </div>
  );
}

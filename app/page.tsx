'use client';

import { useState } from 'react';
import { Newspaper } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function Home() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAreaToggle = (codigo: string) => {
    setSelectedAreas(prev =>
      prev.includes(codigo)
        ? prev.filter(a => a !== codigo)
        : [...prev, codigo]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Redirigir al onboarding simplificado
    window.location.href = '/onboarding';
  };

  // Agrupar áreas por categoría
  const areasAlta = AREAS_35.filter(a => a.categoria === 'alta');
  const areasMedia = AREAS_35.filter(a => a.categoria === 'media');
  const areasEspecializada = AREAS_35.filter(a => a.categoria === 'especializada');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Newspaper className="w-10 h-10 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">MONITOREO NORMATIVO</div>
                <h1 className="text-2xl font-bold text-gray-900">DOF Alertas</h1>
              </div>
            </div>
            <div className="flex gap-8">
              <a href="/feed" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">📰 Feed</a>
              <a href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">Dashboard</a>
              <a href="/admin" className="text-sm text-gray-600 hover:text-blue-600 transition">Admin</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          
          {/* Status Badge */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium tracking-wide">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              ANÁLISIS DIARIO · 8:30 AM Y 4:30 PM
            </div>
          </div>
          
          {/* Main Headline - Estilo White Paper */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              Lo que necesita saber
              <br />
              <span className="text-blue-600 italic">del Diario Oficial</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-6">
              Síntesis diaria del DOF filtrada por área de práctica. Para profesionales del derecho que toman decisiones informadas.
            </p>

            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Dos veces al día (8:30 AM y 4:30 PM), un análisis automatizado de todas las ediciones del Diario Oficial de la Federación, clasificado por relevancia para su práctica profesional.
            </p>
          </div>

          {/* Stats - Con datos concretos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            <div className="border-2 border-dashed border-green-400 rounded-none p-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-xs text-gray-600 uppercase tracking-widest">COBERTURA DOF</div>
            </div>
            <div className="border-2 border-dashed border-green-400 rounded-none p-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">35</div>
              <div className="text-xs text-gray-600 uppercase tracking-widest">ÁREAS LEGALES</div>
            </div>
            <div className="border-2 border-dashed border-green-400 rounded-none p-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">2×/DÍA</div>
              <div className="text-xs text-gray-600 uppercase tracking-widest">MATUTINA Y VESPERTINA</div>
            </div>
            <div className="border-2 border-dashed border-green-400 rounded-none p-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">2-3</div>
              <div className="text-xs text-gray-600 uppercase tracking-widest">LÍNEAS/RESUMEN</div>
            </div>
          </div>

          {/* Metodología - Estilo analítico */}
          <div className="mb-20 bg-gray-50 border-l-4 border-blue-600 p-8">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">Metodología</h3>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>1. Extracción automatizada.</strong> Cada día, nuestro sistema descarga y procesa la totalidad de documentos publicados en el DOF, sin excepción.
              </p>
              <p>
                <strong>2. Clasificación por IA.</strong> Utilizamos Claude 3.5 Haiku (Anthropic) para analizar y clasificar cada documento según su relevancia para las 35 áreas de práctica legal más demandadas en México.
              </p>
              <p>
                <strong>3. Síntesis ejecutiva.</strong> Cada documento relevante es resumido en 2-3 oraciones, destacando: (a) materia regulada, (b) cambio normativo, y (c) implicaciones prácticas.
              </p>
              <p>
                <strong>4. Entrega personalizada.</strong> Solo recibe documentos clasificados en sus áreas de interés, con enlace directo al texto oficial para verificación.
              </p>
            </div>
          </div>

          {/* Value Proposition - Enfoque profesional */}
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eficiencia medible</h3>
              <p className="text-gray-600 leading-relaxed">
                El DOF publica un promedio de 47 documentos diarios. Revisarlos manualmente requiere 2.5 horas. Con DOF Alertas: 8 minutos.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cobertura completa</h3>
              <p className="text-gray-600 leading-relaxed">
                Cero documentos omitidos. Nuestro sistema procesa el 100% de publicaciones, incluyendo secciones especializadas y suplementos.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verificable</h3>
              <p className="text-gray-600 leading-relaxed">
                Cada resumen incluye enlace directo al documento oficial. La síntesis complementa, no sustituye, su análisis profesional.
              </p>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-dashed border-green-400 rounded-none p-12 bg-gray-50">
              <h3 className="text-3xl font-serif font-bold text-center mb-4">Suscripción profesional</h3>
              <p className="text-center text-gray-600 mb-10">
                Inversión: $49 MXN mensuales. Cancelación sin penalización.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                    Correo electrónico profesional *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="correo@despacho.com"
                    required
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                    Nombre completo (opcional)
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Lic. Juan Pérez García"
                  />
                </div>

                {/* Áreas - Agrupadas por categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
                    Áreas de práctica * (seleccione al menos una)
                  </label>
                  
                  {/* Categoría Alta */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Alta demanda</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areasAlta.map((area) => (
                        <label
                          key={area.codigo}
                          className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                            selectedAreas.includes(area.codigo)
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area.codigo)}
                            onChange={() => handleAreaToggle(area.codigo)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{area.emoji} {area.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">{area.descripcion}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categoría Media */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demanda media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areasMedia.map((area) => (
                        <label
                          key={area.codigo}
                          className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                            selectedAreas.includes(area.codigo)
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area.codigo)}
                            onChange={() => handleAreaToggle(area.codigo)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{area.emoji} {area.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">{area.descripcion}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categoría Especializada */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Especializada</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {areasEspecializada.map((area) => (
                        <label
                          key={area.codigo}
                          className={`flex items-start gap-3 p-4 border-2 cursor-pointer transition-all ${
                            selectedAreas.includes(area.codigo)
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area.codigo)}
                            onChange={() => handleAreaToggle(area.codigo)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{area.emoji} {area.nombre}</div>
                            <div className="text-xs text-gray-500 mt-1">{area.descripcion}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    {selectedAreas.length > 0 
                      ? `${selectedAreas.length} área(s) seleccionada(s)` 
                      : 'Seleccione al menos una área de práctica'}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || selectedAreas.length === 0}
                  className="w-full bg-blue-600 text-white py-5 px-8 rounded-none font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
                >
                  {loading ? 'PROCESANDO...' : 'SUSCRIBIRSE — $49 MXN/MES'}
                </button>

                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  Pago seguro mediante tarjeta de crédito o débito. Cancelación sin penalización en cualquier momento. Facturación disponible.
                </p>
              </form>
            </div>
          </div>

          {/* ROI Section - Datos concretos */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-center mb-8">Retorno de inversión</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-none p-8">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide mb-2">Costo hora/abogado (promedio)</div>
                  <div className="text-3xl font-bold text-gray-900">$850 MXN</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide mb-2">Tiempo ahorrado/mes</div>
                  <div className="text-3xl font-bold text-gray-900">~50 horas</div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t-2 border-blue-300 text-center">
                <div className="text-sm text-gray-600 uppercase tracking-wide mb-2">Valor generado/mes</div>
                <div className="text-4xl font-bold text-blue-600">$42,500 MXN</div>
                <p className="text-sm text-gray-600 mt-4">
                  Inversión de $49/mes. ROI de 867:1
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">DOF Alertas</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Servicio de monitoreo normativo y síntesis del Diario Oficial de la Federación para profesionales del derecho.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Información</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Metodología</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Aviso de Privacidad</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Términos y Condiciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Contacto</h4>
              <p className="text-sm text-gray-600">
                Consultas y soporte técnico:<br />
                <a href="mailto:contacto@dofalertas.mx" className="text-blue-600 hover:text-blue-700">
                  contacto@dofalertas.mx
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 DOF Alertas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

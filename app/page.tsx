'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Clock, Shield, Zap, ChevronDown, ChevronUp, FileText, ArrowRight } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function Home() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('alta');

  const handleAreaToggle = (codigo: string) => {
    setSelectedAreas(prev =>
      prev.includes(codigo)
        ? prev.filter(a => a !== codigo)
        : [...prev, codigo]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || selectedAreas.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/demo/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nombre,
          areas: selectedAreas,
        }),
      });

      const data = await response.json();

      if (data.redirect_url) {
        localStorage.setItem('demo_user', JSON.stringify({ email, nombre, areas: selectedAreas, session_id: data.session_id }));
        window.location.href = data.redirect_url;
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Error al procesar la suscripción');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const areasAlta = AREAS_35.filter(a => a.categoria === 'alta');
  const areasMedia = AREAS_35.filter(a => a.categoria === 'media');
  const areasEspecializada = AREAS_35.filter(a => a.categoria === 'especializada');

  const categories = [
    { id: 'alta', name: 'Alta demanda', areas: areasAlta, color: 'emerald' },
    { id: 'media', name: 'Demanda media', areas: areasMedia, color: 'blue' },
    { id: 'especializada', name: 'Especializada', areas: areasEspecializada, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DOF Alertas</h1>
                <p className="text-xs text-slate-500">Monitoreo Normativo</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/feed" className="text-sm text-slate-600 hover:text-blue-600 transition font-medium">Feed</a>
              <a href="/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition font-medium">Dashboard</a>
              <a href="#suscribirse" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/25">
                Suscribirse
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">Análisis diario 8:30 AM y 4:30 PM</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              El DOF, resumido
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                para tu práctica
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Recibe síntesis inteligentes del Diario Oficial de la Federación, 
              filtradas específicamente para tus áreas de práctica legal.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: '100%', label: 'Cobertura DOF', icon: Shield },
              { value: '35', label: 'Áreas legales', icon: FileText },
              { value: '2×', label: 'Alertas diarias', icon: Clock },
              { value: '8 min', label: 'vs 2.5 hrs manual', icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <stat.icon className="w-5 h-5 text-blue-600 mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div id="suscribirse" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  7 días gratis, cancela cuando quieras
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Comienza tu suscripción
                </h3>
                <p className="text-slate-600">
                  Solo <span className="font-semibold text-slate-900">$49 MXN/mes</span> después del trial
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition text-slate-900 placeholder:text-slate-400"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition text-slate-900 placeholder:text-slate-400"
                    placeholder="Lic. Juan Pérez"
                  />
                </div>

                {/* Áreas selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Áreas de práctica <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                            <span className="text-xs text-slate-500">
                              {cat.areas.filter(a => selectedAreas.includes(a.codigo)).length}/{cat.areas.length} seleccionadas
                            </span>
                          </div>
                          {expandedCategory === cat.id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        
                        {expandedCategory === cat.id && (
                          <div className="p-3 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                            {cat.areas.map((area) => (
                              <label
                                key={area.codigo}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  selectedAreas.includes(area.codigo)
                                    ? 'bg-blue-50 border-blue-200 border'
                                    : 'bg-white border border-slate-100 hover:border-blue-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.includes(area.codigo)}
                                  onChange={() => handleAreaToggle(area.codigo)}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                    <span>{area.emoji}</span>
                                    <span className="truncate">{area.nombre}</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedAreas.length > 0 && (
                    <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedAreas.length} área{selectedAreas.length > 1 ? 's' : ''} seleccionada{selectedAreas.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || selectedAreas.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      Comenzar prueba gratis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  Pago seguro con tarjeta. Sin compromisos, cancela cuando quieras.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Cómo funciona?
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Automatizamos el monitoreo del DOF para que tú te enfoques en lo importante
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Extracción automática',
                description: 'Cada día procesamos el 100% de documentos publicados en el DOF, sin excepción.',
              },
              {
                step: '02',
                title: 'Clasificación con IA',
                description: 'Los modelos más avanzados de la industria analizan y clasifican cada documento según relevancia para tu práctica.',
              },
              {
                step: '03',
                title: 'Síntesis ejecutiva',
                description: 'Recibe resúmenes de 2-3 líneas con lo esencial: materia, cambio e implicaciones.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Ahorra tiempo,
                <br />
                <span className="text-blue-600">nunca pierdas una alerta</span>
              </h3>
              <div className="space-y-4">
                {[
                  'El DOF publica ~47 documentos diarios. Revisarlos: 2.5 hrs. Con DOF Alertas: 8 min.',
                  'Cero documentos omitidos. Procesamos 100% de publicaciones, incluyendo suplementos.',
                  'Cada resumen incluye enlace directo al documento oficial para verificación.',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
              <h4 className="text-lg font-medium text-blue-200 mb-2">Retorno de inversión</h4>
              <div className="text-5xl font-bold mb-4">867:1</div>
              <div className="space-y-3 text-blue-100">
                <div className="flex justify-between">
                  <span>Costo hora/abogado (promedio)</span>
                  <span className="font-semibold text-white">$850 MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo ahorrado/mes</span>
                  <span className="font-semibold text-white">~50 hrs</span>
                </div>
                <div className="border-t border-blue-500 pt-3 flex justify-between">
                  <span>Valor generado/mes</span>
                  <span className="font-bold text-white text-xl">$42,500 MXN</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-blue-200">
                Por solo $49/mes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Empieza hoy, sin compromiso
          </h3>
          <p className="text-lg text-slate-400 mb-8">
            7 días de prueba gratis. Cancela cuando quieras.
          </p>
          <a
            href="#suscribirse"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition shadow-2xl"
          >
            Comenzar prueba gratis
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DOF Alertas</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm">
                Servicio de monitoreo normativo y síntesis del Diario Oficial de la Federación para profesionales del derecho.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Producto</h4>
              <ul className="space-y-2">
                <li><a href="/feed" className="text-sm text-slate-400 hover:text-white transition">Feed</a></li>
                <li><a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition">Aviso de Privacidad</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-sm text-slate-500">© 2025 DOF Alertas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

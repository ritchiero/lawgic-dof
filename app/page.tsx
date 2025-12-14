'use client';

import { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, FileText, ArrowRight, Check } from 'lucide-react';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre, areas: selectedAreas }),
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
    { id: 'alta', name: 'Alta demanda', areas: areasAlta },
    { id: 'media', name: 'Demanda media', areas: areasMedia },
    { id: 'especializada', name: 'Especializada', areas: areasEspecializada },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-slate-900">DOF Alertas</span>
            </div>
            <a href="#suscribirse" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Probar gratis →
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Tu asistente de IA que lee el DOF por ti.
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            Te avisa solo cuando algo afecta tu práctica.
          </p>
          <a
            href="#suscribirse"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Probar gratis
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Frase clave */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xl md:text-2xl text-slate-700 space-y-2">
            <p>Lee todo el DOF.</p>
            <p>Filtra lo relevante.</p>
            <p className="text-slate-500">Si no importa, no te molesta.</p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Cómo funciona</h2>
          <div className="space-y-6">
            {[
              'La IA lee el DOF completo cada día',
              'Decide si algo te afecta',
              'Te manda un resumen corto (o nada)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  {i + 1}
                </div>
                <p className="text-lg text-slate-700 pt-1">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ejemplo visual */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="text-xs text-slate-400 mb-1">Asunto:</div>
              <div className="font-medium text-slate-900">
                👉 Tu asistente DOF — 1 alerta relevante hoy
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="text-sm text-slate-600 italic">
                El resto del DOF fue leído y descartado.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precio + Formulario */}
      <section id="suscribirse" className="py-20 px-6">
        <div className="max-w-md mx-auto">
          {/* Precio */}
          <div className="text-center mb-10">
            <p className="text-slate-600 mb-2">Un asistente legal con IA</p>
            <div className="text-4xl font-bold text-slate-900 mb-2">$49 MXN <span className="text-xl font-normal text-slate-500">/ mes</span></div>
            <p className="text-sm text-slate-500">Cancela cuando quieras</p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre <span className="text-slate-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Áreas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ¿Qué áreas te interesan?
                </label>
                
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
                      >
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          {cat.areas.filter(a => selectedAreas.includes(a.codigo)).length > 0 && (
                            <span className="text-xs text-blue-600 font-medium">
                              {cat.areas.filter(a => selectedAreas.includes(a.codigo)).length}
                            </span>
                          )}
                          {expandedCategory === cat.id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>
                      
                      {expandedCategory === cat.id && (
                        <div className="p-2 grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                          {cat.areas.map((area) => (
                            <label
                              key={area.codigo}
                              className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition ${
                                selectedAreas.includes(area.codigo)
                                  ? 'bg-blue-50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                selectedAreas.includes(area.codigo)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-slate-300'
                              }`}>
                                {selectedAreas.includes(area.codigo) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedAreas.includes(area.codigo)}
                                onChange={() => handleAreaToggle(area.codigo)}
                                className="sr-only"
                              />
                              <span className="text-sm text-slate-700">{area.emoji} {area.nombre}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedAreas.length > 0 && (
                  <p className="mt-2 text-sm text-blue-600">
                    {selectedAreas.length} área{selectedAreas.length > 1 ? 's' : ''} seleccionada{selectedAreas.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || selectedAreas.length === 0}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Procesando...' : 'Probar gratis'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <span>© 2025 DOF Alertas</span>
          <div className="flex gap-6">
            <a href="/feed" className="hover:text-slate-700">Feed</a>
            <a href="/dashboard" className="hover:text-slate-700">Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

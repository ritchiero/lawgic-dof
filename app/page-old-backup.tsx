"use client";

import { useState } from 'react';
import { AREAS_ARRAY } from '@/lib/areas';
import { Eye, Mail, CheckCircle2, Zap } from 'lucide-react';

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
    
    if (!email || selectedAreas.length === 0) {
      alert('Por favor ingresa tu email y selecciona al menos un área de práctica');
      return;
    }

    setLoading(true);

    try {
      // Usar modo demo
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">MONITOREO LEGAL</div>
                <h1 className="text-2xl font-bold text-gray-900">DOF Alertas</h1>
              </div>
            </div>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</a>
              <a href="/admin" className="text-sm text-gray-600 hover:text-blue-600">Admin</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            MONITOREO ACTIVO · ACTUALIZADO HOY
          </div>
          
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
            El DOF resumido{' '}
            <span className="text-blue-600 italic">cada mañana</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recibe en tu email solo los documentos del DOF que te interesan, con resúmenes simples. Sin tecnicismos, sin perder tiempo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="border-2 border-dashed border-green-400 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">35</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Áreas de Práctica</div>
          </div>
          <div className="border-2 border-dashed border-green-400 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">7:00 AM</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Envío Diario</div>
          </div>
          <div className="border-2 border-dashed border-green-400 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">$49</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">MXN / Mes</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Solo lo que importa</h3>
            <p className="text-gray-600">Recibe únicamente los documentos relacionados con tu área de práctica.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fácil de leer</h3>
            <p className="text-gray-600">Cada documento viene con un resumen de 2-3 líneas. Sin lenguaje complicado.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Muy accesible</h3>
            <p className="text-gray-600">Solo $29 pesos al mes. Cancela cuando quieras, sin compromisos.</p>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="max-w-3xl mx-auto">
          <div className="border-2 border-dashed border-green-400 rounded-lg p-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-center mb-6">Suscríbete Ahora</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@despacho.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lic. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Áreas de Práctica * (selecciona al menos una)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AREAS_ARRAY.map((area) => (
                    <label
                      key={area.codigo}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAreas.includes(area.codigo)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.codigo)}
                        onChange={() => handleAreaToggle(area.codigo)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-2xl">{area.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">{area.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || selectedAreas.length === 0}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Procesando...' : 'Suscribirme por $29/mes'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Pago seguro con tarjeta. Cancela cuando quieras, sin penalización. Puedes cancelar en cualquier momento.
              </p>
            </form>
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

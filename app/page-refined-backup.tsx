'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
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
              <Eye className="w-10 h-10 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">MONITOREO LEGAL</div>
                <h1 className="text-2xl font-bold text-gray-900">DOF Alertas</h1>
              </div>
            </div>
            <div className="flex gap-8">
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
              MONITOREO ACTIVO · ACTUALIZADO HOY
            </div>
          </div>
          
          {/* Main Headline */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight">
              El DOF resumido
              <br />
              <span className="text-blue-600 italic">cada mañana</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Reciba en su correo únicamente los documentos del Diario Oficial que sean relevantes para su práctica, con resúmenes ejecutivos.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="border-2 border-dashed border-green-400 rounded-none p-8 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">35</div>
              <div className="text-sm text-gray-600 uppercase tracking-widest">ÁREAS DE PRÁCTICA</div>
            </div>
            <div className="border-2 border-dashed border-green-400 rounded-none p-8 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">7:00 AM</div>
              <div className="text-sm text-gray-600 uppercase tracking-widest">ENVÍO DIARIO</div>
            </div>
            <div className="border-2 border-dashed border-green-400 rounded-none p-8 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-3">$29</div>
              <div className="text-sm text-gray-600 uppercase tracking-widest">MXN / MES</div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clasificación automática</h3>
              <p className="text-gray-600 leading-relaxed">
                Cada documento del DOF es analizado y clasificado por área de práctica mediante inteligencia artificial.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Resúmenes ejecutivos</h3>
              <p className="text-gray-600 leading-relaxed">
                Reciba únicamente lo relevante para su práctica, resumido en 2-3 oraciones por documento.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sin configuración</h3>
              <p className="text-gray-600 leading-relaxed">
                Seleccione sus áreas, suscríbase y comience a recibir alertas al día siguiente.
              </p>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-dashed border-green-400 rounded-none p-12 bg-gray-50">
              <h3 className="text-3xl font-serif font-bold text-center mb-10">Suscripción</h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
                    Correo electrónico *
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
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Muy demandadas</h4>
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
                  {loading ? 'PROCESANDO...' : 'SUSCRIBIRSE — $29 MXN/MES'}
                </button>

                <p className="text-sm text-gray-500 text-center leading-relaxed">
                  Pago seguro con tarjeta de crédito o débito. Puede cancelar su suscripción en cualquier momento sin penalización.
                </p>
              </form>
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
                Servicio de alertas diarias del Diario Oficial de la Federación, personalizadas por área de práctica legal.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Metodología</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Aviso de Privacidad</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Términos y Condiciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Contacto</h4>
              <p className="text-sm text-gray-600">
                Para consultas y soporte:<br />
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

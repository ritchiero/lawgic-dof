'use client';

import { useState } from 'react';
import { Newspaper, Check, Shield, Clock, Zap, ChevronRight, Menu, X, ArrowRight } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function Home() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'alta' | 'media' | 'especializada'>('alta');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAreaToggle = (codigo: string) => {
    setSelectedAreas(prev =>
      prev.includes(codigo)
        ? prev.filter(a => a !== codigo)
        : [...prev, codigo]
    );
  };

  const toggleAllInCategory = (categoria: 'alta' | 'media' | 'especializada') => {
    const areasInCategory = AREAS_35.filter(a => a.categoria === categoria).map(a => a.codigo);
    const allSelected = areasInCategory.every(code => selectedAreas.includes(code));
    
    if (allSelected) {
      setSelectedAreas(prev => prev.filter(code => !areasInCategory.includes(code)));
    } else {
      setSelectedAreas(prev => {
        const newSelected = new Set([...prev, ...areasInCategory]);
        return Array.from(newSelected);
      });
    }
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

  // Agrupar áreas
  const areasAlta = AREAS_35.filter(a => a.categoria === 'alta');
  const areasMedia = AREAS_35.filter(a => a.categoria === 'media');
  const areasEspecializada = AREAS_35.filter(a => a.categoria === 'especializada');

  const scrollToForm = () => {
    document.getElementById('subscribe-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">DOF Alertas</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Cómo funciona</a>
              <a href="#beneficios" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Beneficios</a>
              <a href="/feed" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Feed</a>
              <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Login</a>
              <button 
                onClick={scrollToForm}
                className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Suscribirse
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4">
             <a href="#como-funciona" className="block text-sm font-medium text-slate-600">Cómo funciona</a>
             <a href="#beneficios" className="block text-sm font-medium text-slate-600">Beneficios</a>
             <a href="/feed" className="block text-sm font-medium text-slate-600">Feed</a>
             <button onClick={scrollToForm} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Suscribirse</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Actualizado hoy 8:30 AM
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Inteligencia legal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">automatizada</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Monitoreo diario del DOF filtrado por IA. Recibe solo las novedades legales que afectan a tu práctica, resumidas y en tu correo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={scrollToForm}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2"
            >
              Comenzar prueba
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-slate-500">
              Desde $49 MXN/mes · Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Cobertura DOF</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">35</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Áreas Legales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">8 min</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lectura diaria</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Monitoreo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="beneficios" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Por qué los abogados modernos nos eligen</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Deja de perder horas buscando en el DOF. Nuestra tecnología hace el trabajo pesado por ti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ahorra 50+ horas al mes</h3>
              <p className="text-slate-600 leading-relaxed">
                El abogado promedio gasta 2.5 horas diarias revisando el DOF. Nosotros reducimos ese tiempo a minutos, permitiéndote facturar más horas a tus clientes.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Precisión con IA</h3>
              <p className="text-slate-600 leading-relaxed">
                Utilizamos modelos de lenguaje avanzados (Claude 3.5) para analizar y clasificar cada publicación con una precisión superior a la búsqueda por palabras clave.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cobertura Total</h3>
              <p className="text-slate-600 leading-relaxed">
                Desde acuerdos menores hasta reformas constitucionales. Nada se nos escapa. Monitoreamos ediciones matutinas y vespertinas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section - Steps */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Metodología transparente</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Extracción Universal</h4>
                    <p className="text-slate-600">Descargamos automáticamente cada documento del DOF al momento de su publicación.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Análisis Semántico</h4>
                    <p className="text-slate-600">Nuestra IA lee y comprende el contexto legal, no solo busca palabras clave.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Síntesis Ejecutiva</h4>
                    <p className="text-slate-600">Generamos resúmenes de 2-3 líneas enfocados en la acción y el impacto.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Entrega Personalizada</h4>
                    <p className="text-slate-600">Recibes un correo limpio solo con lo relevante para tus áreas seleccionadas.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
               {/* Mock Email Preview */}
               <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
                 <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="p-6 space-y-4">
                   <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                   <div className="space-y-2">
                     <div className="h-3 bg-slate-100 rounded w-full"></div>
                     <div className="h-3 bg-slate-100 rounded w-full"></div>
                     <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                   </div>
                   <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Fiscal</span>
                      </div>
                      <div className="text-sm font-medium text-slate-800">Modificación al Anexo 3 de la Resolución Miscelánea Fiscal para 2024</div>
                      <p className="text-xs text-slate-500 mt-1">Se actualizan criterios no vinculativos. Impacto directo en deducciones de ISR para sector transporte.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section id="subscribe-form" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Left Col: Pitch */}
            <div className="lg:col-span-5 space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Configura tu alerta personalizada</h2>
              <p className="text-slate-400 text-lg">
                Selecciona las áreas de tu interés y recibe tu primer reporte mañana mismo a las 8:30 AM.
              </p>
              
              <div className="space-y-6 pt-6 border-t border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sin plazos forzosos</h4>
                    <p className="text-sm text-slate-400">Cancela en cualquier momento desde tu dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Precio fijo</h4>
                    <p className="text-sm text-slate-400">$49 MXN mensuales. Acceso ilimitado a áreas.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mt-8">
                <p className="italic text-slate-300 mb-4">"Una herramienta indispensable. He recuperado horas de mi semana que antes perdía scrolleando el DOF."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center font-bold">
                    JP
                  </div>
                  <div>
                    <div className="font-medium text-white">Juan Pérez</div>
                    <div className="text-xs text-slate-400">Socio Corporativo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-6 md:p-8 text-slate-900 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Profesional</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="tu@despacho.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  {/* Area Selector with Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-slate-700">Áreas de Práctica</label>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {selectedAreas.length} seleccionadas
                      </span>
                    </div>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      {/* Tabs Header */}
                      <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setActiveTab('alta')}
                          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'alta' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Alta Demanda
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('media')}
                          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'media' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Media Demanda
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('especializada')}
                          className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'especializada' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Especializada
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="p-4 bg-slate-50/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="mb-3 flex justify-end">
                           <button 
                             type="button" 
                             onClick={() => toggleAllInCategory(activeTab)}
                             className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                           >
                             Seleccionar/Deseleccionar todo
                           </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(activeTab === 'alta' ? areasAlta : activeTab === 'media' ? areasMedia : areasEspecializada).map((area) => (
                            <label
                              key={area.codigo}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                selectedAreas.includes(area.codigo)
                                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                  : 'bg-white border-slate-200 hover:border-blue-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAreas.includes(area.codigo)}
                                onChange={() => handleAreaToggle(area.codigo)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {area.emoji} {area.nombre}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || selectedAreas.length === 0}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? 'Procesando...' : 'Comenzar Suscripción'}
                  </button>
                  
                  <p className="text-center text-xs text-slate-500 mt-4">
                    Al suscribirte aceptas nuestros términos y condiciones. Pago seguro vía Stripe.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
               <Newspaper className="w-6 h-6 text-slate-500" />
               <span className="font-bold text-slate-200">DOF Alertas</span>
             </div>
             <div className="flex gap-6 text-sm">
               <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
               <a href="#" className="hover:text-white transition-colors">Términos</a>
               <a href="mailto:contacto@dofalertas.mx" className="hover:text-white transition-colors">Contacto</a>
             </div>
             <div className="text-sm">
               © 2025 Lawgic. Todos los derechos reservados.
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

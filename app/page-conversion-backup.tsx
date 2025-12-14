'use client';

import { useState } from 'react';
import { Eye, Zap, Mail, CheckCircle2, Clock, TrendingUp, Users, Shield, Star } from 'lucide-react';
import { AREAS_ARRAY } from '@/lib/areas';

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
      alert('Por favor completa todos los campos requeridos');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Monitoreo Legal</div>
                <h1 className="text-xl font-bold text-gray-900">DOF Alertas</h1>
              </div>
            </div>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">Dashboard</a>
              <a href="/admin" className="text-sm text-gray-600 hover:text-blue-600 transition">Admin</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Above the Fold */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Social Proof Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              ✅ 247 abogados ya reciben sus alertas diarias
            </div>
          </div>
          
          {/* Main Headline */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              ¿Cansado de revisar el DOF
              <br />
              <span className="text-blue-600 italic">todos los días?</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Recibe <strong>solo lo que te importa</strong> en tu email cada mañana.
              <br />
              Sin perder tiempo. Sin lenguaje complicado.
            </p>

            {/* Value Props - Quick Scan */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Ahorra 2 horas/día</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">35 áreas cubiertas</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">100% confiable</span>
              </div>
            </div>

            {/* CTA Principal - Above the Fold */}
            <div className="max-w-md mx-auto">
              <a
                href="#suscripcion"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-8 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Quiero mis alertas por $29/mes →
              </a>
              <p className="text-sm text-gray-500 mt-3">
                ⚡ Cancela cuando quieras • 💳 Pago seguro con tarjeta
              </p>
            </div>
          </div>

          {/* Problema/Solución Visual */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Antes - Problema */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="text-center mb-4">
                <span className="text-4xl">😫</span>
                <h3 className="text-2xl font-bold text-red-900 mt-2">Sin DOF Alertas</h3>
              </div>
              <ul className="space-y-3 text-red-800">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span>Pierdes 2+ horas revisando el DOF completo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span>Te pierdes cambios importantes para tus clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span>Lenguaje técnico difícil de entender rápido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">❌</span>
                  <span>Estrés de estar siempre &quot;al pendiente&quot;</span>
                </li>
              </ul>
            </div>

            {/* Después - Solución */}
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-4">
                <span className="text-4xl">😎</span>
                <h3 className="text-2xl font-bold text-green-900 mt-2">Con DOF Alertas</h3>
              </div>
              <ul className="space-y-3 text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✅</span>
                  <span><strong>5 minutos</strong> para estar 100% actualizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✅</span>
                  <span><strong>Cero documentos perdidos</strong> de tus áreas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✅</span>
                  <span><strong>Resúmenes simples</strong> que entiendes al instante</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✅</span>
                  <span><strong>Tranquilidad</strong> de estar siempre informado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios / Prueba Social */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros usuarios</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-700 mb-4 italic">
                &quot;Antes perdía 3 horas al día revisando el DOF. Ahora en 5 minutos sé exactamente qué me afecta. Vale cada peso.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  JM
                </div>
                <div>
                  <div className="font-semibold">Juan Martínez</div>
                  <div className="text-sm text-gray-500">Abogado Fiscal, CDMX</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-700 mb-4 italic">
                &quot;Mis clientes están impresionados de lo rápido que les informo sobre cambios. Mi despacho se ve más profesional.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  LR
                </div>
                <div>
                  <div className="font-semibold">Laura Rodríguez</div>
                  <div className="text-sm text-gray-500">Derecho Corporativo, MTY</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-gray-700 mb-4 italic">
                &quot;Por $29 al mes es una ganga. Antes pagaba a un pasante $500/semana solo para revisar el DOF.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  CS
                </div>
                <div>
                  <div className="font-semibold">Carlos Sánchez</div>
                  <div className="text-sm text-gray-500">Despacho Boutique, GDL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-4">Tan fácil que da risa</h3>
          <p className="text-xl text-gray-600 text-center mb-12">3 pasos y listo. Sin complicaciones.</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                1
              </div>
              <h4 className="text-xl font-bold mb-2">Elige tus áreas</h4>
              <p className="text-gray-600">
                Selecciona las áreas de práctica que te interesan. Puedes elegir cuantas quieras.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                2
              </div>
              <h4 className="text-xl font-bold mb-2">Suscríbete</h4>
              <p className="text-gray-600">
                Pago seguro con tarjeta. $29/mes. Cancela cuando quieras, sin preguntas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                ✓
              </div>
              <h4 className="text-xl font-bold mb-2">Recibe tus alertas</h4>
              <p className="text-gray-600">
                Cada mañana a las 7 AM. Solo lo relevante. Resúmenes simples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de Suscripción - Optimizado */}
      <section id="suscripcion" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Urgencia */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100 text-orange-800 rounded-full font-semibold border-2 border-orange-300">
              <Clock className="w-5 h-5" />
              🔥 Oferta de lanzamiento: $29/mes (precio normal $99/mes)
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 border-4 border-dashed border-green-400 rounded-2xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-3">
              Empieza hoy mismo
            </h3>
            <p className="text-center text-gray-600 mb-8 text-lg">
              Mañana a las 7 AM recibirás tu primera alerta 📧
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-gray-900 mb-2">
                  📧 Tu email profesional
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="tu@despacho.com"
                  required
                />
              </div>

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-lg font-semibold text-gray-900 mb-2">
                  👤 Tu nombre (opcional)
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Lic. Juan Pérez"
                />
              </div>

              {/* Áreas */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  ⚖️ Selecciona tus áreas de práctica *
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Elige al menos una. Puedes seleccionar todas las que quieras.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-4 bg-white rounded-xl border-2 border-gray-200">
                  {AREAS_ARRAY.map((area) => (
                    <label
                      key={area.codigo}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAreas.includes(area.codigo)
                          ? 'bg-blue-50 border-blue-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.codigo)}
                        onChange={() => handleAreaToggle(area.codigo)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">
                        {area.emoji} {area.nombre}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedAreas.length > 0 ? `✅ ${selectedAreas.length} área(s) seleccionada(s)` : '⚠️ Selecciona al menos una área'}
                </p>
              </div>

              {/* CTA Button - Destacado */}
              <button
                type="submit"
                disabled={loading || selectedAreas.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-6 px-8 rounded-xl font-bold text-2xl hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? '⏳ Procesando...' : '🚀 Sí, quiero mis alertas por $29/mes'}
              </button>

              {/* Garantías */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-white rounded-lg">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Pago 100% seguro</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Cancela cuando quieras</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">247 abogados confían</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Al suscribirte aceptas recibir emails diarios con alertas del DOF.
                <br />
                Puedes cancelar en cualquier momento sin penalización.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ - Objeciones */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Preguntas frecuentes</h3>
          
          <div className="space-y-6">
            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-bold text-lg cursor-pointer">
                ¿Por qué tan barato? ¿Es confiable?
              </summary>
              <p className="mt-3 text-gray-600">
                Sí, 100% confiable. El precio es bajo porque automatizamos todo con IA. No hay equipos grandes ni oficinas costosas. Queremos que TODOS los abogados en México puedan acceder, no solo los grandes despachos.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-bold text-lg cursor-pointer">
                ¿Puedo cancelar cuando quiera?
              </summary>
              <p className="mt-3 text-gray-600">
                Sí, cancelas con un click. Sin preguntas, sin penalización. Si no te sirve, simplemente cancelas y ya.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-bold text-lg cursor-pointer">
                ¿Qué pasa si me pierdo un documento importante?
              </summary>
              <p className="mt-3 text-gray-600">
                No te pierdes nada. Nuestra IA revisa el 100% del DOF todos los días. Si algo toca tus áreas, te llega. Garantizado.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-bold text-lg cursor-pointer">
                ¿Los resúmenes son precisos?
              </summary>
              <p className="mt-3 text-gray-600">
                Usamos Claude (IA de Anthropic), la misma tecnología que usan bufetes internacionales. Los resúmenes son precisos y siempre incluimos el link al documento original para que verifiques.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-bold text-lg cursor-pointer">
                ¿Cuándo llega mi primera alerta?
              </summary>
              <p className="mt-3 text-gray-600">
                Si te suscribes hoy, mañana a las 7 AM recibes tu primera alerta con todos los documentos relevantes del día anterior.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final - Última Oportunidad */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para dejar de perder tiempo?
          </h3>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Únete a los 247 abogados que ya ahorran 2 horas al día
          </p>
          <a
            href="#suscripcion"
            className="inline-block bg-white text-blue-600 py-5 px-12 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            Sí, quiero mis alertas por $29/mes →
          </a>
          <p className="text-sm mt-6 opacity-75">
            ⚡ Cancela cuando quieras • 💳 Pago seguro con tarjeta • ✅ Sin compromisos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">DOF Alertas</h4>
              <p className="text-sm">
                Alertas diarias del Diario Oficial de la Federación, personalizadas para tu práctica legal.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Metodología</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Soporte</h4>
              <p className="text-sm">
                ¿Preguntas? Escríbenos a<br />
                <a href="mailto:hola@dofalertas.com" className="text-blue-400 hover:text-blue-300">
                  hola@dofalertas.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 DOF Alertas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

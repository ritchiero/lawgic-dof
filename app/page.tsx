'use client';

import { FileText, Shield, Clock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
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
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Síntesis inteligentes del Diario Oficial de la Federación, 
              filtradas específicamente para tus áreas de práctica legal.
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/feed"
                className="group px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
              >
                Explorar Feed Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </a>
              <a 
                href="#suscribirse"
                className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition shadow-md"
              >
                Recibir Alertas por Email
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Feed gratis para siempre • Alertas premium $49 MXN/mes
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Cómo funciona?
            </h3>
            <p className="text-lg text-slate-600">
              Tres pasos simples para mantenerte actualizado
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Explora el Feed',
                description: 'Accede gratis a todos los documentos del DOF con resúmenes generados por IA',
                icon: '🔍',
              },
              {
                step: '2',
                title: 'Suscríbete para Alertas',
                description: 'Recibe 2 emails diarios con documentos filtrados para tus áreas de práctica',
                icon: '📧',
              },
              {
                step: '3',
                title: 'Ahorra Tiempo',
                description: 'De 2.5 horas a 8 minutos diarios revisando el DOF',
                icon: '⚡',
              },
            ].map((feature, i) => (
              <div key={i} className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">{feature.step}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 pt-8 border border-slate-200">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="suscribirse" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Elige tu plan
            </h3>
            <p className="text-lg text-slate-600">
              Empieza gratis, actualiza cuando quieras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Gratis */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Feed Gratis</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500">para siempre</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Acceso completo al feed web',
                  'Resúmenes generados por IA',
                  'Búsqueda y filtros por área',
                  'Documentos históricos',
                  'Sin límites de uso',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/feed"
                className="block w-full py-3 px-6 bg-slate-100 text-slate-900 text-center font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Explorar Ahora
              </a>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 border-2 border-blue-500 shadow-xl shadow-blue-500/30 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                  POPULAR
                </span>
              </div>

              <div className="mb-6">
                <h4 className="text-2xl font-bold text-white mb-2">Premium</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-blue-100">MXN/mes</span>
                </div>
                <p className="text-blue-100 text-sm mt-2">7 días gratis, sin tarjeta</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Todo lo del plan gratis',
                  'Alertas por email 2x al día',
                  'Filtrado por áreas de práctica',
                  'Dashboard personalizado',
                  'Acceso prioritario a nuevas features',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/onboarding"
                className="block w-full py-3 px-6 bg-white text-blue-600 text-center font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg"
              >
                Comenzar Prueba Gratis
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DOF Alertas</span>
          </div>
          <p className="text-sm">
            © 2025 DOF Alertas. Monitoreo inteligente del Diario Oficial de la Federación.
          </p>
        </div>
      </footer>
    </div>
  );
}

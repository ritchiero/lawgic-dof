'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Newspaper,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function Home() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areaQuery, setAreaQuery] = useState('');

  const handleAreaToggle = (codigo: string) => {
    setSelectedAreas(prev =>
      prev.includes(codigo) ? prev.filter(a => a !== codigo) : [...prev, codigo]
    );
  };

  const submitDisabled = loading || !email || selectedAreas.length === 0;

  const { areasAlta, areasMedia, areasEspecializada, query } = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    const matchesQuery = (a: { nombre: string; descripcion: string; codigo: string }) => {
      if (!q) return true;
      return (
        a.nombre.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q) ||
        a.codigo.toLowerCase().includes(q)
      );
    };

    const alta = AREAS_35.filter(a => a.categoria === 'alta').filter(matchesQuery);
    const media = AREAS_35.filter(a => a.categoria === 'media').filter(matchesQuery);
    const especializada = AREAS_35.filter(a => a.categoria === 'especializada').filter(matchesQuery);

    return {
      areasAlta: alta,
      areasMedia: media,
      areasEspecializada: especializada,
      query: q,
    };
  }, [areaQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || selectedAreas.length === 0) {
      setError('Ingresa tu correo y selecciona al menos un área de práctica.');
      return;
    }

    setLoading(true);
    setError(null);

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
        localStorage.setItem(
          'demo_user',
          JSON.stringify({ email, nombre, areas: selectedAreas, session_id: data.session_id })
        );
        window.location.href = data.redirect_url;
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      setError('No se pudo iniciar la suscripción. Inténtalo de nuevo en unos segundos.');
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al procesar la suscripción. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const noAreaResults = areasAlta.length + areasMedia.length + areasEspecializada.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-blue-50">
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm">
                <Newspaper className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-gray-500 uppercase tracking-widest">Monitoreo normativo</div>
                <div className="text-base font-semibold text-gray-900 truncate">DOF Alertas</div>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/feed" className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
                Feed
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Dashboard
              </Link>
              <Link href="/admin" className="hidden sm:inline text-sm text-gray-500 hover:text-blue-600 transition">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Dos entregas al día · 8:30 AM y 4:30 PM
                </div>

                <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-tight">
                  Lo relevante del DOF, <span className="text-blue-700">filtrado por tu práctica</span>.
                </h1>

                <p className="mt-4 text-lg text-gray-700 leading-relaxed max-w-2xl">
                  Resúmenes ejecutivos, enlaces verificables al documento oficial y entrega por correo. Diseñado para abogados y
                  equipos legales que necesitan enterarse rápido.
                </p>

                <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
                  <li className="flex gap-3 items-start p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <Clock className="w-5 h-5 text-blue-700 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Menos tiempo, más señal</div>
                      <div className="text-sm text-gray-600">Solo documentos de tus áreas, con síntesis clara.</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Verificable</div>
                      <div className="text-sm text-gray-600">Cada alerta incluye enlace directo al DOF.</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-700 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Cobertura completa</div>
                      <div className="text-sm text-gray-600">Procesamos todas las publicaciones del día.</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <ExternalLink className="w-5 h-5 text-blue-700 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Sin fricción</div>
                      <div className="text-sm text-gray-600">Te suscribes, eliges áreas y listo.</div>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <a
                    href="#suscripcion"
                    className="inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-4 font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    Suscribirme
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <Link
                    href="/feed"
                    className="inline-flex justify-center items-center gap-2 rounded-xl bg-white text-gray-700 px-6 py-4 font-semibold border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition"
                  >
                    Ver feed
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-10 max-w-2xl">
                  <div className="text-sm font-medium text-gray-900 mb-2">Vista previa (ejemplo de correo)</div>
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Asunto</div>
                      <div className="font-semibold text-gray-900">DOF Alertas · Matutina · Resumen por áreas</div>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                          Fiscal
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            Resolución miscelánea: actualización de reglas aplicables
                          </div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            Ajusta criterios de cumplimiento para ciertos contribuyentes y precisa plazos operativos.
                            Recomendación: revisar impacto en procedimientos internos y calendario fiscal.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                          Laboral
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            Lineamientos administrativos: actualización de criterios
                          </div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            Define reglas de operación y documentación requerida en trámites específicos. Recomendación: validar
                            cumplimiento documental en expedientes activos.
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Cada item incluye enlace al DOF para verificación.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="suscripcion" className="lg:col-span-5 scroll-mt-24">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                    <h2 className="text-xl font-semibold text-gray-900">Suscripción</h2>
                    <p className="mt-1 text-sm text-gray-600">$49 MXN/mes · Cancelación sin penalización.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                      <div
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                      >
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-base"
                        placeholder="correo@despacho.com"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-gray-900 mb-2">
                        Nombre (opcional)
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-base"
                        placeholder="Lic. Juan Pérez"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <div className="flex items-end justify-between gap-4 mb-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Áreas de práctica *{' '}
                          <span className="text-gray-500 font-normal">(elige al menos una)</span>
                        </label>
                        <div className="text-xs text-gray-500">
                          {selectedAreas.length > 0 ? `${selectedAreas.length} seleccionada(s)` : '—'}
                        </div>
                      </div>

                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={areaQuery}
                          onChange={(e) => setAreaQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-sm"
                          placeholder="Buscar área (p. ej., fiscal, amparo, energía...)"
                        />
                      </div>

                      <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alta demanda</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {areasAlta.map((area) => (
                              <label
                                key={area.codigo}
                                className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                  selectedAreas.includes(area.codigo)
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-white border-gray-200 hover:border-blue-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.includes(area.codigo)}
                                  onChange={() => handleAreaToggle(area.codigo)}
                                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {area.emoji} {area.nombre}
                                  </div>
                                  <div className="text-xs text-gray-500 leading-snug">{area.descripcion}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Demanda media</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {areasMedia.map((area) => (
                              <label
                                key={area.codigo}
                                className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                  selectedAreas.includes(area.codigo)
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-white border-gray-200 hover:border-blue-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.includes(area.codigo)}
                                  onChange={() => handleAreaToggle(area.codigo)}
                                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {area.emoji} {area.nombre}
                                  </div>
                                  <div className="text-xs text-gray-500 leading-snug">{area.descripcion}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Especializada</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {areasEspecializada.map((area) => (
                              <label
                                key={area.codigo}
                                className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition ${
                                  selectedAreas.includes(area.codigo)
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-white border-gray-200 hover:border-blue-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.includes(area.codigo)}
                                  onChange={() => handleAreaToggle(area.codigo)}
                                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {area.emoji} {area.nombre}
                                  </div>
                                  <div className="text-xs text-gray-500 leading-snug">{area.descripcion}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {noAreaResults && (
                        <div className="mt-3 text-sm text-gray-600">No se encontraron áreas{query ? ` con “${areaQuery}”` : ''}.</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitDisabled}
                      className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-4 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {loading ? 'Procesando…' : 'Suscribirme — $49 MXN/mes'}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      Pago seguro con tarjeta. Puedes cancelar en cualquier momento.
                    </p>
                  </form>
                </div>

                <div className="mt-6 space-y-3">
                  <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <summary className="cursor-pointer font-semibold text-gray-900">¿Cómo funciona la metodología?</summary>
                    <div className="mt-3 space-y-2 text-sm text-gray-700 leading-relaxed">
                      <p>
                        <strong>1) Extracción automatizada.</strong> Procesamos todas las publicaciones del DOF cada día.
                      </p>
                      <p>
                        <strong>2) Clasificación por áreas.</strong> Identificamos relevancia para las 35 áreas de práctica.
                      </p>
                      <p>
                        <strong>3) Síntesis.</strong> Resúmenes ejecutivos por documento y enlace a fuente oficial.
                      </p>
                      <p>
                        <strong>4) Entrega.</strong> Recibes solo lo que marcaste como relevante.
                      </p>
                    </div>
                  </details>
                  <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <summary className="cursor-pointer font-semibold text-gray-900">¿Puedo cambiar mis áreas después?</summary>
                    <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                      Sí. Puedes actualizar tus preferencias para recibir alertas de nuevas áreas o dejar de recibir otras.
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">35 áreas de práctica</div>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Desde fiscal y corporativo hasta energía, competencia y salud.
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Dos ediciones, dos alertas</div>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Matutina y vespertina, para que no se te pase nada entre cortes.
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Enlaces y contexto</div>
                <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Resumen claro + enlace al documento oficial para lectura completa.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="text-sm font-semibold text-gray-900">DOF Alertas</div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Monitoreo normativo del DOF con síntesis y clasificación por área de práctica.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Producto</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/feed" className="text-gray-600 hover:text-blue-600 transition">
                    Feed
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Contacto</div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Soporte y dudas:
                <br />
                <a href="mailto:contacto@dofalertas.mx" className="text-blue-700 hover:text-blue-800 font-medium">
                  contacto@dofalertas.mx
                </a>
              </p>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-200 text-sm text-gray-500">
            © 2025 DOF Alertas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

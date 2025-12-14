'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Áreas populares para selección rápida
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || selectedAreas.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Crear usuario en Firestore con prueba de 7 días
      const response = await fetch('/api/subscribe-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre: nombre || email.split('@')[0],
          areas: selectedAreas,
        }),
      });

      if (response.ok) {
        // Guardar en localStorage para la welcome page
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_areas', JSON.stringify(selectedAreas));
        
        // Redirigir a welcome page
        router.push('/welcome');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">DOF Alertas</h1>
          </div>
          <p className="text-lg text-slate-600 mb-2">
            Comienza tu prueba gratis de 7 días
          </p>
          <p className="text-sm text-slate-500">
            Sin tarjeta de crédito • Cancela cuando quieras
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico <span className="text-red-500">*</span>
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
              <p className="mt-1 text-xs text-slate-500">
                Aquí recibirás tus alertas 2 veces al día
              </p>
            </div>

            {/* Nombre (opcional) */}
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

            {/* Áreas de práctica */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Áreas de práctica <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-slate-500 mb-3">
                Selecciona al menos una área para recibir alertas relevantes
              </p>

              {/* Áreas populares */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Más populares
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {areasPopulares.map(codigo => {
                    const area = AREAS_35.find(a => a.codigo === codigo);
                    if (!area) return null;
                    return (
                      <button
                        key={area.codigo}
                        type="button"
                        onClick={() => handleAreaToggle(area.codigo)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          selectedAreas.includes(area.codigo)
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-xl">{area.emoji}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {area.nombre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Todas las áreas */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium mb-2">
                  Ver todas las áreas ({AREAS_35.length})
                </summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {AREAS_35.filter(a => !areasPopulares.includes(a.codigo)).map(area => (
                    <label
                      key={area.codigo}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedAreas.includes(area.codigo)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-white border border-transparent hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAreas.includes(area.codigo)}
                        onChange={() => handleAreaToggle(area.codigo)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-lg">{area.emoji}</span>
                      <span className="text-sm text-slate-700 truncate">{area.nombre}</span>
                    </label>
                  ))}
                </div>
              </details>

              {selectedAreas.length > 0 && (
                <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedAreas.length} área{selectedAreas.length > 1 ? 's' : ''} seleccionada{selectedAreas.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || selectedAreas.length === 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-800 transition shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                'Creando cuenta...'
              ) : (
                <>
                  Comenzar prueba gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </>
              )}
            </button>

            {/* Info */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    ¿Qué incluye la prueba gratis?
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• Alertas por email 2 veces al día durante 7 días</li>
                    <li>• Acceso completo al feed web</li>
                    <li>• Sin tarjeta de crédito requerida</li>
                    <li>• Cancela cuando quieras</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Al continuar, aceptas recibir emails de DOF Alertas.
          <br />
          Puedes cancelar tu suscripción en cualquier momento.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Mail, CheckCircle2, ArrowRight, Search, X } from 'lucide-react';
import { AREAS_35 } from '@/lib/areas';

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Áreas populares (destacadas con badge)
  const areasPopulares = ['fiscal', 'corporativo', 'laboral', 'civil', 'mercantil', 'administrativo'];

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

  // Filtrar áreas por búsqueda
  const filteredAreas = AREAS_35.filter(area =>
    area.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Áreas de práctica <span className="text-red-500">*</span>
                </label>
                {selectedAreas.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedAreas.length} seleccionada{selectedAreas.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Selecciona las áreas de tu interés. Haz clic para seleccionar/deseleccionar.
              </p>

              {/* Búsqueda */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar área..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition text-sm text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid de chips */}
              <div className="max-h-[400px] overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredAreas.map(area => {
                    const isSelected = selectedAreas.includes(area.codigo);
                    const isPopular = areasPopulares.includes(area.codigo);
                    
                    return (
                      <button
                        key={area.codigo}
                        type="button"
                        onClick={() => handleAreaToggle(area.codigo)}
                        className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]'
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        {isPopular && !searchQuery && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full shadow-sm">
                            Popular
                          </span>
                        )}
                        <span className="text-xl flex-shrink-0">{area.emoji}</span>
                        <span className={`text-sm font-medium flex-1 ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}>
                          {area.nombre}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {filteredAreas.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">No se encontraron áreas con "{searchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Áreas seleccionadas (resumen) */}
              {selectedAreas.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">
                    Recibirás alertas de:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAreas.map(codigo => {
                      const area = AREAS_35.find(a => a.codigo === codigo);
                      if (!area) return null;
                      return (
                        <span
                          key={codigo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-slate-700 border border-blue-200"
                        >
                          <span>{area.emoji}</span>
                          <span>{area.nombre}</span>
                          <button
                            type="button"
                            onClick={() => handleAreaToggle(codigo)}
                            className="ml-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || selectedAreas.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Comenzar prueba gratis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500">
              Al continuar, aceptas recibir alertas del DOF en tu correo. Puedes cancelar en cualquier momento.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

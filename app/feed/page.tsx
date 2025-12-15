'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DocumentCard, DocumentCardSkeleton } from '@/components/DocumentCardWithImageOverlay';
import { AREAS_35 } from '@/lib/areas';
import { Newspaper, Search, Filter, Bookmark, Mail, X, Check } from 'lucide-react';

// Forzar renderizado dinámico (no SSG)
export const dynamic = 'force-dynamic';

interface Documento {
  id: string;
  titulo: string;
  resumen_ia: string;
  areas_detectadas: string[];
  fecha_publicacion: string;
  tipo_documento: string;
  edicion: string;
  url_dof: string;
}

// Agrupar áreas por categoría para mejor UX
const AREA_GROUPS = [
  {
    name: 'Alta Demanda',
    areas: ['fiscal', 'corporativo', 'laboral', 'penal', 'civil', 'mercantil']
  },
  {
    name: 'Regulatorio',
    areas: ['administrativo', 'constitucional', 'bancario', 'ambiental', 'competencia', 'comercio-exterior']
  },
  {
    name: 'Sectores Específicos',
    areas: ['energia', 'salud', 'bursatil', 'seguros', 'telecomunicaciones', 'tecnologia']
  },
  {
    name: 'Otros',
    areas: ['inmobiliario', 'familia', 'propiedad-intelectual', 'procesal', 'notarial', 'agrario', 'consumidor', 'migratorio', 'electoral', 'transporte', 'maritimo', 'construccion', 'compliance', 'sucesorio', 'medios', 'ciberseguridad', 'internacional']
  }
];

export default function FeedPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedDocs, setSavedDocs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Cargar documentos
  const fetchDocumentos = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: reset ? '1' : page.toString(),
        limit: '10',
        ...(selectedAreas.length > 0 && { areas: selectedAreas.join(',') }),
        ...(searchQuery && { q: searchQuery }),
        ...(showSavedOnly && { saved: 'true' }),
      });

      const res = await fetch(`/api/feed?${params}`);
      const data = await res.json();
      
      if (reset) {
        setDocumentos(data.documentos);
        setPage(2);
      } else {
        setDocumentos(prev => [...prev, ...data.documentos]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedAreas, searchQuery, showSavedOnly, loading, hasMore]);

  // Infinite scroll con Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchDocumentos();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchDocumentos, hasMore, loading]);

  // Cargar inicial
  useEffect(() => {
    fetchDocumentos(true);
  }, [selectedAreas, searchQuery, showSavedOnly]);

  // Cargar guardados del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedDocs');
    if (saved) {
      setSavedDocs(new Set(JSON.parse(saved)));
    }
  }, []);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showFilters]);

  // Ocultar/mostrar header al hacer scroll (estilo Instagram)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Solo ocultar si scrolleamos más de 100px
      if (currentScrollY < 100) {
        setShowHeader(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // Scroll hacia abajo: ocultar header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      // Scroll hacia arriba: mostrar header
      else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Guardar/desguardar documento
  const handleSave = (id: string) => {
    const newSaved = new Set(savedDocs);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedDocs(newSaved);
    localStorage.setItem('savedDocs', JSON.stringify(Array.from(newSaved)));
  };

  // Compartir documento
  const handleShare = async (id: string) => {
    const doc = documentos.find(d => d.id === id);
    if (!doc) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.titulo,
          text: doc.resumen_ia,
          url: doc.url_dof,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al clipboard
      navigator.clipboard.writeText(doc.url_dof);
      alert('Link copiado al portapapeles');
    }
  };

  // Toggle área
  const toggleArea = (codigo: string) => {
    setSelectedAreas(prev => 
      prev.includes(codigo) 
        ? prev.filter(a => a !== codigo)
        : [...prev, codigo]
    );
  };

  // Filtrar áreas por búsqueda
  const filteredAreas = AREAS_35.filter(area => 
    area.nombre.toLowerCase().includes(filterSearch.toLowerCase()) ||
    area.codigo.toLowerCase().includes(filterSearch.toLowerCase())
  );

  // Agrupar áreas filtradas
  const groupedFilteredAreas = AREA_GROUPS.map(group => ({
    ...group,
    areas: group.areas
      .map(codigo => AREAS_35.find(a => a.codigo === codigo))
      .filter(area => area && filteredAreas.includes(area))
  })).filter(group => group.areas.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50">
      {/* Header fijo con animación de ocultar/mostrar */}
      <header 
        ref={headerRef}
        className={`sticky z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-200/50 transition-transform duration-300 ease-in-out ${
          showHeader ? 'top-0 translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Logo y título */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="font-serif text-2xl font-bold text-gray-900">DOF Feed</h1>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Monitoreo Legal</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                showSavedOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={showSavedOnly ? 'Ver todos los documentos' : 'Ver solo documentos guardados'}
            >
              <Bookmark className="w-4 h-4" />
              {showSavedOnly ? `Guardados (${savedDocs.size})` : 'Ver guardados'}
            </button>
          </div>

          {/* Barra de búsqueda con feedback */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback de búsqueda activa */}
          {searchQuery && (
            <div className="mb-3 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
              Mostrando resultados para: <span className="font-semibold">&quot;{searchQuery}&quot;</span>
            </div>
          )}

          {/* Botón de filtros con indicador mejorado */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedAreas.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros {selectedAreas.length > 0 && `(${selectedAreas.length})`}
          </button>
        </div>
      </header>

      {/* Modal de filtros mejorado */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilters(false);
            }
          }}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filtrar por Áreas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAreas.length === 0 
                    ? 'Selecciona las áreas de tu interés'
                    : `${selectedAreas.length} área${selectedAreas.length !== 1 ? 's' : ''} seleccionada${selectedAreas.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Búsqueda de áreas */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar área..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6">
              {groupedFilteredAreas.map((group, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                    {group.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.areas.map(area => area && (
                      <button
                        key={area.codigo}
                        onClick={() => toggleArea(area.codigo)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedAreas.includes(area.codigo)
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {selectedAreas.includes(area.codigo) && (
                          <Check className="w-4 h-4" />
                        )}
                        <span>{area.emoji}</span>
                        <span>{area.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {filteredAreas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No se encontraron áreas</p>
                  <button
                    onClick={() => setFilterSearch('')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedAreas([])}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                disabled={selectedAreas.length === 0}
              >
                Limpiar todo
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner CTA más compacto */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b border-blue-700">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">¿Te gusta lo que ves?</p>
                  <p className="text-xs text-blue-100 truncate">Recibe alertas por email • 7 días gratis</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="/onboarding"
                  className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition text-sm whitespace-nowrap"
                >
                  Suscribirse
                </a>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  aria-label="Cerrar"
                  title="Cerrar banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed de documentos */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Contador mejorado */}
        {!loading && documentos.length > 0 && (
          <div className="mb-5 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            Mostrando <span className="font-semibold">{documentos.length}</span> documento{documentos.length !== 1 ? 's' : ''}
            {selectedAreas.length > 0 && (
              <> en <span className="font-semibold">{selectedAreas.length}</span> área{selectedAreas.length !== 1 ? 's' : ''}</>
            )}
            {searchQuery && (
              <> para <span className="font-semibold">&quot;{searchQuery}&quot;</span></>
            )}
          </div>
        )}

        {/* Lista de documentos */}
        <div className="space-y-0">
          {documentos.map(doc => (
            <DocumentCard
              key={doc.id}
              documento={doc}
              onSave={handleSave}
              onShare={handleShare}
              isSaved={savedDocs.has(doc.id)}
            />
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>
        )}

        {/* Observer target para infinite scroll */}
        <div ref={observerTarget} className="h-10" />

        {/* Indicador de carga */}
        {loading && hasMore && documentos.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Cargando más documentos...
            </div>
          </div>
        )}

        {/* Mensaje de fin */}
        {!loading && !hasMore && documentos.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Has llegado al final</p>
            <p className="text-xs mt-1">No hay más documentos para mostrar</p>
          </div>
        )}

        {/* Mensaje de sin resultados mejorado */}
        {!loading && documentos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No hay resultados para "${searchQuery}". Intenta con otros términos.`
                : selectedAreas.length > 0
                ? 'No hay documentos para las áreas seleccionadas. Intenta con otras áreas.'
                : showSavedOnly
                ? 'No has guardado ningún documento aún. Explora el feed y guarda los que te interesen.'
                : 'No hay documentos disponibles en este momento.'}
            </p>
            {(searchQuery || selectedAreas.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAreas([]);
                  setShowSavedOnly(false);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

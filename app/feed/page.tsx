'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DocumentCard, DocumentCardSkeleton } from '@/components/DocumentCard';
import { AREAS_ARRAY } from '@/lib/areas';
import { Newspaper, Search, Filter, Bookmark, Mail, X } from 'lucide-react';

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
  
  const observerTarget = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50">
      {/* Header fijo */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-200/50">
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
            >
              <Bookmark className="w-4 h-4" />
              {showSavedOnly ? 'Guardados' : 'Ver guardados'}
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-none focus:border-blue-600 focus:outline-none text-sm"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros {selectedAreas.length > 0 && `(${selectedAreas.length})`}
          </button>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-none">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Áreas de Práctica</h3>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {AREAS_ARRAY.map(area => (
                  <button
                    key={area.codigo}
                    onClick={() => toggleArea(area.codigo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedAreas.includes(area.codigo)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {area.emoji} {area.nombre}
                  </button>
                ))}
              </div>
              {selectedAreas.length > 0 && (
                <button
                  onClick={() => setSelectedAreas([])}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Banner CTA */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Mail className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-base">¿Te gusta lo que ves?</p>
                  <p className="text-xs md:text-sm text-blue-100">Recibe estas alertas por email 2 veces al día • 7 días gratis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
        {/* Contador */}
        {!loading && documentos.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
            {selectedAreas.length > 0 && ` en ${selectedAreas.length} área${selectedAreas.length !== 1 ? 's' : ''}`}
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

        {/* Mensaje de fin */}
        {!loading && !hasMore && documentos.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Has llegado al final</p>
            <p className="text-xs mt-1">No hay más documentos para mostrar</p>
          </div>
        )}

        {/* Mensaje de sin resultados */}
        {!loading && documentos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : selectedAreas.length > 0
                ? 'No hay documentos para las áreas seleccionadas'
                : showSavedOnly
                ? 'No has guardado ningún documento aún'
                : 'No hay documentos disponibles'}
            </p>
            {(searchQuery || selectedAreas.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedAreas([]);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-none font-medium hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

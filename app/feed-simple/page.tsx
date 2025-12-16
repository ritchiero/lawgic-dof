'use client';

import { useState, useEffect } from 'react';
import { DocumentCard, DocumentCardSkeleton } from '@/components/DocumentCardWithImageOverlay';

interface Documento {
  id: string;
  titulo: string;
  resumen_ia: string;
  areas_detectadas: string[];
  fecha_publicacion: string;
  tipo_documento: string;
  edicion: string;
  url_dof: string;
  image_url?: string;
  social_headline?: string;
  social_tagline?: string;
  social_impact_data?: string;
}

export default function FeedSimplePage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        console.log('[FeedSimple] Loading documents...');
        const res = await fetch('/api/feed?limit=20');
        const data = await res.json();
        
        console.log('[FeedSimple] Loaded:', data.documentos?.length, 'documents');
        setDocumentos(data.documentos || []);
      } catch (err) {
        console.error('[FeedSimple] Error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadDocs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="font-serif text-2xl font-bold text-gray-900">DOF Feed (Simple)</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Monitoreo Legal</p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Counter */}
        {!loading && documentos.length > 0 && (
          <div className="mb-5 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            Mostrando <span className="font-semibold">{documentos.length}</span> documentos
          </div>
        )}

        {/* Documents list */}
        <div className="space-y-0">
          {documentos.map(doc => (
            <DocumentCard
              key={doc.id}
              documento={doc}
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

        {/* No results */}
        {!loading && documentos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600">
              No hay documentos disponibles en este momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

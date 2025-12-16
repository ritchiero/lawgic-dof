'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TestFeedPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      try {
        console.log('Fetching documents...');
        const res = await fetch('/api/feed?limit=20');
        const data = await res.json();
        
        console.log('API Response:', data);
        console.log('Documentos:', data.documentos);
        console.log('Total:', data.documentos?.length);
        
        setDocumentos(data.documentos || []);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    
    loadDocs();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Feed - {documentos.length} documentos</h1>
      
      <div className="space-y-4">
        {documentos.map((doc, idx) => (
          <div key={doc.id} className="border p-4 rounded">
            <div className="font-bold mb-2">
              {idx + 1}. {doc.titulo?.substring(0, 100)}
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              ID: {doc.id}
            </div>
            
            {doc.image_url ? (
              <div className="mt-2">
                <div className="text-sm text-green-600 mb-1">
                  ✓ Tiene image_url: {doc.image_url}
                </div>
                <div className="relative w-full h-64 bg-gray-100 rounded">
                  <Image
                    src={doc.image_url}
                    alt={doc.titulo}
                    fill
                    className="object-cover rounded"
                    onError={() => console.error('Error loading image:', doc.image_url)}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                ✗ No tiene image_url
              </div>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
              Campos: {Object.keys(doc).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

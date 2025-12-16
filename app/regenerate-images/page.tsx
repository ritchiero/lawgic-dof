'use client';

import { useState } from 'react';

interface RegenerateResult {
  documentId: string;
  titulo: string;
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export default function RegenerateImagesPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RegenerateResult[]>([]);
  const [currentDoc, setCurrentDoc] = useState(0);
  const [totalDocs, setTotalDocs] = useState(20);

  const regenerateImages = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentDoc(0);

    try {
      // Obtener IDs de los 20 documentos más recientes
      const response = await fetch('/api/feed?limit=20');
      const data = await response.json();
      
      if (!data.success || !data.documentos) {
        throw new Error('No se pudieron obtener los documentos');
      }

      const documentos = data.documentos;
      setTotalDocs(documentos.length);

      // Regenerar cada imagen una por una
      for (let i = 0; i < documentos.length; i++) {
        const doc = documentos[i];
        setCurrentDoc(i + 1);

        try {
          console.log(`Regenerando ${i + 1}/${documentos.length}: ${doc.titulo}`);

          const regenerateResponse = await fetch('/api/regenerate-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: doc.id }),
          });

          const result = await regenerateResponse.json();

          setResults(prev => [...prev, {
            documentId: doc.id,
            titulo: doc.titulo,
            success: result.success,
            imageUrl: result.imageUrl,
            error: result.error,
          }]);

        } catch (error) {
          console.error(`Error con documento ${doc.id}:`, error);
          setResults(prev => [...prev, {
            documentId: doc.id,
            titulo: doc.titulo,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          }]);
        }

        // Pequeña pausa entre documentos
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Regenerar Imágenes con Sistema Inteligente</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Este proceso regenerará las imágenes de los 20 documentos más recientes usando el nuevo sistema de análisis semántico inteligente.
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Tiempo estimado:</strong> ~12-15 minutos (30-40 segundos por imagen)
          </p>

          <button
            onClick={regenerateImages}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? 'Regenerando...' : 'Iniciar Regeneración'}
          </button>
        </div>

        {isRunning && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Progreso</h2>
              <span className="text-lg font-mono">
                {currentDoc}/{totalDocs}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(currentDoc / totalDocs) * 100}%` }}
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Resultados</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ {successCount}</span>
                <span className="text-red-600">✗ {errorCount}</span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={result.documentId}
                  className={`p-3 rounded border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-mono text-gray-500 mr-2">
                        {index + 1}.
                      </span>
                      <span className="text-sm">
                        {result.titulo.substring(0, 80)}...
                      </span>
                    </div>
                    <span className="text-lg ml-2">
                      {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1 ml-6">
                      {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

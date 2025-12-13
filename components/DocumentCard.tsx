'use client';

import { useState } from 'react';
import { DocumentoDOF } from '@/lib/types';
import { AREAS_ARRAY } from '@/lib/areas';

interface DocumentCardProps {
  documento: any;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
}

export function DocumentCard({ documento, onSave, onShare, isSaved = false }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(documento.id);
  };

  const handleShare = () => {
    onShare?.(documento.id);
  };

  // Obtener información de áreas
  const areasInfo = documento.areas_detectadas?.map((codigo: string) => {
    const area = AREAS_ARRAY.find(a => a.codigo === codigo);
    return area || { codigo, nombre: codigo, emoji: '📄' };
  }) || [];

  // Calcular tiempo de lectura (aproximado)
  const palabras = documento.resumen_ia?.split(' ').length || 0;
  const minutos = Math.max(1, Math.ceil(palabras / 200));

  return (
    <article className="backdrop-blur-sm bg-white/80 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/50">
      {/* Header con áreas y fecha */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          {areasInfo.slice(0, 2).map((area: any, idx: number) => (
            <span 
              key={idx}
              className="inline-block text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
            >
              {area.emoji} {area.nombre}
            </span>
          ))}
          {areasInfo.length > 2 && (
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              +{areasInfo.length - 2} más
            </span>
          )}
        </div>
        <div className="flex flex-col items-end text-xs text-gray-500">
          <span>{documento.fecha_publicacion || 'Fecha no disponible'}</span>
          <span className="text-gray-400">{documento.edicion || 'Matutina'}</span>
        </div>
      </div>

      {/* Título clickeable */}
      <h3 
        className="font-serif font-bold text-xl mb-3 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
        onClick={() => setExpanded(!expanded)}
      >
        {documento.titulo}
      </h3>

      {/* Resumen (colapsable) */}
      <p className={`text-gray-700 mb-4 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
        {documento.resumen_ia || 'Resumen no disponible'}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {minutos} min de lectura
        </span>
        <span>•</span>
        <span>{documento.tipo_documento || 'Documento'}</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          {expanded ? '↑ Ver menos' : '↓ Leer más'}
        </button>

        <button
          onClick={handleSave}
          className={`text-sm transition-colors font-medium ${
            saved 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          {saved ? '❤️ Guardado' : '🤍 Guardar'}
        </button>

        <button
          onClick={handleShare}
          className="text-sm text-gray-600 hover:text-green-600 transition-colors font-medium"
        >
          📤 Compartir
        </button>

        <a 
          href={documento.url_dof}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-auto transition-colors"
        >
          Ver en DOF →
        </a>
      </div>
    </article>
  );
}

// Variante compacta para vista de lista
export function DocumentCardCompact({ documento, onSave, isSaved = false }: DocumentCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(documento.id);
  };

  const areasInfo = documento.areas_detectadas?.map((codigo: string) => {
    const area = AREAS_ARRAY.find(a => a.codigo === codigo);
    return area || { codigo, nombre: codigo, emoji: '📄' };
  }) || [];

  return (
    <article className="backdrop-blur-sm bg-white/80 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/50">
      <div className="flex items-start gap-3">
        {/* Icono de área principal */}
        <div className="text-2xl flex-shrink-0">
          {areasInfo[0]?.emoji || '📄'}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{documento.fecha_publicacion}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-blue-600 font-medium">{areasInfo[0]?.nombre}</span>
          </div>
          
          <h4 className="font-serif font-semibold text-base mb-2 line-clamp-2 leading-tight">
            {documento.titulo}
          </h4>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {documento.resumen_ia}
          </p>

          <div className="flex items-center gap-3 text-xs">
            <a 
              href={documento.url_dof}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver más →
            </a>
            <button
              onClick={handleSave}
              className={`${saved ? 'text-red-600' : 'text-gray-400'} hover:text-red-600`}
            >
              {saved ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Skeleton loader para cuando se están cargando documentos
export function DocumentCardSkeleton() {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-none p-6 mb-4 bg-white animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
      
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

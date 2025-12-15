'use client';

import { useState } from 'react';
import { DocumentoDOF } from '@/lib/types';
import { AREAS_ARRAY } from '@/lib/areas';
import { Heart, Share2, ExternalLink, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface DocumentCardProps {
  documento: any;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
}

// Mapa de colores por categoría
const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  fiscal: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  corporativo: { border: 'border-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  laboral: { border: 'border-orange-600', bg: 'bg-orange-50', text: 'text-orange-700' },
  penal: { border: 'border-red-600', bg: 'bg-red-50', text: 'text-red-700' },
  civil: { border: 'border-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  mercantil: { border: 'border-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  administrativo: { border: 'border-slate-600', bg: 'bg-slate-50', text: 'text-slate-700' },
  constitucional: { border: 'border-rose-600', bg: 'bg-rose-50', text: 'text-rose-700' },
  bancario: { border: 'border-sky-600', bg: 'bg-sky-50', text: 'text-sky-700' },
  ambiental: { border: 'border-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  default: { border: 'border-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' },
};

export function DocumentCard({ documento, onSave, onShare, isSaved = false }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSave = () => {
    setSaved(!saved);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
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

  // Obtener color de la categoría principal
  const primaryArea = areasInfo[0];
  const categoryColors = CATEGORY_COLORS[primaryArea?.codigo] || CATEGORY_COLORS.default;

  // Calcular tiempo de lectura
  const palabras = documento.resumen_ia?.split(' ').length || 0;
  const minutos = Math.max(1, Math.ceil(palabras / 200));

  // Determinar si es nuevo (publicado hoy)
  const today = new Date().toISOString().split('T')[0];
  const isNew = documento.fecha_publicacion === today;

  // Determinar si es importante (decreto o ley)
  const isImportant = ['Decreto', 'Ley', 'Reforma'].some(tipo => 
    documento.tipo_documento?.includes(tipo) || documento.titulo?.includes(tipo)
  );

  // Simular número de guardados (en producción vendría del backend)
  const savedCount = Math.floor(Math.random() * 50) + 5;

  // Verificar si tiene imagen
  const hasImage = documento.image_url && !imageError;

  return (
    <article 
      className={`
        relative bg-white rounded-2xl shadow-sm hover:shadow-xl 
        transition-all duration-300 ease-out
        border-l-[6px] ${categoryColors.border}
        overflow-hidden
        group
        mb-5
      `}
    >
      {/* Badges de nuevo/importante */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {isNew && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Sparkles className="w-3 h-3" />
            NUEVO
          </span>
        )}
        {isImportant && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
            ⚡ IMPORTANTE
          </span>
        )}
      </div>

      {/* Imagen Hero (si existe) */}
      {hasImage && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={documento.image_url}
            alt={documento.titulo}
            width={1024}
            height={1024}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            priority={false}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="p-8">
        {/* Header: Categoría y fecha */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {areasInfo.slice(0, 2).map((area: any, idx: number) => (
              <span 
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${categoryColors.bg} ${categoryColors.text}`}
              >
                <span className="text-base">{area.emoji}</span>
                {area.nombre}
              </span>
            ))}
            {areasInfo.length > 2 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                +{areasInfo.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Fecha y edición */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span className="font-medium">{documento.fecha_publicacion || 'Fecha no disponible'}</span>
          <span>•</span>
          <span className="capitalize">{documento.edicion || 'Matutina'}</span>
        </div>

        {/* Título - más grande y bold */}
        <h3 
          className="font-serif font-bold text-[22px] leading-tight mb-4 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {documento.titulo}
        </h3>

        {/* Resumen - mejorado */}
        <p className={`text-[15px] leading-relaxed text-gray-600 mb-6 ${expanded ? '' : 'line-clamp-2'}`}>
          {documento.resumen_ia || 'Resumen no disponible'}
        </p>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-6"></div>

        {/* Acciones - estilo redes sociales */}
        <div className="flex items-center justify-between">
          {/* Lado izquierdo: Interacciones */}
          <div className="flex items-center gap-6">
            {/* Botón de guardar con animación */}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 text-sm font-semibold transition-all hover:scale-110"
            >
              <Heart 
                className={`w-5 h-5 transition-all ${
                  saved 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                } ${isAnimating ? 'animate-bounce' : ''}`}
              />
              <span className={saved ? 'text-red-500' : 'text-gray-600'}>
                {savedCount + (saved ? 1 : 0)}
              </span>
            </button>

            {/* Botón de compartir */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir</span>
            </button>

            {/* Tiempo de lectura */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{minutos} min</span>
            </div>
          </div>

          {/* Lado derecho: Ver documento */}
          <a 
            href={documento.url_dof}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            Ver documento
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Botón de expandir/colapsar */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Leer más →
          </button>
        )}
      </div>

      {/* Efecto de hover: gradiente sutil */}
      <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors.bg} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
    </article>
  );
}

// Skeleton loader mejorado con shimmer effect
export function DocumentCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm border-l-[6px] border-gray-300 overflow-hidden mb-5 animate-pulse">
      {/* Skeleton de imagen */}
      <div className="w-full aspect-square bg-gray-200"></div>
      
      <div className="p-8">
        {/* Categorías */}
        <div className="flex gap-2 mb-4">
          <div className="h-7 w-32 bg-gray-200 rounded-full"></div>
          <div className="h-7 w-24 bg-gray-200 rounded-full"></div>
        </div>

        {/* Fecha */}
        <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>

        {/* Título */}
        <div className="space-y-2 mb-4">
          <div className="h-6 w-full bg-gray-200 rounded"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Resumen */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-6"></div>

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
}

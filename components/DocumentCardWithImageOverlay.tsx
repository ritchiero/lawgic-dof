'use client';

import { useState } from 'react';
import { AREAS_ARRAY } from '@/lib/areas';
import { Bookmark, Share2, ExternalLink, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface DocumentCardProps {
  documento: any;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
}

// Mapa de imágenes de fondo por categoría (DESHABILITADO - solo usar imágenes generadas con IA)
const CATEGORY_IMAGES: Record<string, string> = {
  // Todas las imágenes de fallback han sido removidas
  // Solo se mostrarán imágenes generadas con el sistema inteligente
};

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
  
  // Solo usar imagen generada con IA (sin fallback)
  const categoryImage = documento.image_url;
  const hasAIImage = !!documento.image_url;

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

  // Nota: Eliminamos contadores falsos de likes/vistas por no ser relevantes en un feed legal profesional

  // Extraer palabras clave del título (máximo 3 palabras)
  const extractKeywords = (titulo: string): string => {
    const stopWords = [
      'el', 'la', 'los', 'las', 'de', 'del', 'al', 'a', 'en', 'por', 'para', 
      'con', 'que', 'se', 'su', 'sus', 'un', 'una', 'unos', 'unas',
      'mediante', 'relativo', 'relativa', 'acuerdo', 'decreto', 'ley',
      'reglamento', 'circular', 'resolución', 'aviso', 'fe', 'erratas'
    ];

    const words = titulo
      .toLowerCase()
      .replace(/[^\w\sáéíóúñ]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    return words.slice(0, 3).join(' ').toUpperCase();
  };

  const keywords = extractKeywords(documento.titulo);

  return (
    <article 
      className={`
        relative bg-white rounded-2xl shadow-sm hover:shadow-xl 
        transition-all duration-300 ease-out
        overflow-hidden
        group
        mb-5
      `}
    >
      {/* Imagen de fondo con overlay de texto */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {/* Imagen de fondo */}
        {categoryImage && !imageError && (
          <Image
            src={categoryImage}
            alt={documento.social_headline || primaryArea?.nombre || 'Documento'}
            width={1024}
            height={1024}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            priority={false}
          />
        )}

        {/* Placeholder cuando no hay imagen */}
        {(!categoryImage || imageError) && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📝</div>
              <div className="text-sm">Generando imagen...</div>
            </div>
          </div>
        )}

        {/* Las imágenes de IA ya tienen texto integrado, no necesitan overlay CSS */}

        {/* Overlay semi-transparente para mejorar contraste (solo para imágenes estáticas) */}
        {!hasAIImage && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>
            
            {/* Text Overlay (solo para imágenes estáticas) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {/* Emoji más pequeño */}
          <div className="text-5xl mb-2 drop-shadow-lg filter brightness-110">
            {primaryArea?.emoji || '📄'}
          </div>

          {/* Palabras clave con mejor contraste */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] leading-tight max-w-[85%]">
            {keywords}
          </h3>

          {/* Categoría */}
          <p className="text-base text-gray-800 mb-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] font-semibold">
            {primaryArea?.nombre || 'General'}
          </p>

          {/* Separador decorativo */}
          <div className="w-20 h-0.5 bg-gray-400 mb-2 shadow-sm"></div>

          {/* Metadata */}
          <p className="text-sm text-gray-700 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] font-medium">
            {new Date(documento.fecha_publicacion).toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: 'short' 
            }).toUpperCase()} • {documento.tipo_documento || 'Documento'}
          </p>
            </div>
          </>
        )}

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
      </div>

      {/* Contenido inferior */}
      <div className="p-5">
        {/* Título completo - mostrar 3 líneas antes de cortar */}
        <h4 
          className="font-serif font-bold text-base leading-tight mb-3 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-3"
          onClick={() => setExpanded(!expanded)}
          title={documento.social_headline || documento.titulo}
        >
          {documento.social_headline || documento.titulo}
        </h4>

        {/* Resumen */}
        <p className={`text-sm leading-relaxed text-gray-600 mb-4 ${expanded ? '' : 'line-clamp-2'}`}>
          {documento.resumen_ia || 'Resumen no disponible'}
        </p>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-4"></div>

        {/* Acciones - estilo redes sociales */}
        <div className="flex items-center justify-between">
          {/* Lado izquierdo: Interacciones con contexto */}
          <div className="flex items-center gap-5">
            {/* Botón de guardar con animación */}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:scale-105 group/save"
              title={saved ? 'Quitar de guardados' : 'Guardar documento'}
            >
              <Bookmark 
                className={`w-5 h-5 transition-all ${
                  saved 
                    ? 'fill-blue-600 text-blue-600' 
                    : 'text-gray-400 group-hover/save:text-blue-600'
                } ${isAnimating ? 'animate-bounce' : ''}`}
              />
            </button>

            {/* Botón de compartir con tooltip */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all hover:scale-105"
              title="Compartir documento"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Tiempo de lectura */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500" title="Tiempo de lectura estimado">
              <Clock className="w-4 h-4" />
              <span>{minutos} min</span>
            </div>
          </div>

          {/* Lado derecho: Ver documento */}
          <a 
            href={documento.url_dof}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all hover:scale-105 shadow-md hover:shadow-lg"
            title="Abrir documento en el DOF"
          >
            Ver
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Botón de expandir solo si no está expandido */}
        {!expanded && documento.resumen_ia && documento.resumen_ia.split(' ').length > 30 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Leer más →
          </button>
        )}
      </div>
    </article>
  );
}

// Skeleton loader
export function DocumentCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden mb-5 animate-pulse">
      {/* Skeleton de imagen con overlay */}
      <div className="w-full aspect-[4/3] bg-gray-200 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-6 w-56 bg-gray-300 rounded mb-3"></div>
          <div className="h-5 w-40 bg-gray-300 rounded mb-3"></div>
          <div className="w-20 h-0.5 bg-gray-300 mb-3"></div>
          <div className="h-4 w-36 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      <div className="p-5">
        {/* Título */}
        <div className="space-y-2 mb-3">
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Resumen */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-4"></div>

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
}

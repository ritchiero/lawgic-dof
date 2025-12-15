'use client';

import { useState } from 'react';
import { AREAS_ARRAY } from '@/lib/areas';
import { Heart, Share2, ExternalLink, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface DocumentCardProps {
  documento: any;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  isSaved?: boolean;
}

// Mapa de imágenes de fondo por categoría
const CATEGORY_IMAGES: Record<string, string> = {
  fiscal: '/images/categories/fiscal.png',
  corporativo: '/images/categories/corporativo.png',
  laboral: '/images/categories/laboral.png',
  penal: '/images/categories/penal.png',
  civil: '/images/categories/civil.png',
  mercantil: '/images/categories/corporativo.png', // Reusar corporativo
  administrativo: '/images/categories/administrativo.png',
  constitucional: '/images/categories/constitucional.png',
  bancario: '/images/categories/fiscal.png', // Reusar fiscal
  ambiental: '/images/categories/ambiental.png',
  default: '/images/categories/administrativo.png',
};

// Mapa de colores por categoría (para badges y acentos)
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
  
  // Obtener imagen de fondo de la categoría
  const categoryImage = CATEGORY_IMAGES[primaryArea?.codigo] || CATEGORY_IMAGES.default;

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
        mb-3
      `}
    >
      {/* Imagen de fondo con overlay de texto */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {/* Imagen de fondo */}
        {!imageError && (
          <Image
            src={categoryImage}
            alt={primaryArea?.nombre || 'Documento'}
            width={1024}
            height={1024}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            priority={false}
          />
        )}

        {/* Fallback si la imagen falla */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
        )}

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {/* Emoji grande */}
          <div className="text-[72px] mb-3 drop-shadow-lg">
            {primaryArea?.emoji || '📄'}
          </div>

          {/* Palabras clave */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 drop-shadow-md leading-tight max-w-[80%]">
            {keywords}
          </h3>

          {/* Categoría */}
          <p className="text-base text-gray-700 mb-2 drop-shadow-sm font-medium">
            {primaryArea?.nombre || 'General'}
          </p>

          {/* Separador decorativo */}
          <div className="w-20 h-0.5 bg-gray-300 mb-2"></div>

          {/* Metadata */}
          <p className="text-sm text-gray-600 drop-shadow-sm">
            {new Date(documento.fecha_publicacion).toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: 'short' 
            }).toUpperCase()} • {documento.tipo_documento || 'Documento'}
          </p>
        </div>

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

      {/* Contenido inferior (título completo, resumen, acciones) */}
      <div className="p-4">
        {/* Título completo */}
        <h4 
          className="font-serif font-bold text-base leading-tight mb-2 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
          onClick={() => setExpanded(!expanded)}
        >
          {documento.titulo}
        </h4>

        {/* Resumen */}
        <p className={`text-xs leading-relaxed text-gray-600 mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
          {documento.resumen_ia || 'Resumen no disponible'}
        </p>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-3"></div>

        {/* Acciones - estilo redes sociales */}
        <div className="flex items-center justify-between">
          {/* Lado izquierdo: Interacciones */}
          <div className="flex items-center gap-4">
            {/* Botón de guardar con animación */}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:scale-110"
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
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
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
            Ver
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Botón de expandir/colapsar */}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold"
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
      <div className="w-full aspect-square bg-gray-200 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="w-32 h-32 bg-gray-300 rounded-full mb-6"></div>
          <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
          <div className="w-32 h-0.5 bg-gray-300 mb-4"></div>
          <div className="h-4 w-40 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Título */}
        <div className="space-y-2 mb-3">
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Resumen */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-100 mb-3"></div>

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
}

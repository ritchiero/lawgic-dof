/**
 * Script para scrapear todos los documentos del DOF de diciembre 2025
 * y guardarlos en Firestore con clasificación de IA
 * 
 * Uso:
 * 1. Configurar variables de entorno (.env.local)
 * 2. Ejecutar: pnpm tsx scripts/scrape-diciembre-2025.ts
 */

import 'dotenv/config';
import { db, collections } from '../lib/firebase';
import { obtenerDocumentosDOF, obtenerExtracto } from '../lib/services/scraper';
import { clasificarDocumento } from '../lib/services/clasificador';
import { FieldValue } from 'firebase-admin/firestore';

interface Stats {
  totalDias: number;
  totalDocumentos: number;
  documentosClasificados: number;
  documentosGuardados: number;
  errores: number;
  porArea: Record<string, number>;
}

async function scrapeHistorico() {
  console.log('='.repeat(60));
  console.log('SCRAPING HISTÓRICO - DICIEMBRE 2025');
  console.log('='.repeat(60));
  console.log();

  const stats: Stats = {
    totalDias: 0,
    totalDocumentos: 0,
    documentosClasificados: 0,
    documentosGuardados: 0,
    errores: 0,
    porArea: {}
  };

  // Scrapear del 1 al 14 de diciembre 2025
  const añoMes = { año: 2025, mes: 12 };
  const diasAScrapear = Array.from({ length: 14 }, (_, i) => i + 1);

  for (const dia of diasAScrapear) {
    stats.totalDias++;
    const fecha = new Date(añoMes.año, añoMes.mes - 1, dia);
    const fechaStr = fecha.toISOString().split('T')[0];
    
    console.log(`\n📅 Procesando: ${fechaStr} (${fecha.toLocaleDateString('es-MX', { weekday: 'long' })})`);
    console.log('-'.repeat(60));

    try {
      // Obtener documentos del día
      const documentos = await obtenerDocumentosDOF(fecha);
      
      if (documentos.length === 0) {
        console.log('   ⚠️  No hay documentos publicados este día');
        continue;
      }

      console.log(`   ✓ Encontrados ${documentos.length} documentos`);
      stats.totalDocumentos += documentos.length;

      // Procesar cada documento
      for (let i = 0; i < documentos.length; i++) {
        const doc = documentos[i];
        const docNum = `${i + 1}/${documentos.length}`;
        
        try {
          // Verificar si ya existe en Firestore
          const existenteQuery = await db
            .collection(collections.documentosDof)
            .where('url_dof', '==', doc.url_dof)
            .limit(1)
            .get();

          if (!existenteQuery.empty) {
            console.log(`   [${docNum}] ⏭️  Ya existe: ${doc.titulo.substring(0, 50)}...`);
            continue;
          }

          // Obtener extracto
          console.log(`   [${docNum}] 📄 Obteniendo extracto...`);
          const extracto = await obtenerExtracto(doc.url_dof);

          if (!extracto || extracto.length < 50) {
            console.log(`   [${docNum}] ⚠️  Extracto muy corto, omitiendo`);
            stats.errores++;
            continue;
          }

          // Clasificar con IA
          console.log(`   [${docNum}] 🤖 Clasificando con GPT-4o-mini...`);
          const clasificacion = await clasificarDocumento(doc.titulo, extracto);
          stats.documentosClasificados++;

          // Contar áreas
          clasificacion.areas.forEach(area => {
            stats.porArea[area] = (stats.porArea[area] || 0) + 1;
          });

          // Guardar en Firestore
          await db.collection(collections.documentosDof).add({
            fecha_publicacion: fechaStr,
            titulo: doc.titulo,
            tipo_documento: doc.tipo_documento,
            url_dof: doc.url_dof,
            contenido_extracto: extracto,
            edicion: doc.edicion,
            procesado: true,
            areas_clasificadas: clasificacion.areas,
            resumen_ia: clasificacion.resumen,
            created_at: FieldValue.serverTimestamp(),
          });

          stats.documentosGuardados++;
          
          console.log(`   [${docNum}] ✅ ${doc.titulo.substring(0, 50)}...`);
          console.log(`   [${docNum}]    Áreas: ${clasificacion.areas.join(', ') || 'ninguna'}`);
          console.log(`   [${docNum}]    Resumen: ${clasificacion.resumen.substring(0, 80)}...`);

          // Delay para no saturar las APIs
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`   [${docNum}] ❌ Error procesando documento:`, error);
          stats.errores++;
        }
      }

    } catch (error) {
      console.error(`   ❌ Error procesando día ${fechaStr}:`, error);
      stats.errores++;
    }
  }

  // Reporte final
  console.log();
  console.log('='.repeat(60));
  console.log('REPORTE FINAL');
  console.log('='.repeat(60));
  console.log();
  console.log(`📊 Estadísticas:`);
  console.log(`   • Días procesados: ${stats.totalDias}`);
  console.log(`   • Documentos encontrados: ${stats.totalDocumentos}`);
  console.log(`   • Documentos clasificados: ${stats.documentosClasificados}`);
  console.log(`   • Documentos guardados: ${stats.documentosGuardados}`);
  console.log(`   • Errores: ${stats.errores}`);
  console.log();
  console.log(`📈 Documentos por área:`);
  
  const areasOrdenadas = Object.entries(stats.porArea)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  areasOrdenadas.forEach(([area, count]) => {
    const barra = '█'.repeat(Math.ceil(count / 2));
    console.log(`   ${area.padEnd(25)} ${barra} ${count}`);
  });

  console.log();
  console.log('✅ Scraping histórico completado');
  console.log();
}

// Ejecutar
scrapeHistorico()
  .then(() => {
    console.log('Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

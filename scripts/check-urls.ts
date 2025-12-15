import { db, collections } from '../lib/firebase';

async function checkUrls() {
  console.log('=== Verificando URLs en Firestore ===\n');
  
  const docsSnapshot = await db
    .collection(collections.documentosDof)
    .limit(10)
    .get();
  
  console.log(`Total de documentos encontrados: ${docsSnapshot.size}\n`);
  
  docsSnapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    console.log(`--- Documento ${index + 1} ---`);
    console.log(`ID: ${doc.id}`);
    console.log(`Título: ${data.titulo?.substring(0, 60)}...`);
    console.log(`URL: ${data.url_dof || 'VACÍO ❌'}`);
    console.log(`Procesado: ${data.procesado ? 'Sí' : 'No'}`);
    console.log(`Fecha: ${data.fecha_publicacion}`);
    console.log('');
  });
  
  // Contar documentos sin URL
  const sinUrlQuery = await db
    .collection(collections.documentosDof)
    .where('url_dof', '==', '')
    .get();
  
  console.log(`\n📊 Estadísticas:`);
  console.log(`Documentos SIN URL: ${sinUrlQuery.size}`);
  console.log(`Documentos CON URL: ${docsSnapshot.size - sinUrlQuery.size}`);
}

checkUrls()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

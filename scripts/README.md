# Scripts de Scraping - DOF Alertas

## Scraping Histórico de Diciembre 2025

Este script scrapeará todos los documentos del DOF publicados en diciembre 2025 (del 1 al 14), los clasificará con IA y los guardará en Firestore.

### Requisitos Previos

Necesitas configurar las siguientes credenciales en `.env.local`:

#### 1. Firebase Admin SDK

Ve a [Firebase Console](https://console.firebase.google.com/) > Tu proyecto `lawgic-dof`:

1. Click en ⚙️ **Project Settings**
2. Ve a la pestaña **Service Accounts**
3. Click en **"Generate New Private Key"**
4. Descarga el archivo JSON
5. Copia los valores al `.env.local`:
   ```
   FIREBASE_PROJECT_ID=lawgic-dof
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lawgic-dof.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
   ```

**Importante**: La `FIREBASE_PRIVATE_KEY` debe incluir las comillas y los `\n` para los saltos de línea.

#### 2. OpenAI API Key

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Cópiala al `.env.local`:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

### Ejecución

Una vez configuradas las credenciales:

```bash
# Desde la raíz del proyecto
pnpm tsx scripts/scrape-diciembre-2025.ts
```

### Qué Hace el Script

1. **Scraping**: Visita el DOF para cada día del 1 al 14 de diciembre 2025
2. **Extracción**: Obtiene el extracto completo de cada documento
3. **Clasificación**: Usa GPT-4o-mini para:
   - Identificar áreas del derecho aplicables
   - Generar un resumen ejecutivo
4. **Guardado**: Almacena en Firestore con la siguiente estructura:
   ```javascript
   {
     fecha_publicacion: "2025-12-01",
     titulo: "DECRETO por el que...",
     tipo_documento: "DECRETO",
     url_dof: "https://www.dof.gob.mx/...",
     contenido_extracto: "Texto completo...",
     edicion: "matutina",
     procesado: true,
     areas_clasificadas: ["fiscal", "laboral"],
     resumen_ia: "Este decreto modifica...",
     created_at: Timestamp
   }
   ```

### Tiempo Estimado

- **~10-20 documentos por día** en diciembre
- **~140-280 documentos totales** (14 días)
- **~1-2 segundos por documento** (scraping + clasificación)
- **Tiempo total**: 5-10 minutos

### Costos

**OpenAI GPT-4o-mini**:
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- Estimado por documento: ~500 tokens input + 100 tokens output
- **Costo total**: ~$0.02 USD para 200 documentos

**Firebase Firestore**:
- Escrituras: 200 documentos = 200 escrituras
- Plan gratuito: 20K escrituras/día
- **Costo**: $0 (dentro del plan gratuito)

### Reporte

El script genera un reporte en consola con:

```
📊 Estadísticas:
   • Días procesados: 14
   • Documentos encontrados: 187
   • Documentos clasificados: 187
   • Documentos guardados: 187
   • Errores: 0

📈 Documentos por área:
   fiscal                    ████████████████ 32
   laboral                   ████████████ 24
   administrativo            ██████████ 20
   salud                     ████████ 16
   ...
```

### Troubleshooting

**Error: "OpenAI API key not configured"**
- Verifica que `OPENAI_API_KEY` esté en `.env.local`
- Asegúrate de que la key empiece con `sk-`

**Error: "Firestore not initialized"**
- Verifica las 3 variables de Firebase en `.env.local`
- Asegúrate de que `FIREBASE_PRIVATE_KEY` incluya las comillas y `\n`

**Error: "Rate limit exceeded"**
- OpenAI tiene límites de rate (3 requests/min en tier gratuito)
- El script ya incluye un delay de 1 segundo entre documentos
- Si falla, espera 1 minuto y vuelve a ejecutar (continuará desde donde quedó)

**Documentos duplicados**
- El script verifica si un documento ya existe antes de guardarlo
- Puedes ejecutarlo múltiples veces sin problema

### Próximos Pasos

Después de ejecutar el scraping histórico:

1. **Verifica los datos** en Firebase Console > Firestore
2. **Prueba el feed** en `/feed` para ver los documentos
3. **Crea usuarios de prueba** para testear las alertas
4. **Ejecuta el job diario** manualmente: `GET /api/jobs/daily`

### Scripts Adicionales

Puedes crear más scripts para:

- `scrape-mes.ts`: Scrapear cualquier mes completo
- `scrape-año.ts`: Scrapear un año completo
- `reclasificar.ts`: Re-clasificar documentos existentes
- `export-csv.ts`: Exportar documentos a CSV

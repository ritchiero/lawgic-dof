# Configuración de Firebase para Lawgic DOF

## Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre del proyecto: `lawgic-dof` (o el que prefieras)
4. Desactiva Google Analytics (opcional para este proyecto)
5. Click en "Crear proyecto"

## Paso 2: Configurar Firestore Database

1. En el menú lateral, ve a **Build → Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona modo de producción
4. Elige la ubicación más cercana (ej: `us-central1` o `southamerica-east1`)
5. Click en "Habilitar"

## Paso 3: Configurar Reglas de Seguridad de Firestore

Ve a la pestaña "Reglas" y reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo desde el servidor (Firebase Admin SDK)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Importante**: Estas reglas bloquean el acceso directo desde el cliente. Todo el acceso se hace desde el servidor usando Firebase Admin SDK.

## Paso 4: Crear Service Account

1. Ve a **Configuración del proyecto** (ícono de engranaje) → **Cuentas de servicio**
2. Click en "Generar nueva clave privada"
3. Se descargará un archivo JSON con las credenciales
4. **Guarda este archivo de forma segura** - contiene credenciales sensibles

## Paso 5: Configurar Variables de Entorno

Del archivo JSON descargado, extrae:

```json
{
  "project_id": "tu-proyecto-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com"
}
```

Agrega a tu `.env.local`:

```bash
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Nota sobre FIREBASE_PRIVATE_KEY**:
- Debe estar entre comillas dobles
- Los saltos de línea deben ser literales `\n`
- En Vercel, pega la clave completa incluyendo las comillas

## Paso 6: Estructura de Colecciones en Firestore

El proyecto usa las siguientes colecciones:

### `usuarios`
```typescript
{
  id: string (auto-generado)
  email: string
  nombre?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: 'pending' | 'active' | 'cancelled' | 'past_due'
  created_at: Timestamp
  updated_at: Timestamp
}
```

### `areas_usuario`
```typescript
{
  id: string (auto-generado)
  usuario_id: string (referencia a usuarios)
  area_codigo: string
  created_at: Timestamp
}
```

### `documentos_dof`
```typescript
{
  id: string (auto-generado)
  fecha_publicacion: string (YYYY-MM-DD)
  titulo: string
  tipo_documento?: string
  url_dof: string
  contenido_extracto?: string
  resumen_ia?: string
  areas_detectadas?: string[]
  edicion?: string
  procesado: boolean
  created_at: Timestamp
}
```

### `alertas_enviadas`
```typescript
{
  id: string (auto-generado)
  usuario_id: string
  documento_id: string
  fecha_envio: Timestamp
  email_id?: string
}
```

### `webhook_events`
```typescript
{
  id: string (auto-generado)
  stripe_event_id: string
  event_type: string
  payload: any
  processed: boolean
  created_at: Timestamp
}
```

## Paso 7: Crear Índices (Opcional pero Recomendado)

Para mejorar el rendimiento, crea índices compuestos:

1. Ve a **Firestore Database → Índices**
2. Crea los siguientes índices:

**Índice 1: documentos_dof**
- Campo: `fecha_publicacion` (Ascendente)
- Campo: `procesado` (Ascendente)

**Índice 2: usuarios**
- Campo: `status` (Ascendente)
- Campo: `created_at` (Descendente)

**Índice 3: areas_usuario**
- Campo: `usuario_id` (Ascendente)
- Campo: `area_codigo` (Ascendente)

## Paso 8: Probar la Conexión

Ejecuta el proyecto localmente:

```bash
pnpm dev
```

Verifica en los logs que no haya errores de conexión a Firebase.

## Costos de Firebase

### Plan Spark (Gratis)
- **Firestore**: 
  - 50,000 lecturas/día
  - 20,000 escrituras/día
  - 20,000 eliminaciones/día
  - 1 GB de almacenamiento
- **Ideal para**: MVP y primeros usuarios

### Plan Blaze (Pago por uso)
- Mismo límite gratis que Spark
- Después: $0.06 por 100,000 lecturas
- Requiere tarjeta de crédito
- **Recomendado cuando**: Superes 50-100 usuarios activos

## Estimación de Uso

Con 100 usuarios activos:
- **Escrituras diarias**: ~150 (50 docs DOF + 100 alertas)
- **Lecturas diarias**: ~500 (clasificación + matching)
- **Costo mensual estimado**: $0 (dentro del plan gratuito)

## Ventajas de Firebase vs Supabase

✅ **Más fácil de configurar** - No requiere SQL
✅ **Mejor integración con Vercel** - Deploy más simple
✅ **Escalabilidad automática** - No hay que preocuparse por conexiones
✅ **Plan gratuito generoso** - Suficiente para MVP
✅ **Tiempo real opcional** - Por si quieres agregar features en vivo

## Desventajas

❌ **NoSQL** - Menos flexible para queries complejas
❌ **Vendor lock-in** - Más difícil migrar después
❌ **Sin SQL directo** - Requiere aprender Firestore queries

## Seguridad

🔒 **Reglas de Firestore bloqueadas** - Solo acceso desde servidor
🔒 **Service Account privado** - Nunca compartir el JSON
🔒 **Variables de entorno** - Nunca commitear a Git
🔒 **API key del cron** - Protege el endpoint del job diario

## Troubleshooting

### Error: "Could not reach Cloud Firestore backend"
- Verifica que Firestore esté habilitado en Firebase Console
- Verifica las credenciales en `.env.local`

### Error: "Permission denied"
- Verifica que las reglas de Firestore permitan acceso desde Admin SDK
- Verifica que el service account tenga permisos

### Error: "Invalid private key"
- Verifica que `FIREBASE_PRIVATE_KEY` incluya `\n` literales
- Verifica que esté entre comillas dobles

## Recursos

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore Quickstart](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

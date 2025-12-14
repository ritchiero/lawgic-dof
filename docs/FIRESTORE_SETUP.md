# Configuración de Firestore

## Índices

El proyecto incluye un archivo `firestore.indexes.json` que define los índices necesarios para las consultas de Firestore.

### Desplegar Índices

**Opción 1: Firebase CLI (Recomendado)**

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto (solo primera vez)
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

**Opción 2: Firebase Console (Manual)**

1. Ve a [Firebase Console → Firestore → Indexes](https://console.firebase.google.com/u/0/project/lawgic-dof/firestore/indexes)
2. Click en **"Create Index"**
3. Configura:
   - Collection: `documentos_dof`
   - Fields:
     - `areas_clasificadas` → **Array-contains**
     - `fecha_publicacion` → **Descending**
4. Click en **"Create"**
5. Espera 1-2 minutos

### Índices Definidos

#### 1. Índice para Filtrado por Áreas

- **Colección**: `documentos_dof`
- **Campos**:
  - `areas_clasificadas` (ARRAY_CONTAINS)
  - `fecha_publicacion` (DESCENDING)
- **Uso**: Permite filtrar documentos por área y ordenar por fecha

## Reglas de Seguridad

El proyecto incluye `firestore.rules` que define las reglas de seguridad.

### Desplegar Reglas

```bash
firebase deploy --only firestore:rules
```

### Reglas Definidas

- **documentos_dof**: Lectura pública, escritura solo desde servidor
- **usuarios**: Lectura/escritura solo desde servidor
- **suscripciones**: Lectura/escritura solo desde servidor

## Verificación

Después de desplegar los índices, verifica que estén activos:

1. Ve a Firebase Console → Firestore → Indexes
2. Verifica que el índice esté en estado **"Enabled"** (no "Building")
3. Prueba el filtrado en el feed: https://lawgic-dof.vercel.app/feed

## Troubleshooting

### Error: "The query requires an index"

Si ves este error, significa que el índice no se ha creado o aún está en construcción.

**Solución**:
1. Verifica que el índice exista en Firebase Console
2. Espera a que termine de construirse (1-2 minutos)
3. Si no existe, despliégalo con `firebase deploy --only firestore:indexes`

### Error: "PERMISSION_DENIED"

Las reglas de Firestore están bloqueando el acceso.

**Solución**:
1. Verifica las reglas en Firebase Console → Firestore → Rules
2. Despliega las reglas actualizadas con `firebase deploy --only firestore:rules`

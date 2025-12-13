# DOF Alertas - Lawgic (Firebase Edition)

Aplicación web que envía resúmenes diarios personalizados del Diario Oficial de la Federación (DOF) por email a abogados mexicanos, filtrados por áreas de práctica.

## 🔥 Firebase Edition

Esta versión usa **Firebase Firestore** en lugar de Supabase para una configuración más simple y rápida.

## Características

- 🔍 **Scraping automático** del DOF diariamente
- 🤖 **Clasificación con IA** usando Claude para categorizar documentos por área legal
- 📧 **Emails personalizados** con resúmenes ejecutivos
- 💳 **Suscripción mensual** vía Stripe ($49 MXN/mes)
- 🎨 **Diseño minimalista** inspirado en el Observatorio IA México
- 🔥 **Firebase Firestore** para base de datos NoSQL escalable

## Stack Técnico

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Firebase Firestore
- **Pagos**: Stripe Checkout
- **Email**: Resend
- **IA**: Claude (Anthropic)
- **Scraping**: Cheerio

## Inicio Rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar Firebase

Sigue la guía completa en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

Resumen rápido:
1. Crea proyecto en Firebase Console
2. Habilita Firestore Database
3. Descarga credenciales del Service Account
4. Configura variables de entorno

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe, Resend, Claude, etc.
```

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Visita http://localhost:3000

## Áreas de Práctica

1. 💰 Fiscal y Tributario
2. 👷 Laboral y Seguridad Social
3. 🏢 Mercantil y Corporativo
4. 🏦 Financiero y Bancario
5. ⚡ Energía e Hidrocarburos
6. 🌱 Ambiental
7. ©️ Propiedad Intelectual
8. ⚖️ Competencia Económica
9. 📋 Administrativo
10. 📜 Constitucional y Amparo
11. 🌎 Comercio Exterior y Aduanas
12. ⚕️ Salud y Farmacéutico

## Despliegue en Vercel

1. Sube tu código a GitHub
2. Conecta con Vercel
3. Configura las variables de entorno
4. Despliega

## Documentación

- **FIREBASE_SETUP.md**: Guía completa de configuración de Firebase
- **.env.example**: Plantilla de variables de entorno

## Licencia

© 2025 Lawgic. Todos los derechos reservados.

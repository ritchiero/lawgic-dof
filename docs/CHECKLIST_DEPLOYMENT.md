# Checklist de Deployment - DOF Alertas

Este documento contiene una lista completa de verificación para asegurar que el proyecto esté listo para producción.

---

## ✅ Pre-Deployment

### 1. Configuración de Servicios Externos

#### Firebase
- [ ] Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
- [ ] Habilitar Firestore Database
- [ ] Crear cuenta de servicio (Service Account)
- [ ] Descargar clave privada JSON
- [ ] Copiar `project_id`, `client_email` y `private_key`
- [ ] Configurar reglas de seguridad en Firestore:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Solo el servidor puede escribir
      match /{document=**} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }
  }
  ```

#### Stripe
- [ ] Crear cuenta en [Stripe](https://stripe.com/)
- [ ] Activar modo producción (completar verificación de cuenta)
- [ ] Obtener `Secret Key` de producción (`sk_live_...`)
- [ ] Crear producto "DOF Alertas - Suscripción Mensual" con precio $49 MXN/mes
- [ ] Configurar webhook (después del deployment)

#### Anthropic (Claude)
- [ ] Crear cuenta en [Anthropic Console](https://console.anthropic.com/)
- [ ] Generar API Key
- [ ] Verificar límites de uso y billing

#### Resend
- [ ] Crear cuenta en [Resend](https://resend.com/)
- [ ] Verificar dominio de envío (ej. `alertas@dofalertas.mx`)
- [ ] Generar API Key
- [ ] Configurar DNS records (SPF, DKIM, DMARC)

### 2. Repositorio Git

- [ ] Código subido a GitHub/GitLab/Bitbucket
- [ ] Rama `main` o `master` configurada como default
- [ ] Archivo `.gitignore` incluye `.env` y `.env.local`
- [ ] README.md actualizado con instrucciones

### 3. Variables de Entorno

Prepara todas las variables listadas en `.env.example`:

**Firebase**
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`

**Stripe**
- [ ] `STRIPE_SECRET_KEY` (usa `sk_live_...` para producción)
- [ ] `STRIPE_WEBHOOK_SECRET` (se obtiene después de configurar webhook)

**Anthropic**
- [ ] `ANTHROPIC_API_KEY`

**Resend**
- [ ] `RESEND_API_KEY`

**Aplicación**
- [ ] `NEXT_PUBLIC_APP_URL` (URL de producción, ej. `https://dof-alertas.vercel.app`)
- [ ] `CRON_API_KEY` (genera una clave segura con `openssl rand -base64 32`)

---

## 🚀 Deployment en Vercel

### 1. Importar Proyecto
- [ ] Conectar cuenta de Vercel con GitHub
- [ ] Importar repositorio `lawgic-dof-firebase`
- [ ] Framework detectado: Next.js ✓

### 2. Configurar Build Settings
- [ ] Build Command: `pnpm build` (auto-detectado)
- [ ] Output Directory: `.next` (auto-detectado)
- [ ] Install Command: `pnpm install` (auto-detectado)
- [ ] Node.js Version: 18.x o superior

### 3. Agregar Variables de Entorno
- [ ] Copiar todas las variables de `.env.example`
- [ ] Verificar que `FIREBASE_PRIVATE_KEY` incluya comillas y `\n`
- [ ] Usar claves de **producción** (no test)
- [ ] Marcar como "Secret" las variables sensibles

### 4. Deploy
- [ ] Hacer clic en "Deploy"
- [ ] Esperar a que termine el build (1-3 minutos)
- [ ] Verificar que el deployment sea exitoso
- [ ] Copiar la URL de producción

---

## 🔧 Post-Deployment

### 1. Configurar Stripe Webhook
- [ ] Ir a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Agregar endpoint: `https://<TU_URL>/api/webhooks/stripe`
- [ ] Seleccionar eventos:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.deleted`
  - [ ] `customer.subscription.updated`
  - [ ] `invoice.payment_failed`
- [ ] Copiar el `Webhook Secret` (`whsec_...`)
- [ ] Agregar `STRIPE_WEBHOOK_SECRET` a variables de entorno en Vercel
- [ ] Hacer redeploy para aplicar cambios

### 2. Verificar Cron Jobs
- [ ] Ir a Vercel > Proyecto > Logs > Cron Jobs
- [ ] Verificar que los cron jobs estén programados:
  - [ ] `30 14 * * 1-5` (8:30 AM CDMX)
  - [ ] `30 22 * * 1-5` (4:30 PM CDMX)
- [ ] Esperar a la hora programada y verificar ejecución
- [ ] Revisar logs para errores

### 3. Actualizar URL en Código
- [ ] Actualizar `NEXT_PUBLIC_APP_URL` en Vercel con la URL final
- [ ] Si usas dominio personalizado, configurarlo en Vercel
- [ ] Hacer redeploy

### 4. Configurar Dominio Personalizado (Opcional)
- [ ] Ir a Vercel > Proyecto > Settings > Domains
- [ ] Agregar dominio (ej. `dofalertas.mx`)
- [ ] Configurar DNS records según instrucciones de Vercel
- [ ] Esperar propagación DNS (puede tomar hasta 48 horas)
- [ ] Verificar SSL/TLS activo

---

## 🧪 Testing en Producción

### 1. Flujo de Onboarding
- [ ] Visitar landing page
- [ ] Completar onboarding paso 1 (email)
- [ ] Completar onboarding paso 2 (áreas)
- [ ] Ver preview en paso 3
- [ ] Ir a trial page
- [ ] Verificar que muestre documentos de ejemplo

### 2. Flujo de Pago
- [ ] Hacer clic en "Suscribirme ahora"
- [ ] Verificar redirección a Stripe Checkout
- [ ] Completar pago con tarjeta de prueba (si estás en modo test)
- [ ] Verificar redirección a `/welcome`
- [ ] Verificar que el usuario se cree en Firestore con `status: 'active'`
- [ ] Verificar que las áreas se guarden en `areas_usuario`

### 3. Webhook de Stripe
- [ ] Ir a Stripe Dashboard > Webhooks
- [ ] Ver eventos recientes
- [ ] Verificar que `checkout.session.completed` tenga status `200 OK`
- [ ] Revisar logs en Vercel para confirmar procesamiento

### 4. Feed
- [ ] Ir a `/feed`
- [ ] Verificar que cargue documentos (si ya hay en Firestore)
- [ ] Probar filtros por área
- [ ] Probar búsqueda

### 5. Cron Jobs (Scraping y Emails)
- [ ] Esperar a la hora programada (8:30 AM o 4:30 PM CDMX)
- [ ] Revisar logs en Vercel > Cron Jobs
- [ ] Verificar que se ejecute `/api/jobs/daily`
- [ ] Verificar que se guarden documentos en Firestore
- [ ] Verificar que se envíen emails a usuarios activos
- [ ] Revisar bandeja de entrada de un usuario de prueba

---

## 📊 Monitoreo

### 1. Configurar Analytics (Opcional pero Recomendado)
- [ ] Crear cuenta en [Vercel Analytics](https://vercel.com/analytics)
- [ ] Habilitar Analytics en el proyecto
- [ ] Instalar `@vercel/analytics` si no está
- [ ] Agregar `<Analytics />` en `app/layout.tsx`

### 2. Configurar Error Tracking (Opcional)
- [ ] Crear cuenta en [Sentry](https://sentry.io/)
- [ ] Instalar `@sentry/nextjs`
- [ ] Configurar `sentry.client.config.ts` y `sentry.server.config.ts`
- [ ] Agregar `SENTRY_DSN` a variables de entorno

### 3. Logs
- [ ] Revisar logs diariamente en Vercel > Logs
- [ ] Configurar alertas para errores críticos
- [ ] Monitorear uso de Firestore, Stripe, Anthropic y Resend

---

## 🔒 Seguridad

### 1. Firestore Rules
- [ ] Verificar que las reglas de seguridad estén configuradas
- [ ] Solo el servidor puede escribir
- [ ] Usuarios autenticados pueden leer sus propios datos

### 2. API Routes
- [ ] `/api/jobs/daily` protegido con `CRON_API_KEY`
- [ ] `/api/webhooks/stripe` valida firma de Stripe
- [ ] No exponer claves de API en el frontend

### 3. Variables de Entorno
- [ ] Todas las claves sensibles marcadas como "Secret" en Vercel
- [ ] No commitear `.env` o `.env.local` al repositorio
- [ ] Rotar claves regularmente (cada 3-6 meses)

---

## 📈 Optimización

### 1. Performance
- [ ] Habilitar caché de Vercel para assets estáticos
- [ ] Optimizar imágenes con `next/image`
- [ ] Lazy loading de componentes pesados
- [ ] Revisar Core Web Vitals en Vercel Analytics

### 2. SEO
- [ ] Agregar `metadata` en `app/layout.tsx` y páginas
- [ ] Configurar `sitemap.xml` y `robots.txt`
- [ ] Verificar Open Graph tags para redes sociales
- [ ] Registrar en Google Search Console

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] Todos los flujos de usuario funcionan correctamente
- [ ] Stripe webhook configurado y funcionando
- [ ] Cron jobs ejecutándose según horario
- [ ] Emails enviándose correctamente
- [ ] Documentos guardándose en Firestore
- [ ] Logs sin errores críticos
- [ ] Variables de entorno de producción configuradas
- [ ] Dominio personalizado configurado (si aplica)
- [ ] SSL/TLS activo
- [ ] Analytics y monitoreo configurados
- [ ] Documentación actualizada

---

## 🆘 Troubleshooting

### Problema: Build falla en Vercel

**Solución**:
- Revisar logs de build en Vercel
- Verificar que todas las dependencias estén en `package.json`
- Asegurar que `pnpm-lock.yaml` esté actualizado
- Probar build localmente: `pnpm build`

### Problema: Webhook de Stripe no funciona

**Solución**:
- Verificar que la URL del webhook sea correcta
- Verificar que `STRIPE_WEBHOOK_SECRET` esté configurado
- Revisar logs en Stripe Dashboard > Webhooks > Events
- Revisar logs en Vercel para ver el error

### Problema: Cron jobs no se ejecutan

**Solución**:
- Verificar que `vercel.json` esté en el root del proyecto
- Verificar que los horarios estén en UTC (no en hora local)
- Revisar logs en Vercel > Cron Jobs
- Verificar que `CRON_API_KEY` esté configurado

### Problema: Emails no se envían

**Solución**:
- Verificar que `RESEND_API_KEY` esté configurado
- Verificar que el dominio esté verificado en Resend
- Revisar logs de Resend para ver errores
- Verificar límites de envío (plan gratuito: 100 emails/día)

### Problema: Firebase no conecta

**Solución**:
- Verificar que las 3 variables de Firebase estén configuradas
- Verificar que `FIREBASE_PRIVATE_KEY` incluya comillas y `\n`
- Revisar logs en Vercel para ver el error específico
- Verificar que la cuenta de servicio tenga permisos

---

## 📞 Soporte

Si encuentras problemas que no puedes resolver:

1. Revisar documentación oficial:
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Stripe Docs](https://stripe.com/docs)
   - [Firebase Docs](https://firebase.google.com/docs)

2. Revisar logs en cada servicio

3. Contactar soporte:
   - Vercel: [vercel.com/support](https://vercel.com/support)
   - Stripe: [support.stripe.com](https://support.stripe.com/)
   - Firebase: [firebase.google.com/support](https://firebase.google.com/support)

---

**Última actualización**: Diciembre 2024

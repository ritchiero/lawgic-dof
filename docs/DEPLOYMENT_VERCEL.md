# Guía de Deployment a Vercel - DOF Alertas

## Resumen

Esta guía explica paso a paso cómo desplegar el proyecto **DOF Alertas** en Vercel. El proceso es sencillo gracias a la integración nativa de Vercel con Next.js.

## 1. Prerrequisitos

Antes de empezar, asegúrate de tener lo siguiente:

1.  **Cuenta de Vercel**: [Crea una cuenta gratuita en Vercel](https://vercel.com/signup).
2.  **Repositorio en GitHub**: El código del proyecto debe estar en un repositorio de GitHub, GitLab o Bitbucket. Vercel se conectará a este repositorio.
3.  **Variables de Entorno**: Ten a la mano todas las claves de API y secretos listados en el archivo `.env.example`. Las necesitarás para el paso 3.

## 2. Importar y Desplegar el Proyecto

Sigue estos pasos para tu primer deployment:

1.  **Ve a tu Dashboard de Vercel**.
2.  Haz clic en **"Add New..."** y selecciona **"Project"**.
3.  **Importa tu Repositorio Git**: Conecta tu cuenta de GitHub (o similar) y selecciona el repositorio `lawgic-dof-firebase`.
4.  **Configura el Proyecto**: Vercel detectará automáticamente que es un proyecto de Next.js. La configuración por defecto debería ser correcta:
    *   **Framework Preset**: `Next.js`
    *   **Root Directory**: `./`
    *   **Build Command**: `pnpm build` (Vercel usará `pnpm` si detecta un `pnpm-lock.yaml`)
    *   **Output Directory**: `.next`
    *   **Install Command**: `pnpm install`

## 3. Configurar Variables de Entorno

Este es el paso más importante. En la misma pantalla de configuración del proyecto, expande la sección **"Environment Variables"** y agrega todas las variables del archivo `.env.example`.

| Variable | Descripción | Ejemplo | Secreto |
| :--- | :--- | :--- | :--- |
| `FIREBASE_PROJECT_ID` | ID de tu proyecto en Firebase | `dof-alertas-prod` | No |
| `FIREBASE_CLIENT_EMAIL` | Email de la cuenta de servicio | `firebase-adminsdk-xxxxx@...` | No |
| `FIREBASE_PRIVATE_KEY` | Clave privada de la cuenta de servicio | `"-----BEGIN PRIVATE KEY..."` | Sí |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (usa la de producción) | `sk_live_xxxxxxxxxx` | Sí |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe | `whsec_xxxxxxxxxx` | Sí |
| `ANTHROPIC_API_KEY` | Clave de API de Anthropic | `sk-ant-xxxxxxxxxx` | Sí |
| `RESEND_API_KEY` | Clave de API de Resend | `re_xxxxxxxxxx` | Sí |
| `NEXT_PUBLIC_APP_URL` | URL de producción de tu app | `https://dof-alertas.vercel.app` | No |
| `CRON_API_KEY` | Clave secreta para los cron jobs | (Genera una clave segura) | Sí |

**Importante**:
*   Para `FIREBASE_PRIVATE_KEY`, copia y pega el contenido completo, incluyendo las comillas y los `\n`.
*   Usa tus claves de **producción** (live) para Stripe, no las de prueba (test).
*   `NEXT_PUBLIC_APP_URL` debe ser la URL final que Vercel te asigne o tu dominio personalizado.

## 4. Desplegar

Una vez configuradas las variables de entorno, haz clic en el botón **"Deploy"**.

Vercel clonará tu repositorio, instalará las dependencias, ejecutará el build y desplegará la aplicación. El proceso tomará entre 1 y 3 minutos.

Al finalizar, Vercel te dará la URL de producción (ej. `https://lawgic-dof-firebase.vercel.app`).

## 5. Pasos Post-Deployment

### a) Configurar el Webhook de Stripe

Stripe necesita enviar eventos a tu aplicación (ej. `checkout.session.completed`).

1.  **Ve a tu Dashboard de Stripe** > **Developers** > **Webhooks**.
2.  Haz clic en **"Add endpoint"**.
3.  **Endpoint URL**: `https://<TU_URL_DE_VERCEL>/api/webhooks/stripe`
4.  **Events to send**: Haz clic en **"Select events"** y añade los siguientes:
    *   `checkout.session.completed`
    *   `customer.subscription.deleted`
    *   `customer.subscription.updated`
    *   `invoice.payment_failed`
5.  Haz clic en **"Add endpoint"**. Stripe te dará el **Webhook Secret** (`whsec_...`). Cópialo y añádelo a tus variables de entorno en Vercel con el nombre `STRIPE_WEBHOOK_SECRET` (si no lo hiciste ya).

### b) Verificar los Cron Jobs

El archivo `vercel.json` en el repositorio ya configura los cron jobs para que se ejecuten dos veces al día y envíen las alertas.

```json
{
  "crons": [
    {
      "path": "/api/jobs/daily",
      "schedule": "30 14 * * 1-5"
    },
    {
      "path": "/api/jobs/daily",
      "schedule": "30 22 * * 1-5"
    }
  ]
}
```

*   `30 14 * * 1-5`: Se ejecuta a las 14:30 UTC (8:30 AM en CDMX) de Lunes a Viernes.
*   `30 22 * * 1-5`: Se ejecuta a las 22:30 UTC (4:30 PM en CDMX) de Lunes a Viernes.

Para verificar que funcionan:

1.  **Ve a tu proyecto en Vercel** > **Logs** > **Cron Jobs**.
2.  Después de la hora programada, deberías ver una entrada de log con el status `200 OK` para el path `/api/jobs/daily`.

## ¡Listo!

Con estos pasos, tu aplicación estará desplegada y funcionando en Vercel. Cada vez que hagas `git push` a tu rama principal (ej. `main`), Vercel automáticamente desplegará los cambios.

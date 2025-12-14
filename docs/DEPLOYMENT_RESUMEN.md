# Resumen Ejecutivo: Deployment a Vercel

## Introducción

Este documento proporciona un resumen ejecutivo de los requisitos y pasos necesarios para desplegar **DOF Alertas** en producción usando Vercel. El proyecto está técnicamente listo para deployment, pero requiere configurar varios servicios externos antes de lanzar.

## Estado Actual

El código del proyecto está **100% completo** y funcional en desarrollo. Todas las páginas, APIs y funcionalidades están implementadas y probadas localmente. El siguiente paso es mover la aplicación a un entorno de producción accesible públicamente.

## Servicios Externos Requeridos

Para que DOF Alertas funcione en producción, necesitas configurar y obtener credenciales de cinco servicios externos. La siguiente tabla resume cada servicio, su propósito y el costo estimado.

| Servicio | Propósito | Costo Mensual | Límites Plan Gratuito |
|----------|-----------|---------------|------------------------|
| **Firebase** | Base de datos (Firestore) para usuarios, documentos y alertas | Gratis hasta 1GB storage | 50K lecturas/día, 20K escrituras/día |
| **Stripe** | Procesamiento de pagos y suscripciones | 3% + $3 MXN por transacción | Sin límite de transacciones |
| **Anthropic** | Clasificación de documentos con IA (Claude) | ~$0.25 USD por 1K documentos | Sin plan gratuito, pago por uso |
| **Resend** | Envío de emails de alertas | Gratis hasta 100 emails/día | 100 emails/día, 3K emails/mes |
| **Vercel** | Hosting de la aplicación y cron jobs | Gratis para proyectos personales | Unlimited bandwidth, 100 GB-hours |

**Costo total estimado para 100 usuarios**: ~$250 MXN/mes (la mayoría del costo viene de Stripe fees y Anthropic).

## Variables de Entorno Necesarias

El proyecto requiere nueve variables de entorno para funcionar. Estas variables contienen las credenciales y configuraciones de los servicios externos. Debes configurarlas en Vercel antes del deployment.

**Variables de Firebase** (3):
- `FIREBASE_PROJECT_ID`: Identificador único del proyecto en Firebase
- `FIREBASE_CLIENT_EMAIL`: Email de la cuenta de servicio para autenticación
- `FIREBASE_PRIVATE_KEY`: Clave privada para acceso al servidor (debe incluir `\n` para saltos de línea)

**Variables de Stripe** (2):
- `STRIPE_SECRET_KEY`: Clave secreta para crear sesiones de checkout y gestionar suscripciones
- `STRIPE_WEBHOOK_SECRET`: Secreto para validar eventos enviados por Stripe (se obtiene después de configurar el webhook)

**Variables de Anthropic** (1):
- `ANTHROPIC_API_KEY`: Clave de API para usar Claude y clasificar documentos

**Variables de Resend** (1):
- `RESEND_API_KEY`: Clave de API para enviar emails de alertas

**Variables de la Aplicación** (2):
- `NEXT_PUBLIC_APP_URL`: URL pública de la aplicación (ej. `https://dof-alertas.vercel.app`)
- `CRON_API_KEY`: Clave secreta para proteger los endpoints de cron jobs (genera una aleatoria con `openssl rand -base64 32`)

## Proceso de Deployment

El deployment a Vercel consta de cuatro fases principales que deben completarse en orden.

### Fase 1: Preparación (30-60 minutos)

En esta fase, debes crear cuentas y obtener credenciales de todos los servicios externos. Comienza creando un proyecto en Firebase Console y habilitando Firestore Database. Luego genera una cuenta de servicio y descarga el archivo JSON con las credenciales. Repite este proceso para Stripe, Anthropic y Resend, asegurándote de usar claves de producción (no de prueba) para Stripe.

También necesitas tener tu código en un repositorio de Git (GitHub, GitLab o Bitbucket) para que Vercel pueda acceder a él. Asegúrate de que el archivo `.env` esté en `.gitignore` para no exponer tus secretos.

### Fase 2: Deployment Inicial (5-10 minutos)

Una vez que tengas todas las credenciales, ve a Vercel y crea una cuenta si no tienes una. Importa tu repositorio desde Git y Vercel detectará automáticamente que es un proyecto Next.js. En la pantalla de configuración, agrega todas las variables de entorno que preparaste en la Fase 1. Verifica que cada variable esté correctamente copiada, especialmente `FIREBASE_PRIVATE_KEY` que debe incluir las comillas y los saltos de línea.

Haz clic en "Deploy" y espera entre uno y tres minutos mientras Vercel construye y despliega tu aplicación. Al finalizar, recibirás una URL de producción (ej. `https://lawgic-dof-firebase.vercel.app`).

### Fase 3: Configuración Post-Deployment (15-30 minutos)

Después del primer deployment, debes configurar el webhook de Stripe para que pueda enviar eventos a tu aplicación. Ve a Stripe Dashboard, crea un nuevo webhook endpoint apuntando a `https://<TU_URL>/api/webhooks/stripe`, y selecciona los eventos `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated` e `invoice.payment_failed`. Stripe te dará un webhook secret que debes agregar como variable de entorno en Vercel con el nombre `STRIPE_WEBHOOK_SECRET`. Después de agregarlo, haz un redeploy para aplicar los cambios.

También debes verificar que los cron jobs estén configurados correctamente. El archivo `vercel.json` en el proyecto ya define dos cron jobs que se ejecutan a las 8:30 AM y 4:30 PM (hora de Ciudad de México) de lunes a viernes. Puedes verificar su ejecución en la sección de Logs de Vercel.

Si planeas usar un dominio personalizado (ej. `dofalertas.mx`), configúralo en Vercel y actualiza la variable `NEXT_PUBLIC_APP_URL` con el nuevo dominio.

### Fase 4: Testing en Producción (30-60 minutos)

Antes de considerar el deployment completo, debes probar todos los flujos críticos en producción. Comienza completando el onboarding desde la landing page hasta la trial page. Luego realiza un pago de prueba con Stripe (usa una tarjeta de prueba si estás en modo test) y verifica que el usuario se cree correctamente en Firestore con status "active". Revisa los logs del webhook en Stripe para confirmar que el evento `checkout.session.completed` fue procesado exitosamente.

Finalmente, espera a que se ejecute el cron job (8:30 AM o 4:30 PM CDMX) y verifica en los logs de Vercel que el scraping del DOF y el envío de emails funcionaron correctamente. Revisa la bandeja de entrada de un usuario de prueba para confirmar que recibió el email de alerta.

## Riesgos y Mitigaciones

El deployment puede fallar o presentar problemas en producción. Los riesgos más comunes y sus mitigaciones son los siguientes.

**Webhook de Stripe no funciona**: Este es el problema más frecuente. La causa suele ser que el `STRIPE_WEBHOOK_SECRET` no está configurado o la URL del webhook es incorrecta. Verifica ambos en Stripe Dashboard y en las variables de entorno de Vercel. Revisa los logs de Stripe para ver el error específico.

**Cron jobs no se ejecutan**: Si los cron jobs no aparecen en los logs de Vercel, verifica que el archivo `vercel.json` esté en el root del proyecto y que los horarios estén en UTC (no en hora local). También confirma que `CRON_API_KEY` esté configurado correctamente.

**Emails no se envían**: Si Resend no envía emails, verifica que el dominio esté verificado en Resend y que hayas configurado los DNS records (SPF, DKIM, DMARC). También revisa los límites del plan gratuito (100 emails/día).

**Firebase no conecta**: Si Firestore no responde, el problema suele estar en `FIREBASE_PRIVATE_KEY`. Asegúrate de que incluya las comillas y los `\n` para los saltos de línea. Copia el contenido exacto del archivo JSON descargado de Firebase.

## Próximos Pasos

Una vez completado el deployment y verificado que todo funciona correctamente, los siguientes pasos recomendados son:

1. **Configurar monitoreo**: Habilita Vercel Analytics para rastrear tráfico y Core Web Vitals. Considera usar Sentry para error tracking.

2. **Optimizar SEO**: Agrega metadata en las páginas, crea un `sitemap.xml` y registra el sitio en Google Search Console.

3. **Escalar servicios**: Cuando superes los límites de los planes gratuitos, actualiza a planes pagados. Resend Pro cuesta $20 USD/mes para 50K emails, y Vercel Pro cuesta $20 USD/mes para features avanzados.

4. **Documentar procesos**: Crea runbooks para tareas comunes como rotar claves de API, resolver problemas de webhooks y escalar la infraestructura.

## Conclusión

El proyecto DOF Alertas está técnicamente listo para producción. El deployment a Vercel es sencillo gracias a la integración nativa con Next.js, pero requiere configurar correctamente cinco servicios externos y nueve variables de entorno. El proceso completo toma entre dos y tres horas si es la primera vez, incluyendo la creación de cuentas y el testing en producción.

Los documentos complementarios **DEPLOYMENT_VERCEL.md** y **CHECKLIST_DEPLOYMENT.md** proporcionan instrucciones paso a paso y una lista de verificación completa para asegurar que no se omita ningún paso crítico. Sigue estos documentos en orden y el deployment será exitoso.

import { Resend } from 'resend';
import { DocumentoDOF } from '@/lib/types';
import { AREAS_ARRAY } from '@/lib/areas';

// Crear objeto de lookup para áreas
const AREAS_PRACTICA = AREAS_ARRAY.reduce((acc, area) => {
  acc[area.codigo] = area;
  return acc;
}, {} as Record<string, typeof AREAS_ARRAY[0]>);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailAlertaData {
  email: string;
  nombre?: string;
  documentos: DocumentoDOF[];
  documentosHistoricos?: DocumentoDOF[];
  fecha: string;
  hayDocumentosNuevos?: boolean;
}

export async function enviarEmailAlerta(data: EmailAlertaData): Promise<string | null> {
  try {
    const { email, nombre, documentos, documentosHistoricos = [], fecha, hayDocumentosNuevos = true } = data;

    const html = generarHTMLAlerta(nombre, documentos, documentosHistoricos, fecha, hayDocumentosNuevos);

    if (!resend) {
      console.error('Resend API key not configured');
      return null;
    }

    const subject = hayDocumentosNuevos
      ? `DOF Alertas - ${fecha} - ${documentos.length} documento(s) nuevo(s)`
      : `DOF Alertas - ${fecha} - Sin cambios relevantes hoy`;

    const result = await resend.emails.send({
      from: 'DOF Alertas <alertas@lawgic.com>',
      to: email,
      subject,
      html,
    });

    return result.data?.id || null;
  } catch (error) {
    console.error('Error enviando email:', error);
    return null;
  }
}

export async function enviarEmailBienvenida(email: string, nombre?: string): Promise<void> {
  try {
    const html = generarHTMLBienvenida(nombre);

    if (!resend) {
      console.error('Resend API key not configured');
      return;
    }

    await resend.emails.send({
      from: 'DOF Alertas <alertas@lawgic.com>',
      to: email,
      subject: '¡Bienvenido a DOF Alertas!',
      html,
    });
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
}

function generarHTMLDocumento(doc: DocumentoDOF, esHistorico: boolean = false): string {
  const areasHTML = doc.areas_detectadas
    ?.map(area => {
      const areaInfo = AREAS_PRACTICA[area];
      return `<span style="display: inline-block; background: #EBF5FF; color: #1E40AF; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-right: 8px;">${areaInfo?.emoji || ''} ${areaInfo?.nombre || area}</span>`;
    })
    .join('') || '';

  const borderColor = esHistorico ? '#D1D5DB' : '#4ADE80';
  const backgroundColor = esHistorico ? '#FAFAFA' : '#F9FAFB';

  return `
    <div style="border: 2px dashed ${borderColor}; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: ${backgroundColor};">
      <div style="margin-bottom: 12px;">
        ${areasHTML}
        ${esHistorico ? '<span style="display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px;">HISTÓRICO</span>' : ''}
      </div>
      <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">
        ${doc.titulo}
      </h3>
      <p style="margin: 0 0 12px 0; color: #4B5563; line-height: 1.6;">
        ${doc.resumen_ia || 'Sin resumen disponible'}
      </p>
      <div style="display: flex; gap: 12px; align-items: center; font-size: 13px; color: #6B7280;">
        <span>${doc.fecha_publicacion || 'Fecha no disponible'}</span>
        <span>•</span>
        <span>${doc.tipo_documento || 'Documento'}</span>
        <span>•</span>
        <span>${doc.edicion || 'Matutina'}</span>
      </div>
      <a href="${doc.url_dof}" style="display: inline-block; margin-top: 12px; color: #2563EB; text-decoration: none; font-weight: 500;">
        Ver documento completo →
      </a>
    </div>
  `;
}

function generarHTMLAlerta(
  nombre: string | undefined,
  documentos: DocumentoDOF[],
  documentosHistoricos: DocumentoDOF[],
  fecha: string,
  hayDocumentosNuevos: boolean
): string {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';

  let mensajePrincipal = '';
  let documentosNuevosHTML = '';
  let documentosHistoricosHTML = '';

  if (hayDocumentosNuevos) {
    // Hay documentos nuevos
    mensajePrincipal = `
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #4B5563; line-height: 1.6;">
        Encontramos <strong>${documentos.length} documento(s) nuevo(s)</strong> relevante(s) para tus áreas de práctica en el DOF de hoy.
      </p>
    `;
    documentosNuevosHTML = documentos.map(doc => generarHTMLDocumento(doc, false)).join('');
  } else {
    // NO hay documentos nuevos - mostrar mensaje y históricos
    mensajePrincipal = `
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 8px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #92400E;">
          Sin cambios relevantes hoy
        </h3>
        <p style="margin: 0; font-size: 14px; color: #78350F; line-height: 1.5;">
          No se publicaron documentos relevantes para tus áreas de práctica en el DOF de hoy. A continuación, te mostramos los últimos ${documentosHistoricos.length} documentos relevantes para que te mantengas al día.
        </p>
      </div>
    `;

    if (documentosHistoricos.length > 0) {
      documentosHistoricosHTML = `
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #111827; padding-bottom: 12px; border-bottom: 2px solid #E5E7EB;">
          📚 Últimos ${documentosHistoricos.length} documentos relevantes
        </h3>
        ${documentosHistoricos.map(doc => generarHTMLDocumento(doc, true)).join('')}
      `;
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DOF Alertas - ${fecha}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <div style="background: #FFFFFF; border-bottom: 2px solid #E5E7EB; padding: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
              MONITOREO LEGAL
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">
              DOF Alertas
            </h1>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <div style="background: #DBEAFE; color: #1E40AF; padding: 12px 16px; border-radius: 24px; display: inline-block; font-size: 13px; font-weight: 500; margin-bottom: 24px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #2563EB; border-radius: 50%; margin-right: 8px;"></span>
            ${fecha}
          </div>

          <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #111827;">
            ${saludo},
          </h2>
          
          ${mensajePrincipal}
          ${documentosNuevosHTML}
          ${documentosHistoricosHTML}
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #6B7280;">
            © 2025 DOF Alertas by Lawgic
          </p>
          <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
            <a href="{{unsubscribe_url}}" style="color: #6B7280; text-decoration: underline;">
              Cancelar suscripción
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generarHTMLBienvenida(nombre?: string): string {
  const saludo = nombre ? `Hola ${nombre}` : 'Hola';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a DOF Alertas</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <div style="background: #FFFFFF; border-bottom: 2px solid #E5E7EB; padding: 24px;">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
              MONITOREO LEGAL
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">
              DOF Alertas
            </h1>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px; text-align: center;">
          <div style="width: 80px; height: 80px; background: #DBEAFE; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 40px;">✓</span>
          </div>

          <h2 style="margin: 0 0 16px 0; font-size: 32px; font-weight: bold; color: #111827;">
            ${saludo}, ¡bienvenido!
          </h2>

          <p style="margin: 0 0 24px 0; font-size: 16px; color: #4B5563; line-height: 1.6;">
            Tu suscripción a DOF Alertas ha sido activada exitosamente.
          </p>

          <div style="border: 2px dashed #4ADE80; border-radius: 8px; padding: 24px; background: #F9FAFB; text-align: left; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">
              ¿Qué sigue?
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #4B5563; line-height: 1.8;">
              <li>Tu primera alerta llegará mañana a las 8:30 AM y 4:30 PM (hora CDMX)</li>
              <li>Solo recibirás documentos relevantes a tus áreas de práctica</li>
              <li>Cada documento incluye un resumen ejecutivo generado con IA</li>
              <li>Si no hay documentos nuevos, recibirás los últimos 10 relevantes</li>
              <li>Puedes cancelar tu suscripción en cualquier momento</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 24px; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #6B7280;">
            © 2025 DOF Alertas by Lawgic
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

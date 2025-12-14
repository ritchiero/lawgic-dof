import { Timestamp } from 'firebase-admin/firestore';

export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: 'pending' | 'active' | 'cancelled' | 'past_due';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AreaUsuario {
  id: string;
  usuario_id: string;
  area_codigo: string;
  created_at: Timestamp;
}

export interface DocumentoDOF {
  id: string;
  fecha_publicacion: string;
  titulo: string;
  tipo_documento?: string;
  url_dof: string;
  contenido_extracto?: string;
  resumen_ia?: string;
  areas_detectadas?: string[];
  edicion?: string;
  procesado: boolean;
  created_at: Timestamp;
}

export interface AlertaEnviada {
  id: string;
  usuario_id: string;
  documento_id: string;
  fecha_envio: Timestamp;
  email_id?: string;
}

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  payload: unknown;
  processed: boolean;
  created_at: Timestamp;
}

export interface SubscribeRequest {
  email: string;
  nombre?: string;
  areas: string[];
}

export interface SubscribeResponse {
  checkout_url: string;
}

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let firestoreInstance: Firestore | undefined;

// Inicializar Firebase Admin (para el servidor)
function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn('Firebase credentials not configured');
    return undefined;
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return undefined;
  }
}

// Lazy initialization
export function getDb(): Firestore {
  if (!firestoreInstance) {
    app = initializeFirebase();
    if (app) {
      firestoreInstance = getFirestore(app);
    }
  }
  
  if (!firestoreInstance) {
    throw new Error('Firestore not initialized. Check Firebase credentials.');
  }
  
  return firestoreInstance;
}

// Export for convenience (but will throw if not initialized)
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    return getDb()[prop as keyof Firestore];
  }
});

// Colecciones
export const collections = {
  usuarios: 'usuarios',
  areasUsuario: 'areas_usuario',
  documentosDof: 'documentos_dof',
  alertasEnviadas: 'alertas_enviadas',
  webhookEvents: 'webhook_events',
} as const;

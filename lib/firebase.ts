import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | undefined;
let firestoreInstance: Firestore | undefined;
let storageInstance: Storage | undefined;

// Inicializar Firebase Admin (para el servidor)
function initializeFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('Firebase credentials not configured');
    return undefined;
  }

  try {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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

// Lazy initialization for Storage
export function getStorageInstance(): Storage {
  if (!storageInstance) {
    app = initializeFirebase();
    if (app) {
      storageInstance = getStorage(app);
    }
  }
  
  if (!storageInstance) {
    throw new Error('Storage not initialized. Check Firebase credentials.');
  }
  
  return storageInstance;
}

// Export for convenience (but will throw if not initialized)
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    return getDb()[prop as keyof Firestore];
  }
});

export const storage = new Proxy({} as Storage, {
  get(target, prop) {
    return getStorageInstance()[prop as keyof Storage];
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

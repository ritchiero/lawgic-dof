// Almacenamiento local para modo demo (sin base de datos)

export interface DemoUser {
  id: string;
  email: string;
  nombre?: string;
  areas: string[];
  status: 'active' | 'cancelled';
  created_at: string;
  session_id: string;
}

export interface DemoSubscription {
  user: DemoUser;
  documentos_recibidos: number;
  ultima_alerta: string | null;
}

// Simular base de datos en memoria
const demoStorage = {
  users: new Map<string, DemoUser>(),
  subscriptions: new Map<string, DemoSubscription>(),
};

export function createDemoUser(email: string, nombre: string | undefined, areas: string[]): DemoUser {
  const userId = `demo_user_${Date.now()}`;
  const sessionId = `demo_session_${Date.now()}`;
  
  const user: DemoUser = {
    id: userId,
    email,
    nombre,
    areas,
    status: 'active',
    created_at: new Date().toISOString(),
    session_id: sessionId,
  };

  demoStorage.users.set(userId, user);
  demoStorage.subscriptions.set(userId, {
    user,
    documentos_recibidos: 0,
    ultima_alerta: null,
  });

  return user;
}

export function getDemoUser(userId: string): DemoUser | undefined {
  return demoStorage.users.get(userId);
}

export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return Array.from(demoStorage.users.values()).find(u => u.email === email);
}

export function getDemoSubscription(userId: string): DemoSubscription | undefined {
  return demoStorage.subscriptions.get(userId);
}

export function getAllDemoUsers(): DemoUser[] {
  return Array.from(demoStorage.users.values());
}

export function updateDemoUser(userId: string, updates: Partial<DemoUser>): DemoUser | undefined {
  const user = demoStorage.users.get(userId);
  if (!user) return undefined;

  const updatedUser = { ...user, ...updates };
  demoStorage.users.set(userId, updatedUser);

  const subscription = demoStorage.subscriptions.get(userId);
  if (subscription) {
    subscription.user = updatedUser;
    demoStorage.subscriptions.set(userId, subscription);
  }

  return updatedUser;
}

export function incrementDocumentosRecibidos(userId: string): void {
  const subscription = demoStorage.subscriptions.get(userId);
  if (subscription) {
    subscription.documentos_recibidos++;
    subscription.ultima_alerta = new Date().toISOString();
    demoStorage.subscriptions.set(userId, subscription);
  }
}

export function getDemoStats() {
  const users = Array.from(demoStorage.users.values());
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalDocumentos = Array.from(demoStorage.subscriptions.values())
    .reduce((sum, sub) => sum + sub.documentos_recibidos, 0);

  return {
    total_users: users.length,
    active_users: activeUsers,
    cancelled_users: users.length - activeUsers,
    total_documentos_enviados: totalDocumentos,
  };
}

// Inicializar con algunos usuarios demo
export function initDemoData() {
  if (demoStorage.users.size === 0) {
    const demoUsers = [
      { email: 'juan.perez@despacho.com', nombre: 'Juan Pérez', areas: ['fiscal', 'laboral'] },
      { email: 'maria.garcia@abogados.com', nombre: 'María García', areas: ['mercantil', 'financiero'] },
      { email: 'carlos.lopez@legal.mx', nombre: 'Carlos López', areas: ['ambiental', 'administrativo'] },
    ];

    demoUsers.forEach(({ email, nombre, areas }) => {
      const user = createDemoUser(email, nombre, areas);
      // Simular que ya recibieron algunas alertas
      incrementDocumentosRecibidos(user.id);
      incrementDocumentosRecibidos(user.id);
      incrementDocumentosRecibidos(user.id);
    });
  }
}

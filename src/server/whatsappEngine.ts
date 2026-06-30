import whatsapp from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsapp;
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

interface WhatsAppSession {
  id: string;
  name: string;
  vendedor_id: number;
  status: 'disconnected' | 'qr' | 'loading' | 'ready' | 'error';
  qr?: string;
  client?: Client;
}

class WhatsAppEngine {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private sessionsPath: string;

  constructor() {
    this.sessionsPath = path.join(process.cwd(), 'data', 'sessions');
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
    }
  }

  async createSession(vendedor_id: number, name: string) {
    const id = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const session: WhatsAppSession = {
      id,
      name,
      vendedor_id,
      status: 'disconnected'
    };
    this.sessions.set(id, session);
    return session;
  }

  getSessions(vendedor_id: number) {
    return Array.from(this.sessions.values()).filter(s => s.vendedor_id === vendedor_id);
  }

  async startSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) throw new Error('Sesión no encontrada');

    if (session.client) {
      try {
        await session.client.destroy();
      } catch (e) {}
    }

    session.status = 'loading';
    session.qr = undefined;

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: id,
        dataPath: this.sessionsPath
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      }
    });

    client.on('qr', async (qr) => {
      console.log(`QR received for ${id}`);
      session.status = 'qr';
      session.qr = await qrcode.toDataURL(qr);
    });

    client.on('ready', () => {
      console.log(`Client ${id} is ready!`);
      session.status = 'ready';
      session.qr = undefined;
    });

    client.on('authenticated', () => {
      console.log(`Client ${id} authenticated`);
      session.status = 'loading';
    });

    client.on('auth_failure', (msg) => {
      console.error(`Auth failure for ${id}:`, msg);
      session.status = 'error';
    });

    client.on('disconnected', (reason) => {
      console.log(`Client ${id} disconnected:`, reason);
      session.status = 'disconnected';
    });

    session.client = client;
    client.initialize().catch(err => {
      console.error(`Error initializing client ${id}:`, err);
      session.status = 'error';
    });

    return session;
  }

  getSessionStatus(id: string) {
    const session = this.sessions.get(id);
    if (!session) return null;
    return {
      status: session.status,
      qr: session.qr,
      name: session.name
    };
  }
}

export const whatsappEngine = new WhatsAppEngine();

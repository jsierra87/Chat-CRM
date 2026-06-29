import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial Data structure
const initialData = {
  empresas: [
    { id: 1, nombre: 'RACEPOINT', color_marca: '#6C63FF', activo: true, created_at: new Date().toISOString() },
    { id: 2, nombre: 'WYLCO', color_marca: '#00D4AA', activo: true, created_at: new Date().toISOString() },
    { id: 3, nombre: '4PRO', color_marca: '#FF4D6A', activo: true, created_at: new Date().toISOString() },
    { id: 4, nombre: 'FORNITURA', color_marca: '#6C63FF', activo: true, created_at: new Date().toISOString() },
    { id: 5, nombre: 'VILLAS CORALIA', color_marca: '#00D4AA', activo: true, created_at: new Date().toISOString() },
    { id: 6, nombre: 'VILLAS PEZ VELA', color_marca: '#FF4D6A', activo: true, created_at: new Date().toISOString() }
  ],
  usuarios: [],
  redes_sociales: [],
  contactos: [],
  conversaciones: [],
  mensajes: []
};

// Ensure data directory and file exist
export async function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  if (!fs.existsSync(DB_FILE)) {
    // Generate hashed password for test users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin2024!', salt);
    const sellerPassword = await bcrypt.hash('Seller2024!', salt);

    initialData.usuarios = [
      { 
        id: 1, 
        empresa_id: null, 
        nombre: 'Admin', 
        apellido: 'System', 
        email: 'admin@chatcrm.com', 
        password_hash: adminPassword, 
        rol: 'admin', 
        activo: true, 
        created_at: new Date().toISOString() 
      }
    ];

    // Helper to generate users
    const generateUsers = (empresaId: number, count: number, prefix: string) => {
      for (let i = 1; i <= count; i++) {
        initialData.usuarios.push({
          id: initialData.usuarios.length + 1,
          empresa_id: empresaId,
          nombre: `${prefix} ${i}`,
          apellido: 'Vendedor',
          email: `${prefix.toLowerCase()}${i}@test.com`,
          password_hash: sellerPassword,
          rol: 'vendedor',
          activo: true,
          created_at: new Date().toISOString()
        });
      }
    };

    generateUsers(1, 25, 'Racepoint');
    generateUsers(2, 12, 'Wylco');
    generateUsers(3, 6, 'Pro4');
    generateUsers(4, 7, 'Fornitura');
    generateUsers(5, 1, 'Coralia');

    // Sample Social Networks for Racepoint 1 (Juan Perez equivalent)
    initialData.redes_sociales = [
      { id: 1, vendedor_id: 2, tipo: 'whatsapp', usuario_red: '+506 8888-8888', estado: 'conectada', ultima_sync: new Date().toISOString() },
      { id: 2, vendedor_id: 2, tipo: 'instagram', usuario_red: '@racepoint_official', estado: 'conectada', ultima_sync: new Date().toISOString() },
      { id: 3, vendedor_id: 2, tipo: 'telegram', usuario_red: '@racepoint_bot', estado: 'conectada', ultima_sync: new Date().toISOString() }
    ];

    // Sample Contacts
    initialData.contactos = [
      { id: 1, vendedor_id: 2, empresa_id: 1, nombre: 'Juan Pérez', red_social: 'whatsapp', etiqueta: 'lead', created_at: new Date().toISOString() },
      { id: 2, vendedor_id: 2, empresa_id: 1, nombre: 'María García', red_social: 'instagram', etiqueta: 'vip', created_at: new Date().toISOString() }
    ];

    // Sample Conversations
    initialData.conversaciones = [
      { id: 1, contacto_id: 1, vendedor_id: 2, red_social_id: 1, estado: 'pendiente', ultimo_mensaje: '¿Tienen disponibilidad en Villas Coralia?', ultimo_mensaje_fecha: new Date().toISOString(), no_leidos: 1 },
      { id: 2, contacto_id: 2, vendedor_id: 2, red_social_id: 2, estado: 'respondida', ultimo_mensaje: 'Me interesa el catálogo de Fornitura...', ultimo_mensaje_fecha: new Date().toISOString(), no_leidos: 0 }
    ];

    // Sample Messages
    initialData.mensajes = [
      { id: 1, conversacion_id: 1, remitente: 'contacto', contenido: 'Hola, ¿Tienen disponibilidad en Villas Coralia?', tipo: 'texto', leido: false, created_at: new Date().toISOString() },
      { id: 2, conversacion_id: 2, remitente: 'contacto', contenido: 'Me interesa el catálogo de Fornitura...', tipo: 'texto', leido: true, created_at: new Date().toISOString() },
      { id: 3, conversacion_id: 2, remitente: 'vendedor', contenido: 'Hola María, claro que sí. Te adjunto el catálogo.', tipo: 'texto', leido: true, created_at: new Date().toISOString() }
    ];

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

export function getData() {
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(content);
}

export function saveData(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

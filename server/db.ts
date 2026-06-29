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

    // Helper to generate users and their networks/chats
    const populateSellers = (empresaId: number, count: number, prefix: string, serviceInfo: string) => {
      const types = ['whatsapp', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram'];
      
      for (let i = 1; i <= count; i++) {
        const userId = initialData.usuarios.length + 1;
        initialData.usuarios.push({
          id: userId,
          empresa_id: empresaId,
          nombre: `${prefix} ${i}`,
          apellido: 'Vendedor',
          email: `${prefix.toLowerCase().replace(/\s+/g, '')}${i}@test.com`,
          password_hash: sellerPassword,
          rol: 'vendedor',
          activo: true,
          created_at: new Date().toISOString()
        });

        // Add all 6 networks for every seller
        types.forEach((type, index) => {
          const redId = initialData.redes_sociales.length + 1;
          initialData.redes_sociales.push({
            id: redId,
            vendedor_id: userId,
            tipo: type as any,
            usuario_red: `${prefix} ${type} ${i}`,
            estado: 'conectada',
            ultima_sync: new Date().toISOString()
          });

          // Add a sample chat for the first 2 networks of the first seller of each company
          if (i === 1 && index < 2) {
            const contactId = initialData.contactos.length + 1;
            const convId = initialData.conversaciones.length + 1;
            
            initialData.contactos.push({
              id: contactId,
              vendedor_id: userId,
              empresa_id: empresaId,
              nombre: `Cliente ${type.toUpperCase()}`,
              red_social: type as any,
              etiqueta: 'prospecto',
              created_at: new Date().toISOString()
            });

            initialData.conversaciones.push({
              id: convId,
              contacto_id: contactId,
              vendedor_id: userId,
              red_social_id: redId,
              estado: 'pendiente',
              ultimo_mensaje: `Consulta sobre ${serviceInfo} vía ${type}`,
              ultimo_mensaje_fecha: new Date().toISOString(),
              no_leidos: 1
            });

            initialData.mensajes.push({
              id: initialData.mensajes.length + 1,
              conversacion_id: convId,
              remitente: 'contacto',
              contenido: `Hola, me interesa saber más sobre ${serviceInfo}.`,
              tipo: 'texto',
              leido: false,
              created_at: new Date().toISOString()
            });
          }
        });
      }
    };

    populateSellers(1, 25, 'Racepoint', 'ropa de motoristas y cascos AGV');
    populateSellers(2, 12, 'Wylco', 'sistemas de Car Audio y pantallas');
    populateSellers(3, 6, 'Pro4', 'accesorios 4x4 y snorkels');
    populateSellers(4, 7, 'Fornitura', 'muebles premium y sofás modulares');
    populateSellers(5, 1, 'Villas Coralia', 'villas tipo chalet en el puerto');
    populateSellers(6, 1, 'Villas Pez Vela', 'chalets exclusivos frente al mar');

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

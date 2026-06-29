import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { initDB, getData, saveData } from './server/db';

const JWT_SECRET = process.env.JWT_SECRET || 'chatcrm_pro_secret_key_2024';

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
      (req as any).user = user;
      next();
    });
  };

  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Acceso denegado: Se requiere rol Admin' });
    }
    next();
  };

  // --- API Routes ---

  // POST /api/auth/login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getData();
    const user = db.usuarios.find((u: any) => u.email === email && u.activo);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol, empresa_id: user.empresa_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword
      },
      message: 'Login exitoso'
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const db = getData();
    const user = db.usuarios.find((u: any) => u.id === (req as any).user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const { password_hash, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  });

  // Example Protected Route for Admin
  app.get('/api/admin/empresas', authenticateToken, isAdmin, (req, res) => {
    const db = getData();
    // Add seller counts
    const enriched = db.empresas.map((e: any) => {
      const count = db.usuarios.filter((u: any) => u.empresa_id === e.id && u.rol === 'vendedor').length;
      return { ...e, vendedores_count: count };
    });
    res.json({ success: true, data: enriched });
  });

  app.get('/api/admin/empresa/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const empresa = db.empresas.find((e: any) => e.id === parseInt(id));
    if (!empresa) return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    res.json({ success: true, data: empresa });
  });

  app.get('/api/admin/empresa/:id/vendedores', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const vendedores = db.usuarios.filter((u: any) => u.empresa_id === parseInt(id) && u.rol === 'vendedor');
    res.json({ success: true, data: vendedores });
  });

  app.get('/api/admin/vendedor/:id', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const vendedor = db.usuarios.find((u: any) => u.id === parseInt(id) && u.rol === 'vendedor');
    if (!vendedor) return res.status(404).json({ success: false, message: 'Vendedor no encontrado' });
    
    const { password_hash, ...vendedorWithoutPassword } = vendedor;
    res.json({ success: true, data: vendedorWithoutPassword });
  });

  app.get('/api/admin/vendedor/:id/redes', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const redes = db.redes_sociales.filter((r: any) => r.vendedor_id === parseInt(id));
    res.json({ success: true, data: redes });
  });

  app.get('/api/admin/vendedor/:id/chats', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const conversations = db.conversaciones.filter((c: any) => c.vendedor_id === parseInt(id));
    
    // Enrich conversations with contact and red social info
    const enriched = conversations.map((c: any) => {
      const contacto = db.contactos.find((contact: any) => contact.id === c.contacto_id);
      const red = db.redes_sociales.find((r: any) => r.id === c.red_social_id);
      return { ...c, contacto, red_social: red };
    });
    
    res.json({ success: true, data: enriched });
  });

  app.get('/api/admin/conversacion/:id/mensajes', authenticateToken, (req, res) => {
    const { id } = req.params;
    const db = getData();
    const mensajes = db.mensajes.filter((m: any) => m.conversacion_id === parseInt(id));
    res.json({ success: true, data: mensajes });
  });

  // --- Vite / Production Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

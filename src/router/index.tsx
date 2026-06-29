import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import { ProtectedRoute } from '../components/layout/Layout';
import Empresas from '../pages/admin/Empresas';
import CompanyDetail from '../pages/admin/CompanyDetail';
import SellerDashboardAdmin from '../pages/admin/SellerDashboard';

// Placeholder pages for the routes
const AdminDashboard = () => (
  <div>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Resumen Ejecutivo</h1>
      <div className="flex gap-3">
        <button className="btn-secondary">Descargar Reporte</button>
        <button className="btn-primary">Nueva Campaña AI</button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Conversaciones Activas</h3>
        <p className="text-3xl font-bold">1,284</p>
        <p className="text-xs text-success mt-2 font-medium">+12% este mes</p>
      </div>
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Empresas Operativas</h3>
        <p className="text-3xl font-bold">6</p>
        <p className="text-xs text-text-muted mt-2 font-medium">Capacidad 100%</p>
      </div>
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Tasa de Respuesta IA</h3>
        <p className="text-3xl font-bold">84.2%</p>
        <p className="text-xs text-success mt-2 font-medium">+5.4% Eficiencia</p>
      </div>
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Vendedores Conectados</h3>
        <p className="text-3xl font-bold">42 / 300</p>
        <p className="text-xs text-success mt-2 font-medium">● Live Now</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 stat-card p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-semibold">Últimos Chats Intervenidos</h3>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded">IA ACTIVA</span>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { name: 'Juan Pérez', red: 'WhatsApp', msg: '¿Tienen disponibilidad en Villas Coralia?', status: 'Respondido por IA', time: '2 min', color: '#25D366' },
            { name: 'María García', red: 'Instagram', msg: 'Me interesa el catálogo de Fornitura...', status: 'Pendiente Humano', time: '5 min', color: '#E1306C' },
            { name: 'Carlos Ruiz', red: 'Telegram', msg: 'Confirmación de pedido 4PRO #992', status: 'Cerrado', time: '12 min', color: '#0088CC' },
          ].map((chat, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {chat.name} <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 uppercase" style={{ color: chat.color }}>{chat.red}</span>
                </div>
                <p className="text-xs text-text-muted truncate max-w-xs">{chat.msg}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${chat.status === 'Respondido por IA' ? 'text-success' : chat.status === 'Pendiente Humano' ? 'text-primary' : 'text-text-muted'}`}>{chat.status}</p>
                <p className="text-[10px] text-text-muted">Hace {chat.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="stat-card">
        <h3 className="font-semibold mb-6">Estado por Empresa</h3>
        <div className="space-y-3">
          {[
            { name: 'RACEPOINT', v: 12, p: '98%', c: '#6C63FF' },
            { name: 'WYLCO', v: 8, p: '92%', c: '#00D4AA' },
            { name: '4PRO', v: 5, p: '64%', c: '#FF4D6A' },
            { name: 'FORNITURA', v: 7, p: '88%', c: '#6C63FF' },
            { name: 'VILLAS CORALIA', v: 4, p: '100%', c: '#00D4AA' },
          ].map((emp, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-transparent hover:border-primary transition-all">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 rounded" style={{ backgroundColor: emp.c }} />
                <div>
                  <p className="text-xs font-bold">{emp.name}</p>
                  <p className="text-[10px] text-text-muted">{emp.v} Vendedores</p>
                </div>
              </div>
              <span className="text-xs text-success font-medium">{emp.p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SellerDashboard = () => (
  <div>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Panel de Vendedor</h1>
      <button className="btn-primary">Nueva Conversación</button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Mis Chats Pendientes</h3>
        <p className="text-3xl font-bold text-danger">5</p>
        <p className="text-xs text-text-muted mt-2 font-medium">Requieren atención inmediata</p>
      </div>
      <div className="stat-card">
        <h3 className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Redes Conectadas</h3>
        <p className="text-3xl font-bold text-success">3 / 6</p>
        <p className="text-xs text-text-muted mt-2 font-medium">WhatsApp, IG, Telegram</p>
      </div>
    </div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/empresas" element={<Empresas />} />
          <Route path="/admin/empresa/:id" element={<CompanyDetail />} />
          <Route path="/admin/vendedor/:id" element={<SellerDashboardAdmin />} />
          <Route path="/admin/vendedores" element={<div>Gestión de Vendedores</div>} />
        </Route>

        {/* Seller Routes */}
        <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
          <Route path="/vendedor/dashboard" element={<SellerDashboard />} />
          <Route path="/vendedor/chats" element={<div>Mis Chats</div>} />
          <Route path="/vendedor/redes" element={<div>Configuración de Redes</div>} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

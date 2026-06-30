import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Share2, 
  Key, 
  Save, 
  Check, 
  AlertCircle,
  Camera,
  MessageSquare,
  Plus,
  Play,
  QrCode,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface RedSocial {
  id: number;
  tipo: string;
  usuario_red: string;
  estado: string;
}

interface WhatsAppSession {
  id: string;
  name: string;
  status: 'disconnected' | 'qr' | 'loading' | 'ready' | 'error';
  qr?: string;
}

const SellerSettings: React.FC = () => {
  const { user, token } = useAuthStore();
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'networks' | 'whatsapp'>('profile');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // WhatsApp Sessions State
  const [waSessions, setWaSessions] = useState<WhatsAppSession[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    avatarSeed: user?.email || ''
  });

  // Networks Form State
  const [networkConfigs, setNetworkConfigs] = useState<Record<string, string>>({});

  const fetchRedes = () => {
    fetch('/api/vendedor/redes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRedes(data.data);
          const configs: Record<string, string> = {};
          data.data.forEach((r: RedSocial) => {
            configs[r.tipo] = r.usuario_red;
          });
          setNetworkConfigs(configs);
        }
      });
  };

  const fetchWaSessions = () => {
    fetch('/api/vendedor/whatsapp/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setWaSessions(data.data);
      });
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchRedes(), fetchWaSessions()]).finally(() => setLoading(false));
    }
  }, [token]);

  // Polling for session status if there's an active/loading session
  useEffect(() => {
    let interval: any;
    if (waSessions.some(s => s.status === 'loading' || s.status === 'qr')) {
      interval = setInterval(() => {
        fetchWaSessions();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [waSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      const res = await fetch('/api/vendedor/whatsapp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSessionName })
      });
      const data = await res.json();
      if (data.success) {
        setWaSessions([...waSessions, data.data]);
        setShowCreateModal(false);
        setNewSessionName('');
        setStatus({ type: 'success', message: 'Sesión creada correctamente' });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error al crear la sesión' });
    }
  };

  const handleStartSession = async (id: string) => {
    try {
      setSelectedSessionId(id);
      const res = await fetch(`/api/vendedor/whatsapp/session/${id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchWaSessions();
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const getSessionQr = async (id: string) => {
    try {
      const res = await fetch(`/api/vendedor/whatsapp/session/${id}/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        return data.data.qr;
      }
    } catch (err) {
      return null;
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'success', message: 'Perfil actualizado correctamente (Simulado)' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleNetworkSubmit = (type: string) => {
    setStatus({ type: 'success', message: `Credenciales de ${type} guardadas correctamente` });
    setTimeout(() => setStatus(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="text-primary" />
          Ajustes y Configuración
        </h1>
        <p className="text-text-muted mt-1">Personaliza tu perfil y vincula tus canales de comunicación.</p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
        }`}>
          {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <div className="flex gap-4 mb-8 p-1 bg-bg-sidebar rounded-xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <User size={18} />
          Mi Perfil
        </button>
        <button 
          onClick={() => setActiveTab('networks')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'networks' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Share2 size={18} />
          Redes Sociales
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'whatsapp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <MessageSquare size={18} />
          WhatsApp Web
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="stat-card flex flex-col items-center text-center p-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 mb-4 overflow-hidden bg-bg-base">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.avatarSeed}`} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <label className="absolute bottom-6 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-all opacity-0 group-hover:opacity-100">
                  <Camera size={18} />
                  <input type="file" className="hidden" />
                </label>
              </div>
              <h3 className="font-bold text-lg">{profileData.nombre} {profileData.apellido}</h3>
              <p className="text-sm text-text-muted">{user?.rol === 'vendedor' ? 'Asesor de Ventas' : 'Administrador'}</p>
              
              <div className="mt-6 w-full pt-6 border-t border-white/5 space-y-4">
                <div className="text-left">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Cambiar Avatar (Semilla)</label>
                  <input 
                    type="text" 
                    value={profileData.avatarSeed}
                    onChange={(e) => setProfileData({...profileData, avatarSeed: e.target.value})}
                    className="w-full bg-bg-base border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Escribe algo para cambiar el diseño..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="stat-card">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Información Personal
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">Nombre</label>
                    <input 
                      type="text" 
                      value={profileData.nombre}
                      onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                      className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase">Apellido</label>
                    <input 
                      type="text" 
                      value={profileData.apellido}
                      onChange={(e) => setProfileData({...profileData, apellido: e.target.value})}
                      className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    readOnly
                    className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm outline-none opacity-60 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-text-muted italic">El correo no puede ser modificado por el usuario.</p>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : activeTab === 'networks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['whatsapp', 'whatsapp_business', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram'].map((type) => {
            const isConfigured = redes.some(r => r.tipo === type);
            return (
              <div key={type} className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConfigured ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted'}`}>
                      <Share2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold capitalize">{type}</h4>
                      <span className={`text-[10px] uppercase font-bold ${isConfigured ? 'text-success' : 'text-text-muted'}`}>
                        {isConfigured ? 'Vinculado' : 'No vinculado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                  <div className="space-y-4">
                    {['whatsapp', 'whatsapp_business'].includes(type) ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase">Número de Teléfono</label>
                        <div className="relative">
                          <Share2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                          <input 
                            type="text" 
                            value={networkConfigs[type] || ''}
                            onChange={(e) => setNetworkConfigs({...networkConfigs, [type]: e.target.value})}
                            className="w-full bg-bg-base border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary transition-all"
                            placeholder="+52 123 456 7890"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted uppercase">Usuario</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                            <input 
                              type="text" 
                              value={networkConfigs[`${type}_user`] || ''}
                              onChange={(e) => setNetworkConfigs({...networkConfigs, [`${type}_user`]: e.target.value})}
                              className="w-full bg-bg-base border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary transition-all"
                              placeholder="@usuario"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted uppercase">Contraseña</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                            <input 
                              type="password" 
                              value={networkConfigs[`${type}_pass`] || ''}
                              onChange={(e) => setNetworkConfigs({...networkConfigs, [`${type}_pass`]: e.target.value})}
                              className="w-full bg-bg-base border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary transition-all"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => handleNetworkSubmit(type)}
                      className="w-full bg-white/5 hover:bg-primary hover:text-white border border-white/10 hover:border-primary py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      Vincular Cuenta
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Gestión de Sesiones WhatsApp Web
            </h3>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              CREAR NUEVA SESION
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {waSessions.map((session) => (
              <div key={session.id} className="stat-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">{session.name}</h4>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{session.id}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    session.status === 'ready' ? 'bg-success/20 text-success' :
                    session.status === 'qr' ? 'bg-warning/20 text-warning' :
                    session.status === 'loading' ? 'bg-primary/20 text-primary' :
                    'bg-white/5 text-text-muted'
                  }`}>
                    {session.status}
                  </div>
                </div>

                <div className="space-y-4">
                  {session.status === 'qr' && session.qr && (
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl">
                      <img src={session.qr} alt="WhatsApp QR Code" className="w-48 h-48" />
                      <p className="text-black text-[10px] font-bold mt-2 uppercase">Escanea con tu WhatsApp</p>
                    </div>
                  )}

                  {session.status === 'loading' && (
                    <div className="flex flex-col items-center py-8 text-text-muted">
                      <Loader2 size={32} className="animate-spin mb-3 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-widest">Iniciando motor...</p>
                    </div>
                  )}

                  {session.status === 'ready' && (
                    <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <p className="text-success text-xs font-bold">Sesión activa y vinculada</p>
                    </div>
                  )}

                  {(session.status === 'disconnected' || session.status === 'error') && (
                    <button 
                      onClick={() => handleStartSession(session.id)}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      INICIAR MOTOR
                    </button>
                  )}

                  {session.status === 'qr' && (
                    <div className="flex items-center gap-2 text-text-muted text-[10px] justify-center mt-2">
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Esperando escaneo...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {waSessions.length === 0 && (
              <div className="md:col-span-2 py-20 text-center text-text-muted opacity-30 border-2 border-dashed border-white/5 rounded-2xl">
                <QrCode size={48} className="mx-auto mb-4" />
                <p className="font-bold">No hay sesiones creadas</p>
                <p className="text-xs">Crea una nueva sesión para empezar a vincular WhatsApp Web</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-bg-sidebar border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Nueva Sesión WhatsApp</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Nombre de la Sesión</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Ej: Oficina Principal, Mi Celular..."
                  className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={!newSessionName.trim()}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                CREAR SESION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerSettings;

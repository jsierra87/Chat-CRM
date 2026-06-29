import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Share2, 
  Circle, 
  ExternalLink, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface RedSocial {
  id: number;
  tipo: string;
  usuario_red: string;
  estado: 'conectada' | 'desconectada' | 'error';
  ultima_sync: string;
}

interface Chat {
  id: number;
  contacto: {
    nombre: string;
    avatar_url?: string;
  };
  red_social: {
    tipo: string;
  };
  ultimo_mensaje: string;
  ultimo_mensaje_fecha: string;
  estado: string;
  no_leidos: number;
}

const SellerDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendedor, setVendedor] = useState<any>(null);
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venderRes, redesRes, chatsRes] = await Promise.all([
          fetch(`/api/admin/vendedor/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/admin/vendedor/${id}/redes`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/admin/vendedor/${id}/chats`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const venderData = await venderRes.json();
        const redesData = await redesRes.json();
        const chatsData = await chatsRes.json();
        
        if (venderData.success) setVendedor(venderData.data);
        if (redesData.success) setRedes(redesData.data);
        if (chatsData.success) setChats(chatsData.data);
      } catch (error) {
        console.error('Error fetching seller details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-text-main mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        <span>Volver</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-2xl">
            {vendedor?.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{vendedor?.nombre} {vendedor?.apellido}</h1>
            <p className="text-text-muted text-sm">{vendedor?.email} • Vendedor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold flex items-center gap-1">
            <Circle size={8} className="fill-success" />
            VENDEDOR ACTIVO
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Social Networks Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Share2 size={18} className="text-primary" />
                Redes Conectadas
              </h3>
              <span className="text-xs text-text-muted font-bold uppercase">{redes.length} / 6</span>
            </div>
            <div className="space-y-3">
              {['whatsapp', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram'].map((type) => {
                const red = redes.find(r => r.tipo === type);
                return (
                  <div key={type} className="p-3 bg-bg-base/50 rounded-xl border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${red ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted'}`}>
                        <Share2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold capitalize">{type}</p>
                        <p className="text-[10px] text-text-muted">{red ? red.usuario_red : 'No configurado'}</p>
                      </div>
                    </div>
                    {red ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-success font-bold uppercase">Live</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-text-muted uppercase font-bold">Offline</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                  <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/5 last:hidden" />
                  <div className="w-3 h-3 rounded-full bg-primary/40 border border-primary mt-1 relative z-10" />
                  <div>
                    <p className="text-xs text-text-main font-medium">Conversación respondida</p>
                    <p className="text-[10px] text-text-muted">Hace {i * 5 + 2} minutos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chats Section */}
        <div className="lg:col-span-2">
          <div className="stat-card h-full flex flex-col p-0 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Conversaciones Activas
              </h3>
              <div className="flex gap-2">
                <button className="text-xs bg-bg-base px-3 py-1.5 rounded-lg border border-white/10 text-text-muted hover:text-text-main transition-colors">Filtrar</button>
                <button className="text-xs bg-primary px-3 py-1.5 rounded-lg text-white font-bold transition-all shadow-lg shadow-primary/20">Nuevo Chat</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {chats.map((chat) => (
                <div key={chat.id} className="p-4 hover:bg-white/3 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold">
                      {chat.contacto.nombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          {chat.contacto.nombre}
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded uppercase tracking-wider text-text-muted">
                            {chat.red_social.tipo}
                          </span>
                        </h4>
                        <span className="text-[10px] text-text-muted">{new Date(chat.ultimo_mensaje_fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-text-muted truncate group-hover:text-text-main transition-colors">
                        {chat.ultimo_mensaje}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {chat.no_leidos > 0 && (
                        <span className="w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {chat.no_leidos}
                        </span>
                      )}
                      <div className={`text-[10px] font-bold uppercase ${chat.estado === 'pendiente' ? 'text-danger' : 'text-success'}`}>
                        {chat.estado}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {chats.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                  <MessageSquare size={40} className="mb-4 opacity-20" />
                  <p>No hay conversaciones activas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

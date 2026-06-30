import React, { useEffect, useState, useRef } from 'react';
import { 
  MessageSquare, 
  Share2, 
  Circle, 
  Clock,
  Send,
  X,
  FilterX,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface RedSocial {
  id: number;
  tipo: string;
  usuario_red: string;
  estado: 'conectada' | 'desconectada' | 'error';
  ultima_sync: string;
}

interface Message {
  id: number;
  conversacion_id: number;
  remitente: string;
  contenido: string;
  tipo: string;
  created_at: string;
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

const Comunicaciones: React.FC = () => {
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { token, user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = async () => {
    try {
      const [redesRes, chatsRes] = await Promise.all([
        fetch('/api/vendedor/redes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/vendedor/chats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const redesData = await redesRes.json();
      const chatsData = await chatsRes.json();
      
      if (redesData.success) setRedes(redesData.data);
      if (chatsData.success) setChats(chatsData.data);
    } catch (error) {
      console.error('Error fetching communications data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/admin/conversacion/${chatId}/mensajes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversacion/${selectedChat.id}/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contenido: newMessage })
      });
      
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        fetchData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const unreadPerNetwork = chats.reduce((acc, chat) => {
    const type = chat.red_social.tipo;
    acc[type] = (acc[type] || 0) + chat.no_leidos;
    return acc;
  }, {} as Record<string, number>);

  const filteredChats = filterNetwork 
    ? chats.filter(chat => chat.red_social.tipo === filterNetwork)
    : chats;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="text-primary" />
            Comunicaciones
          </h1>
          <p className="text-text-muted text-sm mt-1">Gestiona tus conversaciones de todas las redes sociales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Social Networks Section */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Share2 size={18} className="text-primary" />
                Mis Redes
              </h3>
              <div className="flex items-center gap-2">
                {filterNetwork && (
                  <button 
                    onClick={() => setFilterNetwork(null)}
                    className="p-1 hover:bg-white/10 rounded-md text-danger transition-colors"
                    title="Limpiar filtro"
                  >
                    <FilterX size={14} />
                  </button>
                )}
                <span className="text-xs text-text-muted font-bold uppercase">{redes.filter(r => r.estado === 'conectada').length} Activas</span>
              </div>
            </div>
            <div className="space-y-3">
              {['whatsapp', 'whatsapp_business', 'instagram', 'facebook', 'messenger', 'tiktok', 'telegram'].map((type) => {
                const red = redes.find(r => r.tipo === type);
                const isActiveFilter = filterNetwork === type;
                const unreadCount = unreadPerNetwork[type] || 0;
                return (
                  <div 
                    key={type} 
                    onClick={() => red && setFilterNetwork(isActiveFilter ? null : type)}
                    className={`
                      p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between
                      ${red ? 'bg-bg-base/50 border-white/5 hover:border-primary/40' : 'bg-white/2 border-white/5 opacity-60 cursor-not-allowed'}
                      ${isActiveFilter ? 'border-primary ring-1 ring-primary/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${red ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-muted'}`}>
                        <Share2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold capitalize">{type}</p>
                        <p className="text-[10px] text-text-muted truncate max-w-[120px]">{red ? red.usuario_red : 'No configurado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <div className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </div>
                      )}
                      {red ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-success font-bold uppercase">Live</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted uppercase font-bold">Offline</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chats Section */}
        <div className="lg:col-span-2">
          <div className="stat-card h-full flex flex-col p-0 overflow-hidden min-h-[500px]">
            {selectedChat ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedChat(null)}
                      className="p-2 hover:bg-white/10 rounded-full text-text-muted transition-colors lg:hidden"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat.contacto.nombre}`} 
                        alt="Contact Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{selectedChat.contacto.nombre}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-success uppercase font-bold">
                        <div className="w-1 h-1 rounded-full bg-success" />
                        Online • {selectedChat.red_social.tipo}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="p-2 hover:bg-white/10 rounded-full text-text-muted transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 bg-black/10"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.remitente === 'contacto' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`
                        max-w-[80%] p-3 rounded-2xl text-sm shadow-sm
                        ${msg.remitente === 'contacto' 
                          ? 'bg-bg-sidebar border border-white/5 text-text-main rounded-tl-none' 
                          : 'bg-primary text-white rounded-tr-none'}
                      `}>
                        <p>{msg.contenido}</p>
                        <p className="text-[9px] mt-1 opacity-60 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/2 flex gap-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 transition-all"
                  >
                    <Send size={18} className={sending ? 'animate-pulse' : ''} />
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" />
                    Conversaciones Activas
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                  {filteredChats.map((chat) => (
                    <div 
                      key={chat.id} 
                      onClick={() => handleSelectChat(chat)}
                      className="p-4 hover:bg-white/3 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-bold overflow-hidden shrink-0">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.contacto.nombre}`} 
                            alt="Contact Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                              {chat.contacto.nombre}
                              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded uppercase text-text-muted">
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
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredChats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-text-muted opacity-30">
                      <MessageSquare size={40} className="mb-4" />
                      <p>No hay conversaciones activas</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comunicaciones;

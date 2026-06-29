import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessageSquare, 
  Share2, 
  LogOut,
  User as UserIcon,
  Circle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Empresa {
  id: number;
  nombre: string;
  color_marca: string;
  vendedores_count?: number;
}

const Sidebar: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [empresasOpen, setEmpresasOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    if (user?.rol === 'admin' && token) {
      fetch('/api/admin/empresas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setEmpresas(data.data);
        });
    }
  }, [user?.rol, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  ];

  const sellerMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/vendedor/dashboard' },
    { name: 'Mis Chats', icon: MessageSquare, path: '/vendedor/chats' },
    { name: 'Redes Sociales', icon: Share2, path: '/vendedor/redes' },
  ];

  return (
    <aside className="w-60 bg-bg-sidebar flex flex-col h-screen shadow-xl border-r border-white/5">
      <div className="py-8 px-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
          C
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white uppercase">
          CHATCRM <span className="text-primary">PRO</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {(user?.rol === 'admin' ? adminMenu : sellerMenu).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm
              ${isActive 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-text-muted hover:bg-white/3 hover:text-text-main'}
            `}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {user?.rol === 'admin' && (
          <div className="space-y-1">
            <button
              onClick={() => setEmpresasOpen(!empresasOpen)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-sm
                ${empresasOpen ? 'text-text-main' : 'text-text-muted hover:bg-white/3 hover:text-text-main'}
              `}
            >
              <div className="flex items-center gap-3">
                <Building2 size={18} />
                <span>Empresas</span>
              </div>
              {empresasOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {empresasOpen && (
              <div className="pl-9 pr-2 space-y-1">
                {empresas.map((emp) => (
                  <NavLink
                    key={emp.id}
                    to={`/admin/empresa/${emp.id}`}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-all
                      ${isActive 
                        ? 'text-primary font-medium bg-primary/5' 
                        : 'text-text-muted hover:text-text-main hover:bg-white/2'}
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: emp.color_marca }} />
                      <span className="truncate">{emp.nombre}</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-text-muted shrink-0">
                      {emp.vendedores_count || 0}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}

            <NavLink
              to="/admin/vendedores"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-text-muted hover:bg-white/3 hover:text-text-main'}
              `}
            >
              <Users size={18} />
              <span>Vendedores</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-6 bg-black/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-base border-2 border-primary flex items-center justify-center overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={18} className="text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-main truncate">{user?.nombre || 'Admin'}</p>
          <p className="text-xs text-text-muted capitalize">Admin</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-text-muted hover:text-danger transition-colors p-1"
          title="Cerrar Sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

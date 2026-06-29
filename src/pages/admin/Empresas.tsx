import React, { useEffect, useState } from 'react';
import { Building2, Plus, MoreVertical, Search, Globe, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Empresa {
  id: number;
  nombre: string;
  color_marca: string;
  activo: boolean;
  created_at: string;
}

const Empresas: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await fetch('/api/admin/empresas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setEmpresas(data.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Empresas</h1>
          <p className="text-text-muted text-sm">Administra las organizaciones registradas en el sistema</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Nueva Empresa</span>
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Buscar empresa por nombre..." 
            className="w-full bg-bg-sidebar border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="stat-card hover:border-primary/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: empresa.color_marca }}
                >
                  {empresa.nombre.charAt(0)}
                </div>
                <button className="text-text-muted hover:text-text-main p-1">
                  <MoreVertical size={18} />
                </button>
              </div>

              <h3 className="text-lg font-bold mb-1">{empresa.nombre}</h3>
              <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
                <Globe size={12} />
                <span>ID: {empresa.id.toString().padStart(3, '0')}</span>
                <span className="mx-1">•</span>
                <span className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${empresa.activo ? 'bg-success' : 'bg-danger'}`} />
                  {empresa.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <div className="p-2 bg-white/3 rounded-lg text-center">
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Vendedores</p>
                  <div className="flex items-center justify-center gap-1 font-semibold text-sm">
                    <Users size={14} className="text-primary" />
                    <span>--</span>
                  </div>
                </div>
                <div className="p-2 bg-white/3 rounded-lg text-center">
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Color Marca</p>
                  <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: empresa.color_marca }} />
                    <span>{empresa.color_marca}</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-2 rounded-lg bg-white/3 hover:bg-primary text-white text-sm font-semibold transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                Gestionar Empresa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Empresas;

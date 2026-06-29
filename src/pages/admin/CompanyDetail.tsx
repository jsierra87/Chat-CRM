import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Search, Mail, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  avatar_url?: string;
}

interface Empresa {
  id: number;
  nombre: string;
  color_marca: string;
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, vendRes] = await Promise.all([
          fetch(`/api/admin/empresa/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/admin/empresa/${id}/vendedores`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const empData = await empRes.json();
        const vendData = await vendRes.json();
        
        if (empData.success) setEmpresa(empData.data);
        if (vendData.success) setVendedores(vendData.data);
      } catch (error) {
        console.error('Error fetching company details:', error);
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
        onClick={() => navigate('/admin/empresas')}
        className="flex items-center gap-2 text-text-muted hover:text-text-main mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        <span>Volver a Empresas</span>
      </button>

      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl"
            style={{ backgroundColor: empresa?.color_marca }}
          >
            {empresa?.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{empresa?.nombre}</h1>
            <div className="flex items-center gap-2 text-text-muted text-sm mt-1">
              <Users size={16} />
              <span>{vendedores.length} Vendedores asignados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Buscar vendedor por nombre o email..." 
          className="w-full bg-bg-sidebar border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendedores.map((vendedor) => (
          <div 
            key={vendedor.id} 
            onClick={() => navigate(`/admin/vendedor/${vendedor.id}`)}
            className="bg-bg-sidebar p-4 rounded-xl border border-white/5 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
              {vendedor.avatar_url ? (
                <img src={vendedor.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                vendedor.nombre.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                {vendedor.nombre} {vendedor.apellido}
              </h3>
              <p className="text-xs text-text-muted truncate flex items-center gap-1">
                <Mail size={12} />
                {vendedor.email}
              </p>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      {vendedores.length === 0 && (
        <div className="text-center py-20 bg-bg-sidebar rounded-2xl border border-white/5 border-dashed">
          <Users size={48} className="mx-auto text-text-muted/30 mb-4" />
          <p className="text-text-muted">No hay vendedores registrados para esta empresa.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;

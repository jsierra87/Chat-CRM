import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Building2, 
  UserPlus,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Seller {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  empresa_id: number;
  empresa_nombre: string;
  activo: boolean;
}

interface Company {
  id: number;
  nombre: string;
}

const Sellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    empresa_id: ''
  });

  const { token } = useAuthStore();

  const fetchData = async () => {
    try {
      const [sellersRes, companiesRes] = await Promise.all([
        fetch('/api/admin/vendedores', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/empresas', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const sellersData = await sellersRes.json();
      const companiesData = await companiesRes.json();
      
      if (sellersData.success) setSellers(sellersData.data);
      if (companiesData.success) setCompanies(companiesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingSeller ? `/api/admin/vendedores/${editingSeller.id}` : '/api/admin/vendedores';
    const method = editingSeller ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingSeller(null);
        setFormData({ nombre: '', apellido: '', email: '', password: '', empresa_id: '' });
        fetchData();
      } else {
        alert(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este vendedor?')) return;
    
    try {
      const res = await fetch(`/api/admin/vendedores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
    }
  };

  const openEditModal = (seller: Seller) => {
    setEditingSeller(seller);
    setFormData({
      nombre: seller.nombre,
      apellido: seller.apellido,
      email: seller.email,
      password: '', // Password not editable in this view for simplicity
      empresa_id: seller.empresa_id.toString()
    });
    setShowModal(true);
  };

  const filteredSellers = sellers.filter(s => 
    `${s.nombre} ${s.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-primary" />
            Gestión de Vendedores
          </h1>
          <p className="text-text-muted mt-1">Administra los accesos y asignaciones de tu equipo de ventas.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSeller(null);
            setFormData({ nombre: '', apellido: '', email: '', password: '', empresa_id: '' });
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <UserPlus size={20} />
          <span>Nuevo Vendedor</span>
        </button>
      </div>

      <div className="bg-bg-sidebar rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-white/2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-base border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 text-text-muted text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Empresa Asignada</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-white/1 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.email}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-text-main group-hover:text-primary transition-colors">
                          {seller.nombre} {seller.apellido}
                        </p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <Mail size={12} />
                          {seller.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 size={16} className="text-primary/60" />
                      <span>{seller.empresa_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      seller.activo 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-danger/10 text-danger border-danger/20'
                    }`}>
                      {seller.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(seller)}
                        className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(seller.id)}
                        className="p-2 hover:bg-danger/10 text-text-muted hover:text-danger rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-text-muted italic">
                    No se encontraron vendedores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-sidebar w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {editingSeller ? <Edit2 size={20} className="text-primary" /> : <UserPlus size={20} className="text-primary" />}
                {editingSeller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-full text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Nombre</label>
                  <input 
                    required
                    type="text" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Ej. Juan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Apellido</label>
                  <input 
                    required
                    type="text" 
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Ej. Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Correo Electrónico</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              {!editingSeller && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Contraseña Temporal</label>
                  <input 
                    required
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Asignar a Empresa</label>
                <select 
                  required
                  value={formData.empresa_id}
                  onChange={(e) => setFormData({...formData, empresa_id: e.target.value})}
                  className="w-full bg-bg-base border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecciona una empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-text-muted hover:text-text-main hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {editingSeller ? 'Guardar Cambios' : 'Crear Vendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { login as loginApi } from '../api/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginApi(email, password);
      login(data.user, data.token);
      
      if (data.user.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vendedor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    // Use a small timeout to ensure state is updated before submission if we were using refs, 
    // but here we just wait for the next render cycle or handle it manually.
    // To make it feel better, we can just call login directly if we wanted, 
    // but filling the form and letting the user click is also fine.
    // Actually, let's just make it auto-login for true "quick access".
  };

  const quickLogin = async (eEmail: string, ePass: string) => {
    setEmail(eEmail);
    setPassword(ePass);
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(eEmail, ePass);
      login(data.user, data.token);
      if (data.user.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vendedor/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 border border-primary/30">
            <MessageSquare size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            CHATCRM <span className="text-primary">PRO</span>
          </h1>
          <p className="text-text-muted font-medium">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="bg-bg-sidebar p-8 rounded-2xl shadow-2xl border border-white/5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-3 text-danger text-sm"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-2">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-text-muted" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-bg-card border border-white/5 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="ejemplo@chatcrm.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-muted mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-text-muted" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-bg-card border border-white/5 rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                'Ingresar Sistema'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 text-center">Acceso Rápido</p>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => quickLogin('admin@chatcrm.com', 'Admin2024!')}
                className="text-xs p-3 rounded-lg bg-white/3 border border-white/5 text-text-main hover:bg-primary/10 hover:border-primary/30 transition-all flex items-center justify-between group"
              >
                <span>Admin Principal</span>
                <span className="text-text-muted group-hover:text-primary font-mono text-[10px]">admin@chatcrm.com</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => quickLogin('juan@racepoint.com', 'Seller2024!')}
                  className="text-xs p-3 rounded-lg bg-white/3 border border-white/5 text-text-main hover:bg-primary/10 hover:border-primary/30 transition-all text-left"
                >
                  <p className="font-semibold">Vendedor 1</p>
                  <p className="text-[10px] text-text-muted">Racepoint</p>
                </button>
                <button 
                  onClick={() => quickLogin('maria@wylco.com', 'Seller2024!')}
                  className="text-xs p-3 rounded-lg bg-white/3 border border-white/5 text-text-main hover:bg-primary/10 hover:border-primary/30 transition-all text-left"
                >
                  <p className="font-semibold">Vendedor 2</p>
                  <p className="text-[10px] text-text-muted">Wylco</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-text-muted">
          © 2024 CHATCRM PRO. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

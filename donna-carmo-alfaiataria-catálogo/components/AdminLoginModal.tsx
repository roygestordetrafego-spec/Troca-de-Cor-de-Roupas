
import React, { useState } from 'react';
import { XIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';

interface AdminLoginModalProps {
  onLogin: (success: boolean) => void;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLogin, onClose }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Busca credenciais salvas ou usa o padrão inicial
    const savedCredentials = localStorage.getItem('admin_credentials');
    const credentials = savedCredentials 
      ? JSON.parse(savedCredentials) 
      : { user: 'admin', pass: 'admin123' };

    if (user === credentials.user && password === credentials.pass) {
      onLogin(true);
      setError('');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-stone-900"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
            <LockIcon className="w-8 h-8 text-stone-900" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">Painel Administrativo</h2>
          <p className="text-stone-400 text-sm mt-1">Acesso exclusivo para gerenciamento</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Usuário</label>
            <input 
              type="text" 
              required
              autoFocus
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-stone-900/10 outline-none transition-all"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-stone-900/10 outline-none transition-all pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center font-medium animate-bounce">{error}</p>
          )}

          <button 
            type="submit" 
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg uppercase tracking-widest text-xs mt-4"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-[10px] text-stone-300 mt-8 uppercase tracking-widest">
          Donna Carmo Alfaiataria &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default AdminLoginModal;

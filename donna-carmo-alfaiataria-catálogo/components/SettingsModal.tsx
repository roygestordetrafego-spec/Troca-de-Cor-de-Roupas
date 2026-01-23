
import React, { useState, useEffect } from 'react';
import { XIcon, CogIcon, CheckIcon, EyeIcon, EyeOffIcon, InstagramIcon } from './Icons';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const savedInsta = localStorage.getItem('company_instagram');
    if (savedInsta) setInstagramLink(savedInsta);
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Busca credenciais atuais
    const savedCredentials = localStorage.getItem('admin_credentials');
    const credentials = savedCredentials 
      ? JSON.parse(savedCredentials) 
      : { user: 'admin', pass: 'admin123' };

    // Validações
    if (currentPass !== credentials.pass) {
      setMessage({ type: 'error', text: 'A senha atual está incorreta.' });
      return;
    }

    if (newPass && newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    // Atualiza credenciais se houver mudanças
    const updatedCredentials = {
      user: newUser || credentials.user,
      pass: newPass || credentials.pass
    };
    localStorage.setItem('admin_credentials', JSON.stringify(updatedCredentials));

    // Atualiza link do instagram
    localStorage.setItem('company_instagram', instagramLink);

    setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
    
    // Dispara evento customizado para que o App saiba que mudou
    window.dispatchEvent(new Event('company_settings_updated'));

    // Limpa campos sensíveis
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh] no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
            <CogIcon className="w-5 h-5 text-stone-900" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Configurações Gerais</h2>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <section className="space-y-4">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Redes Sociais</h3>
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2">
                    <InstagramIcon className="w-3 h-3" /> Link do Instagram
                  </label>
                  <input 
                    type="url" 
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10"
                    placeholder="https://instagram.com/donna.carmo"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                  />
               </div>
            </section>

            <div className="h-px bg-stone-100 my-4" />

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Conta Administrativa</h3>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Novo Usuário (opcional)</label>
                <input 
                  type="text" 
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10"
                  placeholder="Mantenha vazio para não alterar"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? "text" : "password"} 
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 pr-12"
                    placeholder="Digite a nova senha"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showNewPass ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Confirmar Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? "text" : "password"} 
                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 pr-12"
                    placeholder="Confirme a nova senha"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showConfirmPass ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </section>

            <div className="h-px bg-stone-100 my-4" />

            <section>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-2">Senha Atual (para salvar)</label>
              <div className="relative">
                <input 
                  type={showCurrentPass ? "text" : "password"} 
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-900/10 pr-12"
                  placeholder="Confirme sua senha atual"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showCurrentPass ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </section>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg uppercase tracking-widest text-xs"
          >
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;

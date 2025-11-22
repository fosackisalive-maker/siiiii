import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2, ShieldCheck, Terminal } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (mode === 'login') {
        user = await authService.login(formData.email, formData.password);
      } else {
        user = await authService.signup(formData.email, formData.password, formData.name);
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-gradient" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl" />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors z-10">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm relative group">
              <div className="absolute inset-0 rounded-2xl border border-cyan-500/10 animate-pulse" />
              {mode === 'login' ? (
                <Lock size={28} className="text-cyan-600" />
              ) : (
                <ShieldCheck size={28} className="text-purple-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Access Terminal' : 'Initialize Identity'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {mode === 'login' ? 'Establish secure connection to cloud node.' : 'Create new researcher profile.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-600 text-xs animate-in slide-in-from-top-2">
              <Terminal size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Display Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-purple-500 focus:outline-none transition-colors shadow-sm"
                    placeholder="Agent Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Cloud ID / Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none transition-colors shadow-sm ${mode === 'login' ? 'focus:border-cyan-500' : 'focus:border-purple-500'}`}
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Passcode</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none transition-colors shadow-sm ${mode === 'login' ? 'focus:border-cyan-500' : 'focus:border-purple-500'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg mt-6
                ${mode === 'login' 
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-200' 
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-200'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Authenticating...' : 'Registering...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Establish Connection' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-200">
          {mode === 'login' ? (
            <p>
              New to Sabeer AI?{' '}
              <button 
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-cyan-600 hover:text-cyan-500 font-bold ml-1 hover:underline"
              >
                Initialize Identity
              </button>
            </p>
          ) : (
            <p>
              Already authorized?{' '}
              <button 
                onClick={() => { setMode('login'); setError(''); }}
                className="text-purple-600 hover:text-purple-500 font-bold ml-1 hover:underline"
              >
                Access Terminal
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
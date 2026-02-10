
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, Mail, Plane, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load remembered credentials
    const savedEmail = localStorage.getItem('login_remember_email');
    const savedPass = localStorage.getItem('login_remember_pass');
    
    if (savedEmail) {
      setEmail(savedEmail);
      if (savedPass) setPassword(atob(savedPass)); // Simple decode for UI pre-fill
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (rememberMe) {
        localStorage.setItem('login_remember_email', email);
        localStorage.setItem('login_remember_pass', btoa(password)); // Simple obscure for pre-fill
      } else {
        localStorage.removeItem('login_remember_email');
        localStorage.removeItem('login_remember_pass');
      }

      if (data.session) onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[450px] space-y-8">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-emerald-600 rounded-[2rem] shadow-2xl shadow-emerald-900/20 animate-bounce-slow">
            <Plane size={40} className="text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">TravelLedger Pro</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Agency Accounting Core v4.0</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} className="dark:text-white" />
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  autoComplete="email"
                  required
                  placeholder="name@agency.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                     <input 
                        type="checkbox" 
                        className="peer hidden" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                     />
                     <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all"></div>
                     <CheckCircle2 size={14} className="absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember Password</span>
               </label>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {loading ? 'Verifying...' : 'Unlock System'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Secure Multi-User Accounting Infrastructure
        </p>
      </div>
    </div>
  );
};

// Internal icon for checkbox
const CheckCircle2 = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export default Login;

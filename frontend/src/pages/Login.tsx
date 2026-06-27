import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      
      {/* Background Cinematic Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center p-2 bg-white rounded-3xl shadow-2xl">
               <img src="/ips_logo.jpeg" alt="Intellectual Paradise Services" className="w-full h-full object-contain" />
            </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
          Intellectual Paradise Services
        </h2>
        <p className="mt-4 text-center text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 opacity-80">
          For Prosperous and Positive living
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface/50 backdrop-blur-3xl py-10 px-6 shadow-2xl sm:rounded-[2.5rem] sm:px-12 border border-border/50">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-danger/10 border border-danger/50 text-danger px-5 py-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Identity Vector (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 bg-background border border-border rounded-2xl py-4 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="name@ips.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Access Passkey</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 bg-background border border-border rounded-2xl py-4 text-gray-900 dark:text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center h-16 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primaryHover transition-all disabled:opacity-50 mt-4 group"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <span className="group-hover:scale-105 transition-transform">Initialize Security Protocol</span>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[8px] text-gray-500 font-bold uppercase tracking-widest opacity-40">
            Internal Corporate Access Only &copy; {new Date().getFullYear()} IPS
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Sun, Moon } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Ambient Background Light Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-primary/20 rounded-full blur-[140px] animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-secondary/15 rounded-full blur-[140px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>

      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleTheme} 
          className="p-3 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border text-gray-500 hover:text-primary hover:border-primary/40 transition-all shadow-lg flex items-center gap-2 text-xs font-bold"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} className="text-yellow-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-primary" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Brand Hero Section */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
          
          {/* Logo with Ambient Glow */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-[2rem] p-3 shadow-2xl border border-white/40 flex items-center justify-center animate-float">
              <img 
                src="/ips_logo.jpeg" 
                alt="Intellectual Paradise Services" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>Bharat Career Connect Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Intellectual Paradise <span className="text-primary">Services</span>
            </h1>
            
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mt-2">
              For Prosperous and Positive Living
            </p>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md leading-relaxed hidden sm:block">
            Centralized enterprise management system for departmental operations, hierarchical task distribution, real-time tracking, and role-based access control.
          </p>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start pt-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface/70 border border-border/80 text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-md">
              <CheckCircle2 size={14} className="text-secondary shrink-0" />
              <span>Role-Based Permissions</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface/70 border border-border/80 text-[11px] font-bold text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-md">
              <ShieldCheck size={14} className="text-primary shrink-0" />
              <span>Encrypted Passkeys</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6 animate-in fade-in slide-in-from-right-6 duration-700">
          <div className="bg-surface/80 dark:bg-surface/60 backdrop-blur-2xl border border-border/80 dark:border-border/60 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Top Card Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Secure Sign In
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-2 h-2 rounded-full bg-danger shrink-0 animate-ping"></div>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">
                  Corporate Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-background/80 border border-border rounded-2xl text-gray-900 dark:text-white text-xs sm:text-sm placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="name@ips.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">
                  Passkey / Secret
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 bg-background/80 border border-border rounded-2xl text-gray-900 dark:text-white text-xs sm:text-sm placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner font-mono"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 mt-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primaryHover transition-all shadow-xl shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Enter</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-[9px] text-gray-500 uppercase font-bold tracking-widest gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                System Status: Online
              </span>
              <span>&copy; {new Date().getFullYear()} IPS Portal</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

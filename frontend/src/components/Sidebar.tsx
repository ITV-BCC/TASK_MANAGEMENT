import { LayoutDashboard, Users, ListTodo, Building2, LogOut, ChevronRight, Menu, X, UserCircle, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const allNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN', 'EMPLOYEE'] },
  { label: 'Tasks', icon: ListTodo, path: '/dashboard/tasks', roles: ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN', 'EMPLOYEE'] },
  { label: 'Users', icon: Users, path: '/dashboard/users', roles: ['GLOBAL_ADMIN', 'ADMIN'] },
  { label: 'Verticals', icon: Building2, path: '/dashboard/verticals', roles: ['GLOBAL_ADMIN'] },
  { label: 'Profile', icon: UserCircle, path: '/dashboard/profile', roles: ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN', 'EMPLOYEE'] },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'EMPLOYEE';

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden h-16 bg-surface border-b border-border flex items-center justify-between px-6 fixed top-0 w-full z-[100]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
               <img src="/ips_logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <p className="font-black text-gray-900 dark:text-white text-xs">I.P.S. Management</p>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-primary transition-all bg-background border border-border rounded-xl">
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-500 hover:text-primary transition-all bg-background border border-border rounded-xl">
                {isOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
      </div>

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 bg-surface border-r border-border flex flex-col z-[101] transition-transform duration-300 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        {/* Logo Section */}
        <div className="p-7 hidden lg:block">
          <div className="flex flex-col gap-4">
            <div className="w-20 h-20 flex items-center justify-center mx-auto scale-125">
              <img src="/ips_logo.jpeg" alt="Intellectual Paradise Services" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="font-black text-gray-900 dark:text-white text-sm tracking-tighter leading-tight">Intellectual Paradise Services</p>
              <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1 italic">For Prosperous and Positive living</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-16 lg:pt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="opacity-30" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area with Theme Toggle & User */}
        <div className="p-6 border-t border-border bg-background/30 backdrop-blur-3xl">
          {/* Theme Toggle Desktop */}
          <button 
            onClick={toggleTheme}
            className="w-full h-10 mb-4 flex items-center justify-center gap-3 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all"
          >
            {theme === 'dark' ? <><Sun size={14} /> Bright Mode</> : <><Moon size={14} /> Stealth Mode</>}
          </button>

          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black ring-4 ring-primary/5">
              {user.first_name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-gray-900 dark:text-white text-[13px] font-bold truncate">{user.first_name || 'User'}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-3 border border-danger/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-danger/70 hover:bg-danger hover:text-white transition-all shadow-xl shadow-danger/5"
          >
            <LogOut size={16} />
            Exit System
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}

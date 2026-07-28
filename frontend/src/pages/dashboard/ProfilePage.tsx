import { useState } from 'react';
import { User, Lock, Mail, Shield, Save, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

export default function ProfilePage() {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPwd, setShowPwd] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Update Profile Info
      await api.put(`/users/${user.id}`, {
        first_name: form.first_name,
        role: user.role,
        vertical_id: user.vertical_id,
        is_active: true
      });

      // 2. Update Password if provided
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          alert('New passwords do not match');
          setLoading(false);
          return;
        }
        if (!form.currentPassword) {
          alert('Current password is required to set a new password');
          setLoading(false);
          return;
        }
        await api.put(`/users/change-password`, { 
          current_password: form.currentPassword, 
          new_password: form.newPassword 
        });
      }

      setSuccess(true);
      // Update session storage
      const updatedUser = { ...user, first_name: form.first_name };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Account Security</h1>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-2 opacity-60">Identity & Access Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl h-fit">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6 border-4 border-surface shadow-xl">
            <User size={40} />
          </div>
          <h3 className="text-white font-bold text-xl">{user.first_name}</h3>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-black">{user.role.replace('_', ' ')}</p>

          <div className="mt-8 w-full space-y-3">
            {user.email && (
              <div className="bg-background/50 p-4 rounded-2xl border border-border flex items-center gap-3">
                <Mail size={14} className="text-gray-600" />
                <span className="text-xs text-gray-400 truncate">{user.email}</span>
              </div>
            )}
            <div className="bg-background/50 p-4 rounded-2xl border border-border flex items-center gap-3">
              <Shield size={14} className="text-gray-600" />
              <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">{user.vertical_name || 'Full System Access'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="lg:col-span-2 bg-surface border border-border rounded-[2.5rem] p-10 shadow-2xl space-y-8">
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              <User size={14} className="text-primary" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">Display Name</label>
                <input
                  type="text"
                  className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-primary transition-all shadow-inner"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full h-14 bg-background border border-border rounded-2xl px-12 text-white outline-none focus:border-primary transition-all shadow-inner"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled
                  />
                  <Mail size={16} className="absolute left-6 top-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border">
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Lock size={14} className="text-secondary" /> Change Password
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter current password..."
                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-secondary transition-all shadow-inner pr-12"
                    value={form.currentPassword}
                    onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="New password..."
                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-secondary transition-all shadow-inner pr-12"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  />
                </div>
                <p className="text-[10px] text-gray-500 px-2">Password must be at least 6 characters long.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Re-enter new password..."
                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-secondary transition-all shadow-inner pr-12"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            {success && (
              <div className="flex items-center gap-2 text-secondary font-bold text-sm animate-in fade-in slide-in-from-left-4">
                <CheckCircle size={18} />
                Identity Updated
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="ml-auto bg-white text-black px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const Loader2 = ({ size, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;

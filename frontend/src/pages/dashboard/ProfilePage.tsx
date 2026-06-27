import { useState } from 'react';
import { User, Lock, Mail, Shield, Save, CheckCircle, Smartphone } from 'lucide-react';
import api from '../../api';

export default function ProfilePage() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    phone_number: user.phone_number || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Update Profile Info
      await api.put(`/users/${user.id}`, {
        first_name: form.first_name,
        phone_number: form.phone_number,
        role: user.role,
        vertical_id: user.vertical_id,
        is_active: true
      });

      // 2. Update Password if provided
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          alert('New passwords do not match');
          return;
        }
        // For security, we'll use our existing reset-password or add a dedicated update-password endpoint
        // For now, let's assume update profile also handles password if sent
        // (I will update the backend controller next)
        await api.put(`/users/${user.id}/reset-password`, { new_password: form.newPassword });
      }

      setSuccess(true);
      // Update local storage
      const updatedUser = { ...user, first_name: form.first_name, phone_number: form.phone_number };
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
            <div className="bg-background/50 p-4 rounded-2xl border border-border flex items-center gap-3">
              <Mail size={14} className="text-gray-600" />
              <span className="text-xs text-gray-400 truncate">{user.email}</span>
            </div>
            <div className="bg-background/50 p-4 rounded-2xl border border-border flex items-center gap-3">
              <Shield size={14} className="text-gray-600" />
              <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">{user.vertical_name || 'System Wide'}</span>
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
                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest px-2">Phone Link</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full h-14 bg-background border border-border rounded-2xl px-12 text-white outline-none focus:border-primary transition-all shadow-inner"
                    value={form.phone_number}
                    onChange={e => setForm({ ...form, phone_number: e.target.value })}
                  />
                  <Smartphone size={16} className="absolute left-6 top-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-border">
            <h4 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Lock size={14} className="text-secondary" /> Authentication Hash (Change Password)
            </h4>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password (Leave blank to keep current)"
                className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-secondary transition-all shadow-inner"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-white outline-none focus:border-secondary transition-all shadow-inner"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Protocol
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const Loader2 = ({ size, className }: any) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;

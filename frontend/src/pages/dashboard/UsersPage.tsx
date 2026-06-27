import { useEffect, useState } from 'react';
import { Plus, Loader2, KeyRound, Power, Eye, EyeOff, Copy, Check, X, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';

const ROLES = ['ADMIN', 'CO_ADMIN', 'EMPLOYEE'];
const roleColors: Record<string, string> = {
  GLOBAL_ADMIN: 'bg-primary/20 text-primary',
  ADMIN: 'bg-purple-400/20 text-purple-400',
  CO_ADMIN: 'bg-blue-400/20 text-blue-400',
  EMPLOYEE: 'bg-secondary/20 text-secondary',
};

// ---- Edit User Modal ----
function EditUserModal({ user, verticals, onClose, onSuccess }: { user: any; verticals: any[]; onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, role: user.role, vertical_id: user.vertical_id || '' });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, form);
            onSuccess();
            onClose();
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4">
            <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-8 md:p-10 border-b border-border bg-background/50">
                    <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter">Edit System Member</h2>
                    <button onClick={onClose} className="p-3 bg-background border border-border text-gray-500 hover:text-white rounded-xl md:rounded-2xl"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdate} className="p-8 md:p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">First Name</label>
                             <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="bg-background border border-border rounded-xl md:rounded-2xl w-full px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary shadow-inner" placeholder="First Name" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Last Name</label>
                             <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="bg-background border border-border rounded-xl md:rounded-2xl w-full px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary shadow-inner" placeholder="Last Name" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Operating Role</label>
                         <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-background border border-border rounded-xl md:rounded-2xl px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary">
                             {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                         </select>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Vertical Assignment</label>
                         <select value={form.vertical_id} onChange={e => setForm({...form, vertical_id: e.target.value})} className="w-full bg-background border border-border rounded-xl md:rounded-2xl px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary">
                             <option value="">System Organization</option>
                             {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                         </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full h-14 md:h-16 bg-primary hover:bg-primaryHover text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin inline" size={18} /> : 'Commit Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ---- Password Reveal Modal ----
function PasswordModal({ data, onClose }: { data: { name: string; email: string; password: string } | null; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!data) return null;
  const handleCopy = () => {
    navigator.clipboard.writeText(data.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[250] p-4">
      <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8 md:p-10 border-b border-border bg-background/50">
          <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter text-center sm:text-left">🔑 Credentials Exported</h2>
        </div>
        <div className="p-8 md:p-10 space-y-6">
          <div className="bg-secondary/10 border-l-4 border-secondary p-4 md:p-5 text-secondary text-[10px] md:text-xs font-bold leading-relaxed">Save this authentication key now! It is encrypted after this session and will never be shown again.</div>
          <div><p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">Identity Vector (Email)</p><p className="text-white font-bold text-sm">{data.email}</p></div>
          <div><p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">Passkey</p>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl md:rounded-2xl px-6 h-14 md:h-16">
              <p className="text-white flex-1 font-mono text-xs md:text-sm tracking-wider">{visible ? data.password : '••••••••••••'}</p>
              <button onClick={() => setVisible(!visible)} className="text-gray-500 hover:text-white transition-all">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <button onClick={handleCopy} className="text-gray-500 hover:text-secondary transition-all">{copied ? <Check size={18} /> : <Copy size={18} />}</button>
            </div>
          </div>
          <button onClick={onClose} className="w-full bg-primary hover:bg-primaryHover text-white h-14 md:h-16 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20">Purge From View</button>
        </div>
      </div>
    </div>
  );
}

// ---- Reset Password Modal ----
function ResetModal({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: (pwd: string, name: string, email: string) => void }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleReset = async () => {
    if (newPassword.length < 6) return;
    setLoading(true);
    try {
      await api.put(`/users/${user.id}/reset-password`, { new_password: newPassword });
      onSuccess(newPassword, `${user.first_name} ${user.last_name}`, user.email);
      onClose();
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4">
      <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 md:p-10">
        <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter mb-8">Override Security</h2>
        <div className="space-y-6">
            <div className="space-y-2">
                 <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">New System Passkey</label>
                 <input type="text" placeholder="Enter new secret..." value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-background border border-border rounded-xl md:rounded-2xl h-14 md:h-16 px-6 text-white outline-none focus:border-primary shadow-inner font-mono text-sm md:text-base" />
            </div>
            <button onClick={handleReset} disabled={loading || newPassword.length < 6} className="w-full bg-primary hover:bg-primaryHover h-14 md:h-16 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30">
                {loading ? <Loader2 className="animate-spin inline" size={18} /> : 'Commit Reset'}
            </button>
            <button onClick={onClose} className="w-full text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:text-white transition-all">Abort Procedure</button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', vertical_id: '' });
  const [pwdModal, setPwdModal] = useState<{ name: string; email: string; password: string } | null>(null);
  const [resetModal, setResetModal] = useState<any | null>(null);
  const [editModal, setEditModal] = useState<any | null>(null);

  const fetchData = async (page = pagination.page) => {
    setFetching(true);
    try {
      const [uRes, vRes] = await Promise.all([
          api.get(`/users?page=${page}&limit=${pagination.limit}&search=${search}`), 
          api.get('/verticals')
      ]);
      setUsers(uRes.data.users || []);
      if (uRes.data.pagination) setPagination(uRes.data.pagination);
      setVerticals(vRes.data.verticals || []);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { 
    const timer = setTimeout(() => { fetchData(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await api.post('/users', form);
          setForm({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', vertical_id: '' });
          setShowTaskForm(false);
          setPwdModal({ 
              name: `${res.data.user.first_name} ${res.data.user.last_name}`,
              email: res.data.user.email,
              password: res.data.plain_password
          });
          fetchData();
      } catch (err) { alert('Failed to create user'); }
  };

  return (
    <div className="p-4 md:p-8">
      <PasswordModal data={pwdModal} onClose={() => setPwdModal(null)} />
      {resetModal && <ResetModal user={resetModal} onClose={() => setResetModal(null)} onSuccess={(pwd, name, email) => setPwdModal({ name, email, password: pwd })} />}
      {editModal && <EditUserModal user={editModal} verticals={verticals} onClose={() => setEditModal(null)} onSuccess={() => fetchData()} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Personnel Directory</h1>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-1.5 opacity-60">Identity & Access Control Center</p>
        </div>
        <button onClick={() => setShowTaskForm(true)} className="h-12 md:h-14 w-full sm:w-auto px-6 md:px-8 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            <Plus size={18} /> Register Member
        </button>
      </div>

      {/* Constraints Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl gap-2 items-center w-full lg:w-auto lg:flex-1 lg:max-w-xl">
              <Search size={16} className="text-gray-600 ml-4" />
              <input 
                type="text" 
                placeholder="Search Identity..." 
                className="bg-transparent border-none text-[11px] md:text-xs text-white px-2 md:px-4 py-2 outline-none flex-1"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>

          <div className="flex items-center gap-3 bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl w-full sm:w-auto justify-center">
             <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronLeft size={18}/></button>
             <span className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">Entry {((pagination.page-1)*10)+1}-{Math.min(pagination.page*10, pagination.total)} of {pagination.total}</span>
             <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronRight size={18}/></button>
          </div>
      </div>

      {/* User Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
        {fetching ? (
            <div className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Personnel Database...</div>
        ) : users.length === 0 ? (
            <div className="py-32 text-center text-gray-700 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">No Personnel Found in This Sector</div>
        ) : users.map(u => (
            <div key={u.id} className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs shadow-inner shrink-0 ${roleColors[u.role]}`}>
                        {(u.first_name?.[0] || 'U')}{(u.last_name?.[0] || '')}
                    </div>
                    <div className="overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <h3 className="text-base md:text-lg font-bold text-white tracking-tight truncate">{u.first_name || 'Unknown'} {u.last_name || 'Member'}</h3>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${roleColors[u.role]}`}>{u.role?.replace('_', ' ') || 'EMPLOYEE'}</span>
                        </div>
                        <p className="text-[11px] md:text-xs text-gray-500 font-medium mt-1 truncate">{u.email || 'no-email'} • <span className="text-primary/70">{u.vertical_name || 'System Level Access'}</span></p>
                    </div>
                </div>
                
                <div className="flex items-center justify-end xl:justify-center gap-2 mt-5 xl:mt-0 opacity-100 transition-opacity">
                    {!u.is_active && <span className="bg-danger/10 text-danger text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mr-2 hidden xs:block">Deactivated</span>}
                    <button onClick={() => setEditModal(u)} className="p-3 md:p-3.5 rounded-xl bg-background border border-border text-gray-500 hover:text-white transition-all shadow-sm" title="Edit Profile"><Edit2 size={16} /></button>
                    <button onClick={() => setResetModal(u)} className="p-3 md:p-3.5 rounded-xl bg-background border border-border text-gray-500 hover:text-yellow-400 transition-all shadow-sm" title="Override Key"><KeyRound size={16} /></button>
                    {u.role !== 'GLOBAL_ADMIN' && (
                        <button onClick={async () => { await api.put(`/users/${u.id}/toggle-status`, {}); fetchData(); }} className={`p-3 md:p-3.5 rounded-xl bg-background border border-border transition-all shadow-sm ${u.is_active ? 'text-gray-500 hover:text-danger hover:bg-danger/5' : 'text-secondary bg-secondary/5 hover:bg-secondary/10'}`} title="System Access">
                            <Power size={16} />
                        </button>
                    )}
                </div>
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 xl:static xl:hidden h-full xl:h-0 w-1 xl:w-0 ${u.is_active ? 'bg-secondary' : 'bg-danger'} opacity-20`}></div>
            </div>
        ))}
      </div>

      {/* Slide-in Registration Panel */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex justify-end">
            <form onSubmit={handleCreate} className="bg-surface w-full max-w-xl border-l border-white/5 p-8 md:p-16 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
                <div className="flex justify-between items-center mb-10 md:mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Member Intake</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Initialize Profile Protocol</p>
                    </div>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="p-3 md:p-4 bg-background border border-border text-gray-500 hover:text-white rounded-2xl md:rounded-3xl transition-all"><X size={24}/></button>
                </div>
                
                <div className="space-y-8 md:space-y-10 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-3">
                             <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">First Name</label>
                             <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm" placeholder="First Name" />
                        </div>
                        <div className="space-y-3">
                             <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Last Name</label>
                             <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm" placeholder="Last Name" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Identity Vector (Email)</label>
                        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm" placeholder="email@organization.com" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">System Passkey</label>
                        <input required type="text" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none font-mono text-sm" placeholder="Encrypted Cipher..." />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Access Role</label>
                            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm">
                                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Sector Assignment</label>
                            <select required value={form.vertical_id} onChange={e => setForm({...form, vertical_id: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm">
                                <option value="">Global System</option>
                                {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-12 md:mt-20 flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 h-16 md:h-20 bg-primary text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-primaryHover transition-all shadow-2xl shadow-primary/20">Commit Entry</button>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="w-full sm:w-20 h-16 md:h-20 bg-background border border-border text-gray-500 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center hover:text-white transition-all">Cancel</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}

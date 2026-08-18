import { useEffect, useState } from 'react';
import { Plus, Loader2, KeyRound, Eye, EyeOff, Copy, Check, X, Edit2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserMinus, Mail, Building2 } from 'lucide-react';
import api from '../../api';

const ROLES = ['ADMIN', 'CO_ADMIN', 'EMPLOYEE'];
const roleColors: Record<string, string> = {
  GLOBAL_ADMIN: 'bg-primary/20 text-primary border border-primary/30',
  ADMIN: 'bg-purple-400/20 text-purple-400 border border-purple-400/30',
  CO_ADMIN: 'bg-blue-400/20 text-blue-400 border border-blue-400/30',
  EMPLOYEE: 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30',
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
                         <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Role</label>
                         <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-background border border-border rounded-xl md:rounded-2xl px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary">
                             {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                         </select>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Department</label>
                         <select value={form.vertical_id} onChange={e => setForm({...form, vertical_id: e.target.value})} className="w-full bg-background border border-border rounded-xl md:rounded-2xl px-5 md:px-6 h-12 md:h-14 text-white text-xs md:text-sm outline-none focus:border-primary">
                             <option value="">No Department (Organization-wide)</option>
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
            <button onClick={onClose} className="w-full h-12 bg-danger/10 text-danger border border-danger/30 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-danger hover:text-white transition-all">Cancel</button>
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
  
  const [currentUser, setCurrentUser] = useState(JSON.parse(sessionStorage.getItem('user') || '{}'));
  const isCoAdmin = currentUser.role === 'CO_ADMIN';
  const canCreateUsers = ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN'].includes(currentUser.role);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', vertical_id: '' });
  const [pwdModal, setPwdModal] = useState<{ name: string; email: string; password: string } | null>(null);
  const [resetModal, setResetModal] = useState<any | null>(null);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [jumpPage, setJumpPage] = useState('');

  // When CO_ADMIN opens the form, pre-fill their own vertical
  const openAddForm = () => {
    if (isCoAdmin) {
      setForm({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', vertical_id: currentUser.vertical_id || '' });
    } else {
      setForm({ first_name: '', last_name: '', email: '', password: '', role: 'EMPLOYEE', vertical_id: '' });
    }
    setShowTaskForm(true);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= (pagination.pages || 1)) {
      fetchData(p, pagination.limit);
      setJumpPage('');
    }
  };

  const fetchData = async (page = pagination.page, limit = pagination.limit) => {
    setFetching(true);
    try {
      const [uRes, vRes, meRes] = await Promise.all([
          api.get(`/users?page=${page}&limit=${limit}&search=${search}`), 
          api.get('/verticals').catch(() => ({ data: { verticals: [] } })),
          api.get('/auth/me').catch(() => ({ data: { user: null } }))
      ]);
      setUsers(uRes.data.users || []);
      if (uRes.data.pagination) setPagination(uRes.data.pagination);
      const vList = vRes.data.verticals || [];
      setVerticals(vList);
      
      if (meRes.data?.user) {
        sessionStorage.setItem('user', JSON.stringify(meRes.data.user));
        setCurrentUser(meRes.data.user);
      }
      setSelectedUsers([]);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { 
    const timer = setTimeout(() => { fetchData(1, pagination.limit); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const renderPageNumbers = () => {
    const totalPages = pagination.pages || 1;
    const currentPage = pagination.page || 1;
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleToggleStatus = async (userObj: any) => {
    if (userObj.role === 'GLOBAL_ADMIN') return;
    try {
      await api.put(`/users/${userObj.id}/toggle-status`, {});
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

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
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Personnel Directory</h1>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 opacity-60">User Management & Access Control</p>
        </div>
        {canCreateUsers && (
          <button onClick={openAddForm} className="h-12 md:h-14 w-full sm:w-auto px-6 md:px-8 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
              <Plus size={18} /> Add User
          </button>
        )}
      </div>

      {/* Search Bar (Clean and Wide) */}
      <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-surface border border-border/80 p-2 rounded-2xl gap-3 items-center w-full max-w-2xl shadow-sm focus-within:border-primary transition-all">
              <Search size={18} className="text-primary ml-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Search personnel by name, email, or department..."
                className="bg-transparent border-none text-xs md:text-sm text-gray-900 dark:text-white px-2 py-1 outline-none flex-1 placeholder:text-gray-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white mr-2">
                  <X size={14} />
                </button>
              )}
          </div>
      </div>

      {selectedUsers.length > 0 && (
          <div className="bg-danger/10 border border-danger/30 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-2xl flex-wrap gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-4">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white ml-2">{selectedUsers.length} Users Selected</span>
                  <button onClick={() => setSelectedUsers([])} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-[9px] font-bold uppercase tracking-widest underline decoration-gray-400 underline-offset-4">Clear</button>
              </div>
              <button onClick={async () => {
                  if (!confirm(`Deactivate ${selectedUsers.length} selected users?`)) return;
                  try {
                      await Promise.all(selectedUsers.map(id => api.put(`/users/${id}/toggle-status`, {})));
                      setSelectedUsers([]);
                      fetchData();
                  } catch (err) { alert('Bulk action failed'); }
              }} className="bg-danger/20 text-danger px-4 h-11 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center gap-2">
                  <UserMinus size={16}/> Toggle Access
              </button>
          </div>
      )}

      {/* TABLE VIEW (Column Wise) */}
      <div className="bg-surface border border-border/80 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
        {fetching ? (
            <div className="py-24 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span>Syncing Personnel Database...</span>
            </div>
        ) : users.length === 0 ? (
            <div className="py-28 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]">
                No Personnel Found in This Sector
            </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-white shadow-md">
                <tr className="text-[11px] font-black uppercase tracking-wider text-white">
                  <th className="py-4 px-4 w-12 text-center text-white">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedUsers.length === users.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers(users.map(u => u.id));
                        else setSelectedUsers([]);
                      }}
                      className="w-4 h-4 cursor-pointer accent-secondary rounded"
                    />
                  </th>
                  <th className="py-4 px-3 w-10 text-center text-white/90">#</th>
                  <th className="py-4 px-4 min-w-[200px] text-white">Team Member</th>
                  <th className="py-4 px-4 min-w-[220px] text-white">Email Address</th>
                  <th className="py-4 px-4 min-w-[130px] text-white">Role</th>
                  <th className="py-4 px-4 min-w-[180px] text-white">Department</th>
                  <th className="py-4 px-4 text-center min-w-[110px] text-white">Status</th>
                  <th className="py-4 px-6 text-right min-w-[150px] text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {users.map((u, idx) => {
                  const isSelected = selectedUsers.includes(u.id);
                  const sNo = (pagination.page - 1) * pagination.limit + idx + 1;
                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors group hover:bg-primary/5 ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedUsers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                          className="w-4 h-4 cursor-pointer accent-primary rounded"
                        />
                      </td>

                      {/* S.No */}
                      <td className="py-4 px-3 text-center text-[10px] font-black text-gray-400">
                        {sNo}
                      </td>

                      {/* Member */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${roleColors[u.role] || 'bg-primary/10 text-primary'}`}>
                            {(u.first_name?.[0] || 'U')}{(u.last_name?.[0] || '')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">
                              {u.first_name || 'Unknown'} {u.last_name || 'Member'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                        <div className="flex items-center gap-2 truncate max-w-[240px]">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate">{u.email || 'no-email'}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${roleColors[u.role] || 'bg-gray-500/20 text-gray-400'}`}>
                          {u.role?.replace(/_/g, ' ') || 'EMPLOYEE'}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-background/80 border border-border/70 px-2.5 py-1 rounded-lg">
                          <Building2 size={12} className="text-primary shrink-0" />
                          <span className="truncate max-w-[160px]">{u.vertical_name || 'System Level Access'}</span>
                        </span>
                      </td>

                      {/* Status with Interactive Switch Toggle */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          {u.role === 'GLOBAL_ADMIN' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              className="group inline-flex items-center gap-2 cursor-pointer outline-none select-none"
                              title={`Click to ${u.is_active ? 'deactivate' : 'activate'} ${u.first_name}`}
                            >
                              {/* Switch Track */}
                              <div
                                className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out shadow-inner ${
                                  u.is_active
                                    ? 'bg-emerald-500 dark:bg-emerald-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                {/* Switch Knob */}
                                <div
                                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    u.is_active ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </div>

                              {/* Label */}
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider min-w-[50px] text-left transition-colors ${
                                  u.is_active
                                    ? 'text-emerald-500 group-hover:text-emerald-600'
                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'
                                }`}
                              >
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditModal(u)}
                            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                            title="Edit Profile"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setResetModal(u)}
                            className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-500 hover:bg-yellow-400 hover:text-white transition-all shadow-sm"
                            title="Reset Password"
                          >
                            <KeyRound size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CENTERED PAGINATION & CONTROLS (Below the Table) */}
      <div className="mt-6 p-4 md:p-5 bg-surface border border-border/80 rounded-2xl md:rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Rows Per Page Selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold justify-center md:justify-start w-full md:w-auto">
              <span>Rows per page:</span>
              <select
                  value={pagination.limit}
                  onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      setPagination(prev => ({ ...prev, limit: newLimit }));
                      fetchData(1, newLimit);
                  }}
                  className="bg-background border border-border text-gray-900 dark:text-white rounded-xl px-2.5 py-1.5 outline-none focus:border-primary text-xs font-bold shadow-inner cursor-pointer"
              >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
              </select>
          </div>

          {/* Center: Prev, Next & Numbered Page Navigation (DEAD CENTER) */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* First Page Button */}
              <button
                  onClick={() => fetchData(1, pagination.limit)}
                  disabled={pagination.page <= 1}
                  className="p-2 h-9 w-9 flex items-center justify-center rounded-xl bg-background border border-border text-gray-500 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="First Page"
              >
                  <ChevronsLeft size={15} />
              </button>

              {/* Previous Page Button */}
              <button
                  onClick={() => fetchData(pagination.page - 1, pagination.limit)}
                  disabled={pagination.page <= 1}
                  className="p-2 h-9 px-3 flex items-center gap-1.5 rounded-xl bg-background border border-border text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="Previous Page"
              >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
              </button>

              {/* Numbered Pills */}
              <div className="flex items-center gap-1 px-1">
                  {renderPageNumbers().map((p, idx) => {
                      if (p === '...') {
                          return <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-gray-400">...</span>;
                      }
                      const isCurrent = p === pagination.page;
                      return (
                          <button
                              key={`page-${p}`}
                              onClick={() => fetchData(Number(p), pagination.limit)}
                              className={`h-9 min-w-[36px] px-2.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                                  isCurrent
                                      ? 'bg-primary text-white shadow-primary/25 ring-2 ring-primary/20 scale-105'
                                      : 'bg-background border border-border text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/40 hover:bg-primary/5'
                              }`}
                          >
                              {p}
                          </button>
                      );
                  })}
              </div>

              {/* Next Page Button */}
              <button
                  onClick={() => fetchData(pagination.page + 1, pagination.limit)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 h-9 px-3 flex items-center gap-1.5 rounded-xl bg-background border border-border text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="Next Page"
              >
                  <span>Next</span>
                  <ChevronRight size={14} />
              </button>

              {/* Last Page Button */}
              <button
                  onClick={() => fetchData(pagination.pages, pagination.limit)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 h-9 w-9 flex items-center justify-center rounded-xl bg-background border border-border text-gray-500 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="Last Page"
              >
                  <ChevronsRight size={15} />
              </button>
          </div>

          {/* Right: Go to Page Text & Input Box */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-2 text-xs text-gray-500 font-bold justify-center md:justify-end w-full md:w-auto">
              <span>Go to:</span>
              <input
                  type="number"
                  min={1}
                  max={pagination.pages || 1}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  placeholder={String(pagination.page)}
                  className="w-14 h-9 bg-background border border-border text-gray-900 dark:text-white rounded-xl px-2 text-center text-xs font-black outline-none focus:border-primary shadow-inner"
              />
              <span className="text-[11px] text-gray-400">/ {pagination.pages || 1}</span>
              <button
                  type="submit"
                  className="h-9 px-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              >
                  Go
              </button>
          </form>
      </div>

      {/* Slide-in Registration Panel */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex justify-end">
            <form onSubmit={handleCreate} className="bg-surface w-full max-w-xl border-l border-white/5 p-8 md:p-16 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
                <div className="flex justify-between items-center mb-10 md:mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Member Intake</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-2">User Details</p>
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
                            {isCoAdmin ? (
                                <div className="w-full h-14 md:h-16 bg-background/30 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 flex items-center">
                                    <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Employee</span>
                                </div>
                            ) : (
                                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm">
                                    {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Department</label>
                            {isCoAdmin ? (
                                <div className="w-full h-14 md:h-16 bg-background/40 border border-primary/30 rounded-xl md:rounded-[2rem] px-6 md:px-8 flex items-center justify-between">
                                    <span className="text-primary text-sm font-bold truncate">
                                        {verticals.find(v => v.id === currentUser.vertical_id)?.name || currentUser.vertical_name || 'Assigned Department'}
                                    </span>
                                    <span className="text-[9px] text-primary/70 font-black uppercase tracking-widest ml-auto shrink-0">Locked</span>
                                </div>
                            ) : (
                                <select required value={form.vertical_id} onChange={e => setForm({...form, vertical_id: e.target.value})} className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-xl md:rounded-[2rem] px-6 md:px-8 text-white focus:border-primary outline-none text-sm">
                                    <option value="">Global System</option>
                                    {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 md:mt-20 flex flex-col sm:flex-row gap-4">
                    <button type="submit" className="flex-1 h-16 md:h-20 bg-primary text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-primaryHover transition-all shadow-2xl shadow-primary/20">Commit Entry</button>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="w-full sm:w-auto px-8 h-16 md:h-20 bg-danger/10 text-danger border border-danger/30 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center hover:bg-danger hover:text-white transition-all font-black uppercase tracking-widest text-[10px] shadow-sm">Cancel</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}

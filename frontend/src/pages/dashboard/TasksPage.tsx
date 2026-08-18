import { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, UserPlus, CheckCircle, RotateCcw, X, History, Paperclip, Download, Trash2, Upload, MessageSquare, Send, FileSpreadsheet, Calendar, Target, Search, ChevronLeft, ChevronRight, FolderTree } from 'lucide-react';
import api from '../../api';
import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-danger/20 text-danger border border-danger/30',
  MEDIUM: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30',
  LOW: 'bg-secondary/20 text-secondary border border-secondary/30',
};
const statusColors: Record<string, string> = {
  CREATED: 'bg-gray-400/20 text-gray-400',
  ASSIGNED: 'bg-blue-400/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-400/20 text-yellow-400',
  COMPLETED: 'bg-secondary/20 text-secondary',
  REVIEWED: 'bg-primary/20 text-primary',
  REWORK: 'bg-danger/20 text-danger',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [filtStatus, setFiltStatus] = useState('ALL');
  const [filtPriority, setFiltPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [exporting, setExporting] = useState(false);
  
  const [historyModal, setHistoryModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [reworkModal, setReworkModal] = useState<{ open: boolean; task: any | null; reason: string }>({ open: false, task: null, reason: '' });
  const [attachModal, setAttachModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [chatModal, setChatModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assignModal, setAssignModal] = useState<{ open: boolean; task: any | null }>({ open: false, task: null });
  const [taskForm, setTaskForm] = useState<{ title: string, description: string, priority: string, due_date: string, vertical_ids: string[], module_id: string }>({ title: '', description: '', priority: 'MEDIUM', due_date: '', vertical_ids: [], module_id: '' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [formModules, setFormModules] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const safeFetch = async (page = pagination.page) => {
    setFetching(true);
    try {
      const [tRes, vRes, uRes] = await Promise.all([
        api.get(`/tasks?page=${page}&limit=${pagination.limit}&search=${search}&status=${filtStatus}&priority=${filtPriority}&sortBy=${sortBy}`).catch(() => ({ data: { tasks: [] } })),
        api.get('/verticals').catch(() => ({ data: { verticals: [] } })),
        api.get('/users?limit=1000').catch(() => ({ data: { users: [] } }))
      ]);
      setTasks(tRes.data.tasks || []);
      if (tRes.data.pagination) setPagination(tRes.data.pagination);
      setVerticals(vRes.data.verticals || []);
      setVerticals(vRes.data.verticals || []);
      setUsers(uRes.data.users || []);
      setSelectedTasks([]);
    } finally { setFetching(false); }
  };

  useEffect(() => { 
    const timer = setTimeout(() => { safeFetch(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, filtStatus, filtPriority, sortBy]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatModal.data]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (user.role === 'GLOBAL_ADMIN') {
            if (taskForm.vertical_ids.length === 0) {
               // Global Task
               await api.post('/tasks', { ...taskForm, vertical_id: null, module_id: taskForm.module_id || null });
            } else {
               // Assign to selected verticals
               await Promise.all(taskForm.vertical_ids.map(vid => api.post('/tasks', { ...taskForm, vertical_id: vid, module_id: taskForm.module_id || null })));
            }
        } else {
            // Normal admin, takes their own vertical, handled by backend
            await api.post('/tasks', { ...taskForm, module_id: taskForm.module_id || null });
        }
        setShowTaskForm(false);
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '', vertical_ids: [], module_id: '' });
        setFormModules([]);
        safeFetch();
    } catch (err) { console.error(err); alert('Failed to create task(s)'); }
  };

  // Fetch modules when a single vertical is selected in form
  useEffect(() => {
    if (taskForm.vertical_ids.length === 1) {
      api.get(`/modules?vertical_id=${taskForm.vertical_ids[0]}`).then(r => setFormModules(r.data.modules || [])).catch(() => setFormModules([]));
    } else if (user.role !== 'GLOBAL_ADMIN') {
      // For admins (non global) fetch their own vertical's modules
      api.get(`/modules?vertical_id=${user.vertical_id}`).then(r => setFormModules(r.data.modules || [])).catch(() => setFormModules([]));
    } else {
      setFormModules([]);
      setTaskForm(prev => ({ ...prev, module_id: '' }));
    }
  }, [taskForm.vertical_ids]);

  const handleAssignTask = async (userId: string) => {
    if (!assignModal.task) return;
    
    if (assignModal.task.id === 'BULK_ASSIGN') {
        try {
            await api.post('/tasks/bulk-assign', { task_ids: selectedTasks, employee_id: userId });
            setAssignModal({ open: false, task: null });
            setSelectedTasks([]);
            safeFetch();
        } catch (err) { console.error(err); alert('Bulk Assign Failed'); }
        return;
    }

    try {
      const res = await api.post('/tasks/assign', { employee_id: userId, task_id: assignModal.task.id });
      const isAssigned = res.data.assigned;
      let newAssigned = [...(assignModal.task.assigned_users || [])];
      if (isAssigned) {
        const emp = users.find(u => u.id === userId);
        if (emp) newAssigned.push({ id: emp.id, first_name: emp.first_name, last_name: emp.last_name });
      } else {
        newAssigned = newAssigned.filter(u => u.id !== userId);
      }
      setAssignModal({
        ...assignModal,
        task: { ...assignModal.task, assigned_users: newAssigned }
      });
      safeFetch();
    } catch (err) { console.error(err); }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/tasks?limit=1000000&search=${search}&status=${filtStatus}&priority=${filtPriority}&sortBy=${sortBy}`);
      const list = res.data.tasks || [];

      const exportData = list.map((t: any) => ({
        Title: t.title,
        Description: t.description,
        Priority: t.priority,
        Status: t.status,
        Department: t.vertical_name || 'Organization Wide',
        'Due Date': t.due_date ? formatDate(t.due_date) : 'N/A',
        'Created At': t.created_at ? formatDateTime(t.created_at) : 'N/A',
        'Last Remark': t.last_remark || ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tasks");
      XLSX.writeFile(wb, `TaskReport_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const baseURL = api.defaults.baseURL || '';
      const response = await fetch(`${baseURL}/attachments/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download file.');
    }
  };

  const openChat = async (task: any) => {
    try {
      const res = await api.get(`/comments/${task.id}`);
      setChatModal({ open: true, task, data: res.data.comments });
    } catch (err) { console.error(err); }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !chatModal.task) return;
    try {
        await api.post('/comments', { task_id: chatModal.task.id, comment: newComment });
        setNewComment('');
        const res = await api.get(`/comments/${chatModal.task.id}`);
        setChatModal({ ...chatModal, data: res.data.comments });
    } catch (err) { console.error(err); }
  };

  const openAttachments = async (task: any) => {
    try {
      const res = await api.get(`/attachments/${task.id}`);
      setAttachModal({ open: true, task, data: res.data.attachments });
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !attachModal.task) return;

    // 10MB Limit Check (10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('File is too large! Maximum limit is 10MB per file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', attachModal.task.id);
    try {
      await api.post('/attachments/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get(`/attachments/${attachModal.task.id}`);
      setAttachModal({ ...attachModal, data: res.data.attachments });
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/attachments/${fileId}`);
      const res = await api.get(`/attachments/${attachModal.task.id}`);
      setAttachModal({ ...attachModal, data: res.data.attachments });
    } catch (err) { console.error(err); }
  };

  const submitRework = async () => {
    if (!reworkModal.task || !reworkModal.reason) return;
    try {
        await api.put(`/tasks/${reworkModal.task.id}/status`, { new_status: 'REWORK', remark: reworkModal.reason });
        setReworkModal({ open: false, task: null, reason: '' });
        safeFetch();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Task Management</h1>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 opacity-70">Manage and track all tasks</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
             <button onClick={exportToExcel} disabled={exporting} className="flex-1 sm:flex-none h-12 md:h-14 px-4 bg-surface border border-border text-gray-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-all flex items-center justify-center gap-2">
                {exporting ? <Loader2 size={16} className="text-secondary animate-spin" /> : <FileSpreadsheet size={16} className="text-secondary" />}
                <span className="hidden xs:inline">{exporting ? 'Exporting...' : 'Export'}</span>
             </button>
             {user.role !== 'EMPLOYEE' && (
                <button onClick={() => setShowTaskForm(true)} className="flex-[2] sm:flex-none h-12 md:h-14 px-6 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-primaryHover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                    <Plus size={18} /> New Task
                </button>
             )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Left search & filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-4xl">
              <div className="flex bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl gap-2 items-center flex-1">
                  <Search size={16} className="text-gray-600 ml-3" />
                  <input 
                    type="text" 
                    placeholder="Search Objectives..." 
                    className="bg-transparent border-none text-[10px] md:text-xs text-white px-3 py-2 outline-none flex-1"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
              </div>
              
              <div className="flex flex-wrap gap-2">
                  <select 
                    value={filtStatus} 
                    onChange={e => setFiltStatus(e.target.value)} 
                    className="bg-surface border border-border text-[9px] md:text-[10px] text-gray-400 px-4 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer min-w-[120px]"
                  >
                     <option value="ALL">All Statuses</option>
                     <option value="CREATED">Created</option>
                     <option value="ASSIGNED">Assigned</option>
                     <option value="IN_PROGRESS">In Progress</option>
                     <option value="COMPLETED">Completed</option>
                     <option value="REVIEWED">Reviewed</option>
                     <option value="REWORK">Rework</option>
                  </select>

                  <select 
                    value={filtPriority} 
                    onChange={e => setFiltPriority(e.target.value)} 
                    className="bg-surface border border-border text-[9px] md:text-[10px] text-gray-400 px-4 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer min-w-[125px]"
                  >
                     <option value="ALL">All Priorities</option>
                     <option value="HIGH">High Criticality</option>
                     <option value="MEDIUM">Standard</option>
                     <option value="LOW">Flexible</option>
                  </select>

                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)} 
                    className="bg-surface border border-border text-[9px] md:text-[10px] text-gray-400 px-4 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer min-w-[115px]"
                  >
                     <option value="newest">Newest First</option>
                     <option value="oldest">Oldest First</option>
                     <option value="due_date">Due Date</option>
                     <option value="priority">Priority</option>
                  </select>
              </div>
          </div>

          {/* Mini Pagination */}
          <div className="flex items-center gap-3 bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl self-center sm:self-auto justify-center">
             <button onClick={() => safeFetch(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronLeft size={18}/></button>
             <span className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">Page {pagination.page} / {pagination.pages}</span>
             <button onClick={() => safeFetch(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronRight size={18}/></button>
          </div>
      </div>

      {selectedTasks.length > 0 && (
          <div className="bg-primary/20 border border-primary/40 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-2xl flex-wrap gap-4">
              <div className="flex items-center gap-4">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white ml-2">{selectedTasks.length} Elements Selected</span>
                  <button onClick={() => setSelectedTasks([])} className="text-gray-400 hover:text-white text-[9px] font-bold uppercase tracking-widest underline decoration-gray-600 underline-offset-4">Clear All</button>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => setAssignModal({ open: true, task: { id: 'BULK_ASSIGN' } })} className="bg-background text-primary px-4 h-11 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-surface border border-primary/20 transition-all flex items-center gap-2"><UserPlus size={16}/> Assign Resources</button>
                  <button onClick={async () => {
                      if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks globally?`)) return;
                      try {
                          await api.post('/tasks/bulk-delete', { task_ids: selectedTasks });
                          setSelectedTasks([]);
                          safeFetch();
                      } catch (err) { alert('Bulk Deletion Failed'); }
                  }} className="bg-danger/20 text-danger px-4 h-11 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center gap-2"><Trash2 size={16}/> Wipe Selection</button>
              </div>
          </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6">
        {fetching ? (
            <div className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <span>Establishing Connection...</span>
            </div>
        ) : tasks.length === 0 ? (
            <div className="py-32 text-center text-gray-700 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">No Active Vectors Detected</div>
        ) : tasks.map((task, i) => (
            <div key={task.id} className="bg-surface border border-border rounded-2xl md:rounded-3xl flex flex-col md:flex-row hover:border-primary/20 transition-all group overflow-hidden relative shadow-2xl">
                
                {/* Checkbox and S.No Panel */}
                <div className="w-full md:w-16 bg-background/50 border-b md:border-b-0 md:border-r border-border flex md:flex-col items-center justify-between md:justify-center p-4 md:py-8 shrink-0">
                    <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-0 md:mb-4">{(pagination.page - 1) * pagination.limit + i + 1}</span>
                    <input 
                        type="checkbox" 
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => setSelectedTasks(prev => prev.includes(task.id) ? prev.filter(tid => tid !== task.id) : [...prev, task.id])}
                        className="w-5 h-5 cursor-pointer accent-primary border border-border bg-background rounded"
                    />
                </div>

                {/* Task Body */}
                <div className="flex-1 p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>{task.priority}</span>
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${statusColors[task.status]} border border-white/5`}>{task.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{task.title}</h3>
                            </div>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-2xl">{task.description}</p>
                            
                            {/* Metadata Row */}
                             <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4">
                                  <div className="flex items-center gap-1.5 font-bold">
                                     <Target size={12} className="text-gray-600" />
                                     <span className="text-[10px] text-gray-500 font-black uppercase">{task.vertical_name || 'System Wide'}</span>
                                  </div>
                                  {task.module_code && (
                                     <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                                         <FolderTree size={11} className="text-primary/70" />
                                         <span className="text-[10px] text-primary font-black uppercase tracking-widest">{task.module_code} · {task.module_name}</span>
                                     </div>
                                  )}
                                  {task.due_date && (
                                     <div className="flex items-center gap-1.5">
                                         <Calendar size={12} className="text-gray-600" />
                                         <span className="text-[10px] text-gray-500 font-black uppercase">Due {formatDate(task.due_date)}</span>
                                     </div>
                                  )}
                                  {task.assigned_users && task.assigned_users.length > 0 && (
                                     <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                                         <div className="flex -space-x-1.5 overflow-hidden mr-1">
                                             {task.assigned_users.map((u: any) => (
                                                 <div key={u.id} className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-surface flex items-center justify-center text-[8px] font-black uppercase" title={`${u.first_name} ${u.last_name || ''}`}>
                                                     {u.first_name[0]}
                                                 </div>
                                             ))}
                                         </div>
                                         <span className="text-[9px] text-primary/80 font-black uppercase tracking-wider">
                                             Assigned: {task.assigned_users.map((u: any) => u.first_name).join(', ')}
                                         </span>
                                     </div>
                                  )}
                            </div>
                        </div>

                        {/* Quick Actions Bar */}
                        <div className="flex md:flex-col gap-1.5 bg-background/50 md:bg-transparent p-2 md:p-0 rounded-xl w-full sm:w-auto justify-around sm:justify-start">
                            <button onClick={() => openChat(task)} className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Comments"><MessageSquare size={18} /></button>
                            <button onClick={() => openAttachments(task)} className="p-2.5 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all" title="Assets"><Paperclip size={18} /></button>
                            <button onClick={() => {
                                setHistoryModal({ open: true, task, data: [] });
                                api.get(`/stats/task/${task.id}/history`).then(res => setHistoryModal({ open: true, task, data: res.data.history }));
                            }} className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Timeline"><History size={18} /></button>
                        </div>
                    </div>

                    {task.last_remark && (
                        <div className="mt-6 bg-danger/5 border-l-4 border-danger/50 p-4 rounded-r-2xl">
                            <p className="text-[9px] text-danger font-black uppercase tracking-[0.2em] mb-1">Rework Instructions</p>
                            <p className="text-xs text-danger/80 font-medium italic">"{task.last_remark}"</p>
                        </div>
                    )}
                </div>

                {/* Vertical Divider (Desktop Only) */}
                <div className="hidden md:block w-px bg-border my-2 opacity-30"></div>

                {/* Operations Section */}
                <div className="md:w-64 flex flex-col justify-center gap-3">
                    {user.role !== 'EMPLOYEE' && (
                        <button onClick={() => setAssignModal({ open: true, task })} className="w-full h-12 md:h-14 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"><UserPlus size={18}/> {task.status === 'CREATED' ? 'Assign Direct' : 'Reassign / Edit'}</button>
                    )}
                    {(user.role === 'EMPLOYEE' || user.role === 'CO_ADMIN') && (task.status === 'ASSIGNED' || task.status === 'REWORK') && (
                        <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'IN_PROGRESS' }).then(() => safeFetch())} className="w-full h-12 md:h-14 bg-yellow-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20">Initiate Workflow</button>
                    )}
                    {(user.role === 'EMPLOYEE' || user.role === 'CO_ADMIN') && task.status === 'IN_PROGRESS' && (
                        <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'COMPLETED' }).then(() => safeFetch())} className="w-full h-12 md:h-14 bg-secondary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/20">Finalize Work</button>
                    )}
                    {user.role !== 'EMPLOYEE' && user.role !== 'CO_ADMIN' && task.status === 'COMPLETED' && (
                        <div className="flex flex-col gap-2">
                             <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'REVIEWED' }).then(() => safeFetch())} className="h-12 bg-secondary/10 border border-secondary/30 text-secondary rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-3"><CheckCircle size={18}/> Approve Asset</button>
                             <button onClick={() => setReworkModal({ open: true, task, reason: '' })} className="h-12 bg-danger/10 border border-danger/30 text-danger rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-3"><RotateCcw size={18}/> Request Rework</button>
                        </div>
                    )}
                </div>
                </div>
            </div>
        ))}
      </div>

      {/* NEW TASK MODAL */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setShowTaskForm(false)}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 rounded-md bg-primary/10 text-primary"><Plus size={14}/></span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Task Management</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Create New Task</h2>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => setShowTaskForm(false)} 
                        className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <X size={18}/>
                    </button>
                </div>
                
                {/* Form Body */}
                <form onSubmit={handleCreateTask} className="p-6 md:p-8 space-y-5">
                    {/* Task Title */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Task Title <span className="text-danger">*</span></label>
                        <input 
                            required 
                            type="text" 
                            className="w-full mt-1.5 h-12 bg-background border border-border rounded-xl px-4 text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-all shadow-inner" 
                            placeholder="e.g. Prepare Monthly Financial Report" 
                            value={taskForm.title} 
                            onChange={e => setTaskForm({...taskForm, title: e.target.value})} 
                        />
                    </div>

                    {/* Task Description */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Task Description / Instructions</label>
                        <textarea 
                            className="w-full mt-1.5 bg-background border border-border rounded-xl p-4 text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-all shadow-inner min-h-[90px] resize-none" 
                            placeholder="Provide clear details and requirements for this task..." 
                            value={taskForm.description} 
                            onChange={e => setTaskForm({...taskForm, description: e.target.value})} 
                        />
                    </div>

                    {/* Priority & Due Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Priority Level</label>
                            <select 
                                className="w-full mt-1.5 h-12 bg-background border border-border rounded-xl px-4 text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors cursor-pointer" 
                                value={taskForm.priority} 
                                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                            >
                                <option value="HIGH">🔴 High Priority</option>
                                <option value="MEDIUM">🟡 Medium Priority</option>
                                <option value="LOW">🟢 Low Priority</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Due Date</label>
                            <input 
                                type="date" 
                                className="w-full mt-1.5 h-12 bg-background border border-border rounded-xl px-4 text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors" 
                                value={taskForm.due_date} 
                                onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Department Multi-Select (Global Admin only) */}
                    {user.role === 'GLOBAL_ADMIN' && (
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Assign to Departments</label>
                            <div className="mt-1.5 bg-background border border-border rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 custom-scrollbar">
                                <label className="flex items-center gap-2.5 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors">
                                  <input 
                                    type="checkbox" 
                                    checked={taskForm.vertical_ids.length === 0} 
                                    onChange={() => setTaskForm({...taskForm, vertical_ids: []})} 
                                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                                  />
                                  <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-wider">All Departments (Global Task)</span>
                                </label>
                                {verticals.map(v => (
                                  <label key={v.id} className="flex items-center gap-2.5 p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors">
                                    <input 
                                      type="checkbox" 
                                      checked={taskForm.vertical_ids.includes(v.id)} 
                                      onChange={(e) => {
                                        if (e.target.checked) setTaskForm({...taskForm, vertical_ids: [...taskForm.vertical_ids, v.id]});
                                        else setTaskForm({...taskForm, vertical_ids: taskForm.vertical_ids.filter(id => id !== v.id)});
                                      }} 
                                      className="w-4 h-4 accent-primary rounded cursor-pointer"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold">{v.name}</span>
                                  </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Module Selection */}
                    {formModules.length > 0 && (
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Associated Module <span className="text-gray-400 font-normal lowercase">(optional)</span></label>
                            <select
                                className="w-full mt-1.5 h-12 bg-background border border-border rounded-xl px-4 text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                                value={taskForm.module_id}
                                onChange={e => setTaskForm({...taskForm, module_id: e.target.value})}
                            >
                                <option value="">— No Module (General Department Task) —</option>
                                {formModules.map(m => (
                                    <option key={m.id} value={m.id}>{m.code} · {m.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3 border-t border-border/50">
                        <button 
                            type="button" 
                            onClick={() => setShowTaskForm(false)} 
                            className="flex-1 h-12 bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px] shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-lg shadow-primary/20"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modals like Assign, Chat, etc - all need similar mobile-first tweaks */}
      {/* (Reducing modal font sizes and paddings where needed) */}
      
      {/* ASSIGN MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setAssignModal({ open: false, task: null })}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
                    <div>
                        <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Assign Team Member</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Select personnel for this task</p>
                    </div>
                    <button onClick={() => setAssignModal({ open: false, task: null })} className="w-8 h-8 flex items-center justify-center bg-background border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"><X size={16}/></button>
                </div>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {users.filter(u => (u.role === 'EMPLOYEE' || u.role === 'CO_ADMIN') && (!assignModal.task?.vertical_id || u.vertical_id === assignModal.task.vertical_id)).map(emp => {
                        const isAssigned = assignModal.task?.assigned_users?.some((u: any) => u.id === emp.id);
                        return (
                            <button key={emp.id} onClick={() => handleAssignTask(emp.id)} className={`w-full p-3.5 bg-background border rounded-xl flex items-center justify-between transition-all group ${isAssigned ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isAssigned ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>{emp.first_name[0]}</div>
                                    <div className="text-left">
                                        <p className="text-gray-900 dark:text-white font-bold text-xs">{emp.first_name} {emp.last_name}</p>
                                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">{emp.vertical_name || 'System'}</p>
                                    </div>
                                 </div>
                                 <div className={isAssigned ? 'text-secondary' : 'text-primary'}>
                                     {isAssigned ? <CheckCircle size={18}/> : <Plus size={18}/>}
                                 </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setChatModal({ open: false, task: null, data: [] })}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50">
                    <div>
                        <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Task Discussion & Comments</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate max-w-[280px]">Task: {chatModal.task?.title}</p>
                    </div>
                    <button onClick={() => setChatModal({ open: false, task: null, data: [] })} className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"><X size={16}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {chatModal.data.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <MessageSquare size={40} className="mb-3 text-primary" />
                            <p className="font-black uppercase tracking-widest text-[10px]">No comments yet</p>
                        </div>
                    ) : chatModal.data.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1 px-1">{msg.first_name} • {msg.role.replace('_', ' ')}</p>
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${msg.user_id === user.id ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' : 'bg-background border border-border text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                {msg.comment}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={postComment} className="p-4 border-t border-border/50 bg-background/50 flex gap-3">
                    <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a message or update..." 
                        className="flex-1 bg-surface border border-border h-12 px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-all shadow-inner"
                    />
                    <button type="submit" className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 shrink-0"><Send size={16}/></button>
                </form>
            </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[140] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setAttachModal({ open: false, task: null, data: [] })}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50">
                    <div>
                        <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Task Files & Attachments</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Documents & proof of work</p>
                    </div>
                    <button onClick={() => setAttachModal({ open: false, task: null, data: [] })} className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"><X size={16}/></button>
                </div>
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {attachModal.data.map(f => (
                        <div key={f.id} className="bg-background border border-border p-3.5 rounded-xl flex items-center justify-between">
                            <div className="overflow-hidden mr-3">
                                <p className="text-gray-900 dark:text-white text-xs font-bold truncate">{f.file_name}</p>
                                <p className="text-[9px] text-gray-500 uppercase mt-0.5">Uploaded by {f.first_name}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => handleDownload(f.id, f.file_name)} className="p-2 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-white rounded-lg transition-all" title="Download File"><Download size={14}/></button>
                                {(user.id === f.uploaded_by || user.role === 'GLOBAL_ADMIN') && <button onClick={() => deleteFile(f.id)} className="p-2 bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white rounded-lg transition-all" title="Delete File"><Trash2 size={14}/></button>}
                            </div>
                        </div>
                    ))}
                    <div className="pt-3 border-t border-border/50">
                         <input type="file" onChange={handleFileUpload} className="hidden" id="task-upload" />
                         <label htmlFor="task-upload" className="w-full h-12 border-2 border-dashed border-border hover:border-primary rounded-xl flex items-center justify-center gap-2.5 text-gray-500 hover:text-primary font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all">
                             {uploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} {uploading ? 'Uploading...' : 'Click to Upload Document'}
                         </label>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Rework Reason Modal */}
      {reworkModal.open && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[160] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setReworkModal({ open: false, task: null, reason: '' })}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight mb-2">Request Task Rework</h2>
                <p className="text-gray-500 text-xs mb-4">Please specify feedback or changes required for the assigned member.</p>
                <textarea 
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-gray-900 dark:text-white text-xs outline-none focus:border-danger transition-all h-28 resize-none mb-4 shadow-inner"
                    placeholder="Explain what needs correction..."
                    value={reworkModal.reason}
                    onChange={e => setReworkModal({...reworkModal, reason: e.target.value})}
                />
                <div className="flex gap-3">
                    <button onClick={() => setReworkModal({ open: false, task: null, reason: '' })} className="flex-1 h-11 bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm">Cancel</button>
                    <button onClick={submitRework} className="flex-1 h-11 bg-danger text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-danger/80 transition-all shadow-lg shadow-danger/20">Submit Rework</button>
                </div>
            </div>
         </div>
      )}

      {/* History Modal (Timeline) */}
      {historyModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setHistoryModal({ open: false, task: null, data: [] })}>
          <div className="bg-surface border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-background/50">
              <div>
                <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Status & Activity History</h2>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Chronological audit log</p>
              </div>
              <button onClick={() => setHistoryModal({ open: false, task: null, data: [] })} className="w-8 h-8 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"><X size={16}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 relative custom-scrollbar">
              {historyModal.data.map((h, i) => (
                <div key={i} className="flex gap-4 items-start bg-background/50 border border-border/40 p-3.5 rounded-2xl">
                   <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                     h.new_status === 'COMPLETED' || h.new_status === 'REVIEWED'
                       ? 'bg-secondary ring-4 ring-secondary/20'
                       : h.new_status === 'REWORK'
                       ? 'bg-danger ring-4 ring-danger/20'
                       : h.new_status === 'IN_PROGRESS'
                       ? 'bg-yellow-400 ring-4 ring-yellow-400/20'
                       : 'bg-primary ring-4 ring-primary/20'
                   }`}></div>
                   <div className="flex-1">
                     <div className="flex flex-wrap items-center justify-between gap-2">
                       <span className="text-gray-900 dark:text-white text-xs font-bold uppercase tracking-tight">
                         {h.new_status.replace(/_/g, ' ')}
                       </span>
                       <span className="text-[10px] text-gray-500 font-mono">{formatDateTime(h.changed_at)}</span>
                     </div>
                     {h.remark && <p className="text-xs text-danger font-medium bg-danger/10 border border-danger/20 px-3 py-1.5 rounded-xl mt-2">"{h.remark}"</p>}
                     <p className="text-[10px] text-gray-500 mt-1 font-bold">Action by: <span className="text-primary">{h.first_name}</span></p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

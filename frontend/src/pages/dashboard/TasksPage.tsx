import { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, UserPlus, CheckCircle, RotateCcw, X, History, Paperclip, Download, Trash2, Upload, MessageSquare, Send, FileSpreadsheet, Calendar, Target, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';
import * as XLSX from 'xlsx';

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
  
  const [historyModal, setHistoryModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [reworkModal, setReworkModal] = useState<{ open: boolean; task: any | null; reason: string }>({ open: false, task: null, reason: '' });
  const [attachModal, setAttachModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [chatModal, setChatModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assignModal, setAssignModal] = useState<{ open: boolean; task: any | null }>({ open: false, task: null });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', due_date: '', vertical_id: '' });
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const safeFetch = async (page = pagination.page) => {
    setFetching(true);
    try {
      const [tRes, vRes, uRes] = await Promise.all([
        api.get(`/tasks?page=${page}&limit=${pagination.limit}&search=${search}`).catch(() => ({ data: { tasks: [] } })),
        api.get('/verticals').catch(() => ({ data: { verticals: [] } })),
        api.get('/users').catch(() => ({ data: { users: [] } }))
      ]);
      setTasks(tRes.data.tasks || []);
      if (tRes.data.pagination) setPagination(tRes.data.pagination);
      setVerticals(vRes.data.verticals || []);
      setUsers(uRes.data.users || []);
    } finally { setFetching(false); }
  };

  useEffect(() => { 
    const timer = setTimeout(() => { safeFetch(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatModal.data]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/tasks', taskForm);
        setShowTaskForm(false);
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', due_date: '', vertical_id: '' });
        safeFetch();
    } catch (err) { console.error(err); alert('Failed to create task'); }
  };

  const handleAssignTask = async (userId: string) => {
    if (!assignModal.task) return;
    try {
      await api.post(`/tasks/${assignModal.task.id}/assign`, { employee_id: userId, task_id: assignModal.task.id });
      setAssignModal({ open: false, task: null });
      safeFetch();
    } catch (err) { console.error(err); }
  };

  const exportToExcel = () => {
    const exportData = tasks.map(t => ({
      Title: t.title,
      Description: t.description,
      Priority: t.priority,
      Status: t.status,
      Department: t.vertical_name || 'Organization Wide',
      'Due Date': t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A',
      'Created At': new Date(t.created_at).toLocaleString(),
      'Last Remark': t.last_remark || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");
    XLSX.writeFile(wb, `TaskReport_${new Date().toLocaleDateString()}.xlsx`);
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
          <h1 className="text-3xl font-black text-white tracking-tighter">Unified Operations</h1>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.3em] mt-1.5 opacity-70">Strategic Asset Management</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
             <button onClick={exportToExcel} className="flex-1 sm:flex-none h-12 md:h-14 px-4 bg-surface border border-border text-gray-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-all flex items-center justify-center gap-2">
                <FileSpreadsheet size={16} className="text-secondary" /> <span className="hidden xs:inline">Export</span>
             </button>
             {user.role !== 'EMPLOYEE' && (
                <button onClick={() => setShowTaskForm(true)} className="flex-[2] sm:flex-none h-12 md:h-14 px-6 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-primaryHover transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                    <Plus size={18} /> New Objective
                </button>
             )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl gap-2 items-center w-full lg:w-auto lg:flex-1 lg:max-w-xl">
              <Search size={16} className="text-gray-600 ml-3" />
              <input 
                type="text" 
                placeholder="Search Objectives..." 
                className="bg-transparent border-none text-[10px] md:text-xs text-white px-3 py-2 outline-none flex-1"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>

          {/* Mini Pagination */}
          <div className="flex items-center gap-3 bg-surface border border-border p-1.5 rounded-xl md:rounded-2xl w-full sm:w-auto justify-center">
             <button onClick={() => safeFetch(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronLeft size={18}/></button>
             <span className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">Page {pagination.page} / {pagination.pages}</span>
             <button onClick={() => safeFetch(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 text-gray-500 hover:text-white disabled:opacity-30"><ChevronRight size={18}/></button>
          </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6">
        {fetching ? (
            <div className="py-24 text-center text-gray-600 font-bold uppercase tracking-widest text-xs animate-pulse font-mono tracking-[0.5em]">Establishing Connection...</div>
        ) : tasks.length === 0 ? (
            <div className="py-32 text-center text-gray-700 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">No Active Vectors Detected</div>
        ) : tasks.map(task => (
            <div key={task.id} className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-8 hover:border-primary/20 transition-all group overflow-hidden relative shadow-2xl">
                
                {/* Task Body */}
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
                                 <div className="flex items-center gap-1.5">
                                    <Target size={12} className="text-gray-600" />
                                    <span className="text-[10px] text-gray-500 font-black uppercase">{task.vertical_name || 'System Wide'}</span>
                                 </div>
                                 {task.due_date && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-600" />
                                        <span className="text-[10px] text-gray-500 font-black uppercase">Due {new Date(task.due_date).toLocaleDateString()}</span>
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
                    {user.role !== 'EMPLOYEE' && task.status === 'CREATED' && (
                        <button onClick={() => setAssignModal({ open: true, task })} className="w-full h-12 md:h-14 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"><UserPlus size={18}/> Assign Direct</button>
                    )}
                    {user.role === 'EMPLOYEE' && (task.status === 'ASSIGNED' || task.status === 'REWORK') && (
                        <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'IN_PROGRESS' }).then(() => safeFetch())} className="w-full h-12 md:h-14 bg-yellow-400 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20">Initiate Workflow</button>
                    )}
                    {user.role === 'EMPLOYEE' && task.status === 'IN_PROGRESS' && (
                        <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'COMPLETED' }).then(() => safeFetch())} className="w-full h-12 md:h-14 bg-secondary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/20">Finalize Work</button>
                    )}
                    {user.role !== 'EMPLOYEE' && task.status === 'COMPLETED' && (
                        <div className="flex flex-col gap-2">
                             <button onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'REVIEWED' }).then(() => safeFetch())} className="h-12 bg-secondary/10 border border-secondary/30 text-secondary rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-3"><CheckCircle size={18}/> Approve Asset</button>
                             <button onClick={() => setReworkModal({ open: true, task, reason: '' })} className="h-12 bg-danger/10 border border-danger/30 text-danger rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-3"><RotateCcw size={18}/> Request Rework</button>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* NEW TASK OVERLAY */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex justify-end">
            <form onSubmit={handleCreateTask} className="bg-surface w-full max-w-xl border-l border-white/5 p-8 md:p-16 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
                <div className="flex justify-between items-center mb-12 flex-shrink-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">New Objective</h2>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.4em] mt-2">Initialize Operation Protocol</p>
                    </div>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="p-4 bg-background border border-border text-gray-500 hover:text-white rounded-2xl md:rounded-3xl transition-all"><X size={24}/></button>
                </div>
                
                <div className="space-y-8 flex-1">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Objective Title</label>
                        <input required type="text" className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-2xl md:rounded-3xl px-6 md:px-8 text-white focus:border-primary transition-all shadow-inner outline-none" placeholder="Task Name..." value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Detailed Intelligence</label>
                        <textarea className="w-full bg-background/50 border border-border rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white focus:border-primary transition-all shadow-inner h-32 md:h-40 outline-none resize-none" placeholder="What needs to be done?" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Priority Hash</label>
                            <select className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-2xl md:rounded-3xl px-6 md:px-8 text-white focus:border-primary outline-none" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                                <option value="HIGH">High Criticality</option>
                                <option value="MEDIUM">Standard</option>
                                <option value="LOW">Flexible</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Timeline Lock</label>
                            <input type="date" className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-2xl md:rounded-3xl px-6 md:px-8 text-white focus:border-primary outline-none" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                        </div>
                    </div>

                    {user.role === 'GLOBAL_ADMIN' && (
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 px-1">Department Vector</label>
                            <select className="w-full h-14 md:h-16 bg-background/50 border border-border rounded-2xl md:rounded-3xl px-6 md:px-8 text-white focus:border-primary outline-none" value={taskForm.vertical_id} onChange={e => setTaskForm({...taskForm, vertical_id: e.target.value})}>
                                <option value="">Global Organization</option>
                                {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-12 md:mt-20 flex flex-col xs:flex-row gap-4 flex-shrink-0">
                    <button type="submit" className="flex-1 h-16 md:h-20 bg-primary text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-primaryHover transition-all shadow-2xl shadow-primary/20">Commit Objective</button>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="h-16 md:h-20 w-full xs:w-20 bg-background border border-border text-gray-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center hover:text-white transition-all shrink-0">Cancel</button>
                </div>
            </form>
        </div>
      )}

      {/* Modals like Assign, Chat, etc - all need similar mobile-first tweaks */}
      {/* (Reducing modal font sizes and paddings where needed) */}
      
      {/* ASSIGN MODAL */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[210] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-[2rem] md:rounded-[3rem] w-full max-w-md p-6 md:p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                    <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter">Assign Resource</h2>
                    <button onClick={() => setAssignModal({ open: false, task: null })} className="text-gray-500 hover:text-white"><X size={20}/></button>
                </div>
                <div className="space-y-2 md:space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {users.filter(u => u.role === 'EMPLOYEE' && (!assignModal.task?.vertical_id || u.vertical_id === assignModal.task.vertical_id)).map(emp => (
                        <button key={emp.id} onClick={() => handleAssignTask(emp.id)} className="w-full p-4 md:p-5 bg-background border border-border rounded-xl md:rounded-2xl flex items-center justify-between hover:border-primary transition-all group">
                             <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{emp.first_name[0]}</div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-xs md:text-sm">{emp.first_name} {emp.last_name}</p>
                                    <p className="text-[8px] md:text-[10px] text-gray-600 uppercase font-black">{emp.vertical_name || 'System'}</p>
                                </div>
                             </div>
                             <div className="text-primary"><Plus size={18}/></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[150] flex items-center justify-center p-2 md:p-4">
            <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl h-[90vh] md:h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 md:p-10 border-b border-border flex justify-between items-center bg-background/50">
                    <div>
                        <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter">Comms Channel</h2>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">Ref: {chatModal.task?.title}</p>
                    </div>
                    <button onClick={() => setChatModal({ open: false, task: null, data: [] })} className="p-3 bg-background border border-border text-gray-500 hover:text-white rounded-xl md:rounded-2xl transition-all"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 md:space-y-6 custom-scrollbar">
                    {chatModal.data.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <MessageSquare size={48} className="mb-4" />
                            <p className="font-black uppercase tracking-widest text-[9px]">No Logs Found</p>
                        </div>
                    ) : chatModal.data.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5 px-1">{msg.first_name} • {msg.role.replace('_', ' ')}</p>
                            <div className={`max-w-[85%] p-4 md:p-5 rounded-2xl md:rounded-3xl text-xs md:text-sm font-medium leading-relaxed ${msg.user_id === user.id ? 'bg-primary text-white rounded-tr-none' : 'bg-background border border-border text-gray-300 rounded-tl-none'}`}>
                                {msg.comment}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={postComment} className="p-6 md:p-10 border-t border-border bg-background/50 flex gap-3 md:gap-4">
                    <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Secure message..." 
                        className="flex-1 bg-surface border border-border h-14 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl text-white text-xs md:text-sm outline-none focus:border-primary transition-all shadow-inner"
                    />
                    <button type="submit" className="w-14 md:w-16 h-14 md:h-16 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primaryHover transition-all shadow-xl shadow-primary/20"><Send size={18}/></button>
                </form>
            </div>
        </div>
      )}

      {/* Attachments Modal */}
      {attachModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[140] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 md:p-10 border-b border-border flex justify-between items-center bg-background/50">
                    <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter">Asset Storage</h2>
                    <button onClick={() => setAttachModal({ open: false, task: null, data: [] })} className="p-3 bg-background border border-border text-gray-500 hover:text-white rounded-xl md:rounded-2xl transition-all"><X size={20}/></button>
                </div>
                <div className="p-6 md:p-10 space-y-3 md:space-y-4 max-h-[60vh] overflow-y-auto">
                    {attachModal.data.map(f => (
                        <div key={f.id} className="bg-background border border-border p-3 md:p-4 rounded-2xl flex items-center justify-between">
                            <div className="overflow-hidden mr-4">
                                <p className="text-white text-[11px] md:text-xs font-black truncate uppercase tracking-tight">{f.file_name}</p>
                                <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">By {f.first_name}</p>
                            </div>
                            <div className="flex gap-1.5 md:gap-2">
                                <a href={`http://localhost:5000/uploads/${f.file_path}`} target="_blank" rel="noreferrer" className="p-3 bg-surface text-gray-400 hover:text-secondary rounded-xl md:rounded-2xl transition-all"><Download size={14}/></a>
                                {(user.id === f.uploaded_by || user.role === 'GLOBAL_ADMIN') && <button onClick={() => deleteFile(f.id)} className="p-3 bg-surface text-gray-400 hover:text-danger rounded-xl md:rounded-2xl transition-all"><Trash2 size={14}/></button>}
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-border/30">
                         <input type="file" onChange={handleFileUpload} className="hidden" id="task-upload" />
                         <label htmlFor="task-upload" className="w-full h-14 md:h-16 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-3 text-gray-500 font-black uppercase tracking-widest text-[9px] cursor-pointer hover:border-secondary hover:text-secondary transition-all">
                             {uploading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>} {uploading ? 'Processing...' : 'Add Support File'}
                         </label>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Rework Reason Modal */}
      {reworkModal.open && (
         <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[160] flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 md:p-10">
                <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter mb-6">Correction Log</h2>
                <textarea 
                    className="w-full bg-background border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 text-white text-xs md:text-sm outline-none focus:border-danger transition-all h-32 md:h-40 resize-none mb-6 shadow-inner"
                    placeholder="Describe specific errors..."
                    value={reworkModal.reason}
                    onChange={e => setReworkModal({...reworkModal, reason: e.target.value})}
                />
                <button onClick={submitRework} className="w-full h-14 md:h-16 bg-danger text-white rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:bg-danger/80 transition-all shadow-2xl shadow-danger/30">Commit Order</button>
            </div>
         </div>
      )}

      {/* History Modal (Timeline) */}
      {historyModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="text-white font-black text-xl md:text-2xl tracking-tighter">Audit Chronology</h2>
              <button onClick={() => setHistoryModal({ open: false, task: null, data: [] })} className="text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto space-y-8 relative custom-scrollbar">
              <div className="absolute left-[39px] md:left-[59px] top-10 bottom-10 w-px bg-border -z-0 opacity-50"></div>
              {historyModal.data.map((h, i) => (
                <div key={i} className="flex gap-6 md:gap-10 relative z-10">
                   <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-surface flex-shrink-0 mt-1 md:mt-0.5 ${i === 0 ? 'bg-primary ring-4 ring-primary/10' : 'bg-gray-700'}`}></div>
                   <div className="flex-1">
                     <p className="text-white text-xs md:text-sm font-black uppercase tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1">
                        {h.new_status.replace('_', ' ')}
                        <span className="text-[9px] text-gray-600 font-mono italic">{new Date(h.changed_at).toLocaleString()}</span>
                     </p>
                     {h.remark && <p className="text-[10px] md:text-[11px] text-danger font-bold bg-danger/5 border border-danger/10 px-3 py-2 rounded-xl mt-2 leading-relaxed">"{h.remark}"</p>}
                     <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-widest opacity-60">Operator: {h.first_name}</p>
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

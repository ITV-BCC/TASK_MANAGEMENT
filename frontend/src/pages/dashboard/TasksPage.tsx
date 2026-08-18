import { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, UserPlus, CheckCircle, RotateCcw, X, History, Paperclip, Download, Trash2, Upload, MessageSquare, Send, FileSpreadsheet, Calendar, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FolderTree, AlertCircle, CheckCircle2, UserCheck, UserX, Building2, Sparkles, Play } from 'lucide-react';
import api from '../../api';
import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-danger/20 text-danger border border-danger/30',
  MEDIUM: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30',
  LOW: 'bg-secondary/20 text-secondary border border-secondary/30',
};
const statusColors: Record<string, string> = {
  CREATED: 'bg-gray-400/20 text-gray-400 border border-gray-400/30',
  ASSIGNED: 'bg-blue-400/20 text-blue-400 border border-blue-400/30',
  IN_PROGRESS: 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
  REVIEWED: 'bg-primary/20 text-primary border border-primary/30',
  REWORK: 'bg-danger/20 text-danger border border-danger/30',
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
  const [jumpPage, setJumpPage] = useState('');
  
  const [historyModal, setHistoryModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [reworkModal, setReworkModal] = useState<{ open: boolean; task: any | null; reason: string }>({ open: false, task: null, reason: '' });
  const [attachModal, setAttachModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [chatModal, setChatModal] = useState<{ open: boolean; task: any | null; data: any[] }>({ open: false, task: null, data: [] });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assignModal, setAssignModal] = useState<{ open: boolean; task: any | null }>({ open: false, task: null });
  const [assignSearch, setAssignSearch] = useState('');
  const [confirmAssignModal, setConfirmAssignModal] = useState<{ open: boolean; emp: any | null; task: any | null; isAssigned: boolean; isBulk?: boolean } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const [taskForm, setTaskForm] = useState<{ title: string, description: string, priority: string, due_date: string, vertical_ids: string[], module_id: string }>({ title: '', description: '', priority: 'MEDIUM', due_date: '', vertical_ids: [], module_id: '' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [formModules, setFormModules] = useState<any[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const safeFetch = async (page = pagination.page, limit = pagination.limit) => {
    setFetching(true);
    try {
      const [tRes, vRes, uRes] = await Promise.all([
        api.get(`/tasks?page=${page}&limit=${limit}&search=${search}&status=${filtStatus}&priority=${filtPriority}&sortBy=${sortBy}`).catch(() => ({ data: { tasks: [] } })),
        api.get('/verticals').catch(() => ({ data: { verticals: [] } })),
        api.get('/users?limit=1000').catch(() => ({ data: { users: [] } }))
      ]);
      setTasks(tRes.data.tasks || []);
      if (tRes.data.pagination) setPagination(tRes.data.pagination);
      setVerticals(vRes.data.verticals || []);
      setUsers(uRes.data.users || []);
      setSelectedTasks([]);
    } finally { setFetching(false); }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= (pagination.pages || 1)) {
      safeFetch(p, pagination.limit);
      setJumpPage('');
    }
  };

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

  useEffect(() => { 
    const timer = setTimeout(() => { safeFetch(1, pagination.limit); }, 300);
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

  const handleAssignTask = async (emp: any) => {
    if (!assignModal.task || !emp) return;
    const userId = emp.id;
    
    if (assignModal.task.id === 'BULK_ASSIGN') {
        try {
            await api.post('/tasks/bulk-assign', { task_ids: selectedTasks, employee_id: userId });
            setConfirmAssignModal(null);
            setAssignModal({ open: false, task: null });
            setSelectedTasks([]);
            showToast(`✅ Successfully assigned ${selectedTasks.length} tasks to ${emp.first_name} ${emp.last_name}!`, 'success');
            safeFetch();
        } catch (err) { 
            console.error(err); 
            showToast('❌ Bulk Assign Failed', 'danger'); 
        }
        return;
    }

    try {
      const res = await api.post('/tasks/assign', { employee_id: userId, task_id: assignModal.task.id });
      const isAssigned = res.data.assigned;
      let newAssigned = [...(assignModal.task.assigned_users || [])];
      if (isAssigned) {
        newAssigned.push({ id: emp.id, first_name: emp.first_name, last_name: emp.last_name });
        showToast(`✅ Assigned "${assignModal.task.title}" to ${emp.first_name} ${emp.last_name}!`, 'success');
      } else {
        newAssigned = newAssigned.filter((u: any) => u.id !== userId);
        showToast(`ℹ️ Removed ${emp.first_name} ${emp.last_name} from task.`, 'danger');
      }
      setAssignModal({
        ...assignModal,
        task: { ...assignModal.task, assigned_users: newAssigned }
      });
      setConfirmAssignModal(null);
      safeFetch();
    } catch (err) { 
      console.error(err); 
      showToast('❌ Failed to update assignment', 'danger'); 
    }
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Left search & filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="flex bg-surface border border-border/80 p-2 rounded-2xl gap-3 items-center flex-1 max-w-md shadow-sm focus-within:border-primary transition-all">
                  <Search size={18} className="text-primary ml-3 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search tasks, descriptions, or assignees..." 
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
              
              <div className="flex flex-wrap gap-2">
                  <select 
                    value={filtStatus} 
                    onChange={e => setFiltStatus(e.target.value)} 
                    className="bg-surface border border-border/80 text-[10px] md:text-xs text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl font-bold uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
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
                    className="bg-surface border border-border/80 text-[10px] md:text-xs text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl font-bold uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
                  >
                     <option value="ALL">All Priorities</option>
                     <option value="HIGH">High Criticality</option>
                     <option value="MEDIUM">Standard</option>
                     <option value="LOW">Flexible</option>
                  </select>

                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)} 
                    className="bg-surface border border-border/80 text-[10px] md:text-xs text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl font-bold uppercase tracking-wider outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
                  >
                     <option value="newest">Newest First</option>
                     <option value="oldest">Oldest First</option>
                     <option value="due_date">Due Date</option>
                     <option value="priority">Priority</option>
                  </select>
              </div>
          </div>
      </div>

      {user.role !== 'EMPLOYEE' && selectedTasks.length > 0 && (
          <div className="bg-primary/15 border border-primary/30 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-2xl flex-wrap gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-4">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white ml-2">{selectedTasks.length} Tasks Selected</span>
                  <button onClick={() => setSelectedTasks([])} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-[9px] font-bold uppercase tracking-widest underline underline-offset-4">Clear All</button>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => setAssignModal({ open: true, task: { id: 'BULK_ASSIGN' } })} className="bg-primary text-white px-4 h-10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primaryHover transition-all flex items-center gap-2 shadow-sm"><UserPlus size={15}/> Assign Resources</button>
                  <button onClick={async () => {
                      if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks globally?`)) return;
                      try {
                          await api.post('/tasks/bulk-delete', { task_ids: selectedTasks });
                          setSelectedTasks([]);
                          safeFetch();
                      } catch (err) { alert('Bulk Deletion Failed'); }
                  }} className="bg-danger/20 text-danger px-4 h-10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center gap-2 shadow-sm"><Trash2 size={15}/> Wipe Selection</button>
              </div>
          </div>
      )}

      {/* DATA TABLE VIEW */}
      <div className="bg-surface border border-border/80 rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
        {fetching ? (
            <div className="py-24 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px] flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <span>Syncing Tasks Database...</span>
            </div>
        ) : tasks.length === 0 ? (
            <div className="py-28 text-center text-gray-500 font-black uppercase tracking-widest text-[10px]">
                No Tasks Found in This Sector
            </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary text-white shadow-md">
                <tr className="text-[11px] font-black uppercase tracking-wider text-white">
                  {user.role !== 'EMPLOYEE' && (
                    <th className="py-4 px-4 w-12 text-center text-white">
                      <input
                        type="checkbox"
                        checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTasks(tasks.map(t => t.id));
                          else setSelectedTasks([]);
                        }}
                        className="w-4 h-4 cursor-pointer accent-secondary rounded"
                      />
                    </th>
                  )}
                  <th className="py-4 px-3 w-10 text-center text-white/90">#</th>
                  <th className="py-4 px-4 min-w-[240px] text-white">Task Objective</th>
                  <th className="py-4 px-4 min-w-[170px] text-white">Department</th>
                  <th className="py-4 px-4 min-w-[180px] text-white">Assigned To</th>
                  <th className="py-4 px-4 min-w-[100px] text-white">Priority</th>
                  <th className="py-4 px-4 min-w-[120px] text-white">Status</th>
                  <th className="py-4 px-4 min-w-[110px] text-white">Due Date</th>
                  <th className="py-4 px-4 text-center min-w-[120px] text-white">Tools</th>
                  <th className="py-4 px-6 text-right min-w-[180px] text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {tasks.map((task, idx) => {
                  const isSelected = selectedTasks.includes(task.id);
                  const sNo = (pagination.page - 1) * pagination.limit + idx + 1;
                  return (
                    <tr
                      key={task.id}
                      className={`transition-colors group hover:bg-primary/5 ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      {/* Checkbox (Admins/Co-Admins only) */}
                      {user.role !== 'EMPLOYEE' && (
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedTasks(prev => prev.includes(task.id) ? prev.filter(tid => tid !== task.id) : [...prev, task.id])}
                            className="w-4 h-4 cursor-pointer accent-primary rounded"
                          />
                        </td>
                      )}

                      {/* S.No */}
                      <td className="py-4 px-3 text-center text-[10px] font-black text-gray-400">
                        {sNo}
                      </td>

                      {/* Task Objective */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                              {task.title}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          {task.last_remark && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-danger/10 text-danger border border-danger/20 rounded-md text-[9px] font-bold">
                              <span>⚠️ Rework: "{task.last_remark}"</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department & Module */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-background/80 border border-border/70 px-2.5 py-1 rounded-lg">
                            <Building2 size={12} className="text-primary shrink-0" />
                            <span className="truncate max-w-[140px]">{task.vertical_name || 'System Wide'}</span>
                          </span>
                          {task.module_code && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                                <FolderTree size={10} />
                                <span className="truncate max-w-[130px]">{task.module_code} · {task.module_name}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="py-4 px-4">
                        {task.assigned_users && task.assigned_users.length > 0 ? (
                          <div 
                            onClick={() => user.role !== 'EMPLOYEE' && setAssignModal({ open: true, task })}
                            className={`flex items-center gap-2 ${user.role !== 'EMPLOYEE' ? 'cursor-pointer hover:opacity-80' : ''}`}
                            title={user.role !== 'EMPLOYEE' ? 'Click to manage assignees' : undefined}
                          >
                            <div className="flex -space-x-2 overflow-hidden shrink-0">
                              {task.assigned_users.map((u: any) => (
                                <div key={u.id} className="w-6 h-6 rounded-full bg-primary text-white border-2 border-surface flex items-center justify-center text-[8px] font-black uppercase shadow-sm" title={`${u.first_name} ${u.last_name || ''}`}>
                                  {u.first_name?.[0] || 'U'}
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                              {task.assigned_users.map((u: any) => u.first_name).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => user.role !== 'EMPLOYEE' && setAssignModal({ open: true, task })}
                            disabled={user.role === 'EMPLOYEE'}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-400 bg-background border border-dashed border-border hover:border-primary hover:text-primary transition-all disabled:pointer-events-none"
                          >
                            <UserPlus size={12} />
                            <span>Unassigned</span>
                          </button>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block ${priorityColors[task.priority] || 'bg-gray-500/20 text-gray-400'}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${statusColors[task.status] || 'bg-gray-500/20 text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'IN_PROGRESS' || task.status === 'COMPLETED' ? 'animate-pulse' : ''} ${
                            task.status === 'COMPLETED' || task.status === 'REVIEWED' ? 'bg-emerald-500' :
                            task.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                            task.status === 'REWORK' ? 'bg-danger' :
                            task.status === 'ASSIGNED' ? 'bg-blue-400' : 'bg-gray-400'
                          }`}></span>
                          {task.status?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                        {task.due_date ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px] italic">No due date</span>
                        )}
                      </td>

                      {/* Quick Tools (Comments, Assets, Timeline) */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1 bg-background/80 border border-border/80 p-1 rounded-xl shadow-sm">
                          <button
                            onClick={() => openChat(task)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-all relative"
                            title="Discussion / Remarks"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button
                            onClick={() => openAttachments(task)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all relative"
                            title="Attachments / Files"
                          >
                            <Paperclip size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setHistoryModal({ open: true, task, data: [] });
                              api.get(`/stats/task/${task.id}/history`).then(res => setHistoryModal({ open: true, task, data: res.data.history }));
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                            title="Activity Log / History"
                          >
                            <History size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Operations / Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin / Co-Admin Reassign */}
                          {user.role !== 'EMPLOYEE' && (
                            <button
                              onClick={() => setAssignModal({ open: true, task })}
                              className="px-3 h-8 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-1.5 shadow-sm"
                              title="Assign or Reassign Task"
                            >
                              <UserPlus size={13} />
                              <span>{task.status === 'CREATED' ? 'Assign' : 'Reassign'}</span>
                            </button>
                          )}

                          {/* Employee / Co-admin Initiate Workflow */}
                          {(user.role === 'EMPLOYEE' || user.role === 'CO_ADMIN') && (task.status === 'ASSIGNED' || task.status === 'REWORK') && (
                            <button
                              onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'IN_PROGRESS' }).then(() => safeFetch())}
                              className="px-3 h-8 bg-yellow-400 text-black hover:bg-yellow-300 rounded-xl font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-1 shadow-sm"
                              title="Start Work"
                            >
                              <Play size={12} className="fill-current" />
                              <span>Start</span>
                            </button>
                          )}

                          {/* Employee / Co-admin Complete Work */}
                          {(user.role === 'EMPLOYEE' || user.role === 'CO_ADMIN') && task.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'COMPLETED' }).then(() => safeFetch())}
                              className="px-3 h-8 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-black uppercase tracking-wider text-[9px] transition-all flex items-center gap-1 shadow-sm"
                              title="Complete Task"
                            >
                              <CheckCircle size={13} />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* Admin Approve or Request Rework */}
                          {user.role !== 'EMPLOYEE' && user.role !== 'CO_ADMIN' && task.status === 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => api.put(`/tasks/${task.id}/status`, { new_status: 'REVIEWED' }).then(() => safeFetch())}
                                className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Approve Task"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => setReworkModal({ open: true, task, reason: '' })}
                                className="p-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white rounded-xl transition-all shadow-sm"
                                title="Request Rework"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </>
                          )}
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
                      safeFetch(1, newLimit);
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
                  onClick={() => safeFetch(1, pagination.limit)}
                  disabled={pagination.page <= 1}
                  className="p-2 h-9 w-9 flex items-center justify-center rounded-xl bg-background border border-border text-gray-500 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="First Page"
              >
                  <ChevronsLeft size={15} />
              </button>

              {/* Previous Page Button */}
              <button
                  onClick={() => safeFetch(pagination.page - 1, pagination.limit)}
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
                              onClick={() => safeFetch(Number(p), pagination.limit)}
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
                  onClick={() => safeFetch(pagination.page + 1, pagination.limit)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 h-9 px-3 flex items-center gap-1.5 rounded-xl bg-background border border-border text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/40 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  title="Next Page"
              >
                  <span>Next</span>
                  <ChevronRight size={14} />
              </button>

              {/* Last Page Button */}
              <button
                  onClick={() => safeFetch(pagination.pages, pagination.limit)}
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
      
      {/* ASSIGN MODAL (Redesigned with High-End SaaS Aesthetics) */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => { setAssignModal({ open: false, task: null }); setAssignSearch(''); }}>
            <div className="bg-surface border border-border/80 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-border/50 bg-gradient-to-b from-primary/5 via-background/40 to-background/10">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-violet-500 text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0 ring-4 ring-primary/10">
                                <UserPlus size={22} />
                            </div>
                            <div>
                                <h2 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">
                                    {assignModal.task?.id === 'BULK_ASSIGN' ? 'Bulk Resource Allocation' : 'Assign Team Member'}
                                </h2>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                                    {assignModal.task?.id === 'BULK_ASSIGN' ? `Assigning ${selectedTasks.length} selected tasks` : 'Allocate personnel & set ownership'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setAssignModal({ open: false, task: null }); setAssignSearch(''); }} 
                            className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm hover:scale-105"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Task Context Hero Card */}
                    {assignModal.task && assignModal.task.id !== 'BULK_ASSIGN' && (
                        <div className="mt-5 p-4 rounded-2xl bg-background/80 dark:bg-background/60 border border-border/70 shadow-inner flex flex-col gap-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                    <Sparkles size={12} /> Target Task
                                </span>
                                {assignModal.task.priority && (
                                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${priorityColors[assignModal.task.priority] || 'bg-gray-500/20 text-gray-400'}`}>
                                        {assignModal.task.priority} Priority
                                    </span>
                                )}
                            </div>
                            <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">
                                {assignModal.task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-[10px] text-gray-500 font-medium">
                                <span className="flex items-center gap-1">
                                    <Building2 size={11} className="text-primary/70" />
                                    {assignModal.task.vertical_name || 'Organization Wide'}
                                </span>
                                <span>•</span>
                                <span className="truncate">
                                    {assignModal.task.assigned_users && assignModal.task.assigned_users.length > 0 ? (
                                        <span className="text-secondary font-bold">
                                            Currently: {assignModal.task.assigned_users.map((u: any) => u.first_name).join(', ')}
                                        </span>
                                    ) : (
                                        <span className="text-amber-500/80 font-bold">Currently Unassigned</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Search & Filter inside Modal */}
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            value={assignSearch}
                            onChange={e => setAssignSearch(e.target.value)}
                            placeholder="Filter members by name, email, or department..."
                            className="w-full h-11 pl-10 pr-4 bg-background/90 border border-border/80 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-500"
                        />
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Team Members List */}
                <div className="p-6 md:p-8 space-y-2.5 overflow-y-auto custom-scrollbar flex-1">
                    {(() => {
                        const targetVerticalId = assignModal.task?.vertical_id;
                        const filteredMembers = users
                            .filter(u => (u.role === 'EMPLOYEE' || u.role === 'CO_ADMIN') && (!targetVerticalId || u.vertical_id === targetVerticalId))
                            .filter(u => {
                                if (!assignSearch.trim()) return true;
                                const q = assignSearch.toLowerCase();
                                return (
                                    `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
                                    (u.email && u.email.toLowerCase().includes(q)) ||
                                    (u.vertical_name && u.vertical_name.toLowerCase().includes(q))
                                );
                            });

                        if (filteredMembers.length === 0) {
                            return (
                                <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                                    <UserX size={36} className="mb-2 text-gray-400" />
                                    <p className="font-bold text-xs">No team members match your criteria</p>
                                    <p className="text-[10px] mt-0.5">Try searching with a different name or department</p>
                                </div>
                            );
                        }

                        return filteredMembers.map(emp => {
                            const isAssigned = assignModal.task?.assigned_users?.some((u: any) => u.id === emp.id);
                            const hasOtherAssignments = !isAssigned && assignModal.task?.assigned_users?.length > 0;

                            return (
                                <div
                                    key={emp.id}
                                    onClick={() => setConfirmAssignModal({
                                        open: true,
                                        emp,
                                        task: assignModal.task,
                                        isAssigned: isAssigned || false,
                                        isBulk: assignModal.task?.id === 'BULK_ASSIGN'
                                    })}
                                    className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group select-none ${
                                        isAssigned
                                            ? 'bg-primary/5 border-primary/50 shadow-md shadow-primary/5'
                                            : 'bg-background/60 hover:bg-background border-border/70 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.01]'
                                    }`}
                                >
                                    {/* Member Info */}
                                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${
                                            isAssigned 
                                                ? 'bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/30' 
                                                : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                                        }`}>
                                            {emp.first_name?.[0] || 'U'}
                                        </div>
                                        <div className="text-left truncate">
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 dark:text-white font-bold text-xs md:text-sm truncate leading-tight">
                                                    {emp.first_name} {emp.last_name || ''}
                                                </p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 ${
                                                    emp.role === 'CO_ADMIN' 
                                                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                                                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                    {emp.role === 'CO_ADMIN' ? 'Co-Admin' : 'Employee'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-1 truncate">
                                                <Building2 size={11} className="text-gray-400 shrink-0" />
                                                <span className="truncate">{emp.vertical_name || 'Assigned Department'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Status Pill */}
                                    <div className="shrink-0">
                                        {isAssigned ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-wider group-hover:bg-danger/15 group-hover:border-danger/30 group-hover:text-danger transition-all shadow-sm">
                                                <CheckCircle2 size={14} className="group-hover:hidden" />
                                                <UserX size={14} className="hidden group-hover:block" />
                                                <span className="group-hover:hidden">Assigned</span>
                                                <span className="hidden group-hover:inline">Remove</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                                                <Plus size={13} />
                                                <span>{hasOtherAssignments ? 'Reassign' : 'Assign'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* Footer Tip */}
                <div className="p-4 px-6 md:px-8 border-t border-border/50 bg-background/50 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <span>💡 Click any member to initiate assignment with confirmation</span>
                </div>
            </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR ASSIGNING / REASSIGNING / REMOVING */}
      {confirmAssignModal && confirmAssignModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[230] flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={() => setConfirmAssignModal(null)}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3.5 mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        confirmAssignModal.isAssigned 
                            ? 'bg-danger/10 text-danger border border-danger/20' 
                            : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                        {confirmAssignModal.isAssigned ? <UserX size={24} /> : <UserCheck size={24} />}
                    </div>
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-black text-lg tracking-tight">
                            {confirmAssignModal.isBulk 
                                ? 'Confirm Bulk Assignment' 
                                : confirmAssignModal.isAssigned 
                                    ? 'Confirm Member Removal' 
                                    : (confirmAssignModal.task?.assigned_users?.length > 0 ? 'Confirm Task Reassignment' : 'Confirm Task Assignment')}
                        </h3>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                            Please verify action details
                        </p>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-background/80 border border-border/70 rounded-2xl p-4 space-y-3 mb-6 text-xs">
                    <div>
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Team Member</span>
                        <div className="flex items-center gap-2.5 mt-1 font-bold text-gray-900 dark:text-white">
                            <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                                {confirmAssignModal.emp?.first_name?.[0]}
                            </span>
                            <span>{confirmAssignModal.emp?.first_name} {confirmAssignModal.emp?.last_name}</span>
                            <span className="text-[10px] text-primary font-normal">({confirmAssignModal.emp?.role?.replace('_', ' ')})</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Target Task</span>
                        <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                            {confirmAssignModal.isBulk 
                                ? `${selectedTasks.length} Selected Tasks` 
                                : confirmAssignModal.task?.title}
                        </p>
                    </div>

                    {!confirmAssignModal.isBulk && confirmAssignModal.task?.assigned_users?.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Currently Assigned</span>
                            <p className="text-gray-600 dark:text-gray-400 font-medium mt-0.5 truncate">
                                {confirmAssignModal.task.assigned_users.map((u: any) => `${u.first_name} ${u.last_name || ''}`).join(', ')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Question Prompt */}
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-6 px-1 leading-relaxed">
                    {confirmAssignModal.isBulk ? (
                        <>Are you sure you want to assign <strong>{selectedTasks.length} tasks</strong> to <strong>{confirmAssignModal.emp?.first_name} {confirmAssignModal.emp?.last_name}</strong>?</>
                    ) : confirmAssignModal.isAssigned ? (
                        <>Are you sure you want to <strong>remove</strong> {confirmAssignModal.emp?.first_name} {confirmAssignModal.emp?.last_name} from this task?</>
                    ) : confirmAssignModal.task?.assigned_users?.length > 0 ? (
                        <>Are you sure you want to <strong>reassign / add</strong> {confirmAssignModal.emp?.first_name} {confirmAssignModal.emp?.last_name} to this task?</>
                    ) : (
                        <>Are you sure you want to assign this task to <strong>{confirmAssignModal.emp?.first_name} {confirmAssignModal.emp?.last_name}</strong>?</>
                    )}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setConfirmAssignModal(null)} 
                        className="flex-1 h-12 bg-surface border border-border text-gray-600 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-background transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleAssignTask(confirmAssignModal.emp)} 
                        className={`flex-1 h-12 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg ${
                            confirmAssignModal.isAssigned 
                                ? 'bg-danger hover:bg-red-600 shadow-danger/20' 
                                : 'bg-primary hover:bg-primaryHover shadow-primary/20'
                        }`}
                    >
                        {confirmAssignModal.isAssigned ? 'Yes, Remove' : (confirmAssignModal.task?.assigned_users?.length > 0 ? 'Yes, Reassign' : 'Yes, Assign')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[260] px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 text-xs font-bold ${
            toast.type === 'danger' 
                ? 'bg-danger text-white border-danger/40 shadow-danger/20' 
                : 'bg-surface text-gray-900 dark:text-white border-primary/40 shadow-primary/20'
        }`}>
            {toast.type === 'danger' ? <AlertCircle size={16} className="text-white shrink-0" /> : <CheckCircle2 size={16} className="text-primary shrink-0" />}
            <span>{toast.message}</span>
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

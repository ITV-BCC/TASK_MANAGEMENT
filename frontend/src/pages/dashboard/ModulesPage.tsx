import React, { useEffect, useState } from 'react';
import { Loader2, FolderTree, Trash2, X, Plus, Search, Calendar, User, Edit3, ArrowLeft, Building2, ChevronRight, Layers } from 'lucide-react';
import api from '../../api';
import { formatDate } from '../../utils/dateUtils';

function ModuleModal({ module, users, userRole, onClose, onRefresh }: { module: any, users: any[], userRole: string, onClose: () => void, onRefresh: () => void }) {
    const canManage = ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN'].includes(userRole);
    const [isEditing, setIsEditing] = useState(false);

    const [code, setCode] = useState(module.code);
    const [name, setName] = useState(module.name);
    const [description, setDescription] = useState(module.description || '');
    const [assigneeId, setAssigneeId] = useState(module.assignee_id || '');
    const [dueDate, setDueDate] = useState(module.due_date ? module.due_date.substring(0, 10) : '');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/modules/${module.id}`, { 
                code, 
                name, 
                description,
                assignee_id: assigneeId || null,
                due_date: dueDate || null
            });
            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to update module');
        } finally {
            setSaving(false);
        }
    };

    const assignee = users.find(u => u.id === module.assignee_id);
    const assigneeName = assignee ? `${assignee.first_name} ${assignee.last_name}` : (module.assignee_first_name ? `${module.assignee_first_name} ${module.assignee_last_name}` : 'Unassigned');
    const formattedDate = module.due_date ? formatDate(module.due_date) : 'No Deadline';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/50">
                    <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider">{module.code}</span>
                        <h3 className="text-gray-900 dark:text-white font-black text-lg md:text-xl tracking-tight">
                            Module Overview
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto">
                    {!isEditing ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">Module Name</h4>
                                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{module.name}</p>
                            </div>
                            
                            {module.description && (
                                <div>
                                    <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5">Description</h4>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-background border border-border/50 p-4 rounded-2xl whitespace-pre-wrap">{module.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-background border border-border/50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Assignee</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{assigneeName}</p>
                                    </div>
                                </div>
                                <div className="bg-background border border-border/50 p-4 rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20 shrink-0">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Due Date</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                {canManage && (
                                    <button onClick={() => setIsEditing(true)} className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primaryHover transition-all shadow-xl shadow-primary/20">
                                        <Edit3 size={14} /> Edit Module
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="flex flex-col gap-4 animate-in slide-in-from-left-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Module Code</label>
                                    <input required value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white font-mono text-xs outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Due Date</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Module Name</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors" />
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Assign User</label>
                                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors">
                                    <option value="">-- Unassigned --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write details about what tasks go into this module..." className="w-full mt-1.5 bg-background border border-border p-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] resize-none transition-all shadow-inner" />
                            </div>

                            <div className="pt-3 flex gap-3 border-t border-border/50">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 h-12 rounded-xl bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all font-black uppercase tracking-widest text-[10px] shadow-sm">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-[2] h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Individual Department View
function IndividualDepartmentView({ 
    vertical, 
    modules, 
    users, 
    userRole,
    onBack, 
    onRefresh, 
    onSelectModule 
}: { 
    vertical: any, 
    modules: any[], 
    users: any[], 
    userRole: string,
    onBack: () => void, 
    onRefresh: () => void, 
    onSelectModule: (m: any) => void 
}) {
    const canManage = ['GLOBAL_ADMIN', 'ADMIN', 'CO_ADMIN'].includes(userRole);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newAssigneeId, setNewAssigneeId] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const vModules = modules.filter((m: any) => 
        m.vertical_id === vertical.id && 
        (!search || 
            m.name.toLowerCase().includes(search.toLowerCase()) || 
            m.code.toLowerCase().includes(search.toLowerCase()) || 
            m.description?.toLowerCase().includes(search.toLowerCase()) ||
            (m.assignee_first_name && m.assignee_first_name.toLowerCase().includes(search.toLowerCase()))
        )
    );

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/modules', { 
                vertical_id: vertical.id, 
                code: newCode, 
                name: newName,
                description: newDescription || null,
                assignee_id: newAssigneeId || null,
                due_date: newDueDate || null
            });
            setNewCode('');
            setNewName('');
            setNewDescription('');
            setNewAssigneeId('');
            setNewDueDate('');
            setShowAddModal(false);
            onRefresh();
        } catch (err) {
            console.error(err);
            alert('Failed to add module');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Permanently delete this module? Tasks tied to it will lose their module mapping.')) return;
        try {
            await api.delete(`/modules/${id}`);
            onRefresh();
        } catch (err) {
            console.error(err);
            alert('Failed to delete module');
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                <button 
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider w-fit group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Departments
                </button>

                <div className="flex items-center gap-3">
                    {canManage && (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="h-11 px-5 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all flex items-center gap-2 shadow-xl shadow-primary/20 shrink-0"
                        >
                            <Plus size={16} /> New Module
                        </button>
                    )}
                </div>
            </div>

            {/* Department Hero Header Card */}
            <div className="bg-surface border border-border p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Department View
                        </span>
                        <span className="text-gray-500 text-xs font-bold">•</span>
                        <span className="text-gray-500 text-xs font-bold">{vModules.length} {vModules.length === 1 ? 'Module' : 'Modules'}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                        {vertical.name}
                    </h1>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 opacity-70">
                        Categorization & task sub-structures for {vertical.name}
                    </p>
                </div>

                <div className="w-full md:w-80 relative z-10">
                    <input
                        type="text"
                        placeholder="Search modules in this department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-gray-900 dark:text-white outline-none focus:border-primary transition-all text-xs shadow-inner"
                    />
                    <Search size={16} className="absolute left-4 top-3.5 text-gray-500" />
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
            </div>

            {/* Modules Grid / Cards */}
            {vModules.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] bg-surface/30 p-8 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <FolderTree size={32} />
                    </div>
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-bold text-base">
                            {search ? 'No Matching Modules Found' : 'No Modules in this Department Yet'}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1 max-w-sm">
                            {search ? 'Try clearing your search term to view all modules.' : 'Create sub-categories (like 1.1, 1.2, etc.) to organize tasks inside this department.'}
                        </p>
                    </div>
                    {!search && (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 h-11 px-6 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Add First Module
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {vModules.map((m: any) => {
                        const formattedDate = m.due_date ? formatDate(m.due_date) : null;
                        return (
                            <div 
                                key={m.id}
                                onClick={() => onSelectModule(m)}
                                className="bg-surface border border-border hover:border-primary/40 rounded-2xl md:rounded-[1.75rem] p-5 md:p-6 flex flex-col justify-between gap-4 transition-all hover:shadow-2xl hover:scale-[1.01] cursor-pointer group relative overflow-hidden"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-xl text-xs font-mono font-black tracking-wider group-hover:bg-primary group-hover:text-white transition-colors">
                                            {m.code}
                                        </span>
                                        {canManage && (
                                            <button 
                                                onClick={(e) => handleDelete(m.id, e)} 
                                                className="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors flex items-center justify-center opacity-70 group-hover:opacity-100"
                                                title="Delete Module"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {m.name}
                                    </h3>

                                    {m.description && (
                                        <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 leading-relaxed bg-background/50 p-2.5 rounded-xl border border-border/40">
                                            {m.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-border/50 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 gap-2">
                                        {m.assignee_first_name ? (
                                            <div className="flex items-center gap-1.5 text-secondary font-bold uppercase tracking-wider">
                                                <User size={12} />
                                                <span className="truncate max-w-[130px]">{m.assignee_first_name} {m.assignee_last_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-bold uppercase tracking-wider">Unassigned</span>
                                        )}

                                        {formattedDate && (
                                            <div className="flex items-center gap-1 font-bold">
                                                <Calendar size={12} />
                                                <span>{formattedDate}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-primary pt-1">
                                        <span>Click for Full Details</span>
                                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Module Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
                    <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/50">
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Add New Module</h3>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Under {vertical.name}</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-9 h-9 flex items-center justify-center bg-surface border border-border rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="p-6 md:p-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Module Code (e.g. 1.1)</label>
                                    <input 
                                        required 
                                        placeholder="e.g. 1.1 or 2.3"
                                        value={newCode} 
                                        onChange={e => setNewCode(e.target.value)} 
                                        className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white font-mono text-xs outline-none focus:border-primary transition-colors" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Due Date</label>
                                    <input 
                                        type="date" 
                                        value={newDueDate} 
                                        onChange={e => setNewDueDate(e.target.value)} 
                                        className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Module Title / Name</label>
                                <input 
                                    required 
                                    placeholder="e.g. Human Resource Management"
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)} 
                                    className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors" 
                                />
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Assign Responsible Person</label>
                                <select 
                                    value={newAssigneeId} 
                                    onChange={e => setNewAssigneeId(e.target.value)} 
                                    className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary transition-colors"
                                >
                                    <option value="">-- Unassigned --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest pl-1">Description</label>
                                <textarea 
                                    value={newDescription} 
                                    onChange={e => setNewDescription(e.target.value)} 
                                    placeholder="Detailed guidelines or tasks under this module..." 
                                    className="w-full mt-1.5 bg-background border border-border p-4 rounded-xl text-gray-900 dark:text-white text-xs outline-none focus:border-primary min-h-[100px] resize-none transition-all shadow-inner" 
                                />
                            </div>

                            <div className="pt-4 flex gap-3 border-t border-border/50">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)} 
                                    className="flex-1 h-12 rounded-xl bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all font-black uppercase tracking-widest text-[10px] shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="flex-[2] h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ModulesPage() {
    const [verticals, setVerticals] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedModule, setSelectedModule] = useState<any>(null);
    const [activeVertical, setActiveVertical] = useState<any>(null);
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userRole: string = user.role || '';

    const fetchData = async () => {
        setFetching(true);
        try {
            const [vRes, mRes, uRes] = await Promise.all([
                api.get('/verticals'),
                api.get('/modules'),
                api.get('/users?limit=1000')
            ]);
            const fetchedVerticals = (vRes.data.verticals || []).sort((a: any, b: any) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            const fetchedModules = mRes.data.modules || [];
            const fetchedUsers = uRes.data.users || [];

            setVerticals(fetchedVerticals);
            setModules(fetchedModules);
            setUsers(fetchedUsers);
            
            if (activeVertical) {
                const updatedActive = fetchedVerticals.find((v: any) => v.id === activeVertical.id);
                if (updatedActive) setActiveVertical(updatedActive);
            }

            if (selectedModule) {
                const updatedModal = fetchedModules.find((m: any) => m.id === selectedModule.id);
                if (updatedModal) setSelectedModule(updatedModal);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredVerticals = search 
        ? verticals.filter(v => 
            v.name.toLowerCase().includes(search.toLowerCase()) || 
            modules.some((m: any) => m.vertical_id === v.id && (
                m.name.toLowerCase().includes(search.toLowerCase()) || 
                m.code.toLowerCase().includes(search.toLowerCase()) || 
                m.description?.toLowerCase().includes(search.toLowerCase())
            ))
          )
        : verticals;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-10 relative">
            {selectedModule && (
                <ModuleModal 
                    module={selectedModule}
                    users={users} 
                    userRole={userRole}
                    onClose={() => setSelectedModule(null)} 
                    onRefresh={fetchData} 
                />
            )}

            {activeVertical ? (
                /* Individual Department Page */
                <IndividualDepartmentView 
                    vertical={activeVertical}
                    modules={modules}
                    users={users}
                    userRole={userRole}
                    onBack={() => setActiveVertical(null)}
                    onRefresh={fetchData}
                    onSelectModule={setSelectedModule}
                />
            ) : (
                /* Main Departments Catalog Grid */
                <div className="space-y-6 md:space-y-10 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="p-1.5 rounded-lg bg-primary/10 text-primary"><Layers size={16}/></span>
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">Department Structure</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">System Modules</h1>
                            <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 opacity-60">
                                Select any department to view and manage its modules individually
                            </p>
                        </div>
                        
                        <div className="w-full lg:w-96 relative">
                            <input
                                type="text"
                                placeholder="Search departments or modules..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-14 pl-12 pr-6 bg-surface border border-border rounded-2xl text-gray-900 dark:text-white outline-none focus:border-primary transition-all text-xs shadow-2xl"
                            />
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Content */}
                    {fetching && verticals.length === 0 ? (
                        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <span>Loading Departments...</span>
                        </div>
                    ) : filteredVerticals.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">
                            No departments found matching your search.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredVerticals.map(v => {
                                const deptModules = modules.filter((m: any) => m.vertical_id === v.id);
                                const moduleCount = deptModules.length;
                                return (
                                    <div 
                                        key={v.id}
                                        onClick={() => setActiveVertical(v)}
                                        className="bg-surface border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 rounded-[1.75rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col justify-between gap-6 transition-all group cursor-pointer relative overflow-hidden min-h-[180px] hover:scale-[1.02]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="p-3.5 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Building2 size={22} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                moduleCount > 0 
                                                    ? 'bg-secondary/10 text-secondary border-secondary/20' 
                                                    : 'bg-background text-gray-500 border-border'
                                            }`}>
                                                {moduleCount} {moduleCount === 1 ? 'Module' : 'Modules'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-tight line-clamp-2">
                                                {v.name}
                                            </h3>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 opacity-60">
                                                Click to open individually
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[10px] font-black uppercase tracking-widest text-primary">
                                            <span>Manage Modules</span>
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-1">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>

                                        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


import { useEffect, useState } from 'react';
import { Loader2, FolderTree, Trash2, X, ChevronDown, ChevronUp, Plus, Search, Calendar, User, Edit3 } from 'lucide-react';
import api from '../../api';

function ModuleModal({ module, users, onClose, onRefresh }: { module: any, users: any[], onClose: ()=>void, onRefresh: ()=>void }) {
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
           onClose(); // Alternatively stay open in view mode, but closing is faster workflow
       } catch (err) {
           console.error(err);
           alert('Failed to update module');
       } finally {
           setSaving(false);
       }
   };

   const assignee = users.find(u => u.id === module.assignee_id);
   const assigneeName = assignee ? `${assignee.first_name} ${assignee.last_name}` : (module.assignee_first_name ? `${module.assignee_first_name} ${module.assignee_last_name}` : 'Unassigned');
   const formattedDate = module.due_date ? new Date(module.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Deadline';

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              
              <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-background/50">
                  <div className="flex items-center gap-3">
                      <h3 className="text-white font-black text-xl md:text-2xl tracking-tight flex items-center gap-3">
                          <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg text-sm font-mono tracking-widest">{module.code}</span>
                          Module Details
                      </h3>
                  </div>
                  <button onClick={onClose} className="relative z-10 w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-full text-gray-500 hover:text-white hover:border-border/80 transition-all"><X size={16} /></button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto">
                  {!isEditing ? (
                      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                          <div>
                              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Module Name</h4>
                              <p className="text-xl font-bold text-white leading-tight">{module.name}</p>
                          </div>
                          
                          {module.description && (
                              <div>
                                  <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Description</h4>
                                  <p className="text-sm text-gray-300 leading-relaxed bg-background border border-border/50 p-5 rounded-2xl whitespace-pre-wrap">{module.description}</p>
                              </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-background border border-border/50 p-4 rounded-2xl flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                      <User size={16} />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Assignee</p>
                                      <p className="text-sm font-bold text-white truncate">{assigneeName}</p>
                                  </div>
                              </div>
                              <div className="bg-background border border-border/50 p-4 rounded-2xl flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20 shrink-0">
                                      <Calendar size={16} />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Due Date</p>
                                      <p className="text-sm font-bold text-white truncate">{formattedDate}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="pt-4 flex gap-4">
                              <button onClick={() => setIsEditing(true)} className="flex-1 h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-white/5"><Edit3 size={14} /> Edit Module</button>
                          </div>
                      </div>
                  ) : (
                      <form onSubmit={handleSave} className="flex flex-col gap-5 animate-in slide-in-from-left-4 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Module Code</label>
                                  <input required value={code} onChange={e=>setCode(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-white font-mono text-xs outline-none focus:border-primary transition-colors" />
                              </div>
                              <div>
                                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Due Date</label>
                                  <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-white text-xs outline-none focus:border-primary transition-colors" />
                              </div>
                          </div>
                          
                          <div>
                              <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Module Name</label>
                              <input required value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-white text-xs outline-none focus:border-primary transition-colors" />
                          </div>

                          <div>
                              <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Assign User</label>
                              <select value={assigneeId} onChange={e=>setAssigneeId(e.target.value)} className="w-full mt-1.5 h-12 bg-background border border-border px-4 rounded-xl text-white text-xs outline-none focus:border-primary transition-colors">
                                  <option value="">-- Unassigned --</option>
                                  {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</option>
                                  ))}
                              </select>
                          </div>

                          <div>
                              <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Detailed Description</label>
                              <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Write details about what tasks go into this module..." className="w-full mt-1.5 bg-background border border-border p-4 rounded-xl text-white text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] resize-none transition-all shadow-inner" />
                          </div>

                          <div className="pt-4 flex gap-4 border-t border-border/50">
                              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 h-12 rounded-xl bg-background border border-border text-gray-400 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">Back to View</button>
                              <button type="submit" disabled={saving} className="flex-[2] h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
                          </div>
                      </form>
                  )}
              </div>
          </div>
      </div>
   );
}

function VerticalCard({ vertical, modules, onRefresh, search, onSelectModule }: { vertical: any, modules: any[], onRefresh: () => void, search: string, onSelectModule: (m:any)=>void }) {
    const [expanded, setExpanded] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');

    const matchesVertical = search && vertical.name.toLowerCase().includes(search.toLowerCase());
    const vModules = modules.filter((m: any) => 
        m.vertical_id === vertical.id && 
        (!search || matchesVertical || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()))
    );

    useEffect(() => {
        if (search && vModules.length > 0) {
            setExpanded(true);
        } else if (!search) {
            setExpanded(false);
        }
    }, [search]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/modules', { vertical_id: vertical.id, code: newCode, name: newName });
            setNewCode('');
            setNewName('');
            onRefresh();
            setExpanded(true);
        } catch (err) {
            console.error(err);
            alert('Failed to add module');
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
        }
    };

    return (
        <div className={`bg-surface border rounded-[2rem] shadow-2xl flex flex-col transition-all h-max overflow-hidden ${expanded ? 'border-primary shadow-primary/20' : 'border-border hover:border-primary/20'}`}>
            <div 
                className={`p-5 md:p-6 cursor-pointer flex justify-between items-center group transition-all border-b ${expanded ? 'bg-primary/10 border-primary/20' : 'bg-background/30 hover:bg-background/80 border-border/50'}`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 pr-4">
                   <h3 className="text-base md:text-lg font-black text-white group-hover:text-primary transition-all tracking-tight leading-tight">{vertical.name}</h3>
                   <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {modules.filter((m: any) => m.vertical_id === vertical.id).length} Modules
                   </p>
                </div>
                <div className={`shrink-0 transition-transform ${expanded ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface text-gray-500 border-border group-hover:text-primary'} border p-2 md:p-3 rounded-xl`}>
                   {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {expanded && (
                <div className="p-4 md:p-6 bg-surface/50">
                    <div className="space-y-4">
                        {vModules.length === 0 ? (
                            <div className="py-6 text-center border border-dashed border-border rounded-2xl bg-background/50">
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{search ? 'No Matches in this Department' : 'No Modules Yet'}</p>
                            </div>
                        ) : vModules.map((m: any) => (
                            <div 
                                key={m.id} 
                                className="bg-background border border-border p-4 rounded-2xl flex flex-col gap-3 group/item hover:border-primary/40 transition-colors shadow-lg cursor-pointer"
                                onClick={() => onSelectModule(m)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-primary shadow-inner">
                                        <FolderTree size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <h4 className="text-white font-bold text-sm leading-tight flex flex-col items-start gap-1.5">
                                            <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono text-[10px] uppercase tracking-widest">{m.code}</span>
                                            <span className="truncate block max-w-full group-hover/item:text-primary transition-colors">{m.name}</span>
                                        </h4>
                                        {m.description && (
                                            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap bg-surface p-2.5 rounded-lg border border-border/50 shadow-inner line-clamp-2">{m.description}</p>
                                        )}
                                        {m.assignee_first_name && (
                                            <div className="flex items-center gap-1.5 mt-2 text-[9px] font-black uppercase tracking-widest text-secondary">
                                                <User size={10} />
                                                <span>Assigned to {m.assignee_first_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-1">
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest px-2 group-hover/item:text-white transition-colors">Tap for Details & Edit</span>
                                    <button onClick={(e) => handleDelete(m.id, e)} className="h-8 px-3 rounded-lg bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-colors flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold tracking-widest"><Trash2 size={12} /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/80">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3 pl-1">Quick Add Module</p>
                        <form onSubmit={handleAdd} className="flex flex-col gap-3">
                            <input type="text" placeholder="Code (e.g. 1.1)" value={newCode} onChange={e => setNewCode(e.target.value)} required className="w-full bg-background border border-border h-12 px-4 rounded-xl text-white text-xs outline-none focus:border-primary transition-colors" />
                            <input type="text" placeholder="Module Name (Title)" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-background border border-border h-12 px-4 rounded-xl text-white text-xs outline-none focus:border-primary transition-colors" />
                            <button type="submit" className="h-12 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-1 shadow-lg shadow-white/5">
                                 <Plus size={16} /> Quick Add
                            </button>
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

    const fetchData = async () => {
        setFetching(true);
        try {
            const [vRes, mRes, uRes] = await Promise.all([
                api.get('/verticals'),
                api.get('/modules'),
                api.get('/users')
            ]);
            setVerticals(vRes.data.verticals || []);
            setModules(mRes.data.modules || []);
            setUsers(uRes.data.users || []);
            
            if (selectedModule) {
               const updatedModal = (mRes.data.modules || []).find((m:any) => m.id === selectedModule.id);
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
            modules.some((m:any) => m.vertical_id === v.id && (m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase())))
          )
        : verticals;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-10 relative">
            {selectedModule && (
                <ModuleModal 
                    module={selectedModule}
                    users={users} 
                    onClose={() => setSelectedModule(null)} 
                    onRefresh={fetchData} 
                />
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">System Modules</h1>
                    <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 md:mt-2 opacity-60">Manage detailed categorization for departments</p>
                </div>
                
                <div className="w-full lg:w-96 relative">
                    <input
                        type="text"
                        placeholder="Search departments or modules..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 bg-surface border border-border rounded-2xl text-white outline-none focus:border-primary transition-all text-xs shadow-2xl"
                    />
                    <Search size={18} className="absolute left-4 top-4.5 text-gray-500" />
                </div>
            </div>

            {fetching && verticals.length === 0 ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span>Loading Repository...</span>
                </div>
            ) : filteredVerticals.length === 0 ? (
                <div className="py-20 text-center text-gray-700 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">
                    No search results found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {filteredVerticals.map(v => (
                        <VerticalCard 
                            key={v.id} 
                            vertical={v} 
                            modules={modules} 
                            onRefresh={fetchData} 
                            search={search}
                            onSelectModule={setSelectedModule}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

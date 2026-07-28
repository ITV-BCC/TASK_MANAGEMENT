import { useEffect, useState } from 'react';
import { Loader2, FolderTree, Trash2, Edit3, X, Check, Search } from 'lucide-react';
import api from '../../api';

export default function ModulesPage() {
    const [verticals, setVerticals] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedVertical, setSelectedVertical] = useState<string>('');
    const [fetching, setFetching] = useState(true);
    
    // Add Form
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');
    
    // Edit Form
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editCode, setEditCode] = useState('');
    const [editName, setEditName] = useState('');
    
    // Search filter
    const [search, setSearch] = useState('');

    const fetchVerticals = async () => {
        try {
            const res = await api.get('/verticals');
            setVerticals(res.data.verticals || []);
            if (res.data.verticals?.length > 0) {
                setSelectedVertical(res.data.verticals[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchModules = async (vid: string) => {
        setFetching(true);
        try {
            const res = await api.get(`/modules${vid ? `?vertical_id=${vid}` : ''}`);
            setModules(res.data.modules || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchVerticals();
    }, []);

    useEffect(() => {
        if (selectedVertical) {
            fetchModules(selectedVertical);
        }
    }, [selectedVertical]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/modules', { vertical_id: selectedVertical, code: newCode, name: newName });
            setNewCode('');
            setNewName('');
            fetchModules(selectedVertical);
        } catch (err) {
            console.error(err);
            alert('Failed to add module');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this module? Tasks assigned to it will retain it, or revert to Global.')) return;
        try {
            await api.delete(`/modules/${id}`);
            fetchModules(selectedVertical);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await api.put(`/modules/${id}`, { code: editCode, name: editName });
            setEditMode(null);
            fetchModules(selectedVertical);
        } catch (err) {
            console.error(err);
            alert('Failed to update module');
        }
    };

    const startEdit = (m: any) => {
        setEditMode(m.id);
        setEditCode(m.code);
        setEditName(m.name);
    };

    const filteredModules = modules.filter(m => 
        (m.name.toLowerCase().includes(search.toLowerCase())) ||
        (m.code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">System Modules</h1>
                <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.2em] mt-1.5 md:mt-2 opacity-60">Manage detailed categorization for departments</p>
            </div>

            {/* Department Selector & Search */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-surface border border-border p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl">
                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pl-2 block mb-3">Select Active Department</label>
                    <select 
                        className="w-full h-14 bg-background border border-border rounded-xl px-6 text-white outline-none focus:border-primary transition-all shadow-inner uppercase font-black text-xs md:text-sm tracking-widest"
                        value={selectedVertical}
                        onChange={(e) => setSelectedVertical(e.target.value)}
                    >
                        {verticals.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 bg-surface border border-border p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col justify-end">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-6 bg-background border border-border rounded-xl text-white outline-none focus:border-primary shadow-inner transition-all text-xs md:text-sm"
                        />
                        <Search size={18} className="absolute left-4 top-4.5 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Add New Module */}
            <form onSubmit={handleAdd} className="bg-surface border border-border p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-2xl group focus-within:border-primary/30 transition-all">
                <h2 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-6">
                    Add New Module
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        required
                        className="w-full md:w-48 bg-background border border-border h-12 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl text-gray-900 dark:text-white text-xs md:text-sm outline-none focus:border-primary transition-all shadow-inner font-mono tracking-widest"
                        placeholder="Code (e.g. 1.1)"
                        value={newCode}
                        onChange={e => setNewCode(e.target.value)}
                    />
                    <input 
                        type="text"
                        required
                        className="flex-1 bg-background border border-border h-12 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl text-gray-900 dark:text-white text-xs md:text-sm outline-none focus:border-primary transition-all shadow-inner"
                        placeholder="Module Name (e.g. HUMAN RESOURCE)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <button type="submit" className="h-12 md:h-16 px-6 md:px-10 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-primaryHover transition-all shadow-xl shadow-primary/20">
                        Commit
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {fetching ? (
                    <div className="py-20 flex justify-center text-primary"><Loader2 size={32} className="animate-spin" /></div>
                ) : filteredModules.length === 0 ? (
                    <div className="py-32 text-center text-gray-700 font-black uppercase tracking-widest text-[10px] border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem]">No Modules Defined for this Department</div>
                ) : filteredModules.map((m) => (
                    <div key={m.id} className="bg-surface border border-border p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col md:flex-row md:items-center justify-between hover:border-border/80 transition-all shadow-lg group">
                        
                        {editMode === m.id ? (
                            <div className="flex flex-col md:flex-row gap-4 flex-1 mr-0 md:mr-6">
                                <input 
                                    className="w-full md:w-32 h-12 bg-background border border-primary/50 rounded-xl px-4 text-white text-xs font-mono outline-none" 
                                    value={editCode} 
                                    onChange={e => setEditCode(e.target.value)} 
                                />
                                <input 
                                    className="flex-1 h-12 bg-background border border-primary/50 rounded-xl px-6 text-white text-xs outline-none" 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 md:gap-6 flex-1 mb-4 md:mb-0">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.2rem] bg-background border border-border flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-all text-primary">
                                    <FolderTree size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-white font-black text-sm md:text-base tracking-tight truncate flex items-center gap-3">
                                        <span className="text-primary font-mono">{m.code}</span>
                                        {m.name}
                                    </h3>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1 truncate">ID: {m.id.substring(0,8)}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 justify-end self-end md:self-auto">
                            {editMode === m.id ? (
                                <>
                                    <button onClick={() => setEditMode(null)} className="p-3 md:p-4 rounded-xl bg-background border border-border text-gray-500 hover:text-white transition-all shadow-sm"><X size={16} /></button>
                                    <button onClick={() => handleUpdate(m.id)} className="p-3 md:p-4 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"><Check size={16} /></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(m)} className="p-3 md:p-4 rounded-xl bg-background border border-border text-gray-500 hover:text-white transition-all shadow-sm"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDelete(m.id)} className="p-3 md:p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

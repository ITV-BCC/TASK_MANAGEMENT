import { useEffect, useState } from 'react';
import { Plus, Building2, Trash2, Edit3, X, Check } from 'lucide-react';
import api from '../../api';

export default function VerticalsPage() {
  const [verticals, setVerticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVertical, setNewVertical] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchVerticals = async () => {
    try {
      const res = await api.get('/verticals');
      setVerticals(res.data.verticals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerticals();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVertical.trim()) return;

    try {
      await api.post('/verticals', { name: newVertical });
      setNewVertical('');
      fetchVerticals();
    } catch (err) {
      alert('Failed to create vertical');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will affect any users or tasks currently linked to it.`)) return;
    try {
      await api.delete(`/verticals/${id}`);
      fetchVerticals();
    } catch (err) {
      alert('Failed to delete vertical (likely because it has linked users/tasks)');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    try {
      await api.put(`/verticals/${id}`, { name: editValue });
      setEditingId(null);
      fetchVerticals();
    } catch (err) {
      alert('Failed to update vertical');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Strategic Sectors</h1>
        <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.4em] mt-1.5 md:mt-2 opacity-60">System Organization & Global Infrastructure</p>
      </div>

      {/* Add New - Optimized for Mobile */}
      <form onSubmit={handleAdd} className="bg-surface border border-border p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-2xl max-w-2xl group focus-within:border-primary/30 transition-all">
         <h2 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-6 flex items-center gap-2">
             <Plus size={14} className="text-primary" /> Initialize New Department
         </h2>
         <div className="flex flex-col sm:flex-row gap-4">
            <input 
                type="text" 
                className="flex-1 bg-background border border-border h-12 md:h-16 px-6 md:px-8 rounded-xl md:rounded-2xl text-gray-900 dark:text-white text-xs md:text-sm outline-none focus:border-primary transition-all shadow-inner"
                placeholder="e.g. Marketing, Logistics..."
                value={newVertical}
                onChange={e => setNewVertical(e.target.value)}
            />
            <button type="submit" className="h-12 md:h-16 px-6 md:px-10 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-primaryHover transition-all shadow-xl shadow-primary/20">
                Initialize
            </button>
         </div>
      </form>

      {/* Grid - Adaptive Layout */}
      {loading ? (
          <div className="py-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Grid Infrastructure...</div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {verticals.map((v) => (
                  <div key={v.id} className="bg-surface border border-border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl min-h-[160px] md:h-48 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                          <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/5 text-primary`}>
                              <Building2 className="size-5 md:size-6" />
                          </div>
                          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingId(v.id); setEditValue(v.name); }} className="p-2.5 text-gray-500 hover:text-primary dark:hover:text-white hover:bg-primary/5 rounded-xl transition-all"><Edit3 size={16}/></button>
                              <button onClick={() => handleDelete(v.id, v.name)} className="p-2.5 text-gray-500 hover:text-danger hover:bg-danger/5 rounded-xl transition-all"><Trash2 size={16}/></button>
                          </div>
                      </div>

                      {editingId === v.id ? (
                          <div className="mt-4 flex gap-2 animate-in zoom-in-95 duration-200">
                             <input 
                                autoFocus
                                className="flex-1 bg-background border border-primary/50 text-xs px-4 py-2 rounded-xl text-gray-900 dark:text-white outline-none"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                             />
                             <button onClick={() => handleUpdate(v.id)} className="p-2 bg-primary text-white rounded-xl flex items-center justify-center shrink-0"><Check size={16}/></button>
                             <button onClick={() => setEditingId(null)} className="p-2 bg-background border border-border text-gray-500 rounded-xl flex items-center justify-center shrink-0"><X size={16}/></button>
                          </div>
                      ) : (
                          <div className="mt-4">
                            <h3 className="text-gray-900 dark:text-white font-bold text-base md:text-lg tracking-tight uppercase line-clamp-2">{v.name}</h3>
                            <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 opacity-60">Established: {new Date(v.created_at).toLocaleDateString()}</p>
                          </div>
                      )}

                      {/* Accent Line (Mobile support) */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -mr-12 -mt-12 pointer-events-none"></div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

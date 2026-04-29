import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Folder, Plus, X, Download, ChevronRight, Search, FolderOpen, Trash2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roomType?: string;
  style?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  createdAt?: any;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  createdAt?: any;
}

export default function ProjectsPanel() {
  const { userData } = useAuth();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [selected, setSelected]   = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [newName, setNewName]     = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes]   = useState('');
  const [creating, setCreating]   = useState(false);

  const tid = userData?.tenantId;

  useEffect(() => {
    if (!tid) return;
    const unsub1 = onSnapshot(query(collection(db, `tenants/${tid}/projects`), orderBy('createdAt', 'desc')), snap => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    });
    const unsub2 = onSnapshot(query(collection(db, `tenants/${tid}/widgetLeads`), orderBy('createdAt', 'desc')), snap => {
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
    });
    return () => { unsub1(); unsub2(); };
  }, [tid]);

  const createProject = async () => {
    if (!newName.trim() || !tid) return;
    setCreating(true);
    try {
      const ref = await addDoc(collection(db, `tenants/${tid}/projects`), {
        name: newName.trim(), address: newAddress.trim(), notes: newNotes.trim(), createdAt: serverTimestamp(),
      });
      setSelected(ref.id);
      setShowNew(false); setNewName(''); setNewAddress(''); setNewNotes('');
      toast.success('Project created');
    } catch { toast.error('Failed to create project'); }
    setCreating(false);
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm('Delete this project?') || !tid) return;
    await deleteDoc(doc(db, `tenants/${tid}/projects`, id));
    if (selected === id) setSelected(null);
    toast.success('Project deleted');
  };

  const assignLead = async (leadId: string, projectId: string | null) => {
    if (!tid) return;
    await updateDoc(doc(db, `tenants/${tid}/widgetLeads`, leadId), { projectId });
    toast.success(projectId ? 'Lead added to project' : 'Lead removed from project');
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const selectedProject  = projects.find(p => p.id === selected);
  const projectLeads     = leads.filter(l => l.projectId === selected);
  const unassigned       = leads.filter(l => !l.projectId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Saved Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your leads by customer or job.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-blue-electric text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* New project form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy">New Project</h3>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-navy"><X size={18} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Customer Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Johnson Family"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Address</label>
                <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="e.g. 123 Main St"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Notes</label>
              <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} rows={2} placeholder="Project details, scope, timeline..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-navy hover:bg-gray-50">Cancel</button>
              <button onClick={createProject} disabled={!newName.trim() || creating}
                className="px-5 py-2.5 bg-blue-electric text-white rounded-xl font-bold text-sm hover:bg-navy transition-all disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Project list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
          </div>

          {/* Unassigned leads shortcut */}
          <button onClick={() => setSelected(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${!selected ? 'bg-blue-electric text-white' : 'bg-white border border-gray-100 hover:border-blue-electric text-navy'}`}>
            <FolderOpen size={18} className={!selected ? 'text-white' : 'text-blue-electric'} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Unassigned Leads</p>
              <p className={`text-xs ${!selected ? 'text-blue-100' : 'text-gray-400'}`}>{unassigned.length} leads</p>
            </div>
          </button>

          {filteredProjects.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${selected === p.id ? 'bg-blue-electric text-white' : 'bg-white border border-gray-100 hover:border-blue-electric text-navy'}`}>
              <Folder size={18} className={selected === p.id ? 'text-white' : 'text-blue-electric'} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                {p.address && <p className={`text-xs truncate ${selected === p.id ? 'text-blue-100' : 'text-gray-400'}`}>{p.address}</p>}
                <p className={`text-xs ${selected === p.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {leads.filter(l => l.projectId === p.id).length} leads
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:text-red-400 ${selected === p.id ? 'text-white/50' : 'text-gray-300'}`}>
                <Trash2 size={14} />
              </button>
            </button>
          ))}

          {filteredProjects.length === 0 && !search && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Folder size={32} className="mx-auto mb-2 opacity-30" />
              No projects yet. Create one to organize your leads.
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            {selected ? (
              <div>
                <h3 className="font-bold text-navy">{selectedProject?.name}</h3>
                {selectedProject?.address && <p className="text-sm text-gray-400">{selectedProject.address}</p>}
                {selectedProject?.notes && <p className="text-sm text-gray-500 mt-1 italic">{selectedProject.notes}</p>}
              </div>
            ) : (
              <h3 className="font-bold text-navy">Unassigned Leads</h3>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {(selected ? projectLeads : unassigned).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ImageIcon size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No leads here yet</p>
                {!selected && <p className="text-xs mt-1">Leads from your widget appear here automatically</p>}
              </div>
            ) : (
              (selected ? projectLeads : unassigned).map(lead => (
                <div key={lead.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  {/* Before thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {lead.beforeImageUrl
                      ? <img src={lead.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                  </div>
                  {/* After thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    {lead.afterImageUrl
                      ? <><img src={lead.afterImageUrl} alt="After" className="w-full h-full object-cover" /><span className="absolute bottom-0.5 right-0.5 bg-blue-electric text-white text-[8px] font-bold px-1 rounded">AI</span></>
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy text-sm">{lead.name}</p>
                    <p className="text-xs text-gray-400">{lead.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{lead.roomType} · {lead.style}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lead.afterImageUrl && (
                      <a href={lead.afterImageUrl} download={`${lead.name}-remodel.jpg`}
                        className="p-2 text-gray-400 hover:text-blue-electric hover:bg-blue-50 rounded-lg transition-all">
                        <Download size={16} />
                      </a>
                    )}
                    {selected ? (
                      <button onClick={() => assignLead(lead.id, null)}
                        className="text-xs font-bold text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-all">
                        Remove
                      </button>
                    ) : (
                      <select onChange={e => e.target.value && assignLead(lead.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-navy focus:outline-none focus:border-blue-electric">
                        <option value="">Move to project...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

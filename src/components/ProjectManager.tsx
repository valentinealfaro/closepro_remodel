import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Users,
  Camera,
  FileText,
  MessageSquare,
  ChevronRight,
  LayoutGrid,
  List,
  MapPin,
  Clock3
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Project, ProjectStatus } from '../types/financial';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function ProjectManager() {
  const { userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!userData?.tenantId) return;

    const projectsRef = collection(db, `tenants/${userData.tenantId}/projects`);
    let q = query(projectsRef, orderBy('createdAt', 'desc'));

    if (statusFilter !== 'all') {
      q = query(projectsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, statusFilter]);

  const handleUpdateStatus = async (id: string, status: ProjectStatus) => {
    try {
      await updateDoc(doc(db, `tenants/${userData.tenantId}/projects`, id), {
        status,
        updatedAt: serverTimestamp()
      });
      toast.success('Project status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-600';
      case 'in_progress': return 'bg-yellow-100 text-yellow-600';
      case 'on_hold': return 'bg-red-100 text-red-600';
      case 'completed': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Projects</h1>
          <p className="text-gray-500">Track and manage your active remodeling jobs.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-electric text-white shadow-md shadow-blue-500/20' : 'text-gray-400 hover:text-navy hover:bg-gray-50'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-electric text-white shadow-md shadow-blue-500/20' : 'text-gray-400 hover:text-navy hover:bg-gray-50'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-electric shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-electric shadow-sm"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div 
              layout
              key={project.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </div>
                  <button className="text-gray-300 hover:text-navy transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-navy group-hover:text-electric transition-colors">{project.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> {project.address || 'No address specified'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</p>
                    <p className="text-sm font-bold text-navy flex items-center gap-1.5">
                      <Calendar size={14} className="text-electric" />
                      {project.startDate ? format(new Date(project.startDate), 'MMM d') : 'TBD'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-electric rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-navy">45%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1 text-xs">
                      <Camera size={14} /> 12
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare size={14} /> 5
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-3 bg-gray-50 text-navy font-bold text-sm hover:bg-electric hover:text-white transition-all flex items-center justify-center gap-2">
                View Project Details <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{project.title}</p>
                        <p className="text-xs text-gray-400">#{project.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {project.startDate ? format(new Date(project.startDate), 'MMM d') : 'TBD'} - {project.endDate ? format(new Date(project.endDate), 'MMM d') : 'TBD'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {[1, 2].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          U{i}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-electric hover:bg-blue-50 rounded-lg transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

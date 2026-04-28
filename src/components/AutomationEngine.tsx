import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Zap, 
  Play, 
  Pause, 
  MoreVertical, 
  Trash2, 
  Edit, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Search,
  Filter,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Automation } from '../types/automation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import AutomationBuilder from './AutomationBuilder';
import TemplateSelector from './TemplateSelector';

export default function AutomationEngine() {
  const { userData } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    if (!userData?.tenantId) return;

    const automationsRef = collection(db, `tenants/${userData.tenantId}/automations`);
    const q = query(automationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation));
      setAutomations(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, `tenants/${userData.tenantId}/automations`, id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Automation ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this automation?')) return;
    try {
      await deleteDoc(doc(db, `tenants/${userData.tenantId}/automations`, id));
      toast.success('Automation deleted');
    } catch (error) {
      toast.error('Failed to delete automation');
    }
  };

  const filteredAutomations = automations.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showBuilder) {
    return (
      <AutomationBuilder 
        automation={editingAutomation} 
        onClose={() => {
          setShowBuilder(false);
          setEditingAutomation(null);
        }} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Automation Engine</h1>
          <p className="text-gray-500">Scale your sales follow-up without manual effort.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 bg-white text-navy px-6 py-3 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
          >
            <LayoutTemplate size={20} />
            Templates
          </button>
          <button 
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 bg-electric text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <Plus size={20} />
            New Automation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Automations', value: automations.filter(a => a.isActive).length, icon: Zap, color: 'text-yellow-500' },
          { label: 'Total Executions', value: automations.reduce((acc, a) => acc + (a.stats?.runCount || 0), 0), icon: Play, color: 'text-blue-500' },
          { label: 'Success Rate', value: '98.5%', icon: CheckCircle2, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search automations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automation Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trigger</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Steps</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Runs</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAutomations.map((automation) => (
                <tr key={automation.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-navy text-sm">{automation.name}</p>
                      <p className="text-xs text-gray-400">{automation.description || 'No description'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Zap size={14} />
                      </div>
                      <span className="text-xs font-bold text-navy capitalize">
                        {automation.trigger.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-navy">{automation.steps.length} Steps</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-navy">{automation.stats?.runCount || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(automation.id, automation.isActive)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                        automation.isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {automation.isActive ? <Play size={12} /> : <Pause size={12} />}
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingAutomation(automation);
                          setShowBuilder(true);
                        }}
                        className="p-2 text-gray-400 hover:text-electric hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(automation.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <TemplateSelector 
            onClose={() => setShowTemplates(false)} 
            onSelect={(template) => {
              setEditingAutomation(template as any);
              setShowBuilder(true);
              setShowTemplates(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

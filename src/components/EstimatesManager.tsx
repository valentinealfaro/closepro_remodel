import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Copy,
  Trash2,
  Eye,
  Mail,
  MessageSquare
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Estimate, EstimateStatus } from '../types/financial';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import EstimateEditor from './EstimateEditor';
import { useSearchParams } from 'react-router-dom';

export default function EstimatesManager() {
  const { userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');
  const dealId = searchParams.get('dealId');

  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstimateStatus | 'all'>('all');
  const [showEditor, setShowEditor] = useState(!!leadId || !!dealId);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);

  useEffect(() => {
    if (leadId || dealId) {
      setShowEditor(true);
    }
  }, [leadId, dealId]);

  useEffect(() => {
    if (!userData?.tenantId) return;

    const estimatesRef = collection(db, `tenants/${userData.tenantId}/estimates`);
    let q = query(estimatesRef, orderBy('createdAt', 'desc'));

    if (statusFilter !== 'all') {
      q = query(estimatesRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Estimate));
      setEstimates(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this estimate?')) return;
    try {
      await deleteDoc(doc(db, `tenants/${userData.tenantId}/estimates`, id));
      toast.success('Estimate deleted');
    } catch (error) {
      toast.error('Failed to delete estimate');
    }
  };

  const handleDuplicate = async (estimate: Estimate) => {
    try {
      const { id, ...data } = estimate;
      await addDoc(collection(db, `tenants/${userData.tenantId}/estimates`), {
        ...data,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Estimate duplicated');
    } catch (error) {
      toast.error('Failed to duplicate estimate');
    }
  };

  const filteredEstimates = estimates.filter(e => 
    e.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.projectInfo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: EstimateStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'sent': return 'bg-blue-100 text-blue-600';
      case 'viewed': return 'bg-purple-100 text-purple-600';
      case 'approved': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (showEditor) {
    return (
      <EstimateEditor 
        estimate={editingEstimate} 
        leadId={leadId || undefined}
        dealId={dealId || undefined}
        onClose={() => {
          setShowEditor(false);
          setEditingEstimate(null);
          setSearchParams({}); // Clear query params
        }} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Estimates</h1>
          <p className="text-gray-500">Manage and track your project proposals.</p>
        </div>
        <button 
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 bg-electric text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus size={20} />
          Create Estimate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Sent', value: estimates.filter(e => e.status !== 'draft').length, icon: Send, color: 'text-blue-500' },
          { label: 'Approved', value: estimates.filter(e => e.status === 'approved').length, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Pending', value: estimates.filter(e => e.status === 'sent' || e.status === 'viewed').length, icon: Clock, color: 'text-yellow-500' },
          { label: 'Drafts', value: estimates.filter(e => e.status === 'draft').length, icon: FileText, color: 'text-gray-500' },
          { label: 'Rejected', value: estimates.filter(e => e.status === 'rejected').length, icon: AlertCircle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
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
              placeholder="Search by client or project..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-electric"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimate</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEstimates.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{estimate.projectInfo.name}</p>
                        <p className="text-xs text-gray-400">#{estimate.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-navy text-sm">{estimate.clientInfo.name}</p>
                      <p className="text-xs text-gray-400">{estimate.clientInfo.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-navy text-sm">${estimate.pricing.total.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(estimate.status)}`}>
                      {estimate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">
                      {estimate.createdAt?.toDate ? format(estimate.createdAt.toDate(), 'MMM d, yyyy') : 'Just now'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingEstimate(estimate);
                          setShowEditor(true);
                        }}
                        className="p-2 text-gray-400 hover:text-electric hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(estimate)}
                        className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-all"
                        title="Duplicate"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(estimate.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEstimates.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                        <FileText size={32} />
                      </div>
                      <p className="text-navy font-bold">No estimates found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

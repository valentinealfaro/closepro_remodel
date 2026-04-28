import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutomationService } from '../services/AutomationService';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  ChevronRight,
  Loader2,
  Tag,
  Download,
  Upload,
  Trash2,
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  UserPlus,
  Zap,
  Edit,
  ExternalLink,
  MoreHorizontal,
  ArrowUpDown,
  FilterX,
  Save,
  X,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  History,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Flame,
  DollarSign,
  MapPin,
  Briefcase,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

// --- Constants ---

const SERVICE_TYPES = [
  'Kitchen Remodel',
  'Bathroom Remodel',
  'Whole Home Remodel',
  'General Contractor',
  'Flooring',
  'Roofing',
  'Siding',
  'Windows',
  'Concrete',
  'Other'
];

const LEAD_SOURCES = [
  'Website Form',
  'Facebook',
  'Google Ads',
  'Google Organic',
  'Referral',
  'Phone Call',
  'Manual Entry',
  'Yelp',
  'Instagram',
  'Other'
];

const LEAD_STATUSES = [
  { label: 'New Lead', value: 'new', color: 'bg-blue-100 text-blue-600' },
  { label: 'Attempted Contact', value: 'attempted', color: 'bg-orange-100 text-orange-600' },
  { label: 'Contacted', value: 'contacted', color: 'bg-sky-100 text-sky-600' },
  { label: 'Consultation Scheduled', value: 'scheduled', color: 'bg-purple-100 text-purple-600' },
  { label: 'Consultation Completed', value: 'completed', color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Proposal Sent', value: 'proposal', color: 'bg-amber-100 text-amber-600' },
  { label: 'Follow-Up', value: 'followup', color: 'bg-pink-100 text-pink-600' },
  { label: 'Won', value: 'won', color: 'bg-green-100 text-green-600' },
  { label: 'Lost', value: 'lost', color: 'bg-red-100 text-red-600' },
  { label: 'Cold Lead', value: 'cold', color: 'bg-gray-100 text-gray-600' }
];

const PRIORITIES = [
  { label: 'Hot', value: 'hot', color: 'text-red-500', icon: Flame },
  { label: 'Warm', value: 'warm', color: 'text-orange-500', icon: Clock },
  { label: 'Cold', value: 'cold', color: 'text-blue-500', icon: XCircle }
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-navy">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Drawer = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 backdrop-blur-sm">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-navy">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function LeadsManager() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [viewFilter, setViewFilter] = useState('all');
  const [sortBy, setSortBy] = useState({ field: 'createdAt', direction: 'desc' });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyName: '',
    serviceType: SERVICE_TYPES[0],
    source: LEAD_SOURCES[0],
    status: 'new',
    assignedTo: userData?.name || '',
    jobValue: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
    priority: 'warm',
    nextFollowUp: '',
    appointmentDate: '',
    appointmentTime: '',
    adCampaignId: '',
    adPlatform: ''
  });

  // --- Data Fetching ---

  useEffect(() => {
    if (!userData?.tenantId) return;

    const q = query(
      collection(db, `tenants/${userData.tenantId}/leads`),
      orderBy(sortBy.field, sortBy.direction as any)
    );

    const leadsPath = `tenants/${userData.tenantId}/leads`;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, leadsPath);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, sortBy]);

  // --- Handlers ---

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      toast.error('First Name and Phone are required');
      return;
    }

    const leadData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tenantId: userData.tenantId,
      createdBy: userData.uid,
      jobValue: parseFloat(formData.jobValue) || 0,
      activity: [
        { type: 'created', date: new Date().toISOString(), note: 'Lead created manually' }
      ]
    };

    try {
      const leadsPath = `tenants/${userData.tenantId}/leads`;
      const docRef = await addDoc(collection(db, leadsPath), leadData).catch(e => handleFirestoreError(e, OperationType.CREATE, leadsPath));
      
      if (docRef) {
        // Trigger automation
        await AutomationService.trigger(userData.tenantId, 'lead_created', { id: docRef.id, ...leadData });
      }

      toast.success('Lead added successfully');
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Unable to create lead. Please try again.');
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const leadData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
      updatedAt: serverTimestamp(),
      jobValue: parseFloat(formData.jobValue) || 0
    };

    try {
      const leadPath = `tenants/${userData.tenantId}/leads/${selectedLead.id}`;
      await updateDoc(doc(db, leadPath), leadData).catch(e => handleFirestoreError(e, OperationType.UPDATE, leadPath));
      toast.success('Lead updated successfully');
      setIsEditModalOpen(false);
      setSelectedLead(null);
      resetForm();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Unable to update lead. Please try again.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const leadPath = `tenants/${userData.tenantId}/leads/${id}`;
      await deleteDoc(doc(db, leadPath)).catch(e => handleFirestoreError(e, OperationType.DELETE, leadPath));
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Error deleting lead');
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    const promises = selectedLeads.map(id => {
      const leadPath = `tenants/${userData.tenantId}/leads/${id}`;
      return updateDoc(doc(db, leadPath), { status, updatedAt: serverTimestamp() })
        .catch(e => handleFirestoreError(e, OperationType.UPDATE, leadPath));
    });
    try {
      await Promise.all(promises);
      toast.success(`Updated ${selectedLeads.length} leads`);
      setSelectedLeads([]);
    } catch (error) {
      toast.error('Error updating leads');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'Source', 'Status', 'Value', 'Created'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.serviceType,
      lead.source,
      lead.status,
      lead.jobValue,
      lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      companyName: '',
      serviceType: SERVICE_TYPES[0],
      source: LEAD_SOURCES[0],
      status: 'new',
      assignedTo: userData?.name || '',
      jobValue: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      notes: '',
      priority: 'warm',
      nextFollowUp: '',
      appointmentDate: '',
      appointmentTime: '',
      adCampaignId: '',
      adPlatform: ''
    });
  };

  const openEditModal = (lead: any) => {
    const [firstName, ...lastNameParts] = lead.name.split(' ');
    setSelectedLead(lead);
    setFormData({
      ...lead,
      firstName,
      lastName: lastNameParts.join(' '),
      jobValue: lead.jobValue?.toString() || '',
      adCampaignId: lead.adCampaignId || '',
      adPlatform: lead.adPlatform || ''
    });
    setIsEditModalOpen(true);
  };

  // --- Filtering & Sorting ---

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesService = serviceFilter === 'all' || lead.serviceType === serviceFilter;

      // View Filter Logic
      let matchesView = true;
      const today = new Date().toISOString().split('T')[0];
      
      if (viewFilter === 'new_today') {
        matchesView = lead.createdAt?.toDate?.().toISOString().split('T')[0] === today;
      } else if (viewFilter === 'needs_followup') {
        matchesView = lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date() && lead.status !== 'won' && lead.status !== 'lost';
      } else if (viewFilter === 'hot') {
        matchesView = lead.priority === 'hot';
      } else if (viewFilter === 'my_leads') {
        matchesView = lead.assignedTo === userData?.name;
      } else if (viewFilter === 'unassigned') {
        matchesView = !lead.assignedTo || lead.assignedTo === 'Unassigned';
      }

      return matchesSearch && matchesStatus && matchesSource && matchesService && matchesView;
    });
  }, [leads, searchTerm, statusFilter, sourceFilter, serviceFilter, viewFilter, userData?.name]);

  // --- Stats ---

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: leads.length,
      newToday: leads.filter(l => l.createdAt?.toDate?.().toISOString().split('T')[0] === today).length,
      needsFollowUp: leads.filter(l => l.nextFollowUp && new Date(l.nextFollowUp) <= new Date()).length,
      scheduled: leads.filter(l => l.status === 'scheduled').length,
      won: leads.filter(l => l.status === 'won').length,
      pipelineValue: leads.reduce((acc, l) => acc + (l.jobValue || 0), 0)
    };
  }, [leads]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New Today', value: stats.newToday, icon: Plus, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Needs Follow-Up', value: stats.needsFollowUp, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Won (Month)', value: stats.won, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pipeline Value', value: `$${stats.pipelineValue.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-xl font-bold text-navy mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Leads Management</h1>
          <p className="text-gray-500">Manage and track all your incoming remodeling leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Saved Views / Quick Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { label: 'All Leads', filter: 'all' },
          { label: 'New Today', filter: 'new_today' },
          { label: 'Needs Follow-Up', filter: 'needs_followup' },
          { label: 'My Leads', filter: 'my_leads' },
          { label: 'Hot Leads', filter: 'hot' },
          { label: 'Won This Month', filter: 'won' },
          { label: 'Unassigned', filter: 'unassigned' }
        ].map((view) => (
          <button
            key={view.filter}
            onClick={() => {
              // Reset all filters first
              setStatusFilter('all');
              setSourceFilter('all');
              setServiceFilter('all');
              setSearchTerm('');
              
              // Apply specific view logic
              if (view.filter === 'new_today') {
                const today = new Date().toISOString().split('T')[0];
                setSearchTerm(''); // Clear search
                // Filtering logic will handle this in useMemo
              } else if (view.filter === 'hot') {
                // Filtering logic will handle this
              } else if (view.filter === 'won') {
                setStatusFilter('won');
              } else if (view.filter === 'unassigned') {
                // Filtering logic will handle this
              }
              // For now, we'll just set a 'view' state to handle more complex logic
              setViewFilter(view.filter);
            }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
              viewFilter === view.filter 
                ? "bg-navy text-white border-navy shadow-lg shadow-navy/20" 
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-navy"
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email, phone, or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric w-full transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-electric transition-all"
              >
                <option value="all">All Statuses</option>
                {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-electric transition-all"
              >
                <option value="all">All Sources</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-electric transition-all"
              >
                <option value="all">All Services</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {(statusFilter !== 'all' || sourceFilter !== 'all' || serviceFilter !== 'all' || searchTerm) && (
                <button 
                  onClick={() => { setStatusFilter('all'); setSourceFilter('all'); setServiceFilter('all'); setSearchTerm(''); }}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Clear Filters"
                >
                  <FilterX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-blue-700">{selectedLeads.length} leads selected</span>
                <div className="h-4 w-px bg-blue-200 mx-2" />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleBulkStatusChange('won')}
                    className="px-3 py-1.5 bg-white text-green-600 text-xs font-bold rounded-lg border border-green-100 hover:bg-green-50 transition-colors"
                  >
                    Mark Won
                  </button>
                  <button 
                    onClick={() => handleBulkStatusChange('lost')}
                    className="px-3 py-1.5 bg-white text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                  >
                    Mark Lost
                  </button>
                  <button 
                    onClick={() => handleBulkStatusChange('cold')}
                    className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    Move to Cold
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeads([])}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Deselect All
              </button>
            </motion.div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold w-10">
                  <button 
                    onClick={() => setSelectedLeads(selectedLeads.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                      <CheckSquare size={18} className="text-blue-electric" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-bold">
                  <button 
                    onClick={() => setSortBy({ field: 'name', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}
                    className="flex items-center gap-1 hover:text-navy transition-colors"
                  >
                    Lead Name <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-4 font-bold">Contact Info</th>
                <th className="px-6 py-4 font-bold">Service</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">AI Score</th>
                <th className="px-6 py-4 font-bold">Assigned To</th>
                <th className="px-6 py-4 font-bold">
                  <button 
                    onClick={() => setSortBy({ field: 'jobValue', direction: sortBy.direction === 'asc' ? 'desc' : 'asc' })}
                    className="flex items-center gap-1 hover:text-navy transition-colors"
                  >
                    Job Value <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="px-6 py-4 font-bold">Follow-Up</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-electric mb-2" size={32} />
                    <p className="text-gray-500">Loading leads...</p>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Users className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500 font-medium">No leads found.</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add New Lead" to create your first lead.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const statusInfo = LEAD_STATUSES.find(s => s.value === lead.status) || LEAD_STATUSES[0];
                  const priorityInfo = PRIORITIES.find(p => p.value === lead.priority) || PRIORITIES[1];
                  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date() && lead.status !== 'won' && lead.status !== 'lost';
                  const isDueToday = lead.nextFollowUp && new Date(lead.nextFollowUp).toDateString() === new Date().toDateString();

                  return (
                    <tr 
                      key={lead.id} 
                      className={cn(
                        "hover:bg-gray-50 transition-colors group cursor-pointer",
                        selectedLeads.includes(lead.id) && "bg-blue-50/50"
                      )}
                      onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedLeads(prev => prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id])}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {selectedLeads.includes(lead.id) ? (
                            <CheckSquare size={18} className="text-blue-electric" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            lead.status === 'won' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-electric'
                          )}>
                            {lead.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-navy text-sm">{lead.name}</p>
                              {lead.priority === 'hot' && <Flame size={14} className="text-red-500" />}
                            </div>
                            <p className="text-xs text-gray-400">{lead.companyName || 'Residential'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={12} />
                            <span>{lead.email || 'No email'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone size={12} />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-navy">{lead.serviceType}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{lead.source}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest", statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {lead.aiScore ? (
                          <div className={cn(
                            "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black",
                            lead.aiScore >= 80 ? "bg-red-100 text-red-600" : 
                            lead.aiScore >= 50 ? "bg-orange-100 text-orange-600" : 
                            "bg-blue-100 text-blue-600"
                          )}>
                            {lead.aiScore}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {lead.assignedTo?.[0] || '?'}
                          </div>
                          <span className="text-xs text-gray-600">{lead.assignedTo || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-navy">
                          ${(lead.jobValue || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {lead.nextFollowUp ? (
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-bold",
                            isOverdue ? "text-red-500" : isDueToday ? "text-orange-500" : "text-gray-500"
                          )}>
                            <Clock size={12} />
                            <span>{new Date(lead.nextFollowUp).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEditModal(lead)}
                            className="p-2 text-gray-400 hover:text-blue-electric hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Lead"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="relative group/menu">
                            <button className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover/menu:block z-20">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/app/estimates?leadId=${lead.id}`);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-600 font-bold hover:bg-blue-50 flex items-center gap-2"
                              >
                                <FileText size={14} /> Create Estimate
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  AutomationService.trigger(userData.tenantId, 'manual_enrollment', lead);
                                  toast.success('Lead enrolled in automations');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-electric font-bold hover:bg-blue-50 flex items-center gap-2"
                              >
                                <Zap size={14} /> Enroll in Automation
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                <MessageSquare size={14} /> Send SMS
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                <Mail size={14} /> Send Email
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                <Calendar size={14} /> Schedule Appt
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button className="w-full text-left px-4 py-2 text-sm text-green-600 font-bold hover:bg-green-50 flex items-center gap-2">
                                <CheckCircle2 size={14} /> Mark Won
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 flex items-center gap-2">
                                <XCircle size={14} /> Mark Lost
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-sm text-gray-500">Showing <b>{filteredLeads.length}</b> of <b>{leads.length}</b> leads</p>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Previous</button>
            <button disabled className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      <Modal 
        isOpen={isAddModalOpen || isEditModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedLead(null); resetForm(); }}
        title={isAddModalOpen ? 'Add New Lead' : 'Edit Lead'}
      >
        <form onSubmit={isAddModalOpen ? handleAddLead : handleUpdateLead} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name *</label>
              <input 
                required
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
              <input 
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone *</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Type *</label>
              <select 
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Source *</label>
              <select 
                required
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status *</label>
              <select 
                required
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                {LEAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</label>
              <input 
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="Rep Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Job Value ($)</label>
              <input 
                type="number"
                value={formData.jobValue}
                onChange={(e) => setFormData({...formData, jobValue: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric min-h-[120px] resize-none transition-all"
              placeholder="Enter lead notes here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Campaign ID</label>
              <input 
                type="text"
                value={formData.adCampaignId}
                onChange={(e) => setFormData({...formData, adCampaignId: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="Campaign ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Platform</label>
              <select 
                value={formData.adPlatform}
                onChange={(e) => setFormData({...formData, adPlatform: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                <option value="">None</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button 
              type="button"
              onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-electric text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
            >
              {isAddModalOpen ? 'Create Lead' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lead Details Drawer */}
      <Drawer 
        isOpen={isDetailsOpen} 
        onClose={() => { setIsDetailsOpen(false); setSelectedLead(null); }}
        title="Lead Details"
      >
        {selectedLead && (
          <div className="space-y-8">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-electric rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {selectedLead.name?.[0] || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy">{selectedLead.name}</h2>
                  <p className="text-gray-500">{selectedLead.companyName || 'Residential Client'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest",
                  LEAD_STATUSES.find(s => s.value === selectedLead.status)?.color || 'bg-gray-100'
                )}>
                  {selectedLead.status}
                </span>
                <div className="flex items-center gap-1 text-red-500 font-bold text-sm">
                  <Flame size={16} />
                  <span>{(selectedLead.priority || 'medium').toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Phone, label: 'Call', color: 'bg-green-50 text-green-600' },
                { icon: Mail, label: 'Email', color: 'bg-blue-50 text-blue-600' },
                { icon: MessageSquare, label: 'SMS', color: 'bg-purple-50 text-purple-600' },
                { icon: Calendar, label: 'Meet', color: 'bg-orange-50 text-orange-600' },
              ].map((action, i) => (
                <button key={i} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105", action.color)}>
                  <action.icon size={20} />
                  <span className="text-xs font-bold">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                <p className="text-sm font-bold text-navy">{selectedLead.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-navy truncate">{selectedLead.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</p>
                <p className="text-sm font-bold text-navy">{selectedLead.serviceType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</p>
                <p className="text-sm font-bold text-navy">{selectedLead.source}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Value</p>
                <p className="text-sm font-bold text-green-600">${(selectedLead.jobValue || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned To</p>
                <p className="text-sm font-bold text-navy">{selectedLead.assignedTo || 'Unassigned'}</p>
              </div>
            </div>

            {/* AI Insights */}
            {selectedLead.aiStrategy && (
              <div className="space-y-3">
                <h4 className="font-bold text-navy flex items-center gap-2">
                  <Zap size={18} className="text-blue-electric" />
                  AI Sales Strategy
                </h4>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                  <p className="text-sm text-navy font-medium leading-relaxed italic">
                    "{selectedLead.aiStrategy}"
                  </p>
                </div>
              </div>
            )}

            {/* Marketing Attribution */}
            {(selectedLead.adCampaignId || selectedLead.adPlatform) && (
              <div className="space-y-3">
                <h4 className="font-bold text-navy flex items-center gap-2">
                  <Megaphone size={18} className="text-blue-electric" />
                  Marketing Attribution
                </h4>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Campaign ID</p>
                    <p className="text-sm font-bold text-navy">{selectedLead.adCampaignId || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Platform</p>
                    <p className="text-sm font-bold text-navy capitalize">{selectedLead.adPlatform || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-3">
              <h4 className="font-bold text-navy flex items-center gap-2">
                <MapPin size={18} className="text-blue-electric" />
                Property Address
              </h4>
              <div className="p-4 bg-white border border-gray-100 rounded-xl">
                <p className="text-sm text-gray-600">
                  {selectedLead.address ? (
                    <>
                      {selectedLead.address}<br />
                      {selectedLead.city}, {selectedLead.state} {selectedLead.zip}
                    </>
                  ) : (
                    'No address provided'
                  )}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h4 className="font-bold text-navy flex items-center gap-2">
                <FileText size={18} className="text-blue-electric" />
                Lead Notes
              </h4>
              <div className="p-4 bg-white border border-gray-100 rounded-xl min-h-[100px]">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedLead.notes || 'No notes added yet.'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-navy flex items-center gap-2">
                <History size={18} className="text-blue-electric" />
                Activity Timeline
              </h4>
              <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {(selectedLead.activity || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-9 h-9 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-blue-electric rounded-full" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-navy capitalize">{item.type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => navigate(`/app/pipeline?convertLeadId=${selectedLead.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  <Briefcase size={18} />
                  Convert to Deal
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <button 
                onClick={() => openEditModal(selectedLead)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                <Edit size={18} />
                Edit Lead
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-electric text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-electric/90 transition-all">
                <Save size={18} />
                Save Note
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

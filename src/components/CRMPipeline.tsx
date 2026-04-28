import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  List, 
  MoreHorizontal, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  ArrowRight,
  Flame,
  MapPin,
  FileText,
  History,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Loader2,
  FilterX,
  AlertCircle,
  Briefcase,
  Target,
  BarChart3,
  ArrowUpRight,
  GripVertical,
  Trash2,
  Edit,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { format, differenceInDays, isSameMonth, parseISO } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---

interface Deal {
  id: string;
  name: string;
  leadId: string;
  leadName: string;
  serviceType: string;
  stage: string;
  value: number;
  probability: number;
  assignedTo: string;
  expectedCloseDate: string;
  source: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'hot';
  tags: string[];
  aiScore?: number;
  aiStrategy?: string;
  createdAt: any;
  updatedAt: any;
  lastActivity: any;
  propertyAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  proposalAmount?: number;
  depositAmount?: number;
  appointmentDate?: string;
  financingNeeded?: boolean;
  insuranceClaim?: boolean;
  lostReason?: string;
  activity?: any[];
}

interface Stage {
  id: string;
  name: string;
  probability: number;
  color: string;
}

// --- Constants ---

const PIPELINE_STAGES: Stage[] = [
  { id: 'new', name: 'New Opportunity', probability: 10, color: 'bg-blue-500' },
  { id: 'attempted', name: 'Attempted Contact', probability: 15, color: 'bg-indigo-500' },
  { id: 'contacted', name: 'Contacted', probability: 25, color: 'bg-cyan-500' },
  { id: 'scheduled', name: 'Consultation Scheduled', probability: 40, color: 'bg-purple-500' },
  { id: 'completed', name: 'Consultation Completed', probability: 55, color: 'bg-pink-500' },
  { id: 'proposal', name: 'Proposal Sent', probability: 70, color: 'bg-orange-500' },
  { id: 'negotiation', name: 'Negotiation / Follow-Up', probability: 80, color: 'bg-yellow-500' },
  { id: 'won', name: 'Won', probability: 100, color: 'bg-green-500' },
  { id: 'lost', name: 'Lost', probability: 0, color: 'bg-red-500' },
];

const SERVICE_TYPES = [
  'Kitchen Remodel',
  'Bathroom Renovation',
  'Whole Home Remodel',
  'Home Addition',
  'Basement Finishing',
  'Exterior Remodel',
  'Deck & Patio',
  'Roofing',
  'Flooring',
  'Painting',
  'Other'
];

const LEAD_SOURCES = [
  'Google Search',
  'Facebook Ads',
  'Instagram',
  'Referral',
  'Website Form',
  'Direct Mail',
  'Local Event',
  'Angi / HomeAdvisor',
  'Houzz',
  'Other'
];

const LOST_REASONS = [
  'Price',
  'No Response',
  'Went With Competitor',
  'Not Ready',
  'Financing',
  'Scope Change',
  'Other'
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-navy">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Plus className="rotate-45 text-gray-400" size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Drawer = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[110]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[120] flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-navy">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Plus className="rotate-45 text-gray-400" size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SortableDealCard = ({ deal, onClick }: { deal: Deal, onClick: (deal: Deal) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const age = differenceInDays(new Date(), deal.createdAt?.toDate?.() || new Date());
  const isHot = deal.priority === 'hot' || (deal.aiScore && deal.aiScore >= 80);
  const isHighValue = deal.value >= 25000;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-electric transition-all cursor-pointer group relative",
        isHot && "border-l-4 border-l-red-500",
        !isHot && "border-l-4 border-l-transparent"
      )}
      onClick={() => onClick(deal)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-6">
          <div className="flex items-center gap-2">
            <p className="font-bold text-navy text-sm group-hover:text-blue-electric transition-colors line-clamp-1">{deal.name}</p>
            {deal.aiScore && (
              <div className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                deal.aiScore >= 80 ? "bg-red-100 text-red-600" : 
                deal.aiScore >= 50 ? "bg-orange-100 text-orange-600" : 
                "bg-blue-100 text-blue-600"
              )}>
                AI: {deal.aiScore}
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{deal.leadName}</p>
        </div>
        <div {...attributes} {...listeners} className="p-1 hover:bg-gray-50 rounded cursor-grab active:cursor-grabbing">
          <GripVertical className="text-gray-300" size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
          {deal.serviceType}
        </span>
        {isHot && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full flex items-center gap-1">
            <Flame size={10} /> HOT
          </span>
        )}
        {isHighValue && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
            High Value
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
          <DollarSign size={14} />
          <span>{deal.value.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase">
            <Clock size={12} />
            <span>{age}d</span>
          </div>
          <div className="w-6 h-6 bg-blue-50 text-blue-electric rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-100">
            {deal.assignedTo?.[0] || '?'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CRMPipeline() {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  // Modals & Drawers
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [repFilter, setRepFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const [isNewLead, setIsNewLead] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    leadId: '',
    serviceType: 'Kitchen Remodel',
    stage: 'new',
    value: '',
    assignedTo: '',
    expectedCloseDate: format(new Date(), 'yyyy-MM-dd'),
    source: 'Google Search',
    notes: '',
    priority: 'medium' as any,
    propertyAddress: '',
    city: '',
    state: '',
    zip: '',
    financingNeeded: false,
    insuranceClaim: false
  });

  // Handle convertLeadId from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const leadId = params.get('convertLeadId');
    
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setFormData({
          name: `${lead.name} Remodel`,
          leadId: lead.id,
          serviceType: lead.serviceType || lead.serviceInterest || 'Kitchen Remodel',
          stage: 'new',
          value: lead.jobValue?.toString() || '',
          assignedTo: lead.assignedTo || '',
          expectedCloseDate: format(new Date(), 'yyyy-MM-dd'),
          source: lead.source || 'Google Search',
          notes: lead.notes || '',
          priority: lead.priority || 'medium',
          propertyAddress: lead.address || '',
          city: lead.city || '',
          state: lead.state || '',
          zip: lead.zip || '',
          financingNeeded: false,
          insuranceClaim: false
        });
        setIsNewDealModalOpen(true);
        // Clear the query param
        navigate('/app/pipeline', { replace: true });
      }
    }
  }, [location.search, leads, navigate]);

  // Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!userData?.tenantId) return;

    // Fetch Deals
    const dealsQuery = query(
      collection(db, `tenants/${userData.tenantId}/deals`),
      orderBy('createdAt', 'desc')
    );
    const dealsPath = `tenants/${userData.tenantId}/deals`;
    const unsubscribeDeals = onSnapshot(dealsQuery, (snapshot) => {
      const dealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      setDeals(dealsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, dealsPath);
    });

    // Fetch Leads (for linking)
    const leadsPath = `tenants/${userData.tenantId}/leads`;
    const leadsQuery = query(collection(db, leadsPath));
    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, leadsPath);
    });

    return () => {
      unsubscribeDeals();
      unsubscribeLeads();
    };
  }, [userData?.tenantId]);

  // --- Filtering Logic ---

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = 
        deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
      const matchesRep = repFilter === 'all' || deal.assignedTo === repFilter;
      const matchesService = serviceFilter === 'all' || deal.serviceType === serviceFilter;

      return matchesSearch && matchesStage && matchesRep && matchesService;
    });
  }, [deals, searchTerm, stageFilter, repFilter, serviceFilter]);

  // --- KPI Calculations ---

  const kpis = useMemo(() => {
    const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
    const wonThisMonth = deals.filter(d => d.stage === 'won' && isSameMonth(d.updatedAt?.toDate() || new Date(), new Date()));
    const lostThisMonth = deals.filter(d => d.stage === 'lost' && isSameMonth(d.updatedAt?.toDate() || new Date(), new Date()));
    
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const weightedPipelineValue = openDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability / 100)), 0);
    
    const winRate = deals.filter(d => d.stage === 'won').length / (deals.filter(d => d.stage === 'won' || d.stage === 'lost').length || 1);

    return {
      totalValue: totalPipelineValue,
      weightedValue: weightedPipelineValue,
      openCount: openDeals.length,
      wonCount: wonThisMonth.length,
      wonValue: wonThisMonth.reduce((sum, d) => sum + (d.value || 0), 0),
      lostCount: lostThisMonth.length,
      winRate: Math.round(winRate * 100),
      avgDealSize: Math.round(totalPipelineValue / (openDeals.length || 1))
    };
  }, [deals]);

  // --- Handlers ---

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.tenantId) return;

    try {
      let leadId = formData.leadId;
      let leadName = '';

      if (isNewLead) {
        // Create new lead first
        const leadsPath = `tenants/${userData.tenantId}/leads`;
        const leadData = {
          firstName: newLeadData.firstName,
          lastName: newLeadData.lastName,
          name: `${newLeadData.firstName} ${newLeadData.lastName}`,
          phone: newLeadData.phone,
          email: newLeadData.email,
          tenantId: userData.tenantId,
          status: formData.stage,
          serviceType: formData.serviceType,
          source: formData.source,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          activity: [{
            type: 'created',
            date: new Date().toISOString(),
            note: 'Lead created automatically with new deal'
          }]
        };
        const leadRef = await addDoc(collection(db, leadsPath), leadData).catch(e => handleFirestoreError(e, OperationType.CREATE, leadsPath));
        if (leadRef) {
          leadId = leadRef.id;
          leadName = leadData.name;
        }
      } else {
        const lead = leads.find(l => l.id === leadId);
        leadName = lead ? lead.name : 'Unknown Lead';
      }

      const stageObj = PIPELINE_STAGES.find(s => s.id === formData.stage);

      const dealData = {
        ...formData,
        leadId,
        leadName,
        tenantId: userData.tenantId,
        value: Number(formData.value),
        probability: stageObj?.probability || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        activity: [{
          type: 'deal_created',
          date: new Date().toISOString(),
          note: 'Deal created in pipeline'
        }]
      };

      const dealsPath = `tenants/${userData.tenantId}/deals`;
      await addDoc(collection(db, dealsPath), dealData).catch(e => handleFirestoreError(e, OperationType.CREATE, dealsPath));
      
      // Update lead status if needed
      if (leadId && !isNewLead) {
        const leadPath = `tenants/${userData.tenantId}/leads/${leadId}`;
        await updateDoc(doc(db, leadPath), {
          status: formData.stage,
          lastActivity: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, leadPath));
      }

      toast.success('Deal created successfully');
      setIsNewDealModalOpen(false);
      resetForm();
      setIsNewLead(false);
      setNewLeadData({ firstName: '', lastName: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Unable to create deal. Please try again.');
    }
  };

  const handleUpdateStage = async (dealId: string, newStage: string) => {
    if (!userData?.tenantId) return;

    try {
      const stageObj = PIPELINE_STAGES.find(s => s.id === newStage);
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      const updates: any = {
        stage: newStage,
        probability: stageObj?.probability || 0,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        activity: [
          ...(deal.activity || []),
          {
            type: 'stage_changed',
            date: new Date().toISOString(),
            note: `Moved from ${PIPELINE_STAGES.find(s => s.id === deal.stage)?.name} to ${stageObj?.name}`
          }
        ]
      };

      const dealPath = `tenants/${userData.tenantId}/deals/${dealId}`;
      await updateDoc(doc(db, dealPath), updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, dealPath));

      // Sync with lead
      if (deal.leadId) {
        const leadPath = `tenants/${userData.tenantId}/leads/${deal.leadId}`;
        await updateDoc(doc(db, leadPath), {
          status: newStage,
          lastActivity: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, leadPath));
      }

      toast.success(`Moved to ${stageObj?.name}`);
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      leadId: '',
      serviceType: 'Kitchen Remodel',
      stage: 'new',
      value: '',
      assignedTo: '',
      expectedCloseDate: format(new Date(), 'yyyy-MM-dd'),
      source: 'Google Search',
      notes: '',
      priority: 'medium',
      propertyAddress: '',
      city: '',
      state: '',
      zip: '',
      financingNeeded: false,
      insuranceClaim: false
    });
  };

  // --- Drag & Drop Logic ---

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeDeal = deals.find(d => d.id === active.id);
    const overId = over.id as string;

    // If hovering over a column (stage)
    if (PIPELINE_STAGES.some(s => s.id === overId)) {
      if (activeDeal && activeDeal.stage !== overId) {
        // We don't update state here to avoid flickering, 
        // we wait for DragEnd for the actual DB update
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // If dropped on a stage column
    if (PIPELINE_STAGES.some(s => s.id === overId)) {
      const deal = deals.find(d => d.id === dealId);
      if (deal && deal.stage !== overId) {
        handleUpdateStage(dealId, overId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-electric mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Loading your pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden max-w-[1800px] mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Sales Pipeline</h1>
          <p className="text-gray-500 font-medium">Track opportunities and forecast revenue.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setViewMode('board')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'board' ? "bg-blue-electric text-white shadow-md" : "text-gray-400 hover:text-navy"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-blue-electric text-white shadow-md" : "text-gray-400 hover:text-navy"
              )}
            >
              <List size={20} />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            <span>Export</span>
          </button>

          <button 
            onClick={() => { resetForm(); setIsNewDealModalOpen(true); }}
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8 flex-shrink-0">
        {[
          { label: 'Pipeline Value', value: `$${kpis.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Weighted Value', value: `$${Math.round(kpis.weightedValue).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Open Deals', value: kpis.openCount, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Won (Month)', value: kpis.wonCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Lost (Month)', value: kpis.lostCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Win Rate', value: `${kpis.winRate}%`, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg Deal Size', value: `$${kpis.avgDealSize.toLocaleString()}`, icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { label: 'Closing Soon', value: '5', icon: Clock, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-lg font-bold text-navy mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center gap-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search deals, leads, or addresses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric w-full transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-blue-electric transition-all"
          >
            <option value="all">All Stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-blue-electric transition-all"
          >
            <option value="all">All Services</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(searchTerm || stageFilter !== 'all' || serviceFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStageFilter('all'); setServiceFilter('all'); }}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            >
              <FilterX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        {viewMode === 'board' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <div className="flex gap-6 h-full min-w-max">
                {PIPELINE_STAGES.map((stage) => {
                  const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
                  const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

                  return (
                    <div key={stage.id} className="w-80 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                          <h3 className="font-black text-navy text-xs uppercase tracking-widest">{stage.name}</h3>
                          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {stageDeals.length}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Value</p>
                          <p className="text-xs font-bold text-navy">${stageTotal.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div 
                        id={stage.id}
                        className={cn(
                          "flex-1 bg-gray-100/50 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-hide border-2 border-transparent transition-colors",
                          activeId && "border-dashed border-gray-300"
                        )}
                      >
                        <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                          {stageDeals.map((deal) => (
                            <SortableDealCard 
                              key={deal.id} 
                              deal={deal} 
                              onClick={(d) => { setSelectedDeal(d); setIsDetailsDrawerOpen(true); }} 
                            />
                          ))}
                        </SortableContext>

                        {stageDeals.length === 0 && (
                          <div className="h-32 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                            <Briefcase size={24} className="mb-2 opacity-20" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No Deals</p>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => { resetForm(); setFormData(prev => ({ ...prev, stage: stage.id })); setIsNewDealModalOpen(true); }}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-electric hover:border-blue-electric transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                        >
                          <Plus size={16} />
                          <span>Add Deal</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}>
              {activeId ? (
                <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-electric w-80 rotate-3 scale-105 opacity-90">
                  <p className="font-bold text-navy text-sm">{deals.find(d => d.id === activeId)?.name}</p>
                  <p className="text-xs text-green-600 font-bold mt-2">${deals.find(d => d.id === activeId)?.value.toLocaleString()}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Deal Name</th>
                    <th className="px-6 py-4">Lead</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Probability</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Expected Close</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeals.map((deal) => (
                    <tr 
                      key={deal.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => { setSelectedDeal(deal); setIsDetailsDrawerOpen(true); }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-navy text-sm group-hover:text-blue-electric transition-colors">{deal.name}</p>
                        <p className="text-xs text-gray-500">{deal.serviceType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-50 text-blue-electric rounded-full flex items-center justify-center text-[10px] font-bold">
                            {deal.leadName[0]}
                          </div>
                          <p className="text-sm font-medium text-gray-700">{deal.leadName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest text-white",
                          PIPELINE_STAGES.find(s => s.id === deal.stage)?.color || 'bg-gray-400'
                        )}>
                          {PIPELINE_STAGES.find(s => s.id === deal.stage)?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-green-600">${deal.value.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-electric" 
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{deal.probability}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">{deal.assignedTo || 'Unassigned'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">{format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isNewDealModalOpen} 
        onClose={() => setIsNewDealModalOpen(false)}
        title="Create New Deal"
      >
        <form onSubmit={handleCreateDeal} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deal Name *</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              placeholder="e.g. Smith Kitchen Remodel"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer / Lead</label>
              <button 
                type="button"
                onClick={() => setIsNewLead(!isNewLead)}
                className="text-xs font-bold text-blue-electric hover:underline"
              >
                {isNewLead ? 'Select Existing Lead' : 'Create New Lead'}
              </button>
            </div>

            {isNewLead ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input 
                    required
                    type="text"
                    placeholder="First Name"
                    value={newLeadData.firstName}
                    onChange={(e) => setNewLeadData({...newLeadData, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-electric"
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    required
                    type="text"
                    placeholder="Last Name"
                    value={newLeadData.lastName}
                    onChange={(e) => setNewLeadData({...newLeadData, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-electric"
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    required
                    type="tel"
                    placeholder="Phone"
                    value={newLeadData.phone}
                    onChange={(e) => setNewLeadData({...newLeadData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-electric"
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    type="email"
                    placeholder="Email"
                    value={newLeadData.email}
                    onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-electric"
                  />
                </div>
              </div>
            ) : (
              <select 
                required
                value={formData.leadId}
                onChange={(e) => setFormData({...formData, leadId: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                <option value="">Select a Lead</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>)}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type *</label>
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pipeline Stage *</label>
              <select 
                required
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              >
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Value ($) *</label>
              <input 
                required
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Close Date</label>
              <input 
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-electric min-h-[100px] resize-none transition-all"
              placeholder="Add any internal notes about this deal..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsNewDealModalOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-electric text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-electric/90 transition-all"
            >
              Create Deal
            </button>
          </div>
        </form>
      </Modal>

      {/* Deal Details Drawer */}
      <Drawer 
        isOpen={isDetailsDrawerOpen} 
        onClose={() => setIsDetailsDrawerOpen(false)}
        title="Deal Details"
      >
        {selectedDeal && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-electric rounded-2xl flex items-center justify-center text-2xl font-bold">
                  <Briefcase size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy">{selectedDeal.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Users size={14} className="text-gray-400" />
                    <p className="text-sm font-bold text-gray-500">{selectedDeal.leadName}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deal Value</p>
                <p className="text-2xl font-black text-green-600">${selectedDeal.value.toLocaleString()}</p>
              </div>
            </div>

            {/* Stage Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stage</p>
                <p className="text-xs font-bold text-blue-electric">{PIPELINE_STAGES.find(s => s.id === selectedDeal.stage)?.name}</p>
              </div>
              <div className="flex gap-1 h-2">
                {PIPELINE_STAGES.map((s, i) => {
                  const currentIndex = PIPELINE_STAGES.findIndex(st => st.id === selectedDeal.stage);
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  
                  return (
                    <div 
                      key={s.id} 
                      className={cn(
                        "flex-1 rounded-full transition-all duration-500",
                        isCompleted ? "bg-blue-electric" : "bg-gray-100",
                        isCurrent && "ring-2 ring-blue-electric ring-offset-2"
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Probability</p>
                <p className="text-lg font-bold text-navy">{selectedDeal.probability}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Close</p>
                <p className="text-lg font-bold text-navy">{format(new Date(selectedDeal.expectedCloseDate), 'MMM dd, yyyy')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned To</p>
                <p className="text-lg font-bold text-navy">{selectedDeal.assignedTo || 'Unassigned'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Source</p>
                <p className="text-lg font-bold text-navy">{selectedDeal.source}</p>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="p-6 bg-navy text-white rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users size={120} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">Customer Contact</h4>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Phone</p>
                    <p className="font-bold">Contact Lead for Phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Email</p>
                    <p className="font-bold">Contact Lead for Email</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                View Lead Record <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h4 className="font-bold text-navy flex items-center gap-2">
                <FileText size={18} className="text-blue-electric" />
                Internal Notes
              </h4>
              <div className="p-4 bg-white border border-gray-100 rounded-2xl min-h-[100px]">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedDeal.notes || 'No internal notes added yet.'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-bold text-navy flex items-center gap-2">
                <History size={18} className="text-blue-electric" />
                Deal Activity
              </h4>
              <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {(selectedDeal.activity || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-9 h-9 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-blue-electric rounded-full" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-navy capitalize">{item.type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(item.date), 'MMM dd')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                <Edit size={18} />
                Edit Deal
              </button>
              <button 
                onClick={() => handleUpdateStage(selectedDeal.id, 'won')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all"
              >
                <Check size={18} />
                Mark Won
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

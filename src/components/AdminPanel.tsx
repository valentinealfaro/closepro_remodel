import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Settings, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Plus, 
  MoreVertical, 
  ExternalLink, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  Globe,
  Shield,
  Clock,
  Mail,
  Phone,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  History,
  RefreshCw,
  Loader2,
  Layout,
  Megaphone,
  FileText,
  Kanban,
  ChevronLeft,
  Copy,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  Check,
  X,
  Edit2
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { TemplateService } from '../services/TemplateService';
import { FullAccountService } from '../services/FullAccountService';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

// Admin Modals
import NewTenantWizard from './admin/NewTenantWizard';
import SeedTemplatesModal from './admin/SeedTemplatesModal';
import SeedFullAccountModal from './admin/SeedFullAccountModal';
import CustomDomainWizard from './admin/CustomDomainWizard';
import TenantDetailsModal from './admin/TenantDetailsModal';
import CreateTemplateWizard from './admin/CreateTemplateWizard';
import TemplateDetailView from './admin/TemplateDetailView';
import SystemSettings from './admin/SystemSettings';
import MetricsDashboard from './MetricsDashboard';

type AdminTab = 'customers' | 'growth' | 'templates' | 'monitoring' | 'revenue' | 'ai-assistant' | 'infrastructure' | 'settings';

export default function AdminPanel({ initialTab }: { initialTab?: AdminTab }) {
  const { user, userData, impersonate } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'customers');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Modal States
  const [isNewTenantWizardOpen, setIsNewTenantWizardOpen] = useState(false);
  const [isSeedTemplatesModalOpen, setIsSeedTemplatesModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [templateToDuplicate, setTemplateToDuplicate] = useState<any>(null);
  const [openTemplateMenuId, setOpenTemplateMenuId] = useState<number | null>(null);
  const [duplicateConfig, setDuplicateConfig] = useState({
    name: '',
    copyTargeting: true,
    copyContent: true,
    copyDeployment: true
  });

  const handleDuplicate = () => {
    toast.success(`Template "${duplicateConfig.name}" created successfully`);
    setIsDuplicateModalOpen(false);
  };

  const templates = [
    { id: 1, title: 'High-Converting Follow-up', niche: 'Kitchen Remodel', plan: 'Growth', version: 'v1.2.0', status: 'published', perf: '18.4%', usage: 142, default: true, lastUpdated: '2 days ago', aiRecommended: true },
    { id: 2, title: 'Bathroom Lead Nurture', niche: 'Bathroom Remodel', plan: 'Pro', version: 'v1.1.0', status: 'published', perf: '22.1%', usage: 85, default: false, lastUpdated: '5 hours ago', aiRecommended: false },
    { id: 3, title: 'Roofing Estimate Follow-up', niche: 'Roofing', plan: 'Starter', version: 'v1.0.5', status: 'draft', perf: '0.0%', usage: 0, default: false, lastUpdated: '1 week ago', aiRecommended: false },
    { id: 4, title: 'General Contractor Onboarding', niche: 'Multi-Service', plan: 'Growth', version: 'v2.0.0', status: 'published', perf: '15.2%', usage: 210, default: true, lastUpdated: '3 days ago', aiRecommended: true },
  ];

  const renderTemplateRow = (template: any) => (
    <tr 
      key={template.id} 
      onClick={() => setSelectedTemplateForEdit(template)}
      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-electric group-hover:text-white transition-all">
            {selectedTemplateCategory === 'automation' ? <Zap size={18} /> :
             selectedTemplateCategory === 'ads' ? <Megaphone size={18} /> :
             selectedTemplateCategory === 'estimates' ? <FileText size={18} /> :
             selectedTemplateCategory === 'pipelines' ? <Kanban size={18} /> : <Layout size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-navy">{template.title}</span>
              {template.default && (
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded uppercase tracking-tighter">Default</span>
              )}
              {template.aiRecommended && (
                <span className="text-[8px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded uppercase tracking-tighter flex items-center gap-0.5">
                  <Brain size={8} /> AI
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Last updated {template.lastUpdated}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className="text-xs font-bold text-gray-500">{template.niche}</span>
      </td>
      <td className="px-8 py-5">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
          template.plan === 'Pro' ? 'bg-navy text-white' : 
          template.plan === 'Growth' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {template.plan}
        </span>
      </td>
      <td className="px-8 py-5">
        <span className="text-xs font-medium text-gray-400">{template.version}</span>
      </td>
      <td className="px-8 py-5">
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
          template.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {template.status}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-electric" />
          <span className="text-xs font-bold text-navy">{template.perf}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-navy">{template.usage}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-right relative">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setTemplateToDuplicate(template);
              setDuplicateConfig({ ...duplicateConfig, name: `${template.title} Copy` });
              setIsDuplicateModalOpen(true);
            }}
            className="p-2.5 text-gray-500 hover:text-navy hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100 bg-gray-50/50"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsSeedTemplatesModalOpen(true); }}
            className="p-2.5 text-gray-500 hover:text-electric hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100 bg-gray-50/50"
            title="Push to Tenants"
          >
            <Zap size={16} />
          </button>
          <div className="relative">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setOpenTemplateMenuId(openTemplateMenuId === template.id ? null : template.id);
              }}
              className="p-2.5 text-gray-500 hover:text-navy hover:bg-white rounded-xl transition-all shadow-sm border border-gray-100 bg-gray-50/50"
            >
              <MoreVertical size={16} />
            </button>
            
            <AnimatePresence>
              {openTemplateMenuId === template.id && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setOpenTemplateMenuId(null)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-[70] text-left overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Template Actions</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedTemplateForEdit(template); setOpenTemplateMenuId(null); }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3"
                    >
                      <Edit2 size={14} className="text-gray-400" /> Edit Template
                    </button>
                    <button 
                      onClick={() => { 
                        setTemplateToDuplicate(template); 
                        setDuplicateConfig({ ...duplicateConfig, name: `${template.title} Copy` });
                        setIsDuplicateModalOpen(true);
                        setOpenTemplateMenuId(null);
                      }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3"
                    >
                      <Copy size={14} className="text-gray-400" /> Duplicate Template
                    </button>
                    <button className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3">
                      <Plus size={14} className="text-gray-400" /> Create New Version
                    </button>
                    <button className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3">
                      <RefreshCw size={14} className="text-gray-400" /> Compare Versions
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment</p>
                    </div>
                    <button className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3">
                      <CheckCircle2 size={14} className="text-gray-400" /> Set as Default
                    </button>
                    <button 
                      onClick={() => { setIsSeedTemplatesModalOpen(true); setOpenTemplateMenuId(null); }}
                      className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3"
                    >
                      <Zap size={14} className="text-gray-400" /> Push to Tenants
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="px-4 py-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Insights</p>
                    </div>
                    <button className="w-full px-4 py-2.5 text-xs font-bold text-navy hover:bg-blue-50 hover:text-electric transition-colors flex items-center gap-3">
                      <Activity size={14} className="text-gray-400" /> View Performance
                    </button>
                    
                    <div className="h-px bg-gray-100 my-1" />
                    <button className="w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3">
                      <Trash2 size={14} /> Archive Template
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </tr>
  );
  const [isSeedFullAccountModalOpen, setIsSeedFullAccountModalOpen] = useState(false);
  const [isCustomDomainWizardOpen, setIsCustomDomainWizardOpen] = useState(false);
  const [selectedTenantForDetails, setSelectedTenantForDetails] = useState<any | null>(null);
  const [isCreateTemplateWizardOpen, setIsCreateTemplateWizardOpen] = useState(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<any | null>(null);

  // Template Sub-view State
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string | null>(null);

  const handleImpersonate = (tenant: any) => {
    impersonate(tenant.id);
    toast.success(`Now impersonating ${tenant.name}`);
  };

  const seedTemplates = async () => {
    setLoading(true);
    try {
      await TemplateService.seedInitialTemplates();
      toast.success('Global templates seeded successfully');
    } catch (error) {
      console.error("Seed templates error:", error);
      toast.error('Failed to seed templates');
    } finally {
      setLoading(false);
    }
  };

  const seedFullAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tenantId = await FullAccountService.seedFullAccount('Elite Roofing & Siding', user.uid);
      toast.success(`Full account seeded: ${tenantId}`);
    } catch (error) {
      toast.error('Failed to seed full account');
    } finally {
      setLoading(false);
    }
  };

  const generateAITemplates = async () => {
    setLoading(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('AI generated 12 new automation flows and 5 ad templates');
    } catch (error) {
      toast.error('AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenantData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTenants(tenantData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tenants');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (tenantId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { status });
      toast.success(`Tenant status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePlan = async (tenantId: string, plan: string) => {
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { plan });
      toast.success(`Tenant plan updated to ${plan}`);
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'active').length,
    churnRate: '2.4%',
    trialConversion: '18.5%',
    totalMRR: tenants.reduce((acc, t) => {
      const prices = { starter: 99, growth: 249, pro: 499 };
      return acc + (prices[t.plan as keyof typeof prices] || 0);
    }, 0),
    totalARR: tenants.reduce((acc, t) => {
      const prices = { starter: 99, growth: 249, pro: 499 };
      return acc + (prices[t.plan as keyof typeof prices] || 0);
    }, 0) * 12,
    avgUsage: 84,
    apiUptime: '99.99%',
    automationSuccess: '98.2%',
    healthScore: 88,
    pendingSupport: 3,
    activeTrials: 12
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAiInsights([
        { type: 'churn', message: '5 customers haven\'t logged in for 7+ days — high churn risk.', priority: 'high', action: 'Send automated re-engagement email' },
        { type: 'upsell', message: 'Top 3 "Growth" plan users are hitting automation limits — suggest "Pro" upgrade.', priority: 'medium', action: 'Trigger upgrade offer notification' },
        { type: 'retention', message: 'Customers using AI Visualizer have 40% higher retention rates.', priority: 'low', action: 'Promote Visualizer to new users' },
        { type: 'growth', message: 'New signups from "Roofing" niche are converting 2x faster this month.', priority: 'medium', action: 'Increase ad spend on roofing keywords' },
        { type: 'performance', message: 'System latency increased by 15ms in US-East region.', priority: 'low', action: 'Monitor load balancer logs' }
      ]);
      setIsAnalyzing(false);
      toast.success('AI Analysis Complete');
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-navy">Super Admin Panel</h1>
            <span className="px-2 py-0.5 bg-electric text-white text-[10px] font-black uppercase tracking-widest rounded-md">System Level</span>
          </div>
          <p className="text-gray-500">Manage tenants, subscriptions, and global infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSeedTemplatesModalOpen(true)}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            Seed Templates
          </button>
          <button 
            onClick={() => setIsSeedFullAccountModalOpen(true)}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
            Seed Full Account
          </button>
          <button 
            onClick={() => setIsNewTenantWizardOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> New Tenant
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Customers', value: stats.totalTenants, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
          { label: 'Active MRR', value: `$${stats.totalMRR.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+8.4%' },
          { label: 'Churn Rate', value: stats.churnRate, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', trend: '-0.5%' },
          { label: 'Trial → Paid', value: stats.trialConversion, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+2.1%' },
          { label: 'LTV (Avg)', value: '$4,250', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+15%' },
          { label: 'Active Users (7d)', value: '142', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+5.2%' },
          { label: 'API Uptime', value: stats.apiUptime, icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50', trend: 'Stable' },
          { label: 'Auto Success', value: stats.automationSuccess, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '99.9%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 
                stat.trend.startsWith('-') ? 'bg-red-50 text-red-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-navy">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'customers', label: 'Customers', icon: Building2 },
          { id: 'growth', label: 'Growth', icon: TrendingUp },
          { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
          { id: 'templates', label: 'Global Templates', icon: Layout },
          { id: 'revenue', label: 'Revenue', icon: CreditCard },
          { id: 'monitoring', label: 'Monitoring', icon: Activity },
          { id: 'infrastructure', label: 'Infrastructure', icon: Globe },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-electric text-electric' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by business name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 font-bold">Business / Owner</th>
                  <th className="px-6 py-4 font-bold">Plan</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Usage (AI/Auto)</th>
                  <th className="px-6 py-4 font-bold">Created</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                      <p className="text-gray-500 font-medium">Loading tenants...</p>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto">
                        <Building2 className="mx-auto text-gray-200 mb-4" size={64} />
                        <h3 className="text-lg font-bold text-navy mb-2">No Tenants Found</h3>
                        <p className="text-sm text-gray-500 mb-6">Start by seeding demo data or creating a new tenant manually.</p>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={seedFullAccount}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                            <Shield size={18} /> Seed Full Account
                          </button>
                          <button 
                            onClick={seedTemplates}
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                          >
                            <Zap size={18} /> Seed Global Templates
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.map((tenant) => (
                  <tr 
                    key={tenant.id} 
                    onClick={() => setSelectedTenantForDetails(tenant)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                          {tenant.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-navy text-sm">{tenant.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{tenant.ownerEmail || 'no-owner@vcv.com'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={tenant.plan}
                        onChange={(e) => handleUpdatePlan(tenant.id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 bg-gray-100 rounded border-none focus:ring-2 focus:ring-blue-500 capitalize"
                      >
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="pro">Pro</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-600' : 
                        tenant.status === 'past_due' ? 'bg-red-100 text-red-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Brain size={10} className="text-purple-500" />
                            {tenant.aiUsage || 0}%
                          </div>
                          <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${tenant.aiUsage || 0}%` }} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Zap size={10} className="text-orange-500" />
                            {tenant.autoUsage || 0}%
                          </div>
                          <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${tenant.autoUsage || 0}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(tenant.createdAt?.toDate?.() || tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImpersonate(tenant);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-electric bg-blue-50 hover:bg-blue-100 rounded-lg transition-all" 
                          title="Impersonate"
                        >
                          <ExternalLink size={14} />
                          Login
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MetricsDashboard />
        </div>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-navy p-8 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-electric/20 rounded-2xl flex items-center justify-center">
                    <Brain className="text-electric" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Business Assistant</h3>
                    <p className="text-blue-200/60 text-sm">Analyze your SaaS metrics and get actionable business insights.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <button 
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                    className="btn-primary bg-electric hover:bg-blue-400 border-none flex items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    Run AI Analysis
                  </button>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest">Health Score</p>
                      <p className="text-xl font-black text-white">{stats.healthScore}/100</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest">Growth Trend</p>
                      <p className="text-xl font-black text-green-400">+14.2%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-electric/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Recommendation</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-sm font-bold text-navy mb-1">Optimize Onboarding</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Users who complete the "Website Setup" in the first 24h are 3x more likely to stay.</p>
                </div>
                <button className="w-full py-2.5 text-xs font-bold text-electric hover:bg-blue-50 rounded-xl transition-all">
                  Automate Nudge Emails →
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500" /> AI Insights & Actions
              </h4>
              <div className="space-y-4">
                {aiInsights.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="mx-auto text-gray-200 mb-2" size={48} />
                    <p className="text-gray-400 text-sm">No analysis run yet.</p>
                  </div>
                ) : aiInsights.map((insight, i) => (
                  <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    insight.priority === 'high' ? 'bg-red-50 border-red-100' :
                    insight.priority === 'medium' ? 'bg-orange-50 border-orange-100' :
                    'bg-blue-50 border-blue-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        insight.priority === 'high' ? 'bg-red-500' :
                        insight.priority === 'medium' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-bold mb-1">{insight.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Action: {insight.action}</span>
                          <button className="text-[10px] font-bold text-electric hover:underline">Execute Now</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" /> Churn Prevention Center
              </h4>
              <div className="space-y-4">
                {[
                  { name: 'Apex Remodeling', risk: 'High', reason: 'No login in 12 days', color: 'text-red-600', bg: 'bg-red-50', ltv: '$2,400' },
                  { name: 'Modern Kitchens', risk: 'Medium', reason: 'Low feature usage', color: 'text-orange-600', bg: 'bg-orange-50', ltv: '$1,200' },
                  { name: 'Luxury Baths', risk: 'Medium', reason: 'Payment failed twice', color: 'text-orange-600', bg: 'bg-orange-50', ltv: '$4,800' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-navy shadow-sm">
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${item.bg} ${item.color}`}>
                        {item.risk} Risk
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">LTV: {item.ltv}</p>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 text-sm font-bold text-gray-400 hover:text-navy transition-colors border-2 border-dashed border-gray-100 rounded-xl">
                  View All Risk Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!selectedTemplateCategory ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-navy">Global Template Library</h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={generateAITemplates}
                      disabled={loading}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                      AI Generate Templates
                    </button>
                    <button 
                      onClick={() => setIsCreateTemplateWizardOpen(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={18} /> New Template
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'automation', title: 'Automation Templates', icon: Zap, count: 24, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { id: 'ads', title: 'Ad Copy Templates', icon: Megaphone, count: 18, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'estimates', title: 'Estimate Templates', icon: FileText, count: 12, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { id: 'pipelines', title: 'Pipeline Templates', icon: Kanban, count: 8, color: 'text-green-600', bg: 'bg-green-50' },
                    { id: 'websites', title: 'Website Templates', icon: Layout, count: 15, color: 'text-pink-600', bg: 'bg-pink-50' },
                  ].map((template, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedTemplateCategory(template.id)}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-electric transition-all cursor-pointer group active:scale-95"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${template.bg} ${template.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <template.icon size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-electric transition-colors">Manage →</span>
                      </div>
                      <h4 className="font-bold text-navy mb-1">{template.title}</h4>
                      <p className="text-sm text-gray-500">{template.count} global templates active.</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedTemplateCategory(null)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-navy transition-colors"
                  >
                    <ChevronLeft size={18} /> Back to Categories
                  </button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsCreateTemplateWizardOpen(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus size={18} /> Add New Template
                    </button>
                    <button 
                      onClick={() => setIsSeedTemplatesModalOpen(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Zap size={18} /> Push to Tenants
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div>
                      <h3 className="text-xl font-black text-navy capitalize">{selectedTemplateCategory} Templates</h3>
                      <p className="text-sm text-gray-500">Manage global {selectedTemplateCategory} templates available to all tenants.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <button className="px-4 py-2 text-xs font-bold text-navy hover:bg-gray-50 rounded-xl flex items-center gap-2">
                          <Filter size={14} /> Filters
                        </button>
                        <button className="px-4 py-2 text-xs font-bold text-navy hover:bg-gray-50 rounded-xl flex items-center gap-2">
                          <ArrowUpDown size={14} /> Sort
                        </button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search templates..." 
                          className="pl-12 pr-6 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-electric shadow-sm min-w-[300px]"
                        />
                      </div>
                      <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-navy transition-all shadow-sm">
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-4">Template Name</th>
                          <th className="px-8 py-4">Niche</th>
                          <th className="px-8 py-4">Plan</th>
                          <th className="px-8 py-4">Version</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4">Performance</th>
                          <th className="px-8 py-4">Usage</th>
                          <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {templates.map(renderTemplateRow)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Duplicate Template Modal */}
      <AnimatePresence>
        {isDuplicateModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDuplicateModalOpen(false)}
              className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-electric rounded-2xl flex items-center justify-center">
                    <Copy size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-navy">Duplicate Template</h3>
                    <p className="text-xs text-gray-500">Create a new copy of "{templateToDuplicate?.title}"</p>
                  </div>
                </div>
                <button onClick={() => setIsDuplicateModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Template Name</label>
                  <input 
                    type="text"
                    value={duplicateConfig.name}
                    onChange={(e) => setDuplicateConfig({ ...duplicateConfig, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duplicate Options</p>
                  {[
                    { id: 'copyTargeting', label: 'Copy targeting rules', desc: 'Niches, plans, and deployment settings' },
                    { id: 'copyContent', label: 'Copy template content', desc: 'Stages, steps, and ad copy' },
                    { id: 'copyDeployment', label: 'Copy deployment settings', desc: 'Priority and visibility rules' },
                  ].map(option => (
                    <div 
                      key={option.id}
                      onClick={() => setDuplicateConfig({ ...duplicateConfig, [option.id]: !duplicateConfig[option.id as keyof typeof duplicateConfig] })}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all"
                    >
                      <div>
                        <p className="text-sm font-bold text-navy">{option.label}</p>
                        <p className="text-[10px] text-gray-500">{option.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        duplicateConfig[option.id as keyof typeof duplicateConfig] ? 'bg-electric text-white' : 'bg-white border border-gray-200 text-transparent'
                      }`}>
                        <Check size={14} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button 
                    onClick={handleDuplicate}
                    className="flex-1 py-4 bg-electric text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                  >
                    Duplicate Template
                  </button>
                  <button 
                    onClick={() => setIsDuplicateModalOpen(false)}
                    className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Monthly Recurring Revenue</p>
              <h3 className="text-3xl font-bold text-navy">${stats.totalMRR.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
                <ArrowUpRight size={14} /> +12.5% from last month
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Annual Recurring Revenue</p>
              <h3 className="text-3xl font-bold text-navy">${stats.totalARR.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
                <ArrowUpRight size={14} /> On track for $1M target
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Average Revenue Per User</p>
              <h3 className="text-3xl font-bold text-navy">$245</h3>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
                <TrendingUp size={14} /> Up 4% this quarter
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-navy mb-6">Revenue by Plan</h4>
              <div className="space-y-6">
                {[
                  { plan: 'Starter', price: '$99', count: 12, revenue: 1188, color: 'bg-blue-500' },
                  { plan: 'Growth', price: '$249', count: 8, revenue: 1992, color: 'bg-purple-500' },
                  { plan: 'Pro', price: '$499', count: 4, revenue: 1996, color: 'bg-navy' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy">{item.plan}</span>
                        <span className="text-xs text-gray-400">({item.count} users)</span>
                      </div>
                      <span className="font-bold text-navy">${item.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.revenue / stats.totalMRR) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-navy mb-6">Revenue by Niche</h4>
              <div className="space-y-6">
                {[
                  { niche: 'Roofing', percentage: 45, color: 'bg-blue-500' },
                  { niche: 'Kitchen Remodeling', percentage: 30, color: 'bg-green-500' },
                  { niche: 'Bathroom Remodeling', percentage: 15, color: 'bg-orange-500' },
                  { niche: 'Other', percentage: 10, color: 'bg-gray-400' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-navy text-sm">{item.niche}</span>
                      <span className="text-xs font-bold text-gray-500">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-navy p-8 rounded-3xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-bold">AI Financial Forecast</h4>
                <p className="text-blue-200/60 text-sm">Predictive analysis based on current growth and churn trends.</p>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest">Projected ARR (12mo)</p>
                <p className="text-xl font-black text-white">$1.2M</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-blue-200/60 mb-2 uppercase tracking-widest">Growth Opportunity</p>
                <p className="text-sm font-medium leading-relaxed">Expanding into "Solar Installation" niche could increase MRR by 15% based on current market demand.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-blue-200/60 mb-2 uppercase tracking-widest">Churn Warning</p>
                <p className="text-sm font-medium leading-relaxed">Increasing ARPU by 5% may lead to a 2% churn increase in the "Starter" plan segment.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-blue-200/60 mb-2 uppercase tracking-widest">Efficiency Gain</p>
                <p className="text-sm font-medium leading-relaxed">Automating "Past Due" recovery could recover $2.4k in lost monthly revenue.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
              <Globe size={18} className="text-blue-500" /> Domain Management
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-navy text-sm">app.closepro.com</p>
                  <p className="text-xs text-green-600 font-bold">SSL Active • Primary</p>
                </div>
                <button className="text-xs font-bold text-gray-400 hover:text-navy">Settings</button>
              </div>
              <button 
                onClick={() => setIsCustomDomainWizardOpen(true)}
                className="w-full py-3 text-sm font-bold text-electric border-2 border-dashed border-blue-100 rounded-xl hover:bg-blue-50 transition-all"
              >
                + Add Custom Domain
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
              <Shield size={18} className="text-green-500" /> System Security
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Database Backups</span>
                <span className="text-xs font-bold text-green-600">Daily • Automated</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">API Rate Limiting</span>
                <span className="text-xs font-bold text-blue-600">Enabled</span>
              </div>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Run Security Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <span className="text-xs font-bold text-green-600">Healthy</span>
              </div>
              <p className="text-sm text-gray-500">API Uptime</p>
              <h4 className="text-xl font-bold text-navy">{stats.apiUptime}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <span className="text-xs font-bold text-blue-600">Stable</span>
              </div>
              <p className="text-sm text-gray-500">Automation Success</p>
              <h4 className="text-xl font-bold text-navy">{stats.automationSuccess}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <span className="text-xs font-bold text-orange-600">2 Warnings</span>
              </div>
              <p className="text-sm text-gray-500">System Latency</p>
              <h4 className="text-xl font-bold text-navy">124ms</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <Activity size={18} className="text-electric" /> System Performance (24h)
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-xs font-bold text-gray-500">API Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-xs font-bold text-gray-500">Latency</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end gap-2">
                {[45, 52, 48, 65, 72, 58, 42, 38, 45, 55, 68, 75, 82, 78, 65, 55, 48, 42, 35, 40, 52, 65, 78, 85].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="w-full bg-blue-100 rounded-t-sm transition-all group-hover:bg-blue-200" style={{ height: `${val}%` }} />
                    <div className="w-full bg-orange-100 rounded-t-sm transition-all group-hover:bg-orange-200" style={{ height: `${val * 0.4}%` }} />
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-navy text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                      {val}k req / {Math.round(val * 1.5)}ms
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-navy flex items-center gap-2">
                  <Shield size={18} className="text-green-500" /> Security Events
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Live</span>
              </div>
              <div className="space-y-4">
                {[
                  { event: 'Brute Force Blocked', ip: '192.168.1.1', time: '5m ago', severity: 'high' },
                  { event: 'SSL Cert Renewed', ip: 'System', time: '12m ago', severity: 'low' },
                  { event: 'Rate Limit Triggered', ip: '45.12.33.1', time: '24m ago', severity: 'medium' },
                  { event: 'New Admin Login', ip: 'Admin (info@vcv)', time: '1h ago', severity: 'low' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.severity === 'high' ? 'bg-red-500' :
                        item.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-xs font-bold text-navy">{item.event}</p>
                        <p className="text-[10px] text-gray-400">{item.ip}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <History size={18} className="text-navy" /> System Logs
              </h3>
              <button className="text-xs font-bold text-electric hover:underline">View All Logs</button>
            </div>
            <div className="space-y-4">
              {[
                { event: 'New Signup', tenant: 'Elite Roofing', time: '2 mins ago', status: 'success', module: 'Auth' },
                { event: 'Payment Failed', tenant: 'Modern Kitchens', time: '15 mins ago', status: 'error', module: 'Billing' },
                { event: 'Automation Triggered', tenant: 'Apex Remodeling', time: '1 hour ago', status: 'success', module: 'Workflows' },
                { event: 'Website Published', tenant: 'Luxury Baths', time: '3 hours ago', status: 'success', module: 'WebBuilder' },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {event.status === 'success' ? <CheckCircle2 className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-navy">{event.event}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold uppercase">{event.module}</span>
                      </div>
                      <p className="text-xs text-gray-500">{event.tenant}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <SystemSettings />
      )}
      {/* Modals */}
      <AnimatePresence>
        {isNewTenantWizardOpen && (
          <NewTenantWizard 
            isOpen={isNewTenantWizardOpen}
            onClose={() => setIsNewTenantWizardOpen(false)}
            onSuccess={(id) => {
              console.log('New tenant created:', id);
              // Refresh is handled by onSnapshot
            }}
          />
        )}
        {isSeedTemplatesModalOpen && (
          <SeedTemplatesModal 
            isOpen={isSeedTemplatesModalOpen}
            onClose={() => setIsSeedTemplatesModalOpen(false)}
            tenants={tenants}
          />
        )}
        {isSeedFullAccountModalOpen && (
          <SeedFullAccountModal 
            isOpen={isSeedFullAccountModalOpen}
            onClose={() => setIsSeedFullAccountModalOpen(false)}
            ownerId={user?.uid || ''}
            onSuccess={(id) => {
              console.log('Full account seeded:', id);
            }}
          />
        )}
        {isCustomDomainWizardOpen && (
          <CustomDomainWizard 
            isOpen={isCustomDomainWizardOpen}
            onClose={() => setIsCustomDomainWizardOpen(false)}
          />
        )}
        {selectedTenantForDetails && (
          <TenantDetailsModal 
            tenant={selectedTenantForDetails}
            isOpen={!!selectedTenantForDetails}
            onClose={() => setSelectedTenantForDetails(null)}
            onImpersonate={handleImpersonate}
          />
        )}
        {isCreateTemplateWizardOpen && (
          <CreateTemplateWizard 
            isOpen={isCreateTemplateWizardOpen}
            onClose={() => setIsCreateTemplateWizardOpen(false)}
            type={selectedTemplateCategory}
          />
        )}
        {selectedTemplateForEdit && (
          <TemplateDetailView 
            template={selectedTemplateForEdit}
            type={selectedTemplateCategory || 'automation'}
            onClose={() => setSelectedTemplateForEdit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

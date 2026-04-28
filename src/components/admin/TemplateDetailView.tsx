import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  Save, 
  Zap, 
  Megaphone, 
  FileText, 
  Kanban, 
  Globe, 
  Layout,
  History, 
  Activity, 
  Settings, 
  Target, 
  Eye, 
  Brain, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  Plus,
  RefreshCw,
  Info,
  Search,
  Check,
  ChevronDown,
  Users,
  AlertCircle,
  GripVertical,
  Edit2,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

const STAGE_TYPES = ['Open', 'Won', 'Lost'];
const STAGE_COLORS = [
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Yellow', class: 'bg-yellow-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Pink', class: 'bg-pink-500' },
];

const NICHE_OPTIONS = [
  'Kitchen Remodel',
  'Bathroom Remodel',
  'Whole Home',
  'Roofing',
  'Flooring',
  'Siding',
  'Windows',
  'Concrete',
  'General Contractor',
  'Multi-Service',
  'Exterior Remodel',
  'Additions',
  'Custom Homes',
  'Insurance Claims',
  'Other'
];

interface TemplateDetailViewProps {
  template: any;
  type: string;
  onClose: () => void;
}

export default function TemplateDetailView({ template, type, onClose }: TemplateDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'targeting' | 'versions' | 'performance'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [openStepMenu, setOpenStepMenu] = useState<number | null>(null);
  
  // Targeting State
  const [selectedPlans, setSelectedPlans] = useState<string[]>(['Growth', 'Pro']);
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Kitchen Remodel', 'Bathroom Remodel']);
  const [deploymentRules, setDeploymentRules] = useState({
    autoDeploy: true,
    setDefault: true,
    aiRecommended: false,
    premium: false
  });
  const [deploymentPriority, setDeploymentPriority] = useState('normal');
  const [visibility, setVisibility] = useState('library');
  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const [nicheSearch, setNicheSearch] = useState('');

  // Pipeline State
  const [pipelineStages, setPipelineStages] = useState([
    { id: '1', name: 'New Lead', type: 'Open', prob: 10, color: 'bg-blue-500', desc: 'Initial lead entry' },
    { id: '2', name: 'Contacted', type: 'Open', prob: 25, color: 'bg-purple-500', desc: 'First outreach completed' },
    { id: '3', name: 'Consultation', type: 'Open', prob: 50, color: 'bg-orange-500', desc: 'Meeting scheduled or held' },
    { id: '4', name: 'Estimate Sent', type: 'Open', prob: 75, color: 'bg-yellow-500', desc: 'Proposal delivered to client' },
    { id: '5', name: 'Won', type: 'Won', prob: 100, color: 'bg-green-500', desc: 'Contract signed' },
    { id: '6', name: 'Lost', type: 'Lost', prob: 0, color: 'bg-red-500', desc: 'Deal closed as lost' },
  ]);
  const [editingStage, setEditingStage] = useState<any>(null);

  // Ads Content State
  const [adsContent, setAdsContent] = useState({
    headline: 'Get Your Dream Kitchen in 3 Weeks',
    primaryText: 'Tired of your outdated kitchen? Our expert team specializes in high-end remodels that fit your budget...',
    secondaryDescription: '',
    cta: 'Get Free Estimate',
    offer: '10% Off Full Remodel',
    platform: 'Facebook',
    creativeGuidance: {
      type: 'Before/After Carousel',
      source: 'Real project photos',
      format: '4:5 Ratio',
      overlayText: 'See Your Dream Kitchen Before You Build',
      notes: 'Use the strongest before/after images from a recent remodel. Avoid stock-looking photos.'
    }
  });

  const [steps, setSteps] = useState([
    { type: 'trigger', label: 'New Lead Created', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50', summary: 'Triggered when a new lead enters the system.' },
    { type: 'delay', label: 'Wait 5 Minutes', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', summary: 'Gives the lead time to breathe before the first contact.' },
    { type: 'action', label: 'Send SMS: "Hi {{first_name}}..."', icon: Megaphone, color: 'text-green-500', bg: 'bg-green-50', summary: 'Initial outreach via SMS.' },
    { type: 'delay', label: 'Wait 1 Day', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', summary: 'Follow up if no response.' },
    { type: 'action', label: 'Send Email: "Checking in..."', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50', summary: 'Secondary outreach via Email.' },
  ]);

  const handleSave = async () => {
    // Validation
    if (deploymentRules.setDefault && selectedNiches.length === 0) {
      toast.error('Select at least one niche before setting this template as the default.');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasUnsavedChanges(false);
    toast.success('Targeting rules saved successfully');
  };

  const updateTargeting = (updates: any) => {
    setDeploymentRules(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const togglePlan = (plan: string) => {
    setSelectedPlans(prev => 
      prev.includes(plan) ? prev.filter(p => p !== plan) : [...prev, plan]
    );
    setHasUnsavedChanges(true);
  };

  const removeNiche = (niche: string) => {
    setSelectedNiches(prev => prev.filter(n => n !== niche));
    setHasUnsavedChanges(true);
  };

  const addNiche = (niche: string) => {
    if (!selectedNiches.includes(niche)) {
      setSelectedNiches(prev => [...prev, niche]);
      setHasUnsavedChanges(true);
    }
    setIsNicheDropdownOpen(false);
    setNicheSearch('');
  };

  const updateStage = (id: string, updates: any) => {
    setPipelineStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasUnsavedChanges(true);
  };

  const deleteStage = (id: string) => {
    setPipelineStages(prev => prev.filter(s => s.id !== id));
    setHasUnsavedChanges(true);
    toast.success('Stage deleted');
  };

  const duplicateStage = (stage: any) => {
    const newStage = { ...stage, id: Math.random().toString(36).substr(2, 9), name: `${stage.name} (Copy)` };
    setPipelineStages(prev => [...prev, newStage]);
    setHasUnsavedChanges(true);
    toast.success('Stage duplicated');
  };

  const movePipelineStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...pipelineStages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pipelineStages.length) return;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    setPipelineStages(newStages);
    setHasUnsavedChanges(true);
  };

  const getTargetingSummary = () => {
    let summary = "This template will be available to ";
    
    if (selectedPlans.length === 0) {
      summary += "no plans ";
    } else if (selectedPlans.length === 3) {
      summary += "all plans ";
    } else {
      summary += `<span class="text-electric font-bold">${selectedPlans.join(' + ')}</span> `;
    }

    if (selectedNiches.length === 0) {
      summary += "for all niches by default.";
    } else {
      summary += `tenants in the <span class="text-electric font-bold">${selectedNiches.join(', ')}</span> niches.`;
    }

    if (deploymentRules.autoDeploy) {
      summary += " It will automatically deploy to matching new tenant accounts.";
    }

    if (deploymentRules.premium) {
      summary += " It will only appear as a premium template where enabled.";
    }

    return summary;
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
    setOpenStepMenu(null);
    toast.success('Step reordered');
  };

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    setOpenStepMenu(null);
    toast.success('Step deleted');
  };

  const duplicateStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, { ...steps[index] });
    setSteps(newSteps);
    setOpenStepMenu(null);
    toast.success('Step duplicated');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-50 text-electric rounded-2xl flex items-center justify-center">
                      {type === 'automation' ? <Zap size={24} /> :
                       type === 'ads' ? <Megaphone size={24} /> :
                       type === 'estimates' ? <FileText size={24} /> :
                       type === 'pipelines' ? <Kanban size={24} /> : <Layout size={24} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-navy">Template Overview</h3>
                      <p className="text-sm text-gray-500">Master configuration and metadata for this global asset.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Template Name</label>
                        <input 
                          type="text" 
                          defaultValue={template.title}
                          className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                          defaultValue={type === 'pipelines' 
                            ? "This pipeline template provides a standardized sales process for high-ticket residential remodeling projects, focusing on consultation and estimate follow-up."
                            : "High-converting follow-up sequence designed to re-engage leads who haven't responded to initial outreach within 48 hours."}
                          className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-electric h-24 resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-8">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Version</label>
                          <span className="text-sm font-bold text-navy bg-gray-100 px-2 py-1 rounded-lg">v1.2.0</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</label>
                          <span className="text-[10px] font-black px-2 py-1 bg-green-100 text-green-600 rounded-lg uppercase tracking-wider">Published</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-3xl p-6 space-y-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Usage Count</span>
                        <span className="text-sm font-black text-navy">142 Tenants</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Active Deploys</span>
                        <span className="text-sm font-black text-navy">128 Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">Total Revenue Impact</span>
                        <span className="text-sm font-black text-green-600">+$2.4M</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={14} className="text-electric" />
                          <span className="text-[10px] font-bold text-navy uppercase tracking-widest">AI Insight</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed italic">
                          "This {type} performs best for Bathroom Remodel tenants on Growth and Pro plans. Conversion rates are 12% higher than the system average."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {type === 'pipelines' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:border-electric transition-all text-left group">
                    <div className="w-10 h-10 bg-blue-50 text-electric rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Brain size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-navy mb-1">Run AI Analysis</h4>
                    <p className="text-[10px] text-gray-500">Analyze current tenant performance using this pipeline.</p>
                  </button>
                  <button className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:border-electric transition-all text-left group">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <TrendingUp size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-navy mb-1">Suggest Better Probabilities</h4>
                    <p className="text-[10px] text-gray-500">Adjust stage probabilities based on real-world win rates.</p>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-navy p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16" />
                <div className="relative">
                  <h4 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-6">AI Recommendation</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-blue-200/60 mb-2 uppercase tracking-widest">Targeting Optimization</p>
                      <p className="text-xs font-medium leading-relaxed">Expand targeting to "Solar Installation" niche. Similar patterns show 15% higher engagement.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-bold text-blue-200/60 mb-2 uppercase tracking-widest">Performance Alert</p>
                      <p className="text-xs font-medium leading-relaxed">Version 1.2.0 is outperforming 1.1.0 by 8% in the "Growth" plan segment.</p>
                    </div>
                    <button className="w-full py-3 bg-white text-navy rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                      <Zap size={14} /> Apply AI Suggestions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {type === 'automation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy">Workflow Builder</h4>
                  <div className="flex items-center gap-3">
                    <button className="text-xs font-bold text-electric flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all">
                      <Brain size={14} /> AI Improve Sequence
                    </button>
                    <button 
                      onClick={() => setSteps([...steps, { type: 'action', label: 'New Action', icon: Zap, color: 'text-gray-500', bg: 'bg-gray-50', summary: 'Configure this action.' }])}
                      className="text-xs font-bold text-white bg-electric px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Step
                    </button>
                  </div>
                </div>
                <div className="space-y-4 relative">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 group relative">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 ${step.bg} ${step.color} rounded-xl flex items-center justify-center shadow-sm z-10`}>
                          <step.icon size={20} />
                        </div>
                        {i < steps.length - 1 && <div className="w-0.5 h-8 bg-gray-100" />}
                      </div>
                      <div className="flex-1 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-electric transition-all group-hover:shadow-md relative">
                        <div className="flex items-center justify-between">
                          <div className="cursor-pointer">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{step.type}</p>
                            <p className="text-sm font-bold text-navy">{step.label}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{step.summary}</p>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStepMenu(openStepMenu === i ? null : i);
                              }}
                              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-300 group-hover:text-gray-400"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            <AnimatePresence>
                              {openStepMenu === i && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-[60]" 
                                    onClick={() => setOpenStepMenu(null)}
                                  />
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[70] overflow-hidden py-2"
                                  >
                                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-navy hover:bg-gray-50 flex items-center gap-2">
                                      <Settings size={14} className="text-gray-400" /> Edit Step
                                    </button>
                                    <button 
                                      onClick={() => duplicateStep(i)}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-navy hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Copy size={14} className="text-gray-400" /> Duplicate Step
                                    </button>
                                    <div className="h-px bg-gray-50 my-1" />
                                    <button 
                                      onClick={() => moveStep(i, 'up')}
                                      disabled={i === 0}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-navy hover:bg-gray-50 flex items-center gap-2 disabled:opacity-30"
                                    >
                                      <ArrowUpRight size={14} className="text-gray-400 rotate-[-45deg]" /> Move Up
                                    </button>
                                    <button 
                                      onClick={() => moveStep(i, 'down')}
                                      disabled={i === steps.length - 1}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-navy hover:bg-gray-50 flex items-center gap-2 disabled:opacity-30"
                                    >
                                      <ArrowUpRight size={14} className="text-gray-400 rotate-[135deg]" /> Move Down
                                    </button>
                                    <div className="h-px bg-gray-50 my-1" />
                                    <button className="w-full px-4 py-2 text-left text-xs font-bold text-purple-600 hover:bg-purple-50 flex items-center gap-2">
                                      <Brain size={14} /> AI Improve Step
                                    </button>
                                    <div className="h-px bg-gray-50 my-1" />
                                    <button 
                                      onClick={() => deleteStep(i)}
                                      className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Delete Step
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type === 'ads' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Ad Copy Content</label>
                      <button className="text-[10px] font-bold text-electric hover:underline flex items-center gap-1">
                        <Brain size={12} /> AI Rewrite Copy
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Headline</p>
                        <input 
                          type="text" 
                          value={adsContent.headline} 
                          onChange={(e) => {
                            setAdsContent({ ...adsContent, headline: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric" 
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Primary Text</p>
                        <textarea 
                          value={adsContent.primaryText} 
                          onChange={(e) => {
                            setAdsContent({ ...adsContent, primaryText: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm text-gray-600 h-32 resize-none focus:ring-2 focus:ring-electric" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">CTA Button</p>
                          <select 
                            value={adsContent.cta}
                            onChange={(e) => {
                              setAdsContent({ ...adsContent, cta: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                          >
                            <option>Get Free Estimate</option>
                            <option>Learn More</option>
                            <option>Book Now</option>
                            <option>Contact Us</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Platform</p>
                          <select 
                            value={adsContent.platform}
                            onChange={(e) => {
                              setAdsContent({ ...adsContent, platform: e.target.value });
                              setHasUnsavedChanges(true);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                          >
                            <option>Facebook</option>
                            <option>Instagram</option>
                            <option>Google Ads</option>
                            <option>TikTok</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Creative Guidance Strategy</label>
                    <button className="text-[10px] font-bold text-electric hover:underline flex items-center gap-1">
                      <Brain size={12} /> AI Generate Guidance
                    </button>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-2xl mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-navy uppercase tracking-widest">Admin Guidance</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed italic">
                        "This is admin-defined guidance that helps contractors know what type of ad creative to use. Contractors can follow this guidance or upload their own assets."
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Creative Type</p>
                        <select 
                          value={adsContent.creativeGuidance.type}
                          onChange={(e) => {
                            setAdsContent({ ...adsContent, creativeGuidance: { ...adsContent.creativeGuidance, type: e.target.value } });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-navy"
                        >
                          <option>Before/After Carousel</option>
                          <option>Static Image</option>
                          <option>Short Video</option>
                          <option>Slideshow</option>
                          <option>Testimonial Graphic</option>
                          <option>AI Render Showcase</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Recommended Ratio</p>
                        <select 
                          value={adsContent.creativeGuidance.format}
                          onChange={(e) => {
                            setAdsContent({ ...adsContent, creativeGuidance: { ...adsContent.creativeGuidance, format: e.target.value } });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-navy"
                        >
                          <option>1:1 (Square)</option>
                          <option>4:5 (Vertical)</option>
                          <option>16:9 (Landscape)</option>
                          <option>9:16 (Story)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Overlay Text Suggestion</p>
                      <input 
                        type="text" 
                        value={adsContent.creativeGuidance.overlayText}
                        onChange={(e) => {
                          setAdsContent({ ...adsContent, creativeGuidance: { ...adsContent.creativeGuidance, overlayText: e.target.value } });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-navy" 
                      />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Visual Style Notes</p>
                      <textarea 
                        value={adsContent.creativeGuidance.notes}
                        onChange={(e) => {
                          setAdsContent({ ...adsContent, creativeGuidance: { ...adsContent.creativeGuidance, notes: e.target.value } });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 h-20 resize-none" 
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:text-navy hover:border-electric transition-all flex items-center justify-center gap-2">
                        <Plus size={16} /> Attach Example Mockup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {type === 'estimates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy">Default Line Items</h4>
                  <button className="text-xs font-bold text-electric flex items-center gap-1">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Item Name</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Unit</th>
                        <th className="px-6 py-3 text-right">Default Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Demolition', desc: 'Full removal of existing fixtures', unit: 'sqft', price: '$12.50' },
                        { name: 'Cabinet Install', desc: 'Installation of custom cabinets', unit: 'unit', price: '$150.00' },
                        { name: 'Countertop', desc: 'Quartz or Granite installation', unit: 'sqft', price: '$85.00' },
                        { name: 'Plumbing Rough-in', desc: 'New plumbing lines and drainage', unit: 'flat', price: '$1,200.00' },
                      ].map((item, i) => (
                        <tr key={i} className="text-sm">
                          <td className="px-6 py-4 font-bold text-navy">{item.name}</td>
                          <td className="px-6 py-4 text-gray-500">{item.desc}</td>
                          <td className="px-6 py-4 text-gray-400 uppercase font-bold text-[10px]">{item.unit}</td>
                          <td className="px-6 py-4 text-right font-bold text-navy">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {type === 'pipelines' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Info size={20} className="text-electric" />
                    <h4 className="text-sm font-bold text-navy">Pipeline Stage Builder</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Define the stages that tenants using this pipeline template will see in their CRM pipeline. These stages control deal flow, stage probability, and default sales process behavior.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        const newId = Math.random().toString(36).substr(2, 9);
                        setPipelineStages([...pipelineStages, { id: newId, name: 'New Stage', type: 'Open', prob: 50, color: 'bg-blue-500', desc: '' }]);
                        setHasUnsavedChanges(true);
                      }}
                      className="btn-primary flex items-center gap-2 text-xs py-2"
                    >
                      <Plus size={16} /> Add Stage
                    </button>
                    <button className="text-xs font-bold text-gray-500 hover:text-navy flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-xl transition-all">
                      <RefreshCw size={14} /> Auto-Balance Probabilities
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-bold text-electric flex items-center gap-1 px-3 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                      <Brain size={14} /> AI Generate Pipeline
                    </button>
                    <button className="text-xs font-bold text-electric flex items-center gap-1 px-3 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                      <Brain size={14} /> AI Optimize Probabilities
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pipelineStages.map((stage, i) => (
                    <div 
                      key={stage.id}
                      onClick={() => setEditingStage(stage)}
                      className="group bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md hover:border-electric transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${stage.color}`} />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-black text-navy">{stage.name}</h5>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                              stage.type === 'Won' ? 'bg-green-100 text-green-600' :
                              stage.type === 'Lost' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {stage.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{stage.desc || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); movePipelineStage(i, 'up'); }}
                            disabled={i === 0}
                            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-20"
                          >
                            <ChevronLeftIcon size={14} className="rotate-90" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); movePipelineStage(i, 'down'); }}
                            disabled={i === pipelineStages.length - 1}
                            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-20"
                          >
                            <ChevronLeftIcon size={14} className="rotate-[-90deg]" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingStage(stage); }}
                            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-electric"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Probability</p>
                          <p className="text-lg font-black text-navy">{stage.prob}%</p>
                        </div>
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${stage.color}`} style={{ width: `${stage.prob}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center py-4 text-gray-400 text-xs font-medium gap-2">
                  <GripVertical size={14} />
                  Drag and drop stages to reorder (Coming Soon)
                </div>

                {/* Stage Edit Modal */}
                <AnimatePresence>
                  {editingStage && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditingStage(null)}
                        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
                      />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-navy">Edit Pipeline Stage</h3>
                          <button onClick={() => setEditingStage(null)} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400">
                            <X size={20} />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stage Name</label>
                            <input 
                              type="text"
                              value={editingStage.name}
                              onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stage Type</label>
                              <select 
                                value={editingStage.type}
                                onChange={(e) => {
                                  const type = e.target.value;
                                  setEditingStage({ 
                                    ...editingStage, 
                                    type, 
                                    prob: type === 'Won' ? 100 : type === 'Lost' ? 0 : editingStage.prob 
                                  });
                                }}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                              >
                                {STAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Probability %</label>
                              <input 
                                type="number"
                                value={editingStage.prob}
                                onChange={(e) => setEditingStage({ ...editingStage, prob: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stage Color</label>
                            <div className="flex flex-wrap gap-3">
                              {STAGE_COLORS.map(color => (
                                <button
                                  key={color.name}
                                  onClick={() => setEditingStage({ ...editingStage, color: color.class })}
                                  className={`w-8 h-8 rounded-full transition-all ${color.class} ${editingStage.color === color.class ? 'ring-4 ring-electric ring-offset-2 scale-110' : 'hover:scale-110'}`}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea 
                              value={editingStage.desc}
                              onChange={(e) => setEditingStage({ ...editingStage, desc: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm text-gray-600 h-24 resize-none focus:ring-2 focus:ring-electric"
                              placeholder="What happens in this stage?"
                            />
                          </div>

                          <div className="pt-4 flex items-center gap-3">
                            <button 
                              onClick={() => {
                                updateStage(editingStage.id, editingStage);
                                setEditingStage(null);
                                toast.success('Stage updated');
                              }}
                              className="flex-1 py-4 bg-electric text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                            >
                              Save Stage
                            </button>
                            <button 
                              onClick={() => {
                                duplicateStage(editingStage);
                                setEditingStage(null);
                              }}
                              className="p-4 bg-gray-50 text-gray-400 hover:text-navy rounded-2xl transition-all"
                              title="Duplicate Stage"
                            >
                              <Copy size={20} />
                            </button>
                            <button 
                              onClick={() => {
                                deleteStage(editingStage.id);
                                setEditingStage(null);
                              }}
                              className="p-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all"
                              title="Delete Stage"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {type === 'websites' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <h4 className="text-sm font-bold text-navy">Included Pages</h4>
                  <div className="space-y-2">
                    {['Home', 'About', 'Services', 'Gallery', 'Contact', 'FAQ'].map((page, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold text-navy">{page}</span>
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="aspect-video bg-gray-100 rounded-3xl border-4 border-gray-200 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-navy/20" />
                    <div className="relative text-center">
                      <Globe size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-sm font-bold text-gray-400">Desktop Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'targeting':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Plan Eligibility</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setSelectedPlans(['Starter', 'Growth', 'Pro']);
                          setHasUnsavedChanges(true);
                        }}
                        className="text-[10px] font-bold text-electric hover:underline"
                      >
                        Select All
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPlans([]);
                          setHasUnsavedChanges(true);
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-navy"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {['Starter', 'Growth', 'Pro'].map(plan => (
                      <div 
                        key={plan} 
                        onClick={() => togglePlan(plan)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                          selectedPlans.includes(plan) 
                            ? 'bg-blue-50 border-blue-100 shadow-sm' 
                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedPlans.includes(plan) 
                              ? (plan === 'Pro' ? 'bg-navy text-white' : 'bg-electric text-white') 
                              : 'bg-white text-gray-400 border border-gray-200'
                          }`}>
                            <Zap size={14} />
                          </div>
                          <span className={`text-sm font-bold ${selectedPlans.includes(plan) ? 'text-navy' : 'text-gray-400'}`}>{plan} Plan</span>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          selectedPlans.includes(plan) ? 'bg-electric border-electric text-white' : 'bg-white border-gray-300'
                        }`}>
                          {selectedPlans.includes(plan) && <Check size={14} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Default Deployment Rules</label>
                  <div className="space-y-3">
                    {[
                      { 
                        id: 'autoDeploy', 
                        label: 'Auto-deploy for new tenants', 
                        desc: 'Automatically add to new accounts on signup.', 
                        tooltip: 'Automatically applies this template to new tenant accounts that match the selected plan and niche rules.'
                      },
                      { 
                        id: 'setDefault', 
                        label: 'Set as default for niche', 
                        desc: 'Make this the primary automation for selected niches.', 
                        tooltip: 'Makes this the primary template for selected niches.'
                      },
                      { 
                        id: 'aiRecommended', 
                        label: 'AI Recommended', 
                        desc: 'Show as "Recommended" in tenant template library.', 
                        tooltip: 'Shows this template as AI-recommended inside the tenant template library.'
                      },
                      { 
                        id: 'premium', 
                        label: 'Premium Template', 
                        desc: 'Only available as an optional add-on.', 
                        tooltip: 'Only available as a premium or higher-tier template.'
                      },
                    ].map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-navy">{rule.label}</p>
                              <div className="group/tooltip relative">
                                <Info size={12} className="text-gray-300 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-navy text-[10px] text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                  {rule.tooltip}
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-500">{rule.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => updateTargeting({ [rule.id]: !deploymentRules[rule.id as keyof typeof deploymentRules] })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all border-2 ${
                            deploymentRules[rule.id as keyof typeof deploymentRules] 
                              ? 'bg-electric border-electric shadow-[0_0_10px_rgba(0,112,243,0.3)]' 
                              : 'bg-gray-200 border-gray-300'
                          }`}
                        >
                          <div className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                            deploymentRules[rule.id as keyof typeof deploymentRules] ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Deployment Priority</label>
                    <select 
                      value={deploymentPriority}
                      onChange={(e) => {
                        setDeploymentPriority(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="preferred">Preferred</option>
                      <option value="default">Default</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Visibility</label>
                    <select 
                      value={visibility}
                      onChange={(e) => {
                        setVisibility(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-electric"
                    >
                      <option value="library">Library</option>
                      <option value="hidden">Hidden</option>
                      <option value="premium">Premium Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Niche Targeting</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setSelectedNiches([...NICHE_OPTIONS]);
                          setHasUnsavedChanges(true);
                        }}
                        className="text-[10px] font-bold text-electric hover:underline"
                      >
                        All
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedNiches([]);
                          setHasUnsavedChanges(true);
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-navy"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl relative">
                    <div className="flex items-center gap-3 mb-4">
                      <Target size={20} className="text-electric" />
                      <h4 className="text-sm font-bold text-navy">Selected Niches</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                      {selectedNiches.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No niches selected. Available to all by default.</p>
                      ) : (
                        selectedNiches.map(niche => (
                          <span key={niche} className="px-3 py-1.5 bg-white text-navy text-[10px] font-bold rounded-xl border border-blue-100 shadow-sm flex items-center gap-2 animate-in zoom-in duration-200">
                            {niche}
                            <button 
                              onClick={() => removeNiche(niche)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsNicheDropdownOpen(!isNicheDropdownOpen)}
                        className="w-full py-2.5 bg-white text-electric text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Niche
                      </button>

                      <AnimatePresence>
                        {isNicheDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsNicheDropdownOpen(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden flex flex-col max-h-64"
                            >
                              <div className="p-3 border-b border-gray-50">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                  <input 
                                    type="text"
                                    placeholder="Search niches..."
                                    value={nicheSearch}
                                    onChange={(e) => setNicheSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-electric"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="overflow-y-auto p-2 space-y-1">
                                {NICHE_OPTIONS.filter(n => 
                                  n.toLowerCase().includes(nicheSearch.toLowerCase()) && 
                                  !selectedNiches.includes(n)
                                ).map(niche => (
                                  <button
                                    key={niche}
                                    onClick={() => addNiche(niche)}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-navy hover:bg-gray-50 rounded-lg transition-colors"
                                  >
                                    {niche}
                                  </button>
                                ))}
                                {nicheSearch && !NICHE_OPTIONS.some(n => n.toLowerCase() === nicheSearch.toLowerCase()) && (
                                  <button
                                    onClick={() => addNiche(nicheSearch)}
                                    className="w-full px-3 py-2 text-left text-xs font-bold text-electric hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    <Plus size={14} /> Create "{nicheSearch}"
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button className="flex-1 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg hover:bg-gray-100 transition-all">Interior Presets</button>
                    <button className="flex-1 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-lg hover:bg-gray-100 transition-all">Exterior Presets</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-navy rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Target size={80} />
                    </div>
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                      Targeting Summary
                      <div className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
                    </h4>
                    <p 
                      className="text-xs text-blue-100/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: `"${getTargetingSummary()}"` }}
                    />
                  </div>

                  <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-navy hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <Eye size={16} className="text-gray-400" /> Preview Matching Tenants
                  </button>

                  <div className="p-6 bg-white border border-gray-100 rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-navy uppercase tracking-widest">Eligibility Matrix</h4>
                      <span className="text-[10px] text-gray-400 font-medium italic">Live Preview</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-50">
                            <th className="pb-2 text-left font-bold">Niche</th>
                            {['S', 'G', 'P'].map(p => <th key={p} className="pb-2 text-center font-bold w-8">{p}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(selectedNiches.length > 0 ? selectedNiches.slice(0, 5) : ['All Niches']).map(niche => (
                            <tr key={niche}>
                              <td className="py-2 font-bold text-navy truncate max-w-[100px]">{niche}</td>
                              {['Starter', 'Growth', 'Pro'].map(plan => (
                                <td key={plan} className="py-2 text-center">
                                  {selectedPlans.includes(plan) ? (
                                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" />
                                  ) : (
                                    <div className="w-3 h-3 bg-gray-100 rounded-full mx-auto" />
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {selectedNiches.length > 5 && (
                            <tr>
                              <td colSpan={4} className="py-2 text-center text-gray-400 italic">+{selectedNiches.length - 5} more niches...</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">AI Targeting Helpers</p>
                    <div className="grid grid-cols-1 gap-2">
                      <button className="w-full py-2.5 bg-blue-50 text-electric text-[10px] font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                        <Brain size={14} /> Suggest Best Plans for this Template
                      </button>
                      <button className="w-full py-2.5 bg-blue-50 text-electric text-[10px] font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                        <Brain size={14} /> Analyze Niche Performance Alignment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'versions':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy">Version History</h4>
                <p className="text-xs text-gray-500">Track and manage template iterations safely.</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Plus size={16} /> Create New Version
              </button>
            </div>
            <div className="space-y-4">
              {[
                { version: 'v1.2.0', date: 'Oct 24, 2025', author: 'Admin (info@vcv)', note: 'Updated SMS follow-up copy for better conversion.', status: 'Published', type: 'Admin', current: true },
                { version: 'v1.1.5', date: 'Oct 12, 2025', author: 'AI Optimizer', note: 'Added 1-day delay between steps 2 and 3.', status: 'Archived', type: 'AI', current: false },
                { version: 'v1.0.0', date: 'Sep 15, 2025', author: 'Admin (info@vcv)', note: 'Initial template creation.', status: 'Archived', type: 'Admin', current: false },
              ].map((v, i) => (
                <div key={i} className={`p-6 rounded-3xl border transition-all ${v.current ? 'border-electric bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.current ? 'bg-electric text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <History size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-navy">{v.version}</span>
                          {v.current && <span className="text-[8px] font-black px-1.5 py-0.5 bg-electric text-white rounded uppercase tracking-tighter">Current</span>}
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${v.type === 'AI' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>{v.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{v.date} • {v.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-lg transition-all">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-navy hover:bg-white rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4 bg-white/50 p-3 rounded-xl border border-gray-100/50 italic">"{v.note}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <div className="flex items-center gap-4">
                      <button className="text-[10px] font-bold text-electric hover:underline flex items-center gap-1">
                        <Eye size={12} /> View Changes
                      </button>
                      {!v.current && (
                        <button className="text-[10px] font-bold text-gray-400 hover:text-navy flex items-center gap-1">
                          <RefreshCw size={12} /> Roll Back
                        </button>
                      )}
                    </div>
                    <button className="text-[10px] font-bold text-navy hover:text-electric">Compare with Current</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Average Win Rate', value: '24.8%', trend: '+2.4%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Avg. Time to Close', value: '18 Days', trend: '-2 Days', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Stalled Deal Rate', value: '12.5%', trend: '-1.2%', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Total Revenue', value: '$2.4M', trend: '+$420k', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                      stat.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h4 className="text-xl font-black text-navy">{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-sm font-bold text-navy uppercase tracking-widest">Stage Conversion Funnel</h4>
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {pipelineStages.map((stage, i) => (
                    <div key={stage.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-navy">{stage.name}</span>
                        <span className="text-gray-400">{100 - (i * 15)}% Conversion</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - (i * 15)}%` }}
                          className={`h-full ${stage.color} rounded-full opacity-80`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={18} className="text-electric" />
                    <h4 className="text-sm font-bold text-navy uppercase tracking-widest">AI Performance Insights</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <TrendingDown className="text-blue-600 shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        "Estimate Sent to Won drop-off is high (35%). Recommend adding a <strong>Follow-Up</strong> stage between them to increase conversion."
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-orange-800 leading-relaxed">
                        "This pipeline has too many stages (6) for Starter tenants. Consider a simplified 4-stage version for lower-tier plans."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-navy uppercase tracking-widest mb-6">Usage by Niche</h4>
                  <div className="space-y-4">
                    {[
                      { niche: 'Kitchen Remodel', usage: 45, color: 'bg-blue-500' },
                      { niche: 'Bathroom Remodel', usage: 30, color: 'bg-purple-500' },
                      { niche: 'Roofing', usage: 15, color: 'bg-orange-500' },
                      { niche: 'Other', usage: 10, color: 'bg-gray-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className="text-navy uppercase tracking-tight">{item.niche}</span>
                            <span className="text-gray-400">{item.usage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.usage}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-navy transition-all shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-navy">{template.title}</h2>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                  {type}
                </span>
              </div>
              <p className="text-sm text-gray-500">Last updated Oct 24, 2025 by Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl animate-in fade-in slide-in-from-right-4">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Unsaved Changes</span>
              </div>
            )}
            <button className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Delete Template">
              <Trash2 size={20} />
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <Zap size={18} /> Push to Tenants
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: Layout },
              { id: 'content', label: 'Template Content', icon: FileText },
              { id: 'targeting', label: 'Targeting Rules', icon: Target },
              { id: 'versions', label: 'Version History', icon: History },
              { id: 'performance', label: 'Performance', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-electric text-electric' 
                    : 'border-transparent text-gray-400 hover:text-navy'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {renderTabContent()}
        </div>
      </motion.div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size: number }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
}

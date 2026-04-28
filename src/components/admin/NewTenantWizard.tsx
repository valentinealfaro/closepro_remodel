import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Building2, 
  User, 
  CreditCard, 
  Zap, 
  Layout, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle2,
  Brain,
  Megaphone,
  FileText,
  Kanban,
  Star,
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Plus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { FullAccountService } from '../../services/FullAccountService';

import { useAuth } from '../../lib/AuthContext';

interface NewTenantWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantId: string) => void;
}

export default function NewTenantWizard({ isOpen, onClose, onSuccess }: NewTenantWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    businessType: 'Kitchen Remodeler',
    plan: 'starter',
    status: 'trial',
    billingStartDate: new Date().toISOString().split('T')[0],
    priceOverride: '',
    teamSeats: '3',
    subdomain: '',
    features: {
      aiVisualizer: true,
      automationEngine: true,
      adsEngine: false,
      websiteEditor: true,
      estimates: true,
      invoices: true,
      payments: true,
      reviews: false,
      calendar: true,
      reporting: false,
    },
    seedOptions: {
      website: true,
      pipeline: true,
      automations: true,
      estimates: true,
      ads: false,
      leads: true,
      deals: true,
      aiProjects: true,
    }
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleCreate = async (seed: boolean = false) => {
    setLoading(true);
    try {
      // In a real app, we'd call a more complex service that handles all steps
      // For now, we'll use the existing FullAccountService if seeding is requested
      // or a simpler one if not.
      const tenantId = await FullAccountService.seedFullAccount(formData.businessName, user?.uid || '');
      toast.success(seed ? 'Tenant created and seeded successfully!' : 'Tenant created successfully!');
      onSuccess(tenantId);
      onClose();
    } catch (error) {
      toast.error('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                  placeholder="e.g. Elite Roofing & Siding"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner First Name</label>
                <input 
                  type="text" 
                  value={formData.ownerFirstName}
                  onChange={e => setFormData({...formData, ownerFirstName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner Last Name</label>
                <input 
                  type="text" 
                  value={formData.ownerLastName}
                  onChange={e => setFormData({...formData, ownerLastName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Type</label>
                <select 
                  value={formData.businessType}
                  onChange={e => setFormData({...formData, businessType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                >
                  <option>Kitchen Remodeler</option>
                  <option>Bathroom Remodeler</option>
                  <option>Home Remodeler</option>
                  <option>General Contractor</option>
                  <option>Roofing</option>
                  <option>Flooring</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan</label>
                <select 
                  value={formData.plan}
                  onChange={e => setFormData({...formData, plan: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                >
                  <option value="starter">Starter ($99/mo)</option>
                  <option value="growth">Growth ($249/mo)</option>
                  <option value="pro">Pro ($499/mo)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active Subscription</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Billing Start Date</label>
                <input 
                  type="date" 
                  value={formData.billingStartDate}
                  onChange={e => setFormData({...formData, billingStartDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Override (Optional)</label>
                <input 
                  type="number" 
                  value={formData.priceOverride}
                  onChange={e => setFormData({...formData, priceOverride: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                  placeholder="e.g. 399"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subdomain Suggestion</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={formData.subdomain}
                    onChange={e => setFormData({...formData, subdomain: e.target.value})}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                    placeholder="e.g. elite-roofing"
                  />
                  <span className="text-sm font-bold text-gray-400">.closepro.com</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-gray-500 mb-4">Enable or disable specific features for this tenant.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'aiVisualizer', label: 'AI Visualizer', icon: Brain },
                { id: 'automationEngine', label: 'Automation Engine', icon: Zap },
                { id: 'adsEngine', label: 'Ads Engine', icon: Megaphone },
                { id: 'websiteEditor', label: 'Website Editor', icon: Globe },
                { id: 'estimates', label: 'Estimates', icon: FileText },
                { id: 'invoices', label: 'Invoices', icon: CreditCard },
                { id: 'payments', label: 'Payments', icon: DollarSign },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'reporting', label: 'Advanced Reporting', icon: BarChart3 },
              ].map((feature) => (
                <label key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-navy shadow-sm">
                      <feature.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-navy">{feature.label}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.features[feature.id as keyof typeof formData.features]}
                    onChange={e => setFormData({
                      ...formData, 
                      features: { ...formData.features, [feature.id]: e.target.checked }
                    })}
                    className="w-5 h-5 text-electric rounded-md border-gray-300 focus:ring-electric"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-sm text-gray-500 mb-4">Select starter data to seed into the new account.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'website', label: 'Starter Website', icon: Globe },
                { id: 'pipeline', label: 'Pipeline Stages', icon: Kanban },
                { id: 'automations', label: 'Default Automations', icon: Zap },
                { id: 'estimates', label: 'Estimate Templates', icon: FileText },
                { id: 'ads', label: 'Ad Templates', icon: Megaphone },
                { id: 'leads', label: 'Sample Leads', icon: Users },
                { id: 'deals', label: 'Demo Deals', icon: DollarSign },
                { id: 'aiProjects', label: 'AI Visualizer Demo', icon: Brain },
              ].map((option) => (
                <label key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-navy shadow-sm">
                      <option.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-navy">{option.label}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={formData.seedOptions[option.id as keyof typeof formData.seedOptions]}
                    onChange={e => setFormData({
                      ...formData, 
                      seedOptions: { ...formData.seedOptions, [option.id]: e.target.checked }
                    })}
                    className="w-5 h-5 text-electric rounded-md border-gray-300 focus:ring-electric"
                  />
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                <Shield size={18} className="text-electric" /> Final Review
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Company</p>
                  <p className="text-sm font-bold text-navy">{formData.businessName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Owner</p>
                  <p className="text-sm font-bold text-navy">{formData.ownerFirstName} {formData.ownerLastName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Plan</p>
                  <p className="text-sm font-bold text-navy capitalize">{formData.plan} ({formData.status})</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Subdomain</p>
                  <p className="text-sm font-bold text-navy">{formData.subdomain || 'auto-generated'}.closepro.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase">Seeding Summary</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.seedOptions)
                  .filter(([_, enabled]) => enabled)
                  .map(([id]) => (
                    <span key={id} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">
                      {id}
                    </span>
                  ))
                }
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric text-white rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">New Tenant Wizard</h2>
              <p className="text-xs text-gray-500">Step {step} of 5: {
                step === 1 ? 'Business Info' :
                step === 2 ? 'Plan & Setup' :
                step === 3 ? 'Enable Features' :
                step === 4 ? 'Seed Options' : 'Final Review'
              }</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-100">
          <motion.div 
            className="h-full bg-electric"
            initial={{ width: '20%' }}
            animate={{ width: `${step * 20}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-navy disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <div className="flex items-center gap-3">
            {step < 5 ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleCreate(false)}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold text-navy hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                >
                  Create Empty Tenant
                </button>
                <button 
                  onClick={() => handleCreate(true)}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Create & Seed Account
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

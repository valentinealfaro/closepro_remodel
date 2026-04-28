import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Zap, 
  Layout, 
  Megaphone, 
  FileText, 
  Kanban, 
  Globe,
  Brain,
  Shield,
  Target,
  Eye,
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface CreateTemplateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  type: string | null;
}

export default function CreateTemplateWizard({ isOpen, onClose, type }: CreateTemplateWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    niche: 'Multi-Service',
    plans: ['starter', 'growth', 'pro'],
    isDefault: false,
    status: 'draft',
    content: {} as any
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async (publish: boolean = false) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Template "${formData.name}" ${publish ? 'published' : 'saved as draft'} successfully!`);
      onClose();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Template Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                  placeholder="e.g. High-Converting Kitchen Lead Follow-up"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric h-24 resize-none"
                  placeholder="What is this template for?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                  >
                    <option value="">Select Category</option>
                    <option>Onboarding</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Niche</label>
                  <select 
                    value={formData.niche}
                    onChange={e => setFormData({...formData, niche: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
                  >
                    <option>Multi-Service</option>
                    <option>Kitchen Remodel</option>
                    <option>Bathroom Remodel</option>
                    <option>Roofing</option>
                    <option>Flooring</option>
                    <option>General Contractor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Plan Eligibility</label>
              <div className="grid grid-cols-3 gap-3">
                {['starter', 'growth', 'pro'].map(plan => (
                  <button
                    key={plan}
                    onClick={() => {
                      const plans = formData.plans.includes(plan)
                        ? formData.plans.filter(p => p !== plan)
                        : [...formData.plans, plan];
                      setFormData({...formData, plans});
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${
                      formData.plans.includes(plan)
                        ? 'border-electric bg-blue-50 text-electric'
                        : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="text-sm font-bold capitalize">{plan}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase">Default Settings</label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-navy">Set as Default</p>
                  <p className="text-xs text-gray-500">Automatically assign to new tenants in eligible plans/niches.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.isDefault}
                  onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                  className="w-5 h-5 text-electric rounded-md border-gray-300 focus:ring-electric"
                />
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Brain className="text-purple-500" size={32} />
              </div>
              <h4 className="text-lg font-bold text-navy mb-2">Template Content Builder</h4>
              <p className="text-sm text-gray-500 mb-6">Configure the specific steps, copy, or layout for this {type} template.</p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button className="btn-secondary bg-white flex items-center justify-center gap-2">
                  <Plus size={18} /> Add Manual Content
                </button>
                <button className="btn-primary bg-purple-600 hover:bg-purple-700 border-none flex items-center justify-center gap-2">
                  <Brain size={18} /> AI Generate Content
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                <Eye size={18} className="text-electric" /> Final Review
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Name</p>
                  <p className="text-sm font-bold text-navy">{formData.name || 'Untitled'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Type</p>
                  <p className="text-sm font-bold text-navy capitalize">{type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Niche</p>
                  <p className="text-sm font-bold text-navy">{formData.niche}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Default</p>
                  <p className="text-sm font-bold text-navy">{formData.isDefault ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase">Publishing Options</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setFormData({...formData, status: 'draft'})}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.status === 'draft' ? 'border-navy bg-navy text-white' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <p className="text-sm font-bold">Save as Draft</p>
                  <p className="text-[10px] opacity-60">Hidden from tenants</p>
                </button>
                <button 
                  onClick={() => setFormData({...formData, status: 'published'})}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.status === 'published' ? 'border-electric bg-blue-50 text-electric' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <p className="text-sm font-bold">Publish Now</p>
                  <p className="text-[10px] opacity-60">Available to tenants</p>
                </button>
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
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric text-white rounded-xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Create {type} Template</h2>
              <p className="text-xs text-gray-500">Step {step} of 4</p>
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
            initial={{ width: '25%' }}
            animate={{ width: `${step * 25}%` }}
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
            {step < 4 ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => handleSave(formData.status === 'published')}
                disabled={loading || !formData.name}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {formData.status === 'published' ? 'Publish Template' : 'Save as Draft'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}

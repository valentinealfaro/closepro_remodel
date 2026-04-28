import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Layout, 
  Megaphone, 
  FileText, 
  Kanban, 
  Globe,
  AlertCircle,
  Users,
  Building2,
  ArrowRight,
  Activity,
  Target,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { TemplateService } from '../../services/TemplateService';

interface SeedTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: any[];
}

export default function SeedTemplatesModal({ isOpen, onClose, tenants }: SeedTemplatesModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'automations' | 'ads' | 'estimates' | 'pipelines' | 'websites'>('all');
  const [target, setTarget] = useState<'all' | 'active' | 'plan' | 'niche' | 'specific' | 'new'>('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [deployMode, setDeployMode] = useState<'optional' | 'default' | 'replace' | 'smart'>('default');
  const [conflictStrategy, setConflictStrategy] = useState<'overwrite' | 'copy' | 'skip'>('overwrite');

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    try {
      let targetTenantIds: string[] = [];
      
      if (target === 'all') {
        targetTenantIds = tenants.map(t => t.id);
      } else if (target === 'active') {
        targetTenantIds = tenants.filter(t => t.status === 'active').map(t => t.id);
      } else if (target === 'plan') {
        targetTenantIds = tenants.filter(t => selectedPlans.includes(t.plan)).map(t => t.id);
      } else if (target === 'niche') {
        targetTenantIds = tenants.filter(t => selectedNiches.includes(t.niche)).map(t => t.id);
      } else if (target === 'specific') {
        targetTenantIds = selectedTenants;
      }

      if (targetTenantIds.length === 0 && target !== 'new') {
        toast.error('No target tenants selected');
        return;
      }

      if (target !== 'new') {
        await TemplateService.pushTemplateToTenants(selectedType as any, targetTenantIds);
      }
      
      let targetText = '';
      if (target === 'all') targetText = 'all tenants';
      else if (target === 'active') targetText = 'all active tenants';
      else if (target === 'plan') targetText = `tenants on ${selectedPlans.join(', ')} plans`;
      else if (target === 'niche') targetText = `tenants in ${selectedNiches.join(', ')} niches`;
      else if (target === 'specific') targetText = `${selectedTenants.length} specific tenants`;
      else if (target === 'new') targetText = 'future new tenants (auto-deploy)';

      const typeText = selectedType === 'all' ? 'all global templates' : `global ${selectedType} templates`;
      
      toast.success(`Successfully pushed ${typeText} to ${targetText}`);
      onClose();
    } catch (error) {
      toast.error('Failed to seed templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleTenant = (id: string) => {
    setSelectedTenants(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">1. Select Template Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Master', icon: Zap },
                  { id: 'automations', label: 'Automations', icon: Zap },
                  { id: 'ads', label: 'Ad Copy', icon: Megaphone },
                  { id: 'estimates', label: 'Estimates', icon: FileText },
                  { id: 'pipelines', label: 'Pipelines', icon: Kanban },
                  { id: 'websites', label: 'Websites', icon: Globe },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selectedType === type.id 
                        ? 'border-orange-500 bg-orange-50 text-orange-600' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-400'
                    }`}
                  >
                    <type.icon size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">2. Select Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Tenants', icon: Users },
                  { id: 'active', label: 'Active Only', icon: Activity },
                  { id: 'plan', label: 'By Plan', icon: Zap },
                  { id: 'niche', label: 'By Niche', icon: Target },
                  { id: 'specific', label: 'Selected', icon: Building2 },
                  { id: 'new', label: 'New Only', icon: Plus },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTarget(t.id as any)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      target === t.id 
                        ? 'border-navy bg-navy text-white' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <t.icon size={16} />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>

              {target === 'plan' && (
                <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {['Starter', 'Growth', 'Pro'].map(plan => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlans(prev => prev.includes(plan) ? prev.filter(p => p !== plan) : [...prev, plan])}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        selectedPlans.includes(plan) ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              )}

              {target === 'specific' && (
                <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl space-y-1 border border-gray-100">
                  {tenants.map(tenant => (
                    <label key={tenant.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-navy text-white rounded flex items-center justify-center text-[10px] font-bold">
                          {tenant.name?.[0] || 'T'}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{tenant.name}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={selectedTenants.includes(tenant.id)}
                        onChange={() => toggleTenant(tenant.id)}
                        className="w-4 h-4 text-navy rounded border-gray-300 focus:ring-navy"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Deployment Mode</label>
              <div className="space-y-2">
                {[
                  { id: 'optional', label: 'Optional Library Item', desc: 'Add to library, but don\'t activate automatically.' },
                  { id: 'default', label: 'Set as Default', desc: 'Make this the primary template for the tenant.' },
                  { id: 'replace', label: 'Force Replace', desc: 'Overwrite existing templates with the same name.' },
                  { id: 'smart', label: 'Smart Update', desc: 'Only update if the tenant hasn\'t customized it.' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDeployMode(mode.id as any)}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      deployMode === mode.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      deployMode === mode.id ? 'border-orange-500' : 'border-gray-300'
                    }`}>
                      {deployMode === mode.id && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${deployMode === mode.id ? 'text-orange-600' : 'text-navy'}`}>{mode.label}</p>
                      <p className="text-[10px] text-gray-500">{mode.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">4. Conflict Handling</label>
              <div className="flex gap-2">
                {[
                  { id: 'overwrite', label: 'Overwrite' },
                  { id: 'copy', label: 'Create Copy' },
                  { id: 'skip', label: 'Skip' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setConflictStrategy(s.id as any)}
                    className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      conflictStrategy === s.id 
                        ? 'border-navy bg-navy text-white' 
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
              <h4 className="text-sm font-bold text-navy uppercase tracking-widest text-center">Review Deployment</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Templates</span>
                  <span className="text-xs font-bold text-navy capitalize">{selectedType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Target</span>
                  <span className="text-xs font-bold text-navy capitalize">{target} Tenants</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Mode</span>
                  <span className="text-xs font-bold text-navy capitalize">{deployMode}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">Conflicts</span>
                  <span className="text-xs font-bold text-navy capitalize">{conflictStrategy}</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-[10px] text-orange-800 leading-relaxed">
                  <span className="font-bold">Important:</span> This action will affect multiple live tenant accounts. Please ensure you have tested these templates in a staging environment first.
                </p>
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
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Push Global Templates</h2>
              <p className="text-xs text-gray-500">Step {step} of 3: {step === 1 ? 'Targeting' : step === 2 ? 'Configuration' : 'Review'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'w-6 bg-orange-500' : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-navy transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="btn-primary bg-navy hover:bg-navy/90 flex items-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSeed}
                disabled={loading}
                className="btn-primary bg-orange-500 hover:bg-orange-600 border-none flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                Confirm & Push Now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Zap, 
  Clock, 
  Mail, 
  MessageSquare, 
  Bell, 
  UserPlus, 
  Tag, 
  Kanban,
  FileText,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Settings,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Automation, AutomationStep, TriggerType, ActionType, AutomationCondition } from '../types/automation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AutomationBuilderProps {
  automation?: Automation | null;
  onClose: () => void;
}

const TRIGGER_OPTIONS: { value: TriggerType; label: string; description: string; icon: any }[] = [
  { value: 'lead_created', label: 'New Lead Created', description: 'When a new lead enters the system', icon: UserPlus },
  { value: 'lead_updated', label: 'Lead Updated', description: 'When any field on a lead is changed', icon: Settings },
  { value: 'deal_won', label: 'Deal Won', description: 'When a deal moves to the Won stage', icon: DollarSign },
  { value: 'estimate_sent', label: 'Estimate Sent', description: 'When an estimate is sent to a client', icon: FileText },
  { value: 'estimate_approved', label: 'Estimate Approved', description: 'When a client signs an estimate', icon: CheckCircle2 },
  { value: 'invoice_overdue', label: 'Invoice Overdue', description: 'When an invoice is past its due date', icon: AlertCircle },
  { value: 'form_submitted', label: 'Website Form Submitted', description: 'When a client fills out a website form', icon: Zap },
];

const ACTION_OPTIONS: { value: ActionType; label: string; icon: any }[] = [
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
  { value: 'trigger_ai_followup', label: 'AI Follow-Up', icon: Zap },
  { value: 'internal_notification', label: 'Internal Notification', icon: Bell },
  { value: 'update_lead_status', label: 'Update Lead Status', icon: Settings },
  { value: 'add_tag', label: 'Add Tag', icon: Tag },
  { value: 'move_deal_stage', label: 'Move Deal Stage', icon: Kanban },
  { value: 'send_estimate', label: 'Send Estimate', icon: FileText },
  { value: 'send_invoice', label: 'Send Invoice', icon: DollarSign },
  { value: 'send_booking_link', label: 'Send Booking Link', icon: Calendar },
];

export default function AutomationBuilder({ automation, onClose }: AutomationBuilderProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Automation>>({
    name: '',
    description: '',
    trigger: { type: 'lead_created' },
    conditions: [],
    steps: [],
    isActive: true,
    ...automation
  });

  const addStep = (type: 'action' | 'delay') => {
    const newStep: AutomationStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      actionType: type === 'action' ? 'send_email' : undefined,
      config: type === 'action' ? { message: '' } : undefined,
      delayConfig: type === 'delay' ? { value: 1, unit: 'days' } : undefined
    };
    setFormData(prev => ({ ...prev, steps: [...(prev.steps || []), newStep] }));
  };

  const updateStep = (id: string, updates: Partial<AutomationStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map(step => step.id === id ? { ...step, ...updates } : step)
    }));
  };

  const removeStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter an automation name');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        tenantId: userData.tenantId,
        updatedAt: serverTimestamp()
      };

      if (automation?.id) {
        await updateDoc(doc(db, `tenants/${userData.tenantId}/automations`, automation.id), data);
        toast.success('Automation updated');
      } else {
        await addDoc(collection(db, `tenants/${userData.tenantId}/automations`), {
          ...data,
          createdAt: serverTimestamp(),
          stats: { runCount: 0, successCount: 0, errorCount: 0 }
        });
        toast.success('Automation created');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save automation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-all">
            <X size={20} />
          </button>
          <div className="h-6 w-px bg-gray-100"></div>
          <div>
            <h2 className="text-sm font-bold text-navy">{automation ? 'Edit Automation' : 'New Automation'}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {formData.name || 'Untitled Workflow'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-electric hover:shadow-lg hover:shadow-blue-500/30 rounded-xl transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save Automation
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Basic Info */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Automation Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-electric"
                  placeholder="e.g., New Lead Follow-up"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Description</label>
                <textarea 
                  rows={2}
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                  placeholder="What does this automation do?"
                />
              </div>
            </div>
          </section>

          {/* Trigger Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold text-navy">Trigger</h3>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRIGGER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, trigger: { type: option.value } }))}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.trigger?.type === option.value 
                        ? 'border-electric bg-blue-50' 
                        : 'border-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.trigger?.type === option.value ? 'bg-electric text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <option.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{option.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Steps Section */}
          <section className="space-y-6 relative">
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-100 -z-10"></div>
            
            <AnimatePresence mode="popLayout">
              {formData.steps?.map((step, index) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xs shadow-sm">
                    {index + 1}
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {step.type === 'delay' ? (
                          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Clock size={18} />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap size={18} />
                          </div>
                        )}
                        <h4 className="font-bold text-navy capitalize">{step.type}</h4>
                      </div>
                      <button 
                        onClick={() => removeStep(step.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {step.type === 'delay' ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Wait For</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={step.delayConfig?.value}
                              onChange={(e) => updateStep(step.id, { delayConfig: { ...step.delayConfig!, value: parseInt(e.target.value) || 0 } })}
                              className="w-24 bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-electric"
                            />
                            <select 
                              value={step.delayConfig?.unit}
                              onChange={(e) => updateStep(step.id, { delayConfig: { ...step.delayConfig!, unit: e.target.value as any } })}
                              className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-electric"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Action Type</label>
                          <select 
                            value={step.actionType}
                            onChange={(e) => updateStep(step.id, { actionType: e.target.value as ActionType })}
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-electric"
                          >
                            {ACTION_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {(step.actionType === 'send_email' || step.actionType === 'send_sms') && (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Message Content</label>
                            <textarea 
                              rows={3}
                              value={step.config?.message}
                              onChange={(e) => updateStep(step.id, { config: { ...step.config, message: e.target.value } })}
                              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                              placeholder="Use variables like [Name], [Service], [Company]..."
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              {['[Name]', '[Service]', '[Company]', '[Estimate Link]'].map(v => (
                                <button 
                                  key={v}
                                  onClick={() => updateStep(step.id, { config: { ...step.config, message: (step.config?.message || '') + v } })}
                                  className="text-[10px] font-bold text-electric bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {step.actionType === 'update_lead_status' && (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">New Status</label>
                            <select 
                              value={step.config?.status}
                              onChange={(e) => updateStep(step.id, { config: { ...step.config, status: e.target.value } })}
                              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-electric"
                            >
                              <option value="new">New Lead</option>
                              <option value="contacted">Contacted</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="won">Won</option>
                              <option value="lost">Lost</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pl-12 flex gap-4">
              <button 
                onClick={() => addStep('action')}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-electric hover:text-electric transition-all"
              >
                <Plus size={18} /> Add Action
              </button>
              <button 
                onClick={() => addStep('delay')}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-yellow-500 hover:text-yellow-500 transition-all"
              >
                <Clock size={18} /> Add Delay
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function CheckCircle2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
}

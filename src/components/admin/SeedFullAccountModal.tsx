import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  Users, 
  Zap, 
  Layout, 
  Brain,
  ArrowRight,
  Star,
  DollarSign,
  Kanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { FullAccountService } from '../../services/FullAccountService';

interface SeedFullAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantId: string) => void;
  ownerId: string;
}

export default function SeedFullAccountModal({ isOpen, onClose, onSuccess, ownerId }: SeedFullAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('Elite Roofing & Siding');
  const [niche, setNiche] = useState('Roofing');

  if (!isOpen) return null;

  const handleSeed = async () => {
    setLoading(true);
    try {
      const tenantId = await FullAccountService.seedFullAccount(businessName, ownerId);
      toast.success(`Full demo account created: ${businessName}`);
      onSuccess(tenantId);
      onClose();
    } catch (error) {
      toast.error('Failed to seed full account');
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Seed Full Demo Account</h2>
              <p className="text-xs text-gray-500">Create a complete, ready-to-demo environment.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
              <input 
                type="text" 
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Elite Roofing & Siding"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Niche / Industry</label>
              <select 
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-blue-500"
              >
                <option>Roofing</option>
                <option>Kitchen Remodeling</option>
                <option>Bathroom Remodeling</option>
                <option>Flooring</option>
                <option>General Contracting</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} /> What's included:
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Full Website', icon: Layout },
                { label: '5 Pipeline Stages', icon: Kanban },
                { label: '10 Demo Leads', icon: Users },
                { label: '5 Active Deals', icon: DollarSign },
                { label: '3 Automations', icon: Zap },
                { label: 'AI Visualizer Data', icon: Brain },
                { label: 'Sample Reviews', icon: Star },
                { label: 'Pro Plan Active', icon: Shield },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-blue-700">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-navy transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSeed}
            disabled={loading || !businessName}
            className="btn-primary bg-blue-600 hover:bg-blue-700 border-none flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Shield size={18} />}
            Create Full Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

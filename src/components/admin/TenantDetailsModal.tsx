import React from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Users, 
  Kanban, 
  FileText, 
  DollarSign, 
  Zap, 
  Brain, 
  Activity,
  Shield,
  ExternalLink,
  MoreVertical,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface TenantDetailsModalProps {
  tenant: any;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate: (tenant: any) => void;
}

export default function TenantDetailsModal({ tenant, isOpen, onClose, onImpersonate }: TenantDetailsModalProps) {
  if (!isOpen || !tenant) return null;

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
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy text-white rounded-2xl flex items-center justify-center font-bold text-lg">
              {tenant.name?.[0] || 'T'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy">{tenant.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  tenant.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tenant.status}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase tracking-wider">
                  {tenant.plan} Plan
                </span>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <Clock size={10} /> Joined {new Date(tenant.createdAt?.toDate?.() || tenant.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onImpersonate(tenant)}
              className="btn-primary flex items-center gap-2"
            >
              <ExternalLink size={18} /> Login as Tenant
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Contact & Info */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    {tenant.ownerEmail || 'no-email@vcv.com'}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    {tenant.phone || '(555) 000-0000'}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Globe size={16} className="text-gray-400" />
                    {tenant.subdomain || 'tenant'}.closepro.com
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-500">Website</span>
                    <span className="text-xs font-bold text-green-600">Published</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-500">SSL</span>
                    <span className="text-xs font-bold text-blue-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs font-medium text-gray-500">Last Activity</span>
                    <span className="text-xs font-bold text-gray-700">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Usage Metrics */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Business Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Leads', value: '42', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Deals', value: '12', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Projects', value: '8', icon: Kanban, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Estimates', value: '24', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                        <stat.icon size={16} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
                      <p className="text-lg font-black text-navy">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Feature Adoption</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-purple-500" />
                        <span className="text-sm font-bold text-navy">AI Visualizer</span>
                      </div>
                      <span className="text-xs font-bold text-purple-600">{tenant.aiUsage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${tenant.aiUsage || 0}%` }} />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-orange-500" />
                        <span className="text-sm font-bold text-navy">Automation</span>
                      </div>
                      <span className="text-xs font-bold text-orange-600">{tenant.autoUsage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${tenant.autoUsage || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-navy p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Activity size={16} className="text-electric" /> AI Health Analysis
                  </h4>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full uppercase">Healthy</span>
                </div>
                <p className="text-xs text-blue-100/60 leading-relaxed">
                  This tenant is showing strong engagement with core features. Their lead-to-deal conversion rate is 15% higher than the niche average. Recommend upselling to the "Pro" plan for advanced reporting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button className="text-xs font-bold text-gray-400 hover:text-navy flex items-center gap-1">
              <Shield size={14} /> Security Audit
            </button>
            <button className="text-xs font-bold text-gray-400 hover:text-navy flex items-center gap-1">
              <Activity size={14} /> Usage Logs
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all">
              Suspend Account
            </button>
            <button className="btn-secondary">
              Edit Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

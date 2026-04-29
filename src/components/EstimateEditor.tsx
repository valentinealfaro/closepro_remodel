import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Send,
  FileText,
  User,
  Briefcase,
  DollarSign,
  Settings,
  ChevronLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Estimate, LineItem, PaymentMilestone } from '../types/financial';
import { FinancialService } from '../services/FinancialService';
import { AIService } from '../services/AIService';
import SignaturePad from './SignaturePad';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Zap, Loader2, PenTool } from 'lucide-react';

const mkId = () => Math.random().toString(36).substr(2, 9);

const ESTIMATE_TEMPLATES: Record<string, { label: string; serviceType: string; items: Omit<LineItem, 'id'>[] }> = {
  kitchen_standard: {
    label: 'Kitchen Remodel (~$45K)',
    serviceType: 'Kitchen Remodel',
    items: [
      { title: 'Demo & Site Preparation', description: 'Remove existing cabinets, counters, flooring, and haul away debris', quantity: 1, unitPrice: 2400, total: 2400 },
      { title: 'Semi-Custom Shaker Cabinetry', description: 'Solid wood face frame, soft-close hinges & drawer slides, install included', quantity: 1, unitPrice: 14500, total: 14500 },
      { title: 'Quartz Countertops', description: 'Premium quartz slab, fabrication & install, eased edge profile — 42 sq ft', quantity: 42, unitPrice: 125, total: 5250 },
      { title: 'Appliance Package', description: 'Range, dishwasher, OTR microwave, refrigerator (allowance)', quantity: 1, unitPrice: 6800, total: 6800 },
      { title: 'Plumbing & Fixtures', description: 'Rough-in, supply lines, drain, kitchen faucet & disposal install', quantity: 1, unitPrice: 3200, total: 3200 },
      { title: 'Electrical (Lighting & Outlets)', description: 'Under-cabinet LED, pendant rough-in, GFCI outlets, panel circuit if needed', quantity: 1, unitPrice: 2800, total: 2800 },
      { title: 'Subway Tile Backsplash', description: '3×6 ceramic subway tile, grout, installation — approx 35 sq ft', quantity: 35, unitPrice: 52, total: 1820 },
      { title: 'LVP Flooring', description: 'Luxury vinyl plank, underlayment & install — approx 280 sq ft', quantity: 280, unitPrice: 12, total: 3360 },
      { title: 'Paint & Interior Finish', description: 'Walls, ceiling, trim — two-coat premium paint', quantity: 1, unitPrice: 2200, total: 2200 },
      { title: 'Hardware & Accessories', description: 'Cabinet pulls, knobs, towel bars, toilet paper holder', quantity: 1, unitPrice: 950, total: 950 },
      { title: 'Project Management & Cleanup', description: 'Daily cleanup, dumpster, final walkthrough, punch-list', quantity: 1, unitPrice: 2400, total: 2400 },
    ]
  },
  bathroom_standard: {
    label: 'Bathroom Remodel (~$18K)',
    serviceType: 'Bathroom Remodel',
    items: [
      { title: 'Demo & Haul Away', description: 'Remove tile, vanity, toilet, tub/shower surround, flooring', quantity: 1, unitPrice: 1200, total: 1200 },
      { title: 'Shower Tile (Floor & Walls)', description: 'Porcelain tile, waterproofing membrane, grout, niche — 80 sq ft', quantity: 80, unitPrice: 48, total: 3840 },
      { title: 'Vanity & Countertop', description: '36" floating vanity, quartz top, undermount sink', quantity: 1, unitPrice: 2800, total: 2800 },
      { title: 'Plumbing', description: 'Shower valve, tub filler or rain head, toilet, supply lines & drain', quantity: 1, unitPrice: 2400, total: 2400 },
      { title: 'Electrical', description: 'Exhaust fan, vanity lighting, GFCI outlets', quantity: 1, unitPrice: 1100, total: 1100 },
      { title: 'Floor Tile', description: 'Porcelain floor tile, heated mat option available — 45 sq ft', quantity: 45, unitPrice: 42, total: 1890 },
      { title: 'Toilet & Accessories', description: 'Elongated comfort-height toilet, towel bars, mirror', quantity: 1, unitPrice: 1200, total: 1200 },
      { title: 'Paint & Interior Finish', description: 'Moisture-resistant paint, trim, caulk & grout sealing', quantity: 1, unitPrice: 950, total: 950 },
      { title: 'Project Management & Cleanup', description: 'Daily cleanup, final walkthrough, punch-list', quantity: 1, unitPrice: 1100, total: 1100 },
    ]
  }
};

interface EstimateEditorProps {
  estimate?: Estimate | null;
  leadId?: string;
  dealId?: string;
  onClose: () => void;
}

export default function EstimateEditor({ estimate, leadId, dealId, onClose }: EstimateEditorProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Partial<Estimate>>({
    clientInfo: { name: '', email: '', phone: '', address: '' },
    projectInfo: { name: '', serviceType: '', notes: '' },
    lineItems: [],
    pricing: { subtotal: 0, taxRate: 0, taxTotal: 0, discount: 0, total: 0 },
    paymentTerms: [
      { id: '1', label: 'Deposit', percentage: 50, amount: 0, status: 'pending' },
      { id: '2', label: 'Completion', percentage: 50, amount: 0, status: 'pending' }
    ],
    notes: '',
    terms: 'All work to be completed in a professional manner according to standard practices. Any alteration or deviation from above specifications involving extra costs will be executed only upon written orders, and will become an extra charge over and above the estimate.',
    status: 'draft',
    ...estimate
  });

  useEffect(() => {
    if (leadId && !estimate) {
      fetchLeadData(leadId);
    }
  }, [leadId]);

  const fetchLeadData = async (id: string) => {
    try {
      const leadRef = collection(db, `tenants/${userData.tenantId}/leads`);
      const q = query(leadRef, where('id', '==', id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lead = snapshot.docs[0].data();
        setFormData(prev => ({
          ...prev,
          leadId: id,
          clientInfo: {
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            address: lead.address || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching lead data:', error);
    }
  };

  const calculateTotals = (items: LineItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxTotal;
    
    const paymentTerms = formData.paymentTerms?.map(m => ({
      ...m,
      amount: total * (m.percentage / 100)
    })) || [];

    setFormData(prev => ({
      ...prev,
      lineItems: items,
      pricing: { subtotal, taxRate, taxTotal, discount, total },
      paymentTerms
    }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    calculateTotals([...(formData.lineItems || []), newItem], formData.pricing?.taxRate || 0, formData.pricing?.discount || 0);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const items = formData.lineItems?.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }) || [];
    calculateTotals(items, formData.pricing?.taxRate || 0, formData.pricing?.discount || 0);
  };

  const removeLineItem = (id: string) => {
    const items = formData.lineItems?.filter(item => item.id !== id) || [];
    calculateTotals(items, formData.pricing?.taxRate || 0, formData.pricing?.discount || 0);
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!formData.clientInfo?.name || !formData.projectInfo?.name) {
      toast.error('Please fill in client and project names');
      return;
    }

    setLoading(true);
    try {
      const data = { ...formData, status };
      if (estimate?.id) {
        await FinancialService.updateEstimate(userData.tenantId, estimate.id, data);
        toast.success('Estimate updated');
      } else {
        await FinancialService.createEstimate(userData.tenantId, data);
        toast.success('Estimate created');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save estimate');
    } finally {
      setLoading(false);
    }
  };

  const loadEstimateTemplate = (key: string) => {
    const tmpl = ESTIMATE_TEMPLATES[key];
    if (!tmpl) return;
    const items: LineItem[] = tmpl.items.map(i => ({ ...i, id: mkId() }));
    setFormData(prev => ({
      ...prev,
      projectInfo: { ...prev.projectInfo!, name: prev.projectInfo?.name || tmpl.serviceType, serviceType: tmpl.serviceType },
    }));
    calculateTotals(items, formData.pricing?.taxRate || 0, formData.pricing?.discount || 0);
    setShowTemplateMenu(false);
    toast.success(`${tmpl.label} template loaded!`);
  };

  const generateAIScope = async () => {
    if (!formData.projectInfo?.name || !formData.projectInfo?.serviceType) {
      toast.error('Please enter project name and service type first');
      return;
    }

    setIsGeneratingScope(true);
    try {
      const scope = await AIService.generateScopeOfWork(
        userData.tenantId,
        formData.projectInfo.name,
        formData.projectInfo.serviceType,
        formData.projectInfo.notes
      );
      
      setFormData(prev => ({
        ...prev,
        notes: scope
      }));
      toast.success('AI Scope generated!');
    } catch (error) {
      toast.error('Failed to generate AI scope');
    } finally {
      setIsGeneratingScope(false);
    }
  };

  const handleSign = async (signatureDataUrl: string) => {
    if (!signerName) {
      toast.error('Please enter your full name for the signature');
      return;
    }

    setLoading(true);
    try {
      const signature = {
        name: signerName,
        date: serverTimestamp(),
        ip: 'User IP (Simulated)',
        dataUrl: signatureDataUrl
      };

      if (estimate?.id) {
        await FinancialService.updateEstimate(userData.tenantId, estimate.id, {
          ...formData,
          status: 'approved',
          signature,
          approvedAt: serverTimestamp()
        });
        toast.success('Estimate approved and signed!');
        onClose();
      } else {
        toast.error('Please save the estimate before signing');
      }
    } catch (error) {
      toast.error('Failed to sign estimate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-100"></div>
          <div>
            <h2 className="text-sm font-bold text-navy">{estimate ? 'Edit Estimate' : 'New Estimate'}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {formData.projectInfo?.name || 'Untitled Project'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-navy hover:bg-gray-100 rounded-xl transition-all"
          >
            {isPreview ? <Settings size={18} /> : <Eye size={18} />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-navy bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('sent')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-electric hover:shadow-lg hover:shadow-blue-500/30 rounded-xl transition-all disabled:opacity-50"
          >
            <Send size={18} />
            Send Estimate
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          {isPreview ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Preview UI */}
              <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-black text-navy mb-2">ESTIMATE</h1>
                    <p className="text-gray-400 font-bold tracking-widest uppercase">#{estimate?.id?.slice(0, 8).toUpperCase() || 'DRAFT'}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-navy">{userData?.businessName || 'ClosePro Remodel'}</h3>
                    <p className="text-sm text-gray-500">{userData?.email}</p>
                    <p className="text-sm text-gray-500">{userData?.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Client Information</p>
                    <h4 className="font-bold text-navy">{formData.clientInfo?.name}</h4>
                    <p className="text-sm text-gray-500">{formData.clientInfo?.address}</p>
                    <p className="text-sm text-gray-500">{formData.clientInfo?.email}</p>
                    <p className="text-sm text-gray-500">{formData.clientInfo?.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Project Details</p>
                    <h4 className="font-bold text-navy">{formData.projectInfo?.name}</h4>
                    <p className="text-sm text-gray-500">{formData.projectInfo?.serviceType}</p>
                    <p className="text-sm text-gray-500 mt-2 italic">{formData.projectInfo?.notes}</p>
                  </div>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-navy">
                      <th className="py-4 text-left text-xs font-bold text-navy uppercase tracking-widest">Description</th>
                      <th className="py-4 text-center text-xs font-bold text-navy uppercase tracking-widest w-24">Qty</th>
                      <th className="py-4 text-right text-xs font-bold text-navy uppercase tracking-widest w-32">Unit Price</th>
                      <th className="py-4 text-right text-xs font-bold text-navy uppercase tracking-widest w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {formData.lineItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-6">
                          <p className="font-bold text-navy">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </td>
                        <td className="py-6 text-center text-sm text-navy">{item.quantity}</td>
                        <td className="py-6 text-right text-sm text-navy">${item.unitPrice.toLocaleString()}</td>
                        <td className="py-6 text-right font-bold text-navy">${item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-navy font-bold">${formData.pricing?.subtotal.toLocaleString()}</span>
                    </div>
                    {formData.pricing?.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Discount</span>
                        <span>-${formData.pricing?.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.pricing?.taxTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax ({formData.pricing?.taxRate}%)</span>
                        <span className="text-navy font-bold">${formData.pricing?.taxTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl pt-3 border-t-2 border-navy">
                      <span className="font-black text-navy">Total</span>
                      <span className="font-black text-navy">${formData.pricing?.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Schedule</p>
                    <div className="space-y-2">
                      {formData.paymentTerms?.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm">
                          <span className="text-gray-500">{m.label} ({m.percentage}%)</span>
                          <span className="text-navy font-bold">${m.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Terms & Conditions</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{formData.terms}</p>
                  </div>
                </div>

                {/* Signature Section */}
                {formData.status !== 'approved' ? (
                  <div className="mt-12 pt-12 border-t border-gray-100">
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-navy">Approve & Sign</h3>
                        <p className="text-sm text-gray-500">By signing below, you agree to the terms and conditions outlined above.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Full Name</label>
                          <input 
                            type="text" 
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            placeholder="Type your full name"
                            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Signature</label>
                          <SignaturePad onSave={handleSign} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-12 pt-12 border-t border-gray-100 flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signed By</p>
                      <p className="font-bold text-navy">{formData.signature?.name}</p>
                      <p className="text-xs text-gray-500">
                        {formData.signature?.date?.toDate ? format(formData.signature.date.toDate(), 'MMM d, yyyy h:mm a') : 'Just now'}
                      </p>
                      <p className="text-[8px] text-gray-400">IP: {formData.signature?.ip}</p>
                    </div>
                    <div className="text-right">
                      <img src={formData.signature?.dataUrl} alt="Signature" className="h-16 ml-auto" />
                      <div className="h-px w-48 bg-navy mt-1"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Editor UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <User className="text-electric" size={20} /> Client Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Client Name</label>
                      <input 
                        type="text" 
                        value={formData.clientInfo?.name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, clientInfo: { ...prev.clientInfo!, name: e.target.value } }))}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Email</label>
                        <input 
                          type="email" 
                          value={formData.clientInfo?.email} 
                          onChange={(e) => setFormData(prev => ({ ...prev, clientInfo: { ...prev.clientInfo!, email: e.target.value } }))}
                          className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Phone</label>
                        <input 
                          type="tel" 
                          value={formData.clientInfo?.phone} 
                          onChange={(e) => setFormData(prev => ({ ...prev, clientInfo: { ...prev.clientInfo!, phone: e.target.value } }))}
                          className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Address</label>
                      <input 
                        type="text" 
                        value={formData.clientInfo?.address} 
                        onChange={(e) => setFormData(prev => ({ ...prev, clientInfo: { ...prev.clientInfo!, address: e.target.value } }))}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <Briefcase className="text-electric" size={20} /> Project Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Project Name</label>
                      <input 
                        type="text" 
                        value={formData.projectInfo?.name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, projectInfo: { ...prev.projectInfo!, name: e.target.value } }))}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                        placeholder="Kitchen Remodel"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Service Type</label>
                      <select 
                        value={formData.projectInfo?.serviceType} 
                        onChange={(e) => setFormData(prev => ({ ...prev, projectInfo: { ...prev.projectInfo!, serviceType: e.target.value } }))}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                      >
                        <option value="">Select Service</option>
                        <option value="Kitchen Remodel">Kitchen Remodel</option>
                        <option value="Bathroom Remodel">Bathroom Remodel</option>
                        <option value="Basement Finishing">Basement Finishing</option>
                        <option value="Home Addition">Home Addition</option>
                        <option value="Exterior Renovation">Exterior Renovation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Internal Notes</label>
                      <textarea 
                        rows={2}
                        value={formData.projectInfo?.notes} 
                        onChange={(e) => setFormData(prev => ({ ...prev, projectInfo: { ...prev.projectInfo!, notes: e.target.value } }))}
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-electric"
                        placeholder="Any internal notes about this project..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <FileText className="text-electric" size={20} /> Line Items
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowTemplateMenu(v => !v)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all border border-indigo-100"
                      >
                        <LayoutTemplate size={14} /> Quick Template <ChevronDown size={12} />
                      </button>
                      {showTemplateMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 w-56">
                          {Object.entries(ESTIMATE_TEMPLATES).map(([key, tmpl]) => (
                            <button key={key} onClick={() => loadEstimateTemplate(key)}
                              className="w-full text-left px-4 py-3 text-xs font-bold text-navy hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                              {tmpl.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={addLineItem}
                      className="flex items-center gap-2 text-xs font-bold text-electric hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Plus size={16} /> Add Item
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.lineItems?.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-gray-50 rounded-2xl relative group">
                      <div className="col-span-12 md:col-span-5">
                        <input 
                          type="text" 
                          value={item.title} 
                          onChange={(e) => updateLineItem(item.id, 'title', e.target.value)}
                          className="w-full bg-white border-none rounded-xl p-2 text-sm font-bold focus:ring-2 focus:ring-electric"
                          placeholder="Item Title"
                        />
                        <textarea 
                          rows={1}
                          value={item.description} 
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="w-full bg-white border-none rounded-xl p-2 mt-2 text-xs text-gray-500 focus:ring-2 focus:ring-electric"
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-electric"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Unit Price</label>
                        <input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border-none rounded-xl p-2 text-sm focus:ring-2 focus:ring-electric"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Total</label>
                        <div className="w-full p-2 text-sm font-black text-navy">
                          ${item.total.toLocaleString()}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeLineItem(item.id)}
                        className="absolute -right-2 -top-2 p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.lineItems?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl space-y-3">
                      <LayoutTemplate size={28} className="text-gray-300 mx-auto" />
                      <p className="text-sm font-bold text-gray-400">No line items yet</p>
                      <p className="text-xs text-gray-400">Start from a template or add items manually</p>
                      <div className="flex items-center justify-center gap-3 pt-1">
                        {Object.entries(ESTIMATE_TEMPLATES).map(([key, tmpl]) => (
                          <button key={key} onClick={() => loadEstimateTemplate(key)}
                            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-100">
                            {tmpl.label}
                          </button>
                        ))}
                        <button onClick={addLineItem} className="px-4 py-2 text-xs font-bold text-electric bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
                          + Blank item
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-8 pt-6 border-t border-gray-50">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Payment Terms</label>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.paymentTerms?.map((m, idx) => (
                          <div key={m.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl">
                            <input 
                              type="text" 
                              value={m.label}
                              onChange={(e) => {
                                const terms = [...(formData.paymentTerms || [])];
                                terms[idx].label = e.target.value;
                                setFormData(prev => ({ ...prev, paymentTerms: terms }));
                              }}
                              className="flex-1 bg-transparent border-none p-0 text-xs font-bold text-navy focus:ring-0"
                            />
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={m.percentage}
                                onChange={(e) => {
                                  const terms = [...(formData.paymentTerms || [])];
                                  terms[idx].percentage = parseFloat(e.target.value) || 0;
                                  // Adjust other terms to total 100
                                  setFormData(prev => ({ ...prev, paymentTerms: terms }));
                                  calculateTotals(formData.lineItems || [], formData.pricing?.taxRate || 0, formData.pricing?.discount || 0);
                                }}
                                className="w-10 bg-transparent border-none p-0 text-xs font-bold text-electric text-right focus:ring-0"
                              />
                              <span className="text-[10px] font-bold text-gray-400">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-72 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-navy font-bold">${formData.pricing?.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Discount</span>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">$</span>
                        <input 
                          type="number" 
                          value={formData.pricing?.discount}
                          onChange={(e) => calculateTotals(formData.lineItems || [], formData.pricing?.taxRate || 0, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-gray-50 border-none rounded-lg px-2 py-1 text-sm text-right font-bold focus:ring-2 focus:ring-electric"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Tax Rate</span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={formData.pricing?.taxRate}
                          onChange={(e) => calculateTotals(formData.lineItems || [], parseFloat(e.target.value) || 0, formData.pricing?.discount || 0)}
                          className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-sm text-right font-bold focus:ring-2 focus:ring-electric"
                        />
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xl pt-3 border-t-2 border-navy">
                      <span className="font-black text-navy">Total</span>
                      <span className="font-black text-navy">${formData.pricing?.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <AlertCircle className="text-electric" size={20} /> Terms & Conditions
                  </h3>
                  <button 
                    onClick={generateAIScope}
                    disabled={isGeneratingScope}
                    className="flex items-center gap-2 text-xs font-bold text-blue-electric hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isGeneratingScope ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    {isGeneratingScope ? 'Generating...' : 'AI Generate Scope'}
                  </button>
                </div>
                <textarea 
                  rows={8}
                  value={formData.notes} 
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm text-gray-600 focus:ring-2 focus:ring-electric"
                  placeholder="Detailed scope of work and project notes..."
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

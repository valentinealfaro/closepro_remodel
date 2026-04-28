import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Mail,
  CreditCard,
  History,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Invoice, InvoiceStatus } from '../types/financial';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { FinancialService } from '../services/FinancialService';
import { useSearchParams } from 'react-router-dom';

export default function InvoiceManager() {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  useEffect(() => {
    const success = searchParams.get('success');
    const invoiceId = searchParams.get('invoiceId');
    if (success === 'true' && invoiceId) {
      toast.success('Payment successful! Thank you.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userData?.tenantId) return;

    const invoicesRef = collection(db, `tenants/${userData.tenantId}/invoices`);
    let q = query(invoicesRef, orderBy('createdAt', 'desc'));

    if (statusFilter !== 'all') {
      q = query(invoicesRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.tenantId, statusFilter]);

  const handleRecordPayment = async () => {
    if (!selectedInvoice || paymentAmount <= 0) return;
    
    try {
      await FinancialService.recordPayment(userData.tenantId, {
        invoiceId: selectedInvoice.id,
        amount: paymentAmount,
        method: 'check', // Default for manual recording
        status: 'completed'
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount(0);
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleStripePayment = async (invoice: Invoice) => {
    setIsPaying(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: invoice.pricing.balanceDue,
          invoiceId: invoice.id,
          tenantId: userData.tenantId,
          clientEmail: invoice.clientInfo.email,
          projectName: invoice.projectInfo.name
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Stripe Error:', error);
      toast.error(error.message || 'Failed to start Stripe payment');
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-600';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-600';
      case 'paid': return 'bg-green-100 text-green-600';
      case 'overdue': return 'bg-red-500 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.clientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.projectInfo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = invoices.reduce((sum, i) => sum + (i.pricing.amountPaid || 0), 0);
  const outstandingRevenue = invoices.reduce((sum, i) => sum + (i.pricing.balanceDue || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Invoices</h1>
          <p className="text-gray-500">Track billings and payments from your clients.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Revenue</p>
            <p className="text-xl font-black text-navy">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-red-500">Outstanding</p>
            <p className="text-xl font-black text-red-500">${outstandingRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by client or project..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-electric"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-electric"
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy text-sm">{invoice.projectInfo.name}</p>
                        <p className="text-xs text-gray-400">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-navy text-sm">{invoice.clientInfo.name}</p>
                      <p className="text-xs text-gray-400">{invoice.clientInfo.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-navy text-sm">${invoice.pricing.total.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-green-600 font-bold">${(invoice.pricing.amountPaid || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-red-500 font-bold">${(invoice.pricing.balanceDue || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setPaymentAmount(invoice.pricing.balanceDue);
                          setShowPaymentModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Record Payment"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button 
                        onClick={() => handleStripePayment(invoice)}
                        disabled={isPaying || invoice.status === 'paid'}
                        className="p-2 text-gray-400 hover:text-blue-electric hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                        title="Pay with Stripe"
                      >
                        {isPaying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-electric hover:bg-blue-50 rounded-lg transition-all" title="Send">
                        <Mail size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-all" title="Download">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-navy">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-navy">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Balance</p>
                  <p className="text-3xl font-black text-navy">${selectedInvoice.pricing.balanceDue.toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Payment Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="number" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xl font-black text-navy focus:ring-2 focus:ring-electric"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleRecordPayment}
                  className="w-full bg-electric text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

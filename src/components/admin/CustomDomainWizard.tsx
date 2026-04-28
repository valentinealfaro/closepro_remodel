import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Loader2, 
  Shield, 
  Server, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

interface CustomDomainWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomDomainWizard({ isOpen, onClose }: CustomDomainWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      toast.success('DNS Records Verified!');
      nextStep();
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-navy">Connect Your Domain</h3>
              <p className="text-sm text-gray-500">Enter the custom domain you want to use for your platform.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Domain Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. app.yourdomain.com"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <Shield className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-800 leading-relaxed">
                  We'll automatically provision an SSL certificate for your domain once it's connected.
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-navy">Configure DNS Records</h3>
              <p className="text-sm text-gray-500">Add the following records to your DNS provider (e.g. Cloudflare, GoDaddy).</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Host</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded uppercase">CNAME</span>
                    <span className="text-sm font-bold text-navy">app</span>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Value</span>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs font-mono text-blue-600 bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1 overflow-hidden text-ellipsis">
                      cname.closepro.com
                    </code>
                    <button 
                      onClick={() => copyToClipboard('cname.closepro.com')}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-navy transition-all border border-transparent hover:border-gray-200"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-orange-800 leading-relaxed">
                  DNS changes can take up to 24-48 hours to propagate, but usually happen within minutes.
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
              {isVerifying ? (
                <Loader2 className="animate-spin" size={40} />
              ) : (
                <RefreshCw size={40} />
              )}
            </div>
            <h3 className="text-xl font-bold text-navy">Verifying DNS Records</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              We're checking your DNS records for <span className="font-bold text-navy">{domain}</span>. This may take a moment.
            </p>
            {!isVerifying && (
              <button 
                onClick={handleVerify}
                className="btn-primary mt-6"
              >
                Check Records Now
              </button>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center py-8">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-navy">Domain Connected!</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Your domain <span className="font-bold text-navy">{domain}</span> is now successfully connected and SSL is being provisioned.
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8 text-left">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Next Steps</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-navy font-medium">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  DNS Propagation
                </div>
                <div className="flex items-center gap-3 text-sm text-navy font-medium">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                  </div>
                  SSL Certificate Issuance (5-10 mins)
                </div>
                <div className="flex items-center gap-3 text-sm text-navy font-medium">
                  <div className="w-5 h-5 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </div>
                  Global CDN Deployment
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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Custom Domain</h2>
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
            className="h-full bg-blue-500"
            initial={{ width: '25%' }}
            animate={{ width: `${step * 25}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1 || step === 4}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 hover:text-navy disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <div className="flex items-center gap-3">
            {step === 1 ? (
              <button 
                onClick={nextStep}
                disabled={!domain}
                className="btn-primary flex items-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : step === 2 ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex items-center gap-2"
              >
                I've added the records <ChevronRight size={18} />
              </button>
            ) : step === 4 ? (
              <button 
                onClick={onClose}
                className="btn-primary"
              >
                Done
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

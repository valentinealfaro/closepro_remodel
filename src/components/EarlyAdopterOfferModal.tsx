import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { EarlyAdopterService, EarlyAdopterOffer } from '../services/EarlyAdopterService';

interface EarlyAdopterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  userId: string;
  onAccepted?: (offer: EarlyAdopterOffer) => void;
}

const PLANS: Array<{
  level: 'starter' | 'growth' | 'pro';
  label: string;
  description: string;
  regular: number;
  offer: number;
  highlighted?: boolean;
}> = [
  { level: 'starter', label: 'Starter', description: 'Solo remodelers getting started', regular: 99, offer: 49 },
  { level: 'growth', label: 'Growth', description: 'Most popular for growing teams', regular: 229, offer: 149, highlighted: true },
  { level: 'pro', label: 'Pro', description: 'Multi-location & high volume', regular: 499, offer: 299 },
];

export default function EarlyAdopterOfferModal({
  isOpen,
  onClose,
  tenantId,
  userId,
  onAccepted,
}: EarlyAdopterOfferModalProps) {
  const [offer, setOffer] = useState<EarlyAdopterOffer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('growth');
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [commitments, setCommitments] = useState({
    caseStudy: false,
    videoTestimonial: false,
    review: true,
  });

  useEffect(() => {
    if (!isOpen || !tenantId) return;
    let cancelled = false;
    (async () => {
      const existing = await EarlyAdopterService.getOfferForTenant(tenantId);
      if (!cancelled) setOffer(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, tenantId]);

  const handleCreate = async () => {
    if (!tenantId || !userId) return;
    setLoading(true);
    try {
      const created = await EarlyAdopterService.createOffer(tenantId, userId, selectedPlan);
      setOffer(created);
      toast.success('Offer reserved — review and accept below.');
    } catch (error: any) {
      toast.error(error?.message || 'Could not reserve offer');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer?.id) return;
    setAccepting(true);
    try {
      await EarlyAdopterService.acceptOffer(offer.id, commitments);
      toast.success('Welcome aboard, early adopter!');
      onAccepted?.(offer);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not accept offer');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (offer?.id) {
      try {
        await EarlyAdopterService.declineOffer(offer.id);
      } catch {
        // Non-blocking
      }
    }
    onClose();
  };

  const activePlan = offer
    ? PLANS.find(p => p.level === offer.planLevel)
    : PLANS.find(p => p.level === selectedPlan);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-navy text-white p-6 rounded-t-3xl relative overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-electric" size={18} />
                <span className="text-xs font-bold uppercase tracking-widest text-electric">Early Adopter Offer</span>
              </div>
              <h2 className="text-2xl font-black mb-2">50% off for 6 months</h2>
              <p className="text-sm text-blue-200/80">
                Limited to the first 50 customers. Lock in your savings and help shape the product.
              </p>
            </div>

            {/* Plan picker (only when no offer reserved yet) */}
            {!offer && (
              <div className="p-6 space-y-3">
                <p className="text-sm font-bold text-navy mb-2">Choose your plan</p>
                {PLANS.map(plan => (
                  <button
                    key={plan.level}
                    onClick={() => setSelectedPlan(plan.level)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedPlan === plan.level
                        ? 'border-electric bg-electric/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-navy">{plan.label}</p>
                          {plan.highlighted && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-electric bg-electric/10 px-2 py-0.5 rounded-full">
                              Most popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 line-through">${plan.regular}/mo</p>
                        <p className="text-lg font-black text-navy">
                          ${plan.offer}<span className="text-xs font-medium text-gray-500">/mo</span>
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Reserved offer */}
            {offer && activePlan && (
              <div className="p-6 space-y-5">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-electric mb-2">
                    Your offer — {activePlan.label}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-black text-navy">${offer.offerPrice}</p>
                    <p className="text-sm text-gray-500">/mo for {offer.monthsIncluded} months</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Regular ${offer.regularPrice}/mo — you save{' '}
                    <strong className="text-navy">${offer.savingsPerMonth}/mo</strong> ($
                    {offer.savingsPerYear}/yr).
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-navy mb-2">What's included</p>
                  <ul className="space-y-2">
                    {offer.benefits.map(benefit => (
                      <li key={benefit} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} />
                        </span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-bold text-navy mb-2">Help us grow (optional)</p>
                  <div className="space-y-2">
                    {[
                      { key: 'caseStudy' as const, label: 'I\'ll be featured as a case study' },
                      { key: 'videoTestimonial' as const, label: 'I\'ll record a short video testimonial' },
                      { key: 'review' as const, label: 'I\'ll leave a review when I\'m happy' },
                    ].map(item => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={commitments[item.key]}
                          onChange={e =>
                            setCommitments({ ...commitments, [item.key]: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-electric focus:ring-electric"
                        />
                        <span className="text-sm text-navy">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={handleDecline}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Not now
              </button>
              {offer ? (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="bg-electric hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
                >
                  {accepting && <Loader2 size={16} className="animate-spin" />}
                  Accept offer
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-electric hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Reserve my spot
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

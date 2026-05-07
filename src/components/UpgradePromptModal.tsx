import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowUpRight, Check } from 'lucide-react';
import {
  PLAN_DEFINITIONS,
  PlanLevel,
  Feature,
} from '../services/PlanService';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature;
  used: number;
  limit: number;
  currentPlan: PlanLevel;
  /** Plan to recommend; falls back to next tier above current. */
  recommendedPlan?: PlanLevel;
  /** Optional handler to open the early adopter offer modal instead of /pricing. */
  onSeeEarlyAdopterOffer?: () => void;
}

const FEATURE_COPY: Record<Feature, { title: string; body: string }> = {
  aiGenerations: {
    title: 'You\'ve hit your AI generation limit',
    body: 'Upgrade to keep generating remodel visuals for your leads this month.',
  },
  projects: {
    title: 'Project limit reached',
    body: 'Upgrade to track more active projects and keep your pipeline moving.',
  },
  teamMembers: {
    title: 'Add more teammates',
    body: 'Your current plan caps team seats. Upgrade to invite the rest of your crew.',
  },
  leads: {
    title: 'Lead limit reached this month',
    body: 'You\'re crushing it — upgrade so we don\'t turn anyone away.',
  },
};

function nextTier(current: PlanLevel): PlanLevel | null {
  const order: PlanLevel[] = ['starter', 'growth', 'pro'];
  const idx = order.indexOf(current);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}

export default function UpgradePromptModal({
  isOpen,
  onClose,
  feature,
  used,
  limit,
  currentPlan,
  recommendedPlan,
  onSeeEarlyAdopterOffer,
}: UpgradePromptModalProps) {
  const recommended = recommendedPlan || nextTier(currentPlan);
  const copy = FEATURE_COPY[feature];
  const recommendedDef = recommended ? PLAN_DEFINITIONS[recommended] : null;
  const currentDef = PLAN_DEFINITIONS[currentPlan];
  const newLimit = recommendedDef ? recommendedDef.limits[feature] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-gradient-to-br from-navy to-blue-900 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-electric" size={18} />
                <span className="text-xs font-bold uppercase tracking-widest text-electric">
                  Upgrade required
                </span>
              </div>
              <h2 className="text-2xl font-black mb-2">{copy.title}</h2>
              <p className="text-sm text-blue-200/80">{copy.body}</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Current — {currentDef.label}
                  </p>
                  <p className="text-lg font-black text-navy mt-1">
                    {used}{limit < 0 ? '' : ` / ${limit}`}{' '}
                    <span className="text-xs font-medium text-gray-500">used</span>
                  </p>
                </div>
                {recommendedDef && newLimit !== null && (
                  <>
                    <ArrowUpRight className="text-electric flex-shrink-0" size={20} />
                    <div className="text-right">
                      <p className="text-xs text-electric font-bold uppercase tracking-widest">
                        On {recommendedDef.label}
                      </p>
                      <p className="text-lg font-black text-navy mt-1">
                        {newLimit < 0 ? 'Unlimited' : newLimit}{' '}
                        <span className="text-xs font-medium text-gray-500">/ mo</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {recommendedDef && (
                <div>
                  <p className="text-sm font-bold text-navy mb-2">
                    What you unlock on {recommendedDef.label}
                  </p>
                  <ul className="space-y-2">
                    {recommendedDef.highlights.map(h => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} />
                        </span>
                        <span className="text-sm text-gray-700">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendedDef && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-bold text-navy">{recommendedDef.label}</p>
                    <p className="text-xs text-gray-500 line-through">
                      ${recommendedDef.price}/mo
                    </p>
                  </div>
                  <p className="text-2xl font-black text-electric mt-1">
                    ${recommendedDef.earlyAdopterPrice}
                    <span className="text-xs font-medium text-gray-500">/mo</span>{' '}
                    <span className="text-xs font-bold text-orange-600 ml-2">
                      Early adopter — 50% off for 6 months
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Not now
              </button>
              <div className="flex items-center gap-2">
                {onSeeEarlyAdopterOffer && (
                  <button
                    onClick={() => {
                      onSeeEarlyAdopterOffer();
                      onClose();
                    }}
                    className="text-sm font-bold text-electric hover:text-blue-700 px-3 py-2"
                  >
                    See early adopter offer
                  </button>
                )}
                <Link
                  to="/pricing"
                  className="bg-electric hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
                  onClick={onClose}
                >
                  View plans
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface TrialBannerProps {
  status?: string;
  trialEndsAt?: any; // Firestore Timestamp | Date | string | number
  onUpgrade?: () => void;
}

function toMillis(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return isNaN(parsed) ? null : parsed;
  }
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  return null;
}

export default function TrialBanner({ status, trialEndsAt, onUpgrade }: TrialBannerProps) {
  const daysRemaining = useMemo(() => {
    const millis = toMillis(trialEndsAt);
    if (!millis) return null;
    const diff = millis - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trialEndsAt]);

  if (status !== 'trialing') return null;

  const isExpired = daysRemaining === 0;
  const isCritical = daysRemaining !== null && daysRemaining <= 2 && !isExpired;
  const isWarning = daysRemaining !== null && daysRemaining <= 5 && !isCritical && !isExpired;

  const palette = isExpired
    ? { bg: 'bg-red-50 border-red-200', icon: 'text-red-600', text: 'text-red-900', sub: 'text-red-700', cta: 'bg-red-600 hover:bg-red-700' }
    : isCritical
    ? { bg: 'bg-orange-50 border-orange-200', icon: 'text-orange-600', text: 'text-orange-900', sub: 'text-orange-700', cta: 'bg-orange-600 hover:bg-orange-700' }
    : isWarning
    ? { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-600', text: 'text-amber-900', sub: 'text-amber-700', cta: 'bg-amber-600 hover:bg-amber-700' }
    : { bg: 'bg-blue-50 border-blue-200', icon: 'text-electric', text: 'text-navy', sub: 'text-gray-600', cta: 'bg-electric hover:bg-blue-700' };

  const headline = isExpired
    ? 'Your free trial has ended'
    : daysRemaining === null
    ? 'You\'re on a free trial'
    : daysRemaining === 1
    ? '1 day left in your free trial'
    : `${daysRemaining} days left in your free trial`;

  const subline = isExpired
    ? 'Upgrade now to keep your leads, projects, and AI generations.'
    : isCritical
    ? 'Lock in 50% off as an early adopter — save up to $200/mo for 6 months.'
    : isWarning
    ? 'Pick a plan before your trial ends to keep momentum going.'
    : 'Save 50% as an early adopter — limited to the first 50 customers.';

  const Icon = isExpired || isCritical ? AlertTriangle : isWarning ? Clock : Zap;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${palette.bg} border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex-shrink-0 ${palette.icon}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-bold ${palette.text} truncate`}>{headline}</p>
          <p className={`text-xs ${palette.sub} truncate`}>{subline}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="text-xs font-bold text-navy hover:text-electric px-3 py-1.5 hidden sm:inline-flex"
          >
            See offer
          </button>
        )}
        <Link
          to="/pricing"
          className={`${palette.cta} text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors`}
        >
          {isExpired ? 'Upgrade now' : 'Upgrade'}
        </Link>
      </div>
    </motion.div>
  );
}

import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export type PlanLevel = 'starter' | 'growth' | 'pro';
export type Feature = 'aiGenerations' | 'projects' | 'teamMembers' | 'leads';

export interface PlanLimits {
  aiGenerations: number; // monthly
  projects: number; // total active
  teamMembers: number;
  leads: number; // monthly inbound
  customDomain: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export interface PlanDefinition {
  level: PlanLevel;
  label: string;
  price: number;
  earlyAdopterPrice: number;
  limits: PlanLimits;
  highlights: string[];
}

// AI generation limits removed: with BYOK, contractors pay Google directly.
// Plans differentiate on seats, projects, custom domain, widget, white label, support.
export const PLAN_DEFINITIONS: Record<PlanLevel, PlanDefinition> = {
  starter: {
    level: 'starter',
    label: 'Starter',
    price: 99,
    earlyAdopterPrice: 49,
    limits: {
      aiGenerations: -1, // unlimited (BYOK)
      projects: 25,
      teamMembers: 1,
      leads: 250,
      customDomain: false,
      whiteLabel: false,
      prioritySupport: false,
    },
    highlights: [
      'Unlimited AI generations (BYOK)',
      '25 active projects',
      '1 team seat',
      'Lead inbox + before/after gallery',
    ],
  },
  growth: {
    level: 'growth',
    label: 'Growth',
    price: 229,
    earlyAdopterPrice: 149,
    limits: {
      aiGenerations: -1,
      projects: 100,
      teamMembers: 5,
      leads: 1000,
      customDomain: true,
      whiteLabel: false,
      prioritySupport: true,
    },
    highlights: [
      'Unlimited AI generations (BYOK)',
      '100 active projects',
      '5 team seats',
      'Embeddable widget on your site',
      'Custom domain',
      'Priority support',
    ],
  },
  pro: {
    level: 'pro',
    label: 'Pro',
    price: 499,
    earlyAdopterPrice: 299,
    limits: {
      aiGenerations: -1,
      projects: -1,
      teamMembers: -1,
      leads: -1,
      customDomain: true,
      whiteLabel: true,
      prioritySupport: true,
    },
    highlights: [
      'Unlimited AI generations (BYOK)',
      'Unlimited projects & seats',
      'White-label widget',
      'Priority support',
    ],
  },
};

export interface UsageSnapshot {
  aiGenerations: number; // this calendar month
  projects: number;
  teamMembers: number;
  leads: number;
  periodKey: string; // e.g., "2026-05"
}

export interface PlanStatus {
  plan: PlanLevel;
  definition: PlanDefinition;
  usage: UsageSnapshot;
}

const FEATURE_LABEL: Record<Feature, string> = {
  aiGenerations: 'AI generations',
  projects: 'projects',
  teamMembers: 'team members',
  leads: 'leads',
};

function periodKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const PlanService = {
  /** Resolve the canonical plan for a tenant; defaults to 'starter'. */
  async getPlan(tenantId: string): Promise<PlanLevel> {
    if (!tenantId) return 'starter';
    try {
      const snap = await getDoc(doc(db, 'tenants', tenantId));
      const plan = snap.data()?.plan as PlanLevel | undefined;
      return plan && PLAN_DEFINITIONS[plan] ? plan : 'starter';
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `tenants/${tenantId}`);
      return 'starter';
    }
  },

  async getStatus(tenantId: string): Promise<PlanStatus> {
    const plan = await this.getPlan(tenantId);
    const usage = await this.getUsage(tenantId);
    return { plan, definition: PLAN_DEFINITIONS[plan], usage };
  },

  /** Read the per-period usage counters from the tenant document. */
  async getUsage(tenantId: string): Promise<UsageSnapshot> {
    const empty: UsageSnapshot = {
      aiGenerations: 0,
      projects: 0,
      teamMembers: 0,
      leads: 0,
      periodKey: periodKey(),
    };
    if (!tenantId) return empty;
    try {
      const snap = await getDoc(doc(db, 'tenants', tenantId));
      const usage = (snap.data()?.usage || {}) as Partial<UsageSnapshot>;
      const currentPeriod = periodKey();
      // If usage tracking is from a previous month, treat monthly counters as 0
      const isCurrentPeriod = usage.periodKey === currentPeriod;
      return {
        aiGenerations: isCurrentPeriod ? usage.aiGenerations || 0 : 0,
        projects: usage.projects || 0,
        teamMembers: usage.teamMembers || 0,
        leads: isCurrentPeriod ? usage.leads || 0 : 0,
        periodKey: currentPeriod,
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `tenants/${tenantId}`);
      return empty;
    }
  },

  /** Pure check: is `used` under `limit`? -1 means unlimited. */
  isWithinLimit(used: number, limit: number): boolean {
    if (limit < 0) return true;
    return used < limit;
  },

  /** Convenience: throw-free check for a feature against a plan + usage. */
  canUse(plan: PlanLevel, feature: Feature, usage: UsageSnapshot): {
    allowed: boolean;
    used: number;
    limit: number;
    feature: Feature;
    label: string;
  } {
    const limit = PLAN_DEFINITIONS[plan].limits[feature] as number;
    const used = usage[feature] || 0;
    return {
      allowed: this.isWithinLimit(used, limit),
      used,
      limit,
      feature,
      label: FEATURE_LABEL[feature],
    };
  },

  /** Increment a monthly counter. Resets the period if rolled over. */
  async incrementUsage(tenantId: string, feature: Feature, amount = 1): Promise<void> {
    if (!tenantId) return;
    const tenantRef = doc(db, 'tenants', tenantId);
    try {
      const snap = await getDoc(tenantRef);
      const current = (snap.data()?.usage || {}) as Partial<UsageSnapshot>;
      const currentPeriod = periodKey();

      if (current.periodKey !== currentPeriod) {
        // New period: zero the monthly counters, then add `amount`
        await updateDoc(tenantRef, {
          'usage.periodKey': currentPeriod,
          'usage.aiGenerations': feature === 'aiGenerations' ? amount : 0,
          'usage.leads': feature === 'leads' ? amount : 0,
          'usage.updatedAt': serverTimestamp(),
        });
        return;
      }

      await updateDoc(tenantRef, {
        [`usage.${feature}`]: increment(amount),
        'usage.periodKey': currentPeriod,
        'usage.updatedAt': serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `tenants/${tenantId}`);
    }
  },

  /** Recommend the cheapest plan that can serve the requested feature usage. */
  recommendUpgrade(currentPlan: PlanLevel, feature: Feature, neededCapacity: number): PlanLevel | null {
    const order: PlanLevel[] = ['starter', 'growth', 'pro'];
    const currentIdx = order.indexOf(currentPlan);
    for (let i = currentIdx + 1; i < order.length; i++) {
      const limit = PLAN_DEFINITIONS[order[i]].limits[feature] as number;
      if (limit < 0 || limit >= neededCapacity) return order[i];
    }
    return null;
  },
};

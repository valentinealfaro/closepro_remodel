import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import {
  PlanService,
  PlanStatus,
  Feature,
  PLAN_DEFINITIONS,
  PlanLevel,
} from '../services/PlanService';

interface UsePlanLimitsResult {
  plan: PlanLevel;
  status: PlanStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** True if the tenant can perform another action of this feature right now. */
  canUse: (feature: Feature) => boolean;
  /** { used, limit, remaining, allowed } for the feature; limit -1 means unlimited. */
  usageFor: (feature: Feature) => {
    used: number;
    limit: number;
    remaining: number;
    allowed: boolean;
    label: string;
  };
  /** Increment a monthly counter (e.g. after a successful AI generation). */
  recordUsage: (feature: Feature, amount?: number) => Promise<void>;
}

export function usePlanLimits(): UsePlanLimitsResult {
  const { userData } = useAuth();
  const tenantId: string | undefined = userData?.tenantId;
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    if (!tenantId) {
      setStatus(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const next = await PlanService.getStatus(tenantId);
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan: PlanLevel = status?.plan || 'starter';

  const usageFor = useCallback(
    (feature: Feature) => {
      const empty = {
        aiGenerations: 0,
        projects: 0,
        teamMembers: 0,
        leads: 0,
        periodKey: '',
      };
      const usage = status?.usage || empty;
      const result = PlanService.canUse(plan, feature, usage);
      const remaining = result.limit < 0 ? Infinity : Math.max(0, result.limit - result.used);
      return { ...result, remaining };
    },
    [plan, status],
  );

  const canUse = useCallback((feature: Feature) => usageFor(feature).allowed, [usageFor]);

  const recordUsage = useCallback(
    async (feature: Feature, amount = 1) => {
      if (!tenantId) return;
      await PlanService.incrementUsage(tenantId, feature, amount);
      await refresh();
    },
    [tenantId, refresh],
  );

  return {
    plan,
    status,
    loading,
    refresh,
    canUse,
    usageFor,
    recordUsage,
  };
}

export { PLAN_DEFINITIONS };

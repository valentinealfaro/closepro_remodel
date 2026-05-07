import { 
  collection, 
  addDoc, 
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface TrialMetrics {
  totalSignups: number;
  activeTrials: number;
  expiredTrials: number;
  convertedFromTrial: number;
  conversionRate: number; // percentage
  avgTrialDuration: number; // days
  avgActivationTime: number; // hours from signup to "aha" moment
}

export interface RevenueMetrics {
  totalCustomers: number;
  activeSubscriptions: number;
  mrr: number; // Monthly recurring revenue
  arr: number; // Annual recurring revenue
  customersByPlan: Record<string, number>;
  revenueByPlan: Record<string, number>;
  churnRate: number; // percentage
  avgContractValue: number;
}

export interface EngagementMetrics {
  usersWithProjects: number;
  usersWithEstimates: number;
  usersWithLeads: number;
  aiGenerationsThisMonth: number;
  automationRulesCreated: number;
  widgetEmbeds: number;
  widgetLeadsGenerated: number;
}

export interface AcquisitionMetrics {
  newSignupsThisMonth: number;
  signupsBySource: Record<string, number>; // 'organic', 'paid', 'referral', etc
  landingPageViews: number;
  demoBookings: number;
  demoToSignupRate: number; // percentage
  costPerAcquisition: number; // $
  returnOnAdSpend: number; // ROAS
}

export interface ComprehensiveMetrics {
  period: string; // 'daily' | 'weekly' | 'monthly'
  date: any; // timestamp
  trial: TrialMetrics;
  revenue: RevenueMetrics;
  engagement: EngagementMetrics;
  acquisition: AcquisitionMetrics;
}

export const MetricsService = {
  /**
   * Calculate trial conversion metrics
   */
  getTrialMetrics: async (): Promise<TrialMetrics> => {
    try {
      const tenantsSnap = await getDocs(collection(db, 'tenants'));
      const tenants = tenantsSnap.docs.map(d => d.data());

      const now = Date.now();
      const activeTrials = tenants.filter(t => t.status === 'trialing' && t.trialEndsAt?.toMillis() > now).length;
      const expiredTrials = tenants.filter(t => t.status === 'trialing' && t.trialEndsAt?.toMillis() <= now).length;
      const convertedFromTrial = tenants.filter(t => t.trialConvertedAt).length;

      const totalSignups = tenants.length;
      const conversionRate = totalSignups > 0 ? (convertedFromTrial / (totalSignups - activeTrials - expiredTrials)) * 100 : 0;

      // Calculate average trial duration and activation time
      let totalTrialDuration = 0;
      let totalActivationTime = 0;
      let calculatedCount = 0;

      for (const tenant of tenants) {
        if (tenant.createdAt && tenant.trialEndsAt) {
          const duration = (tenant.trialEndsAt.toMillis() - tenant.createdAt.toMillis()) / (1000 * 60 * 60 * 24);
          totalTrialDuration += duration;
          calculatedCount++;
        }

        // Activation time is from creation to first "aha" event
        if (tenant.createdAt && tenant.activatedAt) {
          const activation = (tenant.activatedAt.toMillis() - tenant.createdAt.toMillis()) / (1000 * 60 * 60);
          totalActivationTime += activation;
        }
      }

      return {
        totalSignups,
        activeTrials,
        expiredTrials,
        convertedFromTrial,
        conversionRate: Math.round(conversionRate),
        avgTrialDuration: calculatedCount > 0 ? Math.round(totalTrialDuration / calculatedCount) : 0,
        avgActivationTime: calculatedCount > 0 ? Math.round(totalActivationTime / calculatedCount) : 0,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'tenants');
      throw error;
    }
  },

  /**
   * Calculate revenue metrics
   */
  getRevenueMetrics: async (): Promise<RevenueMetrics> => {
    try {
      const tenantsSnap = await getDocs(collection(db, 'tenants'));
      const tenants = tenantsSnap.docs.map(d => d.data());

      const activeSubscriptions = tenants.filter(t => t.status === 'active').length;
      const totalCustomers = activeSubscriptions;

      // Calculate revenue by plan
      const planPrices = {
        starter: 99,
        growth: 229,
        pro: 499,
        launchpad: 99,
        accelerator: 229,
        catalyst: 499,
        apex: 749,
      };

      const customersByPlan: Record<string, number> = {};
      const revenueByPlan: Record<string, number> = {};
      let mrr = 0;

      for (const tenant of tenants) {
        if (tenant.status === 'active') {
          const plan = tenant.plan || 'starter';
          const price = planPrices[plan] || 99;
          
          customersByPlan[plan] = (customersByPlan[plan] || 0) + 1;
          revenueByPlan[plan] = (revenueByPlan[plan] || 0) + price;
          mrr += price;
        }
      }

      const arr = mrr * 12;
      const avgContractValue = totalCustomers > 0 ? mrr / totalCustomers : 0;

      // Calculate churn (simplified: tenants that were active last month but are not now)
      const churnRate = 0; // Would need historical data to calculate properly

      return {
        totalCustomers,
        activeSubscriptions,
        mrr,
        arr,
        customersByPlan,
        revenueByPlan,
        churnRate,
        avgContractValue,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'tenants');
      throw error;
    }
  },

  /**
   * Calculate engagement metrics
   */
  getEngagementMetrics: async (): Promise<EngagementMetrics> => {
    try {
      const tenantsSnap = await getDocs(collection(db, 'tenants'));
      const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      let usersWithProjects = 0;
      let usersWithEstimates = 0;
      let usersWithLeads = 0;
      let aiGenerationsThisMonth = 0;
      let automationRulesCreated = 0;

      for (const tenant of tenants) {
        // Count projects
        const projectsSnap = await getDocs(collection(db, `tenants/${tenant.id}/projects`));
        if (projectsSnap.size > 0) usersWithProjects++;

        // Count estimates
        const estimatesSnap = await getDocs(collection(db, `tenants/${tenant.id}/estimates`));
        if (estimatesSnap.size > 0) usersWithEstimates++;

        // Count leads
        const leadsSnap = await getDocs(collection(db, `tenants/${tenant.id}/leads`));
        if (leadsSnap.size > 0) usersWithLeads++;

        // Count AI visualizations
        const aiSnap = await getDocs(collection(db, `tenants/${tenant.id}/aiVisualizations`));
        aiGenerationsThisMonth += aiSnap.size;

        // Count automations
        const automationsSnap = await getDocs(collection(db, `tenants/${tenant.id}/automations`));
        automationRulesCreated += automationsSnap.size;
      }

      // Count widget embeds and leads
      const widgetLeadsSnap = await getDocs(collection(db, 'widgetLeads'));
      const widgetEmbeds = new Set(
        widgetLeadsSnap.docs
          .map(d => d.data().tenantId)
          .filter(Boolean)
      ).size;

      return {
        usersWithProjects,
        usersWithEstimates,
        usersWithLeads,
        aiGenerationsThisMonth,
        automationRulesCreated,
        widgetEmbeds,
        widgetLeadsGenerated: widgetLeadsSnap.size,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'metrics');
      throw error;
    }
  },

  /**
   * Record acquisition event
   */
  recordAcquisitionEvent: async (
    source: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await addDoc(collection(db, 'acquisition_events'), {
        source,
        userId,
        metadata,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'acquisition_events');
      throw error;
    }
  },

  /**
   * Get comprehensive metrics dashboard
   */
  getComprehensiveMetrics: async (): Promise<ComprehensiveMetrics> => {
    try {
      const trial = await MetricsService.getTrialMetrics();
      const revenue = await MetricsService.getRevenueMetrics();
      const engagement = await MetricsService.getEngagementMetrics();

      // Simplified acquisition metrics
      const acqEventsSnap = await getDocs(collection(db, 'acquisition_events'));
      const acqEventsThisMonth = acqEventsSnap.docs.filter(d => {
        const ts = d.data().timestamp as Timestamp;
        const eventDate = ts.toDate();
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      });

      const signupsBySource: Record<string, number> = {};
      acqEventsThisMonth.forEach(d => {
        const source = d.data().source || 'unknown';
        signupsBySource[source] = (signupsBySource[source] || 0) + 1;
      });

      return {
        period: 'monthly',
        date: serverTimestamp(),
        trial,
        revenue,
        engagement,
        acquisition: {
          newSignupsThisMonth: acqEventsThisMonth.length,
          signupsBySource,
          landingPageViews: 0, // Would need analytics integration
          demoBookings: 0, // Would need to count from bookings
          demoToSignupRate: 0,
          costPerAcquisition: 0,
          returnOnAdSpend: 0,
        },
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'metrics');
      throw error;
    }
  },

  /**
   * Store metrics snapshot for historical tracking
   */
  recordMetricsSnapshot: async (metrics: ComprehensiveMetrics): Promise<void> => {
    try {
      await addDoc(collection(db, 'metrics_snapshots'), {
        ...metrics,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'metrics_snapshots');
      throw error;
    }
  },
};

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface TenantMetrics {
  mrr: number;
  churnRate: number;
  ltv: number;
  activeUsers: number;
  aiUsage: number;
  automationSuccess: number;
}

export class AdminService {
  /**
   * Fetches aggregated metrics for all tenants.
   */
  static async getGlobalMetrics() {
    const path = 'tenants';
    try {
      const tenantsSnap = await getDocs(collection(db, path));
      const tenants = tenantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalTenants = tenants.length;
      const activeTenants = tenants.filter((t: any) => t.status === 'active').length;
      
      // Mock calculations for now, would be real in production
      const prices = { starter: 99, growth: 249, pro: 499 };
      const totalMRR = tenants.reduce((acc, t: any) => acc + (prices[t.plan as keyof typeof prices] || 0), 0);
      
      return {
        totalTenants,
        activeTenants,
        totalMRR,
        totalARR: totalMRR * 12,
        churnRate: 2.4, // Mock
        trialConversion: 18.5, // Mock
        avgLTV: 4250, // Mock
        healthScore: 88 // Mock
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  }

  /**
   * Pushes a global template to multiple tenants.
   */
  static async pushTemplateToTenants(templateId: string, tenantIds: string[], type: 'automation' | 'ads' | 'website') {
    const templatePath = 'global_templates';
    try {
      const templateDoc = await getDocs(query(collection(db, templatePath), where('id', '==', templateId)));
      if (templateDoc.empty) throw new Error('Template not found');
      
      const templateData = templateDoc.docs[0].data();
      
      const promises = tenantIds.map(async (tenantId) => {
        const collectionPath = type === 'automation' ? `tenants/${tenantId}/automations` :
                              type === 'ads' ? `tenants/${tenantId}/ad_campaigns` :
                              `tenants/${tenantId}/websites`;
                              
        await addDoc(collection(db, collectionPath), {
          ...templateData,
          isFromTemplate: true,
          templateId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, collectionPath));
      });
      
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, templatePath);
      throw error;
    }
  }

  /**
   * Gets AI performance logs across the platform.
   */
  static async getAIPerformanceLogs(limitCount: number = 50) {
    const path = 'system_monitoring';
    try {
      const q = query(collection(db, path), where('type', '==', 'ai_performance'), orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  }

  /**
   * Updates a tenant's subscription plan.
   */
  static async updateTenantPlan(tenantId: string, plan: 'starter' | 'growth' | 'pro') {
    const path = `tenants/${tenantId}`;
    try {
      await updateDoc(doc(db, 'tenants', tenantId), {
        plan,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }
}

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export const FullAccountService = {
  seedFullAccount: async (tenantName: string, ownerId: string) => {
    try {
      // 1. Create Tenant
      const tenantRef = await addDoc(collection(db, 'tenants'), {
        name: tenantName,
        ownerId: ownerId,
        plan: 'pro',
        status: 'active',
        createdAt: serverTimestamp(),
        ownerEmail: 'demo@vcv.com',
        aiUsage: 45,
        autoUsage: 60,
        websiteStatus: 'published'
      });

      const tenantId = tenantRef.id;

      // 2. Create Default Pipeline
      const stages = ['New Lead', 'Contacted', 'Estimate Sent', 'Won', 'Lost'];
      for (let i = 0; i < stages.length; i++) {
        await addDoc(collection(db, `tenants/${tenantId}/pipeline_stages`), {
          name: stages[i],
          order: i,
          createdAt: serverTimestamp()
        });
      }

      // 3. Create Demo Leads
      const demoLeads = [
        { name: 'John Smith', email: 'john@example.com', phone: '555-0101', source: 'Website', status: 'New Lead', createdAt: serverTimestamp() },
        { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-0102', source: 'Facebook', status: 'Contacted', createdAt: serverTimestamp() },
        { name: 'Mike Brown', email: 'mike@example.com', phone: '555-0103', source: 'Referral', status: 'Estimate Sent', createdAt: serverTimestamp() }
      ];

      for (const lead of demoLeads) {
        await addDoc(collection(db, `tenants/${tenantId}/leads`), {
          ...lead,
          tenantId: tenantId
        });
      }

      // 4. Create Demo Automations
      const demoAutomations = [
        { name: 'New Lead Follow-up', trigger: 'lead_created', action: 'send_sms', status: 'active', createdAt: serverTimestamp() },
        { name: 'Estimate Reminder', trigger: 'status_changed', action: 'send_email', status: 'active', createdAt: serverTimestamp() }
      ];

      for (const auto of demoAutomations) {
        await addDoc(collection(db, `tenants/${tenantId}/automations`), auto);
      }

      // 5. Create Demo Website Config
      const websiteRef = await addDoc(collection(db, `tenants/${tenantId}/websites`), {
        name: 'Main Website',
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await setDoc(doc(db, `tenants/${tenantId}/websites/${websiteRef.id}/config`, 'main'), {
        hero: { title: `Welcome to ${tenantName}`, subtitle: 'Quality Remodeling Services' },
        services: [
          { title: 'Roofing', description: 'Expert roofing solutions.' },
          { title: 'Siding', description: 'Premium siding installation.' }
        ],
        theme: { primary: '#1e3a8a', secondary: '#3b82f6' },
        updatedAt: serverTimestamp()
      });

      return tenantId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seed_full_account');
      throw error;
    }
  }
};

import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface GlobalTemplate {
  id?: string;
  type: 'automation' | 'ad' | 'estimate' | 'website' | 'pipeline';
  name: string;
  description: string;
  content: any;
  plans: string[];
  createdAt: any;
}

export const TemplateService = {
  async getTemplatesByType(type: GlobalTemplate['type']) {
    const q = query(collection(db, 'global_templates'), where('type', '==', type));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalTemplate));
  },

  async createTemplate(template: Omit<GlobalTemplate, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'global_templates'), {
        ...template,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'global_templates');
      throw error;
    }
  },

  async seedInitialTemplates() {
    const templates: Omit<GlobalTemplate, 'id' | 'createdAt'>[] = [
      {
        type: 'pipeline',
        name: 'Standard Remodeling Pipeline',
        description: 'Default stages for kitchen and bath remodeling projects.',
        plans: ['starter', 'growth', 'pro'],
        content: {
          stages: ['New Lead', 'Attempted Contact', 'Contacted', 'Consultation Scheduled', 'Consultation Completed', 'Proposal Sent', 'Follow-Up', 'Closed Won', 'Closed Lost']
        }
      },
      {
        type: 'automation',
        name: 'New Lead Follow-up',
        description: 'Automatic SMS and Email when a new lead arrives.',
        plans: ['growth', 'pro'],
        content: {
          trigger: { type: 'lead_created' },
          steps: [
            { type: 'sms', delay: 0, content: 'Hi {{name}}, thanks for reaching out! When is a good time to chat about your project?' },
            { type: 'email', delay: 300, subject: 'Welcome to {{businessName}}', content: 'We received your request...' }
          ]
        }
      }
    ];

    for (const t of templates) {
      await this.createTemplate(t);
    }
  },

  async pushTemplateToTenants(type: GlobalTemplate['type'] | 'all', tenantIds: string[]) {
    try {
      const templates = type === 'all' 
        ? (await getDocs(collection(db, 'global_templates'))).docs.map(doc => ({ id: doc.id, ...doc.data() } as GlobalTemplate))
        : await this.getTemplatesByType(type);

      for (const tenantId of tenantIds) {
        for (const template of templates) {
          const collectionName = template.type === 'pipeline' ? 'pipelineStages' : `${template.type}s`;
          // For pipeline, we might need to handle stages differently, but for now let's just add it
          await addDoc(collection(db, `tenants/${tenantId}/${collectionName}`), {
            ...template.content,
            name: template.name,
            description: template.description,
            pushedAt: serverTimestamp(),
            isFromTemplate: true,
            templateId: template.id
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'push_templates');
      throw error;
    }
  }
};

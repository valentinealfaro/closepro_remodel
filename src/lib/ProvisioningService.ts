import { 
  doc, 
  setDoc, 
  collection, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { TemplateService } from '../services/TemplateService';

export interface ProvisioningData {
  userId: string;
  email: string;
  businessName: string;
  plan: 'starter' | 'growth' | 'pro';
}

export const ProvisioningService = {
  async provisionNewTenant(data: ProvisioningData) {
    const { userId, email, businessName, plan } = data;
    
    // 1. Create Tenant
    const tenantId = `tenant_${userId}`; // Or generate a random ID
    const tenantPath = `tenants/${tenantId}`;
    const tenantRef = doc(db, 'tenants', tenantId);
    await setDoc(tenantRef, {
      name: businessName,
      ownerId: userId,
      plan: plan,
      status: 'active',
      createdAt: serverTimestamp(),
      onboardingComplete: false,
      subdomain: businessName.toLowerCase().replace(/\s+/g, '-'),
      settings: {
        email: email,
        brandColors: { primary: '#001F3F', secondary: '#0074D9' }
      }
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, tenantPath));

    // 2. Create User Profile
    const userPath = `users/${userId}`;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email: email,
      tenantId: tenantId,
      role: 'admin',
      createdAt: serverTimestamp()
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, userPath));

    // 3. Create Default Website from Template
    const websitePath = `tenants/${tenantId}/websites`;
    const websiteRef = doc(collection(db, websitePath));
    await setDoc(websiteRef, {
      tenantId: tenantId,
      templateId: `${plan}_template_v1`,
      status: 'draft',
      globalSettings: {
        businessName: businessName,
        brandColors: { primary: '#001F3F', secondary: '#0074D9', accent: '#0074D9' }
      },
      conversionSettings: {
        primaryCta: { text: 'Get a Quote', link: '/contact', action: 'form' },
        stickyCta: true,
        chatWidget: false,
        exitIntentPopup: false
      },
      seo: {
        title: `${businessName} | Expert Remodeling Services`,
        description: `High-quality kitchen and bathroom remodeling by ${businessName}.`
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, `${websitePath}/${websiteRef.id}`));

    // 4. Create Default Homepage
    const pagePath = `tenants/${tenantId}/websites/${websiteRef.id}/pages`;
    const pageRef = doc(collection(db, pagePath));
    await setDoc(pageRef, {
      title: 'Home',
      slug: 'home',
      status: 'published',
      isHomepage: true,
      templateType: 'standard',
      order: 0,
      seo: { title: 'Home | ' + businessName, description: 'Welcome to our website.' },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, `${pagePath}/${pageRef.id}`));

    // 5. Create Default Sections
    const sectionsPath = `tenants/${tenantId}/websites/${websiteRef.id}/pages/${pageRef.id}/sections`;
    const sectionsRef = collection(db, sectionsPath);
    const defaultSections = [
      { type: 'hero', content: { headline: `Premium Remodeling in ${businessName}'s Area`, subheadline: "We help you land $10K-$50K jobs with ease.", primaryCtaText: 'Get Started', imageUrl: 'https://picsum.photos/seed/hero/1920/1080' }, order: 0 },
      { type: 'services', content: { title: "Our Services", items: [{ title: "Kitchen Remodeling", description: "Complete kitchen transformations from design to installation.", icon: 'wrench' }, { title: "Bathroom Renovation", description: "Modern bathroom upgrades with high-end finishes.", icon: 'bath' }] }, order: 1 },
      { type: 'cta', content: { headline: 'Ready to start your project?', subheadline: 'Contact us today for a free estimate.', buttonText: 'Contact Us' }, order: 2 }
    ];

    for (const section of defaultSections) {
      await addDoc(sectionsRef, {
        ...section,
        isVisible: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, sectionsPath));
    }

    // 6. Create Default CRM Stages (Pull from global templates if available)
    const pipelineTemplates = await TemplateService.getTemplatesByType('pipeline');
    const defaultPipeline = pipelineTemplates.find(t => t.plans.includes(plan))?.content.stages;

    const crmConfigPath = `tenants/${tenantId}/config/crm`;
    const crmConfigRef = doc(db, `tenants/${tenantId}/config`, 'crm');
    await setDoc(crmConfigRef, {
      stages: defaultPipeline || (plan === 'starter' 
        ? ['New Lead', 'Contacted', 'Appointment Set', 'Proposal Sent', 'Closed Won', 'Closed Lost']
        : ['New Lead', 'Attempted Contact', 'Contacted', 'Consultation Scheduled', 'Consultation Completed', 'Visualization Sent', 'Proposal Sent', 'Follow-Up', 'Closed Won', 'Closed Lost'])
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, crmConfigPath));

    return { tenantId };
  }
};

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Estimate, 
  Invoice, 
  Project, 
  Payment, 
  EstimateStatus, 
  InvoiceStatus, 
  ProjectStatus 
} from '../types/financial';
import { AutomationService } from './AutomationService';

export class FinancialService {
  static async createEstimate(tenantId: string, estimateData: Partial<Estimate>) {
    try {
      const estimatesRef = collection(db, `tenants/${tenantId}/estimates`);
      const docRef = await addDoc(estimatesRef, {
        ...estimateData,
        tenantId,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Trigger automation
      await AutomationService.trigger(tenantId, 'estimate_sent', { id: docRef.id, ...estimateData });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'estimate');
      throw error;
    }
  }

  static async updateEstimate(tenantId: string, estimateId: string, estimateData: Partial<Estimate>) {
    try {
      const estimateRef = doc(db, `tenants/${tenantId}/estimates`, estimateId);
      await updateDoc(estimateRef, {
        ...estimateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'estimate');
      throw error;
    }
  }

  static async approveEstimate(tenantId: string, estimateId: string, signature: any) {
    try {
      const estimateRef = doc(db, `tenants/${tenantId}/estimates`, estimateId);
      const estimateSnap = await getDoc(estimateRef);
      
      if (!estimateSnap.exists()) throw new Error('Estimate not found');
      const estimate = estimateSnap.data() as Estimate;

      await updateDoc(estimateRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        signature,
        updatedAt: serverTimestamp()
      });

      // Trigger automation
      await AutomationService.trigger(tenantId, 'estimate_approved', { id: estimateId, ...estimate });

      // Automatically convert to invoice
      await this.convertToInvoice(tenantId, estimateId);
      
      // Automatically update deal stage if exists
      if (estimate.dealId) {
        const dealRef = doc(db, `tenants/${tenantId}/deals`, estimate.dealId);
        await updateDoc(dealRef, {
          stage: 'won',
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'estimate_approval');
      throw error;
    }
  }

  static async convertToInvoice(tenantId: string, estimateId: string) {
    try {
      const estimateRef = doc(db, `tenants/${tenantId}/estimates`, estimateId);
      const estimateSnap = await getDoc(estimateRef);
      
      if (!estimateSnap.exists()) throw new Error('Estimate not found');
      const estimate = estimateSnap.data() as Estimate;

      const invoicesRef = collection(db, `tenants/${tenantId}/invoices`);
      const invoiceData: Partial<Invoice> = {
        tenantId,
        estimateId,
        leadId: estimate.leadId,
        clientInfo: estimate.clientInfo,
        projectInfo: estimate.projectInfo,
        lineItems: estimate.lineItems,
        pricing: {
          ...estimate.pricing,
          amountPaid: 0,
          balanceDue: estimate.pricing.total
        },
        paymentSchedule: estimate.paymentTerms,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(invoicesRef, invoiceData);
      
      // Trigger automation
      await AutomationService.trigger(tenantId, 'invoice_sent', { id: docRef.id, ...invoiceData });

      // Create project automatically
      await this.createProject(tenantId, {
        leadId: estimate.leadId!,
        dealId: estimate.dealId,
        estimateId: estimateId,
        invoiceId: docRef.id,
        title: estimate.projectInfo.name,
        address: estimate.clientInfo.address,
        status: 'scheduled'
      });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'invoice_conversion');
      throw error;
    }
  }

  static async createProject(tenantId: string, projectData: Partial<Project>) {
    try {
      const projectsRef = collection(db, `tenants/${tenantId}/projects`);
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        tenantId,
        tasks: [],
        notes: [],
        photos: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'project');
      throw error;
    }
  }

  static async recordPayment(tenantId: string, paymentData: Partial<Payment>) {
    try {
      const paymentsRef = collection(db, `tenants/${tenantId}/payments`);
      const docRef = await addDoc(paymentsRef, {
        ...paymentData,
        tenantId,
        status: 'completed',
        createdAt: serverTimestamp()
      });

      // Update invoice status
      const invoiceRef = doc(db, `tenants/${tenantId}/invoices`, paymentData.invoiceId!);
      const invoiceSnap = await getDoc(invoiceRef);
      if (invoiceSnap.exists()) {
        const invoice = invoiceSnap.data() as Invoice;
        const newAmountPaid = (invoice.pricing.amountPaid || 0) + paymentData.amount!;
        const newBalanceDue = invoice.pricing.total - newAmountPaid;
        const newStatus: InvoiceStatus = newBalanceDue <= 0 ? 'paid' : 'partially_paid';

        await updateDoc(invoiceRef, {
          'pricing.amountPaid': newAmountPaid,
          'pricing.balanceDue': newBalanceDue,
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      }

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payment');
      throw error;
    }
  }
}

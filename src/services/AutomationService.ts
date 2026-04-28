import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Automation, 
  AutomationLog, 
  TriggerType, 
  AutomationStep,
  ActionType
} from '../types/automation';

import { AIService } from './AIService';

export class AutomationService {
  /**
   * Triggers automations based on an event.
   */
  static async trigger(tenantId: string, triggerType: TriggerType, targetData: any) {
    try {
      // 1. Find active automations for this trigger
      const automationsRef = collection(db, `tenants/${tenantId}/automations`);
      const q = query(
        automationsRef, 
        where('isActive', '==', true),
        where('trigger.type', '==', triggerType)
      );
      const snapshot = await getDocs(q);
      const automations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation));

      for (const automation of automations) {
        // 2. Check conditions
        if (this.checkConditions(automation.conditions, targetData)) {
          await this.startExecution(tenantId, automation, targetData);
        }
      }
      
      // Special case: Lead Created - Auto-analyze with AI
      if (triggerType === 'lead_created') {
        const analysis = await AIService.analyzeLead(tenantId, targetData);
        const leadRef = doc(db, `tenants/${tenantId}/leads`, targetData.id);
        await updateDoc(leadRef, {
          aiScore: analysis.score,
          aiStrategy: analysis.strategy,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error triggering automations:', error);
    }
  }

  /**
   * Starts the execution of an automation.
   */
  private static async startExecution(tenantId: string, automation: Automation, targetData: any) {
    try {
      const logsRef = collection(db, `tenants/${tenantId}/automation_logs`);
      const logData: Partial<AutomationLog> = {
        tenantId,
        automationId: automation.id,
        automationName: automation.name,
        targetId: targetData.id,
        targetName: targetData.name || targetData.title || 'Unknown',
        triggerType: automation.trigger.type,
        status: 'running',
        currentStepIndex: 0,
        stepsExecuted: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const logDoc = await addDoc(logsRef, logData);
      
      // Update automation stats
      const autoRef = doc(db, `tenants/${tenantId}/automations`, automation.id);
      await updateDoc(autoRef, {
        'stats.runCount': (automation.stats?.runCount || 0) + 1,
        'stats.lastTriggeredAt': serverTimestamp()
      });

      // Execute first step
      await this.executeStep(tenantId, automation, 0, logDoc.id, targetData);
    } catch (error) {
      console.error('Error starting automation execution:', error);
    }
  }

  /**
   * Executes a specific step in an automation.
   */
  private static async executeStep(
    tenantId: string, 
    automation: Automation, 
    stepIndex: number, 
    logId: string, 
    targetData: any
  ) {
    const step = automation.steps[stepIndex];
    if (!step) {
      // No more steps, complete the log
      await updateDoc(doc(db, `tenants/${tenantId}/automation_logs`, logId), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
      return;
    }

    if (step.type === 'delay') {
      const delayMs = this.calculateDelayMs(step.delayConfig!);
      const nextRunAt = new Date(Date.now() + delayMs);
      
      await updateDoc(doc(db, `tenants/${tenantId}/automation_logs`, logId), {
        status: 'waiting',
        nextRunAt: Timestamp.fromDate(nextRunAt),
        currentStepIndex: stepIndex + 1,
        updatedAt: serverTimestamp()
      });
      return;
    }

    // Execute action
    try {
      const result = await this.performAction(tenantId, step.actionType!, step.config, targetData);
      
      // Log step success
      const logRef = doc(db, `tenants/${tenantId}/automation_logs`, logId);
      const currentLogSnap = await getDocs(query(collection(db, `tenants/${tenantId}/automation_logs`), where('id', '==', logId)));
      const currentSteps = !currentLogSnap.empty ? (currentLogSnap.docs[0].data().stepsExecuted || []) : [];

      await updateDoc(logRef, {
        stepsExecuted: [
          ...currentSteps,
          {
            stepId: step.id,
            type: step.actionType,
            executedAt: new Date().toISOString(),
            status: 'success',
            result
          }
        ],
        currentStepIndex: stepIndex + 1,
        updatedAt: serverTimestamp()
      });

      // Execute next step
      await this.executeStep(tenantId, automation, stepIndex + 1, logId, targetData);
    } catch (error) {
      console.error('Error executing automation step:', error);
      // Log step error
      const logRef = doc(db, `tenants/${tenantId}/automation_logs`, logId);
      await updateDoc(logRef, {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        updatedAt: serverTimestamp()
      });
    }
  }

  /**
   * Checks if an automation's conditions are met.
   */
  private static checkConditions(conditions: any[], targetData: any): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const targetValue = targetData[condition.field];
      switch (condition.operator) {
        case 'equals': return targetValue === condition.value;
        case 'not_equals': return targetValue !== condition.value;
        case 'contains': return String(targetValue).includes(condition.value);
        case 'greater_than': return Number(targetValue) > Number(condition.value);
        case 'less_than': return Number(targetValue) < Number(condition.value);
        default: return true;
      }
    });
  }

  /**
   * Performs an automation action.
   */
  private static async performAction(tenantId: string, actionType: ActionType, config: any, targetData: any) {
    // Replace variables in message templates
    const message = this.replaceVariables(config?.message || '', targetData);

    switch (actionType) {
      case 'send_email':
        console.log(`[Automation] Sending Email to ${targetData.email}: ${message}`);
        // In a real app, call an email service (SendGrid, etc.)
        return { sent: true, to: targetData.email };
      
      case 'send_sms':
        console.log(`[Automation] Sending SMS to ${targetData.phone}: ${message}`);
        // In a real app, call an SMS service (Twilio, etc.)
        return { sent: true, to: targetData.phone };

      case 'trigger_ai_followup':
        const aiMessage = await AIService.generateFollowUp(tenantId, targetData);
        console.log(`[Automation] AI Follow-up to ${targetData.phone}: ${aiMessage}`);
        // In a real app, send this via SMS/Email
        return { aiSent: true, message: aiMessage };

      case 'update_lead_status':
        const leadRef = doc(db, `tenants/${tenantId}/leads`, targetData.id);
        await updateDoc(leadRef, { status: config.status, updatedAt: serverTimestamp() });
        return { statusUpdated: config.status };

      case 'add_tag':
        const targetRef = doc(db, `tenants/${tenantId}/${targetData.type || 'leads'}`, targetData.id);
        const currentTags = targetData.tags || [];
        if (!currentTags.includes(config.tag)) {
          await updateDoc(targetRef, { tags: [...currentTags, config.tag], updatedAt: serverTimestamp() });
        }
        return { tagAdded: config.tag };

      default:
        console.warn(`Action type ${actionType} not implemented yet.`);
        return { info: 'Action simulated' };
    }
  }

  private static replaceVariables(text: string, data: any): string {
    return text
      .replace(/\[Name\]/g, data.name || data.firstName || 'Client')
      .replace(/\[Service\]/g, data.serviceType || 'Project')
      .replace(/\[Company\]/g, 'ClosePro Remodel')
      .replace(/\[Estimate Link\]/g, `https://closepro.app/estimate/${data.id}`)
      .replace(/\[Invoice Link\]/g, `https://closepro.app/invoice/${data.id}`);
  }

  private static calculateDelayMs(config: { value: number, unit: string }): number {
    const { value, unit } = config;
    switch (unit) {
      case 'minutes': return value * 60 * 1000;
      case 'hours': return value * 60 * 60 * 1000;
      case 'days': return value * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  }

  private static async getLogSteps(tenantId: string, logId: string) {
    const logSnap = await getDocs(query(collection(db, `tenants/${tenantId}/automation_logs`), where('id', '==', logId)));
    if (logSnap.empty) return [];
    return logSnap.docs[0].data().stepsExecuted || [];
  }

  /**
   * Checks for pending automations that need to run after a delay.
   */
  static async checkPending(tenantId: string) {
    try {
      const logsRef = collection(db, `tenants/${tenantId}/automation_logs`);
      const q = query(
        logsRef,
        where('status', '==', 'waiting'),
        where('nextRunAt', '<=', Timestamp.now()),
        limit(10)
      );
      const snapshot = await getDocs(q);
      
      for (const logDoc of snapshot.docs) {
        const log = { id: logDoc.id, ...logDoc.data() } as AutomationLog;
        const automationRef = doc(db, `tenants/${tenantId}/automations`, log.automationId);
        const autoSnap = await getDocs(query(collection(db, `tenants/${tenantId}/automations`), where('id', '==', log.automationId)));
        
        if (!autoSnap.empty) {
          const automation = { id: autoSnap.docs[0].id, ...autoSnap.docs[0].data() } as Automation;
          if (automation.isActive) {
            // Get target data
            const targetRef = doc(db, `tenants/${tenantId}/leads`, log.targetId); // Assuming leads for now
            const targetSnap = await getDocs(query(collection(db, `tenants/${tenantId}/leads`), where('id', '==', log.targetId)));
            
            if (!targetSnap.empty) {
              await this.executeStep(tenantId, automation, log.currentStepIndex, log.id, { id: targetSnap.docs[0].id, ...targetSnap.docs[0].data() });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking pending automations:', error);
    }
  }
}

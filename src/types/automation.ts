export type TriggerType = 
  | 'lead_created' 
  | 'lead_updated' 
  | 'lead_tagged' 
  | 'deal_created' 
  | 'deal_moved' 
  | 'deal_won' 
  | 'deal_lost' 
  | 'estimate_sent' 
  | 'estimate_viewed' 
  | 'estimate_approved' 
  | 'estimate_rejected' 
  | 'invoice_sent' 
  | 'payment_received' 
  | 'invoice_overdue' 
  | 'form_submitted' 
  | 'booking_scheduled' 
  | 'manual_enrollment';

export type ActionType = 
  | 'send_email' 
  | 'send_sms' 
  | 'internal_notification' 
  | 'update_lead_status' 
  | 'add_tag' 
  | 'assign_user' 
  | 'create_task' 
  | 'move_deal_stage' 
  | 'send_estimate' 
  | 'send_invoice' 
  | 'send_payment_reminder' 
  | 'send_booking_link' 
  | 'send_design_link'
  | 'trigger_ai_followup';

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AutomationStep {
  id: string;
  type: 'action' | 'delay';
  actionType?: ActionType;
  config?: any; // e.g., email template, SMS body, status ID
  delayConfig?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  trigger: {
    type: TriggerType;
    config?: any;
  };
  conditions: AutomationCondition[];
  steps: AutomationStep[];
  isActive: boolean;
  stats: {
    runCount: number;
    successCount: number;
    errorCount: number;
    lastTriggeredAt?: any;
  };
  createdAt: any;
  updatedAt: any;
}

export interface AutomationLog {
  id: string;
  tenantId: string;
  automationId: string;
  automationName: string;
  targetId: string; // leadId or dealId
  targetName: string;
  triggerType: TriggerType;
  status: 'running' | 'completed' | 'error' | 'waiting';
  currentStepIndex: number;
  stepsExecuted: {
    stepId: string;
    type: string;
    executedAt: any;
    status: 'success' | 'error';
    error?: string;
    result?: any;
  }[];
  error?: string;
  createdAt: any;
  updatedAt: any;
}

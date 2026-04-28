export type Role = 'owner' | 'manager' | 'sales_rep' | 'super_admin';

export interface Tenant {
  id: string;
  name: string;
  industry: 'roofing' | 'kitchen_remodel' | 'bathroom_remodel' | 'general_contracting';
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  settings: TenantSettings;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  billing: {
    plan: 'starter' | 'pro' | 'enterprise';
    stripeCustomerId?: string;
    subscriptionId?: string;
    usage: {
      aiTokens: number;
      leadsThisMonth: number;
      adsActive: number;
    };
  };
}

export interface TenantSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  ai: {
    autoFollowUp: boolean;
    leadScoring: boolean;
    adOptimization: boolean;
  };
  integrations: {
    stripe: boolean;
    twilio: boolean;
    sendgrid: boolean;
    googleCalendar: boolean;
    metaAds: boolean;
    googleAds: boolean;
  };
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  source: 'facebook' | 'google' | 'instagram' | 'tiktok' | 'website' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost' | 'won';
  score: number; // AI generated 0-100
  aiStrategy?: string; // AI generated strategy
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  serviceType: string;
  budget?: number;
  notes: string;
  assignedTo?: string; // User ID
  createdAt: string;
  updatedAt: string;
  pipelineId: string;
  stageId: string;
  metadata: Record<string, any>;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  leadId: string;
  title: string;
  value: number;
  status: 'open' | 'won' | 'lost';
  pipelineId: string;
  stageId: string;
  aiScore?: number;
  aiStrategy?: string;
  createdAt: string;
  updatedAt: string;
  expectedCloseDate?: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  platform: 'facebook' | 'google' | 'instagram' | 'tiktok';
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: {
    daily: number;
    total?: number;
  };
  targeting: {
    location: string[];
    radius?: number;
    interests?: string[];
    ageRange?: [number, number];
  };
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: string;
  campaignId: string;
  tenantId: string;
  headline: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  cta: string;
  performance: AdPerformance;
}

export interface AdPerformance {
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpl: number;
  roi: number;
}

export interface Automation {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive: boolean;
  createdAt: string;
}

export type AutomationTrigger = 
  | { type: 'new_lead'; source?: string }
  | { type: 'lead_replied' }
  | { type: 'appointment_booked' }
  | { type: 'estimate_sent' }
  | { type: 'pipeline_stage_changed'; fromStageId?: string; toStageId: string };

export type AutomationAction = 
  | { type: 'send_sms'; template: string }
  | { type: 'send_email'; subject: string; template: string }
  | { type: 'assign_user'; userId: string }
  | { type: 'move_pipeline_stage'; stageId: string }
  | { type: 'trigger_ai_followup' };

export interface Estimate {
  id: string;
  tenantId: string;
  leadId: string;
  dealId?: string;
  number: string;
  status: 'draft' | 'sent' | 'approved' | 'declined';
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  scopeOfWork?: string; // AI generated
  createdAt: string;
  expiresAt?: string;
  signedAt?: string;
  signatureUrl?: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  estimateId?: string;
  leadId: string;
  number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  items: EstimateItem[];
  total: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  stripePaymentIntentId?: string;
}

export interface Message {
  id: string;
  tenantId: string;
  leadId: string;
  type: 'sms' | 'email' | 'call_log';
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'failed' | 'received';
  aiGenerated: boolean;
}

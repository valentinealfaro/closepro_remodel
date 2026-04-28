export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';
export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type ProjectStatus = 'scheduled' | 'in_progress' | 'on_hold' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface LineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentMilestone {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  dueDate?: any;
  status: 'pending' | 'paid';
  stripePaymentIntentId?: string;
}

export interface Estimate {
  id: string;
  tenantId: string;
  leadId?: string;
  dealId?: string;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  projectInfo: {
    name: string;
    serviceType: string;
    notes: string;
  };
  lineItems: LineItem[];
  pricing: {
    subtotal: number;
    taxRate: number;
    taxTotal: number;
    discount: number;
    total: number;
  };
  paymentTerms: PaymentMilestone[];
  notes: string;
  terms: string;
  status: EstimateStatus;
  signature?: {
    name: string;
    date: any;
    ip: string;
    dataUrl: string; // Base64 signature image
  };
  createdAt: any;
  updatedAt: any;
  sentAt?: any;
  viewedAt?: any;
  approvedAt?: any;
}

export interface Invoice {
  id: string;
  tenantId: string;
  estimateId?: string;
  leadId?: string;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  projectInfo: {
    name: string;
    serviceType: string;
  };
  lineItems: LineItem[];
  pricing: {
    subtotal: number;
    taxTotal: number;
    discount: number;
    total: number;
    amountPaid: number;
    balanceDue: number;
  };
  paymentSchedule: PaymentMilestone[];
  status: InvoiceStatus;
  dueDate: any;
  createdAt: any;
  updatedAt: any;
}

export interface Project {
  id: string;
  tenantId: string;
  leadId: string;
  dealId?: string;
  estimateId?: string;
  invoiceId?: string;
  title: string;
  address?: string;
  status: ProjectStatus;
  startDate?: any;
  endDate?: any;
  assignedTo?: string[]; // User IDs
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  notes: {
    id: string;
    text: string;
    authorId: string;
    createdAt: any;
  }[];
  photos: {
    id: string;
    url: string;
    type: 'before' | 'after' | 'progress';
    createdAt: any;
  }[];
  createdAt: any;
  updatedAt: any;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  milestoneId?: string;
  amount: number;
  method: 'stripe' | 'check' | 'cash' | 'other';
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  createdAt: any;
}

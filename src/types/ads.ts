export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CampaignGoal = 'lead_generation' | 'website_traffic' | 'booking_appointments' | 'brand_awareness';
export type AdPlatform = 'facebook' | 'google' | 'instagram' | 'linkedin';

export interface AdCampaign {
  id?: string;
  tenantId: string;
  name: string;
  goal: CampaignGoal;
  service: string;
  location: {
    city: string;
    radius: number;
  };
  budget: {
    daily: number;
    currency: string;
  };
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  createdAt: any;
  updatedAt: any;
}

export interface AdCreative {
  id?: string;
  campaignId: string;
  tenantId: string;
  platform: AdPlatform;
  copy: {
    primaryText: string;
    headline: string;
    description: string;
    cta: string;
  };
  media: {
    type: 'image' | 'video' | 'carousel';
    urls: string[];
    overlayText?: string;
  };
  offerId?: string;
  landingPageUrl: string;
  status: 'active' | 'paused' | 'archived';
  performance?: {
    impressions: number;
    clicks: number;
    leads: number;
    spend: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface AdOffer {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'free_service' | 'consultation' | 'custom';
}

export const PREBUILT_OFFERS: AdOffer[] = [
  { id: 'free_estimate', title: 'Free Estimate', description: 'Get a professional estimate at no cost.', type: 'free_service' },
  { id: 'discount_500', title: '$500 Off Remodel', description: 'Save $500 on your next major project.', type: 'discount' },
  { id: 'same_week', title: 'Same Week Consultation', description: 'We will meet with you within 7 days.', type: 'consultation' },
  { id: 'no_obligation', title: 'No Obligation Quote', description: 'Get a quote with zero pressure to buy.', type: 'free_service' },
  { id: 'insurance_help', title: 'Insurance Claim Help', description: 'Expert assistance with your insurance claims.', type: 'custom' },
];

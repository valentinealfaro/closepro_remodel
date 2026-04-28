export type WebsiteStatus = 'draft' | 'published';
export type PageStatus = 'draft' | 'published' | 'private';

export interface GlobalSettings {
  businessName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  favicon?: string;
}

export interface ConversionSettings {
  primaryCta: {
    text: string;
    link: string;
    action: 'form' | 'booking' | 'call' | 'link';
  };
  stickyCta: boolean;
  chatWidget: boolean;
  exitIntentPopup: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  isHomepage: boolean;
  templateType: string;
  order: number;
  seo: SEOData;
}

export interface WebsiteSection {
  id: string;
  type: string;
  content: any;
  order: number;
  isVisible: boolean;
  settings?: any;
}

export interface Website {
  id: string;
  tenantId: string;
  templateId: string;
  status: WebsiteStatus;
  lastPublishedAt?: any;
  globalSettings: GlobalSettings;
  conversionSettings: ConversionSettings;
}

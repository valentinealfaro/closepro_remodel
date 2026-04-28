import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  getDoc,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AdCampaign, AdCreative, AdOffer } from '../types/ads';
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey: key });
};

export class AdService {
  static async createCampaign(tenantId: string, campaignData: Partial<AdCampaign>) {
    try {
      const campaignsRef = collection(db, `tenants/${tenantId}/ad_campaigns`);
      const docRef = await addDoc(campaignsRef, {
        ...campaignData,
        tenantId,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ad_campaign');
      throw error;
    }
  }

  static async updateCampaign(tenantId: string, campaignId: string, campaignData: Partial<AdCampaign>) {
    try {
      const campaignRef = doc(db, `tenants/${tenantId}/ad_campaigns`, campaignId);
      await updateDoc(campaignRef, {
        ...campaignData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'ad_campaign');
      throw error;
    }
  }

  static async createAdCreative(tenantId: string, creativeData: Partial<AdCreative>) {
    try {
      const creativesRef = collection(db, `tenants/${tenantId}/ad_creatives`);
      const docRef = await addDoc(creativesRef, {
        ...creativeData,
        tenantId,
        status: 'active',
        performance: {
          impressions: 0,
          clicks: 0,
          leads: 0,
          spend: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ad_creative');
      throw error;
    }
  }

  static async generateAdCopy(service: string, offer: AdOffer, platform: string) {
    try {
      const prompt = `Generate high-converting ad copy for a ${service} remodeling business.
      Platform: ${platform}
      Offer: ${offer.title} - ${offer.description}
      
      Return the response in JSON format with the following fields:
      - primaryText: The main body of the ad.
      - headline: A catchy headline.
      - description: A short description (for Google/Facebook).
      - cta: The recommended Call To Action text.`;

      const response = await getAI().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error generating ad copy:', error);
      throw error;
    }
  }

  static async generateAdImage(service: string, offer: Partial<AdOffer> & { aspectRatio?: string }) {
    try {
      const prompt = `A professional, high-quality photograph of a ${service} remodeling project. 
      The image should be vibrant, clean, and showcase excellent craftsmanship. 
      ${offer.title ? `Include a subtle overlay or context related to: ${offer.title}.` : ''} 
      No text in the image, just a beautiful professional photo.`;

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (offer.aspectRatio as any) || '1:1'
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
      throw new Error('No image generated');
    } catch (error) {
      console.error('Error generating ad image:', error);
      throw error;
    }
  }

  static async getCampaigns(tenantId: string) {
    try {
      const q = query(
        collection(db, `tenants/${tenantId}/ad_campaigns`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'ad_campaigns');
      throw error;
    }
  }

  static async getCampaignPerformance(tenantId: string, campaignId: string) {
    try {
      const leadsRef = collection(db, `tenants/${tenantId}/leads`);
      const q = query(leadsRef, where('adCampaignId', '==', campaignId));
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => doc.data());
      
      return {
        leads: leads.length,
        wonLeads: leads.filter(l => l.status === 'won').length,
        totalValue: leads.reduce((acc, l) => acc + (Number(l.jobValue) || 0), 0)
      };
    } catch (error) {
      console.error('Error getting campaign performance:', error);
      return { leads: 0, wonLeads: 0, totalValue: 0 };
    }
  }
}

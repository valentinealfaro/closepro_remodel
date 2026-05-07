import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface EarlyAdopterOffer {
  id: string;
  tenantId: string;
  userId: string;
  planLevel: 'starter' | 'growth' | 'pro';
  offerPrice: number; // Monthly price for early adopter
  regularPrice: number; // Standard monthly price
  savingsPerMonth: number;
  savingsPerYear: number;
  monthsIncluded: number; // e.g., 6 months at offer price
  benefits: string[]; // Additional benefits like "1:1 onboarding", "priority support", etc
  caseStudyCommitment: boolean; // Whether they commit to being a case study
  videoTestimonialCommitment: boolean;
  reviewCommitment: boolean;
  status: 'active' | 'accepted' | 'declined' | 'expired';
  expiresAt: any;
  acceptedAt?: any;
  createdAt: any;
}

export interface EarlyAdopterStats {
  totalOffered: number;
  totalAccepted: number;
  acceptanceRate: number;
  avgMonthlySavings: number;
  totalCaseStudyCommitments: number;
  totalTestimonialCommitments: number;
}

export const EarlyAdopterService = {
  /**
   * Create an early adopter offer
   * Limit to first 25-50 customers
   */
  createOffer: async (
    tenantId: string,
    userId: string,
    planLevel: 'starter' | 'growth' | 'pro',
    customPrice?: number
  ): Promise<EarlyAdopterOffer> => {
    try {
      // Check current count of early adopter offers
      const q = query(
        collection(db, 'early_adopter_offers'),
        where('status', '==', 'accepted')
      );
      const snapshot = await getDocs(q);

      if (snapshot.size >= 50) {
        throw new Error('Early adopter offer limit reached');
      }

      // Define pricing
      const pricingMap = {
        starter: { regular: 99, offer: 49, months: 6 },
        growth: { regular: 229, offer: 149, months: 6 },
        pro: { regular: 499, offer: 299, months: 6 },
      };

      const pricing = pricingMap[planLevel];
      const offerPrice = customPrice || pricing.offer;
      const monthsIncluded = 6;

      const offer: EarlyAdopterOffer = {
        id: '', // Will be set by Firestore
        tenantId,
        userId,
        planLevel,
        offerPrice,
        regularPrice: pricing.regular,
        savingsPerMonth: pricing.regular - offerPrice,
        savingsPerYear: (pricing.regular - offerPrice) * 12,
        monthsIncluded,
        benefits: [
          '1:1 onboarding call with our team',
          'Priority email support for 6 months',
          'Direct access to product team for feedback',
          'Featured as a case study (optional)',
          'Early access to new features',
          'Custom branding on your widget',
        ],
        caseStudyCommitment: false,
        videoTestimonialCommitment: false,
        reviewCommitment: false,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day expiration
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'early_adopter_offers'), offer);
      offer.id = docRef.id;

      return offer;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'early_adopter_offers');
      throw error;
    }
  },

  /**
   * Accept early adopter offer
   */
  acceptOffer: async (
    offerId: string,
    commitments: {
      caseStudy: boolean;
      videoTestimonial: boolean;
      review: boolean;
    }
  ): Promise<void> => {
    try {
      const offerRef = doc(db, 'early_adopter_offers', offerId);
      
      await updateDoc(offerRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        caseStudyCommitment: commitments.caseStudy,
        videoTestimonialCommitment: commitments.videoTestimonial,
        reviewCommitment: commitments.review,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'early_adopter_offers');
      throw error;
    }
  },

  /**
   * Decline early adopter offer
   */
  declineOffer: async (offerId: string): Promise<void> => {
    try {
      const offerRef = doc(db, 'early_adopter_offers', offerId);
      await updateDoc(offerRef, {
        status: 'declined',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'early_adopter_offers');
      throw error;
    }
  },

  /**
   * Get early adopter offer for a tenant
   */
  getOfferForTenant: async (tenantId: string): Promise<EarlyAdopterOffer | null> => {
    try {
      const q = query(
        collection(db, 'early_adopter_offers'),
        where('tenantId', '==', tenantId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as EarlyAdopterOffer;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'early_adopter_offers');
      return null;
    }
  },

  /**
   * Get early adopter offer by ID
   */
  getOffer: async (offerId: string): Promise<EarlyAdopterOffer | null> => {
    try {
      const offerRef = doc(db, 'early_adopter_offers', offerId);
      const snapshot = await getDocs(collection(db, 'early_adopter_offers'));
      
      const offer = snapshot.docs.find(d => d.id === offerId);
      if (!offer) return null;

      return offer.data() as EarlyAdopterOffer;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'early_adopter_offers');
      return null;
    }
  },

  /**
   * Get early adopter program statistics
   */
  getStats: async (): Promise<EarlyAdopterStats> => {
    try {
      const snapshot = await getDocs(collection(db, 'early_adopter_offers'));
      
      const offers = snapshot.docs.map(d => d.data() as EarlyAdopterOffer);
      const accepted = offers.filter(o => o.status === 'accepted');

      const totalSavings = accepted.reduce((sum, o) => sum + o.savingsPerMonth, 0);
      const caseStudies = accepted.filter(o => o.caseStudyCommitment).length;
      const testimonials = accepted.filter(o => o.videoTestimonialCommitment).length;

      return {
        totalOffered: offers.length,
        totalAccepted: accepted.length,
        acceptanceRate: offers.length > 0 ? accepted.length / offers.length : 0,
        avgMonthlySavings: accepted.length > 0 ? totalSavings / accepted.length : 0,
        totalCaseStudyCommitments: caseStudies,
        totalTestimonialCommitments: testimonials,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'early_adopter_offers');
      throw error;
    }
  },

  /**
   * Get list of early adopter customers for case studies/testimonials
   */
  getCommittedCustomers: async (
    type: 'case_study' | 'testimonial' | 'review'
  ): Promise<EarlyAdopterOffer[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'early_adopter_offers'));
      
      const offers = snapshot.docs
        .map(d => d.data() as EarlyAdopterOffer)
        .filter(o => o.status === 'accepted');

      if (type === 'case_study') {
        return offers.filter(o => o.caseStudyCommitment);
      } else if (type === 'testimonial') {
        return offers.filter(o => o.videoTestimonialCommitment);
      } else {
        return offers.filter(o => o.reviewCommitment);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'early_adopter_offers');
      throw error;
    }
  },
};

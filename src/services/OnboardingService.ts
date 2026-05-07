import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface OnboardingProfile {
  userId: string;
  tenantId: string;
  businessName: string;
  businessType: string; // 'kitchen' | 'bathroom' | 'general' | 'exterior' | 'whole-home'
  monthlyRevenue: string; // '$50K-$100K' | '$100K-$250K' | '$250K-$500K' | '$500K-$1M' | '$1M+'
  biggestChallenge: string; // 'winning more bids' | 'faster estimates' | 'better communication' | 'tracking projects' | 'other'
  desiredOutcome: string; // Free-form text
  createdAt: any;
  updatedAt: any;
}

export interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  completedAt?: any;
}

export interface OnboardingProgress {
  userId: string;
  tenantId: string;
  completedSteps: string[];
  currentStep: string;
  lastActivityAt: any;
  activated: boolean; // true when they've completed first "aha!" moment
}

export const OnboardingService = {
  /**
   * Initialize onboarding profile for new user
   * Called immediately after signup
   */
  createProfile: async (
    userId: string,
    tenantId: string,
    businessName: string,
    businessType: string
  ): Promise<string> => {
    try {
      const profileRef = await addDoc(collection(db, 'onboarding_profiles'), {
        userId,
        tenantId,
        businessName,
        businessType,
        monthlyRevenue: '',
        biggestChallenge: '',
        desiredOutcome: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as OnboardingProfile);

      // Initialize progress tracking
      await setDoc(doc(db, `users/${userId}/onboarding_progress`), {
        userId,
        tenantId,
        completedSteps: [],
        currentStep: 'welcome',
        activated: false,
        lastActivityAt: serverTimestamp(),
      } as OnboardingProgress);

      return profileRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'onboarding_profiles');
      throw error;
    }
  },

  /**
   * Update onboarding profile with user preferences
   * Called during the initial setup wizard
   */
  updateProfile: async (
    userId: string,
    updates: Partial<OnboardingProfile>
  ): Promise<void> => {
    try {
      const q = query(
        collection(db, 'onboarding_profiles'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Onboarding profile not found');
      }

      await updateDoc(snapshot.docs[0].ref, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'onboarding_profiles');
      throw error;
    }
  },

  /**
   * Get personalized onboarding steps based on user profile
   */
  getPersonalizedSteps: (profile: OnboardingProfile): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'business_setup',
        label: 'Set Up Your Business Profile',
        description: 'Add your company info and branding',
        priority: 'critical',
      },
      {
        id: 'first_project',
        label: 'Create Your First Project',
        description: `Create a sample ${profile.businessType} project to see how ClosePro works`,
        priority: 'critical',
      },
      {
        id: 'first_estimate',
        label: 'Generate Your First Estimate',
        description: 'Create an estimate and see how easy it is',
        priority: 'critical',
      },
    ];

    // Add AI visualizer step for relevant business types
    if (['kitchen', 'bathroom', 'general', 'whole-home'].includes(profile.businessType)) {
      baseSteps.push({
        id: 'ai_visualizer',
        label: 'Try the AI Visualizer',
        description: 'Upload a photo and generate a remodel preview in seconds',
        priority: 'high',
      });
    }

    // Add lead capture step
    baseSteps.push({
      id: 'lead_capture',
      label: 'Add Your First Lead',
      description: 'Capture a lead through the CRM',
      priority: 'high',
    });

    // Add integration step
    baseSteps.push({
      id: 'embed_widget',
      label: 'Add Widget to Your Website',
      description: 'Get your embed code and add the lead capture widget to your site',
      priority: 'medium',
    });

    return baseSteps;
  },

  /**
   * Mark a step as complete
   * Returns true if user is now "activated" (has completed first aha moment)
   */
  completeStep: async (userId: string, stepId: string): Promise<boolean> => {
    try {
      const progressRef = doc(db, `users/${userId}/onboarding_progress`);
      const progressSnap = await getDoc(progressRef);

      if (!progressSnap.exists()) {
        throw new Error('Progress not found');
      }

      const currentProgress = progressSnap.data() as OnboardingProgress;
      const completedSteps = Array.from(new Set([...currentProgress.completedSteps, stepId]));

      // User is "activated" once they complete first 3 critical steps or create first estimate
      const activationTriggers = [
        completedSteps.includes('business_setup') &&
        completedSteps.includes('first_project') &&
        completedSteps.includes('first_estimate'),
      ];

      const activated = activationTriggers.some(Boolean) || currentProgress.activated;

      await updateDoc(progressRef, {
        completedSteps,
        activated,
        lastActivityAt: serverTimestamp(),
      });

      return activated;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'onboarding_progress');
      throw error;
    }
  },

  /**
   * Get current onboarding status
   */
  getProgress: async (userId: string): Promise<OnboardingProgress | null> => {
    try {
      const progressRef = doc(db, `users/${userId}/onboarding_progress`);
      const progressSnap = await getDoc(progressRef);

      if (!progressSnap.exists()) {
        return null;
      }

      return progressSnap.data() as OnboardingProgress;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'onboarding_progress');
      return null;
    }
  },

  /**
   * Get onboarding profile
   */
  getProfile: async (userId: string): Promise<OnboardingProfile | null> => {
    try {
      const q = query(
        collection(db, 'onboarding_profiles'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as OnboardingProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'onboarding_profiles');
      return null;
    }
  },

  /**
   * Capture user feedback during onboarding
   */
  captureFeedback: async (
    userId: string,
    tenantId: string,
    feedbackType: 'challenge' | 'feature_request' | 'blocker' | 'success',
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await addDoc(collection(db, 'onboarding_feedback'), {
        userId,
        tenantId,
        feedbackType,
        message,
        metadata,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'onboarding_feedback');
      throw error;
    }
  },

  /**
   * Record onboarding event for analytics
   */
  recordEvent: async (
    userId: string,
    tenantId: string,
    eventType: 'signup' | 'profile_completed' | 'first_action' | 'aha_moment' | 'trial_converted' | 'trial_expired',
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await addDoc(collection(db, 'onboarding_events'), {
        userId,
        tenantId,
        eventType,
        metadata,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'onboarding_events');
      throw error;
    }
  },
};

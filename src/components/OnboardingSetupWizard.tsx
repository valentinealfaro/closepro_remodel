import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Loader2,
  Zap,
  Target,
  Users,
  TrendingUp,
  Brain,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/AuthContext';
import { OnboardingService, OnboardingProfile, OnboardingStep } from '../services/OnboardingService';

interface OnboardingSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  tenantId: string;
}

const BUSINESS_TYPES = [
  { id: 'kitchen', label: 'Kitchen Remodeling', icon: '🍳' },
  { id: 'bathroom', label: 'Bathroom Remodeling', icon: '🚿' },
  { id: 'general', label: 'General Remodeling', icon: '🏠' },
  { id: 'exterior', label: 'Exterior/Roofing', icon: '🏘️' },
  { id: 'whole-home', label: 'Whole Home Renovation', icon: '🏗️' },
];

const REVENUE_RANGES = [
  { id: '50-100k', label: '$50K–$100K/year', icon: '📊' },
  { id: '100-250k', label: '$100K–$250K/year', icon: '📈' },
  { id: '250-500k', label: '$250K–$500K/year', icon: '📊' },
  { id: '500k-1m', label: '$500K–$1M/year', icon: '💰' },
  { id: '1m-plus', label: '$1M+/year', icon: '🚀' },
];

const CHALLENGES = [
  { id: 'winning-bids', label: 'Winning more bids and projects', icon: Target },
  { id: 'faster-estimates', label: 'Faster, better estimates', icon: Zap },
  { id: 'communication', label: 'Better client communication', icon: MessageSquare },
  { id: 'project-tracking', label: 'Tracking projects and leads', icon: Users },
  { id: 'scaling', label: 'Scaling to more revenue', icon: TrendingUp },
];

export default function OnboardingSetupWizard({ 
  isOpen, 
  onClose, 
  onComplete,
  tenantId 
}: OnboardingSetupWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'business-type' | 'revenue' | 'challenge' | 'goals' | 'ready'>('business-type');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    businessType: '',
    monthlyRevenue: '',
    challenge: '',
    desiredOutcome: '',
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setStep('business-type');
      setProfile({
        businessType: '',
        monthlyRevenue: '',
        challenge: '',
        desiredOutcome: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 'business-type' && !profile.businessType) {
      toast.error('Please select your business type');
      return;
    }
    if (step === 'revenue' && !profile.monthlyRevenue) {
      toast.error('Please select your revenue range');
      return;
    }
    if (step === 'challenge' && !profile.challenge) {
      toast.error('Please select your biggest challenge');
      return;
    }
    if (step === 'goals' && !profile.desiredOutcome) {
      toast.error('Please tell us your goals');
      return;
    }

    if (step === 'goals') {
      // Save profile and complete onboarding
      setLoading(true);
      try {
        await OnboardingService.updateProfile(user?.uid || '', {
          businessType: profile.businessType,
          monthlyRevenue: profile.monthlyRevenue,
          biggestChallenge: profile.challenge,
          desiredOutcome: profile.desiredOutcome,
        } as Partial<OnboardingProfile>);

        await OnboardingService.recordEvent(user?.uid || '', tenantId, 'profile_completed', {
          businessType: profile.businessType,
        });

        setStep('ready');
      } catch (error) {
        toast.error('Failed to save profile');
      } finally {
        setLoading(false);
      }
      return;
    }

    const steps: Array<'business-type' | 'revenue' | 'challenge' | 'goals' | 'ready'> = ['business-type', 'revenue', 'challenge', 'goals', 'ready'];
    const nextIdx = steps.indexOf(step) + 1;
    if (nextIdx < steps.length) {
      setStep(steps[nextIdx]);
    }
  };

  const handleBack = () => {
    const steps: Array<'business-type' | 'revenue' | 'challenge' | 'goals' | 'ready'> = ['business-type', 'revenue', 'challenge', 'goals', 'ready'];
    const prevIdx = steps.indexOf(step) - 1;
    if (prevIdx >= 0) {
      setStep(steps[prevIdx]);
    }
  };

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric text-white rounded-xl flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-navy">Let's Set You Up</h2>
              <p className="text-xs text-gray-500">Answer a few quick questions to personalize your experience</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="h-1 w-full bg-gray-100">
          <motion.div
            className="h-full bg-electric"
            initial={{ width: '0%' }}
            animate={{
              width: step === 'business-type' ? '20%' 
                   : step === 'revenue' ? '40%' 
                   : step === 'challenge' ? '60%' 
                   : step === 'goals' ? '80%' 
                   : '100%'
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Business Type */}
            {step === 'business-type' && (
              <motion.div
                key="business-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 flex-1"
              >
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-navy">What type of remodeling do you do?</h3>
                  <p className="text-sm text-gray-600">This helps us customize your experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setProfile({ ...profile, businessType: type.id })}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        profile.businessType === type.id
                          ? 'border-electric bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <p className="font-bold text-navy text-sm">{type.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Revenue Range */}
            {step === 'revenue' && (
              <motion.div
                key="revenue"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 flex-1"
              >
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-navy">What's your annual revenue?</h3>
                  <p className="text-sm text-gray-600">This helps us understand your business stage</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {REVENUE_RANGES.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setProfile({ ...profile, monthlyRevenue: range.id })}
                      className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                        profile.monthlyRevenue === range.id
                          ? 'border-electric bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{range.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-navy">{range.label}</p>
                      </div>
                      {profile.monthlyRevenue === range.id && (
                        <CheckCircle2 size={20} className="text-electric flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Challenge */}
            {step === 'challenge' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 flex-1"
              >
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-navy">What's your biggest challenge?</h3>
                  <p className="text-sm text-gray-600">This helps us show you the most relevant features</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {CHALLENGES.map((challenge) => {
                    const Icon = challenge.icon;
                    return (
                      <button
                        key={challenge.id}
                        onClick={() => setProfile({ ...profile, challenge: challenge.id })}
                        className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                          profile.challenge === challenge.id
                            ? 'border-electric bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} className="text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-navy text-sm">{challenge.label}</p>
                        </div>
                        {profile.challenge === challenge.id && (
                          <CheckCircle2 size={20} className="text-electric flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Goals */}
            {step === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 flex-1"
              >
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-black text-navy">What do you want to achieve?</h3>
                  <p className="text-sm text-gray-600">Share your main goal in a sentence or two</p>
                </div>

                <textarea
                  value={profile.desiredOutcome}
                  onChange={(e) => setProfile({ ...profile, desiredOutcome: e.target.value })}
                  placeholder="e.g., I want to close more kitchen remodeling projects by showing clients beautiful before/after visualizations..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-electric focus:outline-none resize-none"
                  rows={5}
                />

                <p className="text-xs text-gray-500">This helps us prioritize features that matter most to you</p>
              </motion.div>
            )}

            {/* Ready */}
            {step === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6 flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-navy">You're all set!</h3>
                  <p className="text-sm text-gray-600">
                    Your personalized experience is ready. Let's show you how ClosePro Remodel can help you close more deals.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
                  <p className="text-navy font-bold mb-2">✨ Here's what we're recommending:</p>
                  <ul className="text-gray-600 space-y-1 text-xs">
                    <li>1. Complete your business profile</li>
                    <li>2. Create your first project to see ClosePro in action</li>
                    <li>3. Try the AI Visualizer with a real photo</li>
                    <li>4. Get your embed code to start capturing leads</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 'business-type' || step === 'ready'}
            className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-navy hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {step === 'business-type' && 'Step 1 of 4'}
            {step === 'revenue' && 'Step 2 of 4'}
            {step === 'challenge' && 'Step 3 of 4'}
            {step === 'goals' && 'Step 4 of 4'}
            {step === 'ready' && 'Ready!'}
          </div>

          {step === 'ready' ? (
            <button
              onClick={handleComplete}
              className="btn-shimmer px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-shimmer px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Saving...' : 'Next'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ProvisioningService } from '../lib/ProvisioningService';
import { motion } from 'motion/react';
import { CheckCircle2, Eye, EyeOff, Chrome, ArrowRight, Zap, Shield } from 'lucide-react';

const PLAN_LABELS: Record<string, { label: string; price: string; color: string }> = {
  launchpad:    { label: 'Launchpad',    price: '$99/mo',  color: 'bg-gray-100 text-navy' },
  accelerator:  { label: 'Accelerator',  price: '$229/mo', color: 'bg-blue-electric/10 text-blue-electric' },
  catalyst:     { label: 'Catalyst',     price: '$499/mo', color: 'bg-purple-100 text-purple-700' },
  apex:         { label: 'Apex',         price: '$749/mo', color: 'bg-amber-100 text-amber-700' },
  // legacy support
  starter:      { label: 'Launchpad',    price: '$99/mo',  color: 'bg-gray-100 text-navy' },
  growth:       { label: 'Accelerator',  price: '$229/mo', color: 'bg-blue-electric/10 text-blue-electric' },
  pro:          { label: 'Catalyst',     price: '$499/mo', color: 'bg-purple-100 text-purple-700' },
};

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':    'An account with this email already exists. Try signing in instead.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/operation-not-allowed':   'Email/password signup is not enabled. Contact support.',
    'auth/too-many-requests':       'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed':  'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user':    'Google sign-in was cancelled. Please try again.',
    'auth/popup-blocked':           'Popup was blocked. Please allow popups for this site and try again.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  if (!password) return null;
  return (
    <div className="space-y-1 mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-bold ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-500' : 'text-green-600'}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function Signup() {
  const [searchParams] = useSearchParams();
  const rawPlan = searchParams.get('plan') || 'accelerator';
  const planInfo = PLAN_LABELS[rawPlan] || PLAN_LABELS.accelerator;

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validate = (): string => {
    if (!businessName.trim()) return 'Business name is required.';
    if (!email.trim()) return 'Email address is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await ProvisioningService.provisionNewTenant({
        userId: user.uid,
        email: user.email!,
        businessName,
        plan: rawPlan as any
      });
      setSuccess(true);
      setTimeout(() => navigate('/app'), 1200);
    } catch (err: any) {
      setError(friendlyError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!businessName.trim()) { setError('Please enter your business name first.'); return; }
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await ProvisioningService.provisionNewTenant({
        userId: user.uid,
        email: user.email!,
        businessName,
        plan: rawPlan as any
      });
      setSuccess(true);
      setTimeout(() => navigate('/app'), 1200);
    } catch (err: any) {
      setError(friendlyError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Account created!</h2>
          <p className="text-gray-400">Setting up your platform...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col lg:flex-row">
      {/* Left panel — social proof */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-electric rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 space-y-8">
          <Link to="/">
            <img src="/logo.png" alt="ClosePro Remodel" className="h-14 w-auto brightness-0 invert" />
          </Link>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white leading-tight">
              Start closing more<br /><span className="text-blue-electric">$10K–$50K jobs</span><br />in 7 days.
            </h2>
            <p className="text-gray-400 text-lg">The complete CRM + AI platform built for remodeling contractors.</p>
          </div>
          <div className="space-y-4">
            {[
              'AI remodel visualizer that closes deals on-site',
              'Automated SMS + email follow-up sequences',
              'Professional estimate & invoice system',
              'Lead capture website included',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-electric shrink-0" />
                <span className="text-gray-300 font-medium">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {['MK', 'SJ', 'DR', 'LT'].map((initials, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-blue-electric/20 border-2 border-navy flex items-center justify-center text-xs font-bold text-blue-electric">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm"><strong className="text-white">500+ contractors</strong> use ClosePro to close more jobs</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-8 lg:px-16">
        <div className="lg:hidden flex justify-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="ClosePro Remodel" className="h-12 w-auto brightness-0 invert" />
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${planInfo.color}`}>
                {planInfo.label} Plan — {planInfo.price}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Create your account</h1>
            <p className="text-gray-400 text-sm">Live and capturing leads in under 24 hours.</p>
          </div>

          {/* Google button */}
          <button onClick={handleGoogleSignup} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-navy rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 shadow-lg">
            <Chrome size={20} className="text-red-500" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Elite Kitchens & Baths"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-sm"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 text-sm transition-colors ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-400 focus:ring-red-400/20'
                    : confirmPassword && confirmPassword === password
                    ? 'border-green-400 focus:ring-green-400/20'
                    : 'border-white/10 focus:border-blue-electric focus:ring-blue-electric/20'
                }`}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-400 font-bold mt-1">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || (!!confirmPassword && confirmPassword !== password)}
              className="w-full py-4 bg-blue-electric text-white rounded-xl font-black text-base hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-blue-electric/20 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Setting up your platform...</>
                : <><Zap size={18} /> Get Started Now — Free Trial</>}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield size={13} /> No credit card required · Cancel anytime
            </div>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-electric font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

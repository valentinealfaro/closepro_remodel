import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ProvisioningService } from '../lib/ProvisioningService';
import { motion } from 'motion/react';
import { Layout, CheckCircle, ArrowRight, Chrome } from 'lucide-react';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get('plan') as 'starter' | 'growth' | 'pro') || 'starter';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    if (!businessName) {
      setError('Please enter your business name first.');
      return;
    }
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
        plan
      });

      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Provision the new tenant
      await ProvisioningService.provisionNewTenant({
        userId: user.uid,
        email: user.email!,
        businessName,
        plan
      });

      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-start sm:justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl">
            <Layout className="text-electric" />
            <span>ClosePro<span className="text-electric">Remodel</span></span>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white">
          Create your account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-gray-400">
          Selected Plan: <span className="text-electric font-bold uppercase">{plan}</span>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <div className="mt-1">
                <input
                  id="business"
                  name="business"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric sm:text-sm"
                  placeholder="e.g. Elite Kitchens & Baths"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-electric hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric disabled:opacity-50"
              >
                {loading ? 'Setting up your platform...' : 'Get Started Now'}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric disabled:opacity-50"
              >
                <Chrome size={18} className="text-red-500" />
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

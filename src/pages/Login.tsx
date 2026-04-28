import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Layout, Chrome, Mail, ArrowLeft } from 'lucide-react';

type View = 'login' | 'forgot';

export default function Login() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Incorrect email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Try again later or reset your password.'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with that email address.'
        : err.message;
      setError(msg);
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
          {view === 'login' ? 'Sign in to your platform' : 'Reset your password'}
        </h2>
        {view === 'forgot' && (
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email and we'll send a reset link.
          </p>
        )}
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 shadow sm:rounded-lg sm:px-10">

          {/* ── Forgot Password View ── */}
          {view === 'forgot' ? (
            <>
              {resetSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="text-green-600" size={28} />
                  </div>
                  <h3 className="font-bold text-navy text-lg">Check your inbox</h3>
                  <p className="text-sm text-gray-600">
                    We sent a password reset link to <strong>{email}</strong>. It may take a minute to arrive.
                  </p>
                  <button
                    onClick={() => { setView('login'); setResetSent(false); setError(''); }}
                    className="text-sm text-electric font-bold hover:underline flex items-center gap-1 mx-auto"
                  >
                    <ArrowLeft size={14} /> Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                  {error && <div className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</div>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-electric hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(''); }}
                    className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-navy font-medium"
                  >
                    <ArrowLeft size={14} /> Back to sign in
                  </button>
                </form>
              )}
            </>
          ) : (
            /* ── Login View ── */
            <>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(''); }}
                      className="text-xs text-electric hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-electric focus:border-electric text-sm"
                  />
                </div>

                {error && <div className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-electric hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500 uppercase font-bold tracking-wider">Or continue with</span>
                  </div>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="mt-4 w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Chrome size={18} className="text-red-500" />
                  Sign in with Google
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-electric font-bold hover:underline">
                    Start Free Trial
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

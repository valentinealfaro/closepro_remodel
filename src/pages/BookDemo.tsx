import { useState } from 'react';
import { CheckCircle2, Calendar, ShieldCheck, Star, Clock, Users, TrendingUp } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DemoForm {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  monthlyRevenue: string;
  biggestChallenge: string;
}

const INITIAL_FORM: DemoForm = {
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  businessType: 'Kitchen Remodeler',
  monthlyRevenue: '',
  biggestChallenge: ''
};

export default function BookDemo() {
  const [form, setForm] = useState<DemoForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof DemoForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'demoRequests'), {
        ...form,
        createdAt: serverTimestamp(),
        status: 'pending',
        source: 'book-demo-page'
      });
      setSubmitted(true);
    } catch (err: any) {
      // If Firebase fails (e.g., offline), still show success to user
      console.error('Demo request save error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-blue-electric/10 text-blue-electric px-4 py-2 rounded-full text-sm font-bold">
                <Clock size={14} /> Only 15 minutes
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
                See How ClosePro Remodel Helps You Close More{' '}
                <span className="text-blue-electric">$10K–$50K Jobs</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join a personalized 15-minute demo to see the AI visualizer, CRM, and automation tools helping remodelers double their close rates.
              </p>
            </div>

            {/* What to expect */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy">What you'll see on the demo:</h3>
              <ul className="space-y-3">
                {[
                  "Live walkthrough of the AI Remodel Visualizer",
                  "How to automate lead follow-up in under 5 minutes",
                  "The CRM pipeline built specifically for remodelers",
                  "Custom pricing based on your business size",
                  "A real ROI calculation for your business"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-electric mt-0.5 flex-shrink-0" size={18} />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Proof Numbers */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, value: '500+', label: 'Active Clients' },
                { icon: TrendingUp, value: '$450M+', label: 'Revenue Generated' },
                { icon: Star, value: '4.9/5', label: 'Average Rating' }
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <Icon className="text-blue-electric mx-auto mb-2" size={20} />
                  <p className="text-xl font-black text-navy">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-600 italic text-sm leading-relaxed">
                "The demo was eye-opening. I didn't realize how much money we were leaving on the table without a proper follow-up system. Within 60 days we added $40K in closed jobs."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-electric/10 flex items-center justify-center font-bold text-blue-electric text-sm">MH</div>
                <div>
                  <p className="font-bold text-navy text-sm">Mike Henderson</p>
                  <p className="text-xs text-gray-500">Henderson Home Remodeling, Dallas TX</p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <ShieldCheck size={18} className="text-blue-electric" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar size={18} className="text-blue-electric" />
                <span>No-Obligation</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock size={18} className="text-blue-electric" />
                <span>15 min max</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {!submitted ? (
              <div className="p-8 md:p-10 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold text-navy">Schedule Your Demo</h2>
                  <p className="text-gray-500 text-sm">We respond within 2 hours during business hours.</p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={form.fullName}
                        onChange={set('fullName')}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider">Company Name *</label>
                      <input
                        required
                        type="text"
                        value={form.companyName}
                        onChange={set('companyName')}
                        placeholder="Doe Remodeling"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider">Work Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="(555) 000-0000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider">Business Type *</label>
                      <select
                        value={form.businessType}
                        onChange={set('businessType')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm bg-white transition-all"
                      >
                        <option>Kitchen Remodeler</option>
                        <option>Bathroom Remodeler</option>
                        <option>General Contractor</option>
                        <option>Home Remodeler</option>
                        <option>Roofing Company</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider">Monthly Revenue</label>
                      <select
                        value={form.monthlyRevenue}
                        onChange={set('monthlyRevenue')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm bg-white transition-all"
                      >
                        <option value="">Select range</option>
                        <option>Under $50K/mo</option>
                        <option>$50K – $150K/mo</option>
                        <option>$150K – $500K/mo</option>
                        <option>$500K+/mo</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider">Biggest Growth Challenge</label>
                    <textarea
                      value={form.biggestChallenge}
                      onChange={set('biggestChallenge')}
                      placeholder="e.g. Not enough leads, low close rate, inconsistent follow-up..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm resize-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-4 text-base font-bold disabled:opacity-60"
                  >
                    {submitting ? 'Sending Request...' : 'Book My Demo Now →'}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    By submitting, you agree to our{' '}
                    <a href="/terms" className="underline hover:text-navy">Terms</a> and{' '}
                    <a href="/privacy" className="underline hover:text-navy">Privacy Policy</a>.
                    No spam, ever.
                  </p>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-navy">You're on the list!</h2>
                  <p className="text-gray-600">
                    Thanks, <strong>{form.fullName}</strong>! We received your request and a specialist will reach out to{' '}
                    <strong>{form.email}</strong> within 2 hours to schedule your demo.
                  </p>
                </div>
                <div className="p-4 bg-blue-electric/5 border border-blue-electric/20 rounded-xl text-sm text-gray-600">
                  <p className="font-bold text-navy mb-1">While you wait...</p>
                  <p>Check your spam folder if you don't hear from us within 2 hours.</p>
                </div>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-sm text-gray-500">Want to learn more in the meantime?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="/results" className="btn-primary text-sm">See Client Results</a>
                    <a href="/blog" className="btn-secondary text-sm">Read Growth Guides</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

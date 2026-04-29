import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, ChevronRight, ShieldCheck, Zap, TrendingUp, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    revenue: 'Under $10K',
    subject: 'General Inquiry',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Lead Routing Logic
      const isHighValue = formData.revenue === '$50K–$100K' || formData.revenue === '$100K+';
      
      await addDoc(collection(db, 'contactSubmissions'), {
        ...formData,
        type: 'contact_form',
        isHighValue,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        revenue: 'Under $10K',
        subject: 'General Inquiry',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>Contact ClosePro Remodel | Book Demo or Get Support</title>
        <meta name="description" content="Contact ClosePro Remodel to learn how to generate more leads, improve follow-up, and close more remodeling jobs. Book a demo or send us a message." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-navy text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-electric rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-electric rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-7xl font-black leading-tight">
              Let’s Help You <br />
              <span className="text-blue-electric">Close More Remodel Jobs</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Whether you want more leads, better follow-up, or higher close rates — our team is here to help.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30 inline-block">
              Book My Demo
            </Link>
            <a href="#contact-form" className="px-12 py-6 text-2xl font-bold border-2 border-white text-white rounded-xl hover:bg-white hover:text-navy transition-all inline-block">
              Send a Message
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest pt-12 border-t border-white/10"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-electric" size={20} />
              <span>Built for Remodelers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-blue-electric" size={20} />
              <span>Fast Setup (24–48 Hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-electric" size={20} />
              <span>No Tech Skills Needed</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prioritize Demo Section */}
      <section className="py-20 bg-blue-electric/5">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-widest">
            <Zap size={16} /> Fastest Path to Growth
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-navy">Want a Faster Walkthrough?</h2>
          <p className="text-xl text-gray-600">
            The fastest way to see how ClosePro works is to book a live demo. We'll show you exactly how to automate your sales process.
          </p>
          <div className="pt-4">
            <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30 inline-block">
              Book My Demo Now
            </Link>
          </div>
          
          {/* Calendar Placeholder */}
          <div className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 aspect-video flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-blue-electric/10 text-blue-electric flex items-center justify-center">
              <ChevronRight size={40} />
            </div>
            <p className="text-gray-400 font-medium italic">Live Calendar Integration Loading...</p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section id="contact-form" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          {/* Contact Info & Trust */}
          <div className="space-y-16">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-navy">Contact Information</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Prefer a faster response? <Link to="/book-demo" className="text-blue-electric font-bold underline">Book a demo above</Link>. Otherwise, our team is ready to help you with any questions.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center flex-shrink-0 group-hover:bg-blue-electric group-hover:text-white transition-colors">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1 text-xl">Email Us</h4>
                  <p className="text-gray-600 text-lg">support@closeproremodel.com</p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center flex-shrink-0 group-hover:bg-blue-electric group-hover:text-white transition-colors">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1 text-xl">Call Us</h4>
                  <p className="text-gray-600 text-lg">(800) 555-0123</p>
                  <p className="text-sm text-gray-400 font-medium">Mon–Fri | 9am–6pm EST</p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center flex-shrink-0 group-hover:bg-blue-electric group-hover:text-white transition-colors">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-1 text-xl">Office</h4>
                  <p className="text-gray-600 text-lg">Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Live Chat Section */}
            <div className="p-10 bg-navy rounded-[2rem] text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/10 rounded-full blur-3xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-blue-electric" size={32} />
                  <h3 className="text-2xl font-bold">Need a Quick Answer?</h3>
                </div>
                <p className="text-gray-400 text-lg">
                  Our team is available via live chat during business hours to answer your questions instantly.
                </p>
              </div>
              <button className="btn-primary w-full py-5 text-xl shadow-xl shadow-blue-electric/20 relative z-10">
                Start Live Chat
              </button>
            </div>

            {/* Trust Section */}
            <div className="pt-12 border-t border-gray-100 space-y-8">
              <h3 className="text-2xl font-bold text-navy">Trusted by Remodelers Nationwide</h3>
              <div className="flex gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={24} />)}
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-gray-600 italic font-medium">"Best investment I’ve made in 10 years."</p>
                  <p className="text-sm font-bold text-navy">— Jim P., Bathroom Contractor</p>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 italic font-medium">"Our close rate doubled."</p>
                  <p className="text-sm font-bold text-navy">— Kelly R., Kitchen Remodeling</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-electric/5 rounded-full blur-2xl"></div>
            <h3 className="text-3xl font-black text-navy mb-10">Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">First Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all" 
                    placeholder="John"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">Last Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all" 
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all" 
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all" 
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">Company Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all" 
                    placeholder="Remodel Pro Inc."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-navy uppercase tracking-widest">Monthly Revenue</label>
                  <select 
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all bg-white"
                  >
                    <option>Under $10K</option>
                    <option>$10K–$50K</option>
                    <option>$50K–$100K</option>
                    <option>$100K+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-widest">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all bg-white"
                >
                  <option>General Inquiry</option>
                  <option>Sales Question</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-widest">Message</label>
                <textarea 
                  required
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 outline-none focus:border-blue-electric focus:ring-4 focus:ring-blue-electric/10 transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <div className="space-y-4">
                <button 
                  disabled={status === 'submitting'}
                  className={`btn-primary w-full py-6 text-2xl shadow-2xl shadow-blue-electric/30 ${status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {status === 'submitting' ? 'Sending...' : 'Request Info'}
                </button>
                <p className="text-center text-gray-400 text-sm font-medium">
                  We typically respond within 24 hours.
                </p>
              </div>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-center font-bold"
                  >
                    Message sent successfully! We'll be in touch soon.
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-center font-bold"
                  >
                    Something went wrong. Please try again or email us directly.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </section>

      {/* Objection Handling Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-gray-100 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-navy leading-tight">
                Not Sure If This Is Right For You?
              </h2>
              <div className="space-y-6">
                <p className="text-xl text-gray-600 font-bold">If you're wondering:</p>
                <ul className="space-y-4">
                  {[
                    "Will this actually help me get more jobs?",
                    "Is this complicated to set up?",
                    "Will this work for my business?"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 text-lg">
                      <CheckCircle2 className="text-blue-electric shrink-0 mt-1" size={20} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-lg text-gray-600 leading-relaxed">
                  The answer is <span className="text-blue-electric font-black">yes</span> — and we’ll walk you through everything step by step.
                </p>
              </div>
            </div>
            <div className="text-center space-y-8">
              <div className="w-24 h-24 rounded-full bg-blue-electric/10 text-blue-electric flex items-center justify-center mx-auto">
                <ShieldCheck size={48} />
              </div>
              <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30 inline-block">
                Book My Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-navy text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-electric/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Ready To See How This Works?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Book a demo and we’ll show you exactly how to generate more leads and close more jobs.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30 inline-block">
              Book My Demo Now
            </Link>
            <p className="text-blue-electric font-black uppercase tracking-widest text-sm">
              Limited onboarding spots available this month
            </p>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Link to="/book-demo" className="bg-blue-electric text-white px-8 py-4 rounded-full font-black shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group">
              Book Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

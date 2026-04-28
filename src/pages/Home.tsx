import { motion, AnimatePresence, useInView } from 'motion/react';
import { ChevronRight, Star, CheckCircle2, ArrowRight, Zap, BarChart3, Users, Layout as LayoutIcon, MessageSquare, FileText, X, Phone, ArrowUpRight, TrendingUp, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../lib/tracking';

// ── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = to / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  '⚡ Kitchen Remodeling Leads', '🏆 $50K Jobs Closed', '🤖 AI Visualizer', '📈 Close Rate +40%',
  '🔥 Automated Follow-Up', '💰 $142K Monthly Revenue', '⭐ 4.9 Star Rating', '🏗️ General Contractors',
  '🛁 Bathroom Remodelers', '📊 CRM Built for Remodelers', '✅ 500+ Active Clients', '🚀 Scale to $5M+'
];

function Marquee() {
  return (
    <div className="overflow-hidden bg-blue-electric py-3 relative">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-white font-bold text-sm tracking-wide">{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [sliderValue, setSliderValue] = useState(50);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('exit-popup-shown')) {
        setShowExitPopup(true);
        localStorage.setItem('exit-popup-shown', 'true');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <div className="overflow-hidden">
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "Organization",
        "name": "ClosePro Remodel", "url": "https://closeproremodel.com",
        "description": "High-converting growth platform for kitchen and bathroom remodelers.",
      })}</script>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-electric/20 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-electric/10 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/3 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-electric/20 border border-blue-electric/30 text-blue-electric text-sm font-bold">
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Zap size={14} fill="currentColor" />
              </motion.span>
              #1 Growth Platform for Remodelers
            </motion.div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Land More{' '}
              <span className="relative inline-block">
                <span className="text-blue-electric">$10K–$50K</span>
                <motion.span
                  animate={{ scaleX: [0, 1] }} transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-electric/40 rounded-full origin-left block" />
              </span>
              {' '}Remodel Jobs — Without Chasing Leads
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-xl">
              ClosePro Remodel is the all-in-one CRM, AI visualizer, and automation platform built exclusively for kitchen & bathroom remodelers. Stop relying on referrals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book-demo"
                onClick={() => trackEvent('hero_cta_click')}
                className="group relative overflow-hidden bg-blue-electric text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-blue-electric/40 hover:shadow-blue-electric/60 transition-all hover:scale-105 active:scale-95">
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  👉
                </motion.span>
                Book My Free Demo
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/how-it-works"
                className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/40 transition-all">
                See How It Works
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-5 pt-2">
              {[
                { icon: '✅', text: 'No contracts required' },
                { icon: '⚡', text: 'Live in 7 days' },
                { icon: '🔒', text: 'Cancel anytime' }
              ].map((t, i) => (
                <span key={i} className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <span>{t.icon}</span> {t.text}
                </span>
              ))}
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '500', suffix: '+', label: 'Active Clients' },
                { value: '450', prefix: '$', suffix: 'M+', label: 'Revenue Generated' },
                { value: '4.9', suffix: '/5', label: 'Average Rating' }
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-black text-white">
                    {s.prefix}<Counter to={parseFloat(s.value)} />{s.suffix}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero right — dashboard preview */}
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }} className="relative">
            {/* Floating badges */}
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 z-20 bg-green-500 text-white px-4 py-2 rounded-xl shadow-2xl shadow-green-500/40 font-bold text-sm flex items-center gap-2">
              <TrendingUp size={16} /> +34% Close Rate
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -right-4 z-20 bg-white text-navy px-4 py-2 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2">
              <Zap size={16} className="text-blue-electric" fill="currentColor" /> New Lead — $28K Kitchen
            </motion.div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-1/2 -right-8 z-20 bg-blue-electric text-white px-3 py-2 rounded-xl shadow-xl font-bold text-xs">
              🤖 AI Sent Follow-up
            </motion.div>

            <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm p-2">
              <img src="https://picsum.photos/seed/remodel-dashboard/900/700" alt="ClosePro Dashboard"
                className="w-full rounded-2xl" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent rounded-3xl pointer-events-none" />
            </div>
            {/* Glow */}
            <div className="absolute inset-0 bg-blue-electric/10 blur-3xl rounded-full scale-75 -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── STATS BANNER ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: '+', label: 'Active Remodelers', icon: Users, color: 'text-blue-electric', bg: 'bg-blue-electric/10' },
              { value: 12000, suffix: '+', label: 'Jobs Closed', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
              { prefix: '$', value: 450, suffix: 'M+', label: 'Revenue Generated', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
              { value: 97, suffix: '%', label: 'Client Satisfaction', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map(({ value, suffix, prefix, label, icon: Icon, color, bg }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center space-y-3">
                <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mx-auto shadow-sm`}>
                  <Icon size={24} />
                </div>
                <p className={`text-4xl font-black ${color}`}>
                  <Counter to={value} prefix={prefix || ''} suffix={suffix} />
                </p>
                <p className="text-gray-500 font-medium text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-bold uppercase tracking-wider">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">The "Old Way" is Costing You Jobs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Stop losing $50K jobs to contractors with better systems.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '👻', title: 'Ghosted Estimates', desc: 'Sending detailed estimates and never hearing back from the customer.', color: 'border-red-100 hover:border-red-300' },
              { emoji: '🕳️', title: 'Leads Slipping Away', desc: 'Forgetting to follow up with leads that aren\'t ready to buy today.', color: 'border-orange-100 hover:border-orange-300' },
              { emoji: '🤷', title: 'Visualization Gap', desc: 'Customers can\'t see the vision, leading to hesitation and "let me think about it".', color: 'border-yellow-100 hover:border-yellow-300' },
              { emoji: '🔁', title: 'Inconsistent Follow-up', desc: 'No automated system to keep your brand top-of-mind during the decision process.', color: 'border-red-100 hover:border-red-300' },
              { emoji: '📞', title: 'Referral Dependency', desc: 'Waiting for the phone to ring instead of having a predictable lead system.', color: 'border-orange-100 hover:border-orange-300' },
              { emoji: '📋', title: 'Messy Sales Process', desc: 'Tracking jobs on whiteboards or spreadsheets instead of a professional CRM.', color: 'border-yellow-100 hover:border-yellow-300' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`bg-white p-8 rounded-2xl border-2 ${item.color} shadow-sm hover:shadow-lg transition-all duration-300`}>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Arrow pointing down */}
          <div className="text-center mt-12">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex flex-col items-center gap-2 text-gray-400 font-bold text-sm">
              <span>There's a better way</span>
              <span className="text-2xl">↓</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION FEATURES ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-electric/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-wider">
              The Solution
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-navy">Everything You Need to Close More Jobs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">One platform. Every tool a remodeler needs to grow.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'AI Remodel Visualizer', desc: 'Show customers their dream kitchen or bath in seconds. Close deals on the first visit.', result: 'Close rate +40%', color: 'from-blue-500 to-blue-electric', bg: 'bg-blue-50', text: 'text-blue-electric' },
              { icon: LayoutIcon, title: 'Lead Capture Website', desc: 'High-converting site optimized to turn visitors into demo bookings automatically.', result: 'Leads +3x', color: 'from-purple-500 to-purple-700', bg: 'bg-purple-50', text: 'text-purple-600' },
              { icon: BarChart3, title: 'CRM Pipeline', desc: 'Track every lead from initial contact to signed contract. Never lose a deal again.', result: 'Zero lost leads', color: 'from-green-500 to-green-700', bg: 'bg-green-50', text: 'text-green-600' },
              { icon: MessageSquare, title: 'Automated Follow-Ups', desc: 'Auto SMS and email sequences that nurture leads until they\'re ready to sign.', result: 'Response in 60s', color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
              { icon: FileText, title: 'Estimates & Invoices', desc: 'Professional estimates that get approved faster and invoices that get paid on time.', result: 'Paid 2x faster', color: 'from-teal-400 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-600' },
              { icon: Users, title: 'Demo Booking Tools', desc: 'Let customers book consultations directly to your calendar while you sleep.', result: 'More demos booked', color: 'from-pink-400 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' },
            ].map((feature, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
                <div className={`w-14 h-14 ${feature.bg} ${feature.text} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{feature.desc}</p>
                <div className={`inline-flex items-center gap-1.5 ${feature.text} font-bold text-xs bg-opacity-10 ${feature.bg} px-3 py-1.5 rounded-full`}>
                  <CheckCircle2 size={13} /> {feature.result}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI VISUALIZER SPOTLIGHT ───────────────────────────────────────────── */}
      <section className="section-padding bg-navy text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-blue-electric/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-electric/20 border border-blue-electric/30 text-blue-electric rounded-full text-sm font-bold mb-6">
                <Zap size={14} fill="currentColor" /> THE GAME CHANGER
              </span>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Show Them Their Dream Home <span className="text-blue-electric">Before</span> They Sign
              </h2>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                The biggest hurdle in remodeling is the "Visualization Gap." Our AI tool instantly generates a stunning remodel visualization from a photo of the client's current space.
              </p>
              <ul className="space-y-4 mb-10">
                {['Reduce sales friction and hesitation instantly', 'Build confidence in high-ticket $30K+ projects', 'Stand out from every other contractor in your market', 'Close deals on the first or second visit consistently'].map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-gray-200">
                    <span className="w-6 h-6 bg-blue-electric rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-white" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              <Link to="/book-demo" className="inline-flex items-center gap-2 bg-blue-electric text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-electric/90 hover:scale-105 transition-all shadow-xl shadow-blue-electric/30">
                👉 See It Live <ChevronRight size={20} />
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative">
            <div className="rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-white/5 p-1">
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img src="https://picsum.photos/seed/kitchen-before/800/800" alt="Before"
                  className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderValue}%)` }}>
                  <img src="https://picsum.photos/seed/kitchen-after/800/800" alt="After"
                    className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl z-20" style={{ left: `${sliderValue}%` }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
                    <div className="flex gap-1"><div className="w-1 h-5 bg-blue-electric rounded-full" /><div className="w-1 h-5 bg-blue-electric rounded-full" /></div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-widest">Before</div>
                <div className="absolute top-4 right-4 bg-blue-electric/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-widest">After (AI)</div>
                <input type="range" min="0" max="100" value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
              </div>
            </div>
            <p className="text-center text-gray-400 mt-4 text-sm italic">← Drag to see the AI transformation</p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-bold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">Up and Running in 4 Steps</h2>
            <p className="text-xl text-gray-500">No tech skills required. We set everything up for you.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-electric/20 via-blue-electric to-blue-electric/20 z-0" />
            {[
              { step: '01', title: 'Quick Setup', desc: 'We build your custom CRM, lead capture site, and AI tools — done in 7 days.', color: 'border-blue-electric bg-blue-electric text-white', icon: '🔧' },
              { step: '02', title: 'Capture Leads', desc: 'High-quality leads flow directly into your automated pipeline 24/7.', color: 'border-purple-500 bg-purple-500 text-white', icon: '🎯' },
              { step: '03', title: 'AI Visualization', desc: 'Show customers their dream remodel during consultations. Close on the spot.', color: 'border-green-500 bg-green-500 text-white', icon: '🤖' },
              { step: '04', title: 'Close & Scale', desc: 'Automated follow-ups ensure you win more $10K–$50K jobs every month.', color: 'border-orange-400 bg-orange-400 text-white', icon: '💰' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative z-10 text-center space-y-4">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl border-4 ${item.color} flex flex-col items-center justify-center mx-auto shadow-xl text-2xl`}>
                  {item.icon}
                </motion.div>
                <div className="font-black text-4xl text-gray-100">{item.step}</div>
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-blue-electric font-bold text-lg hover:gap-4 transition-all">
              See Full Walkthrough <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BANNER ───────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-r from-navy via-blue-900 to-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.15),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '< 60s', label: 'Auto Lead Response', icon: '⚡' },
              { value: '+40%', label: 'Avg Close Rate Lift', icon: '📈' },
              { value: '$28K', label: 'Avg Job Value Closed', icon: '💰' },
              { value: '7 Days', label: 'To Go Live', icon: '🚀' }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="space-y-2">
                <div className="text-3xl">{s.icon}</div>
                <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
                <p className="text-gray-400 text-sm font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Chart card */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative">
            <div className="absolute -top-5 -left-5 bg-blue-electric text-white px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg z-10">
              📊 Example Client Results
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-electric/5 rounded-full -mr-20 -mt-20" />
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Monthly Revenue</p>
                  <p className="text-5xl font-black text-navy">$142,500</p>
                </div>
                <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
                  <TrendingUp size={14} /> +34%
                </span>
              </div>
              <div className="h-48 flex items-end gap-2 mb-6">
                {[40, 60, 45, 70, 85, 65, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t-lg relative">
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-electric to-blue-electric/70 rounded-t-lg" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[{ label: 'New Leads', value: '48' }, { label: 'Demos Booked', value: '22' }, { label: 'Jobs Closed', value: '9' }].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-black text-navy">{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-8">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-bold uppercase tracking-wider">Real Results</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">Focus on Business Outcomes, Not Just Features</h2>
            <p className="text-xl text-gray-500 leading-relaxed">Our platform isn't just tools — it's the results that matter to your bottom line.</p>
            <div className="space-y-6">
              {[
                { icon: TrendingUp, title: 'Close More High-Ticket Jobs', desc: 'Increase your average project value by building trust with AI visuals.', color: 'bg-blue-electric text-white', glow: 'shadow-blue-electric/30' },
                { icon: Clock, title: 'Respond to Leads in Under 60 Seconds', desc: 'Automated speed-to-lead ensures you\'re first — every single time.', color: 'bg-green-500 text-white', glow: 'shadow-green-500/30' },
                { icon: MessageSquare, title: 'Stop Losing Deals to Poor Follow-Up', desc: 'Our automation keeps you top-of-mind until they\'re ready to sign.', color: 'bg-purple-500 text-white', glow: 'shadow-purple-500/30' },
                { icon: Shield, title: 'Look Like the Premium Contractor', desc: 'A high-end sales system that positions you above all competition.', color: 'bg-orange-500 text-white', glow: 'shadow-orange-500/30' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg ${item.glow} group-hover:scale-110 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-bold uppercase tracking-wider">Who It's For</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">Built for Your Trade</h2>
            <p className="text-xl text-gray-500">Specialized tools for every type of remodeling professional.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🍳', title: 'Kitchen Remodelers', href: '/kitchen-remodeling-leads', desc: 'Show off high-end cabinetry, layout changes, and countertops with AI.', gradient: 'from-blue-electric to-blue-700' },
              { emoji: '🛁', title: 'Bathroom Remodelers', href: '/bathroom-remodeling-leads', desc: 'Help clients visualize tile, fixtures, and modern spa-inspired layouts.', gradient: 'from-purple-500 to-purple-700' },
              { emoji: '🏠', title: 'Home Remodelers', href: '/home-remodeling-leads', desc: 'Manage complex multi-room projects with a streamlined CRM system.', gradient: 'from-green-500 to-green-700' },
              { emoji: '🔨', title: 'General Contractors', href: '/general-contractor-crm', desc: 'Professionalize your entire sales process and win bigger bids.', gradient: 'from-orange-400 to-orange-600' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}>
                <Link to={item.href}
                  className="block group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
                  <div className="p-8 space-y-4">
                    <div className="text-4xl">{item.emoji}</div>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-navy group-hover:text-blue-electric transition-colors">{item.title}</h3>
                      <ArrowUpRight className="text-gray-300 group-hover:text-blue-electric transition-all group-hover:translate-x-1 group-hover:-translate-y-1 flex-shrink-0 mt-1" size={20} />
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    <span className="inline-block text-blue-electric font-bold text-sm border-b-2 border-blue-electric/20 group-hover:border-blue-electric transition-all pb-0.5">Learn More</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,144,255,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-bold uppercase tracking-wider mb-4">Client Results</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Remodelers. Real Revenue.</h2>
            <div className="flex justify-center text-yellow-400 gap-1">
              {[1,2,3,4,5].map((i) => <Star key={i} size={22} fill="currentColor" />)}
            </div>
            <p className="text-gray-400 text-sm mt-2 font-medium">4.9/5 from 200+ contractor reviews</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Mark Thompson', company: 'Thompson Kitchens', result: '25% Close Rate Increase', quote: 'ClosePro changed our business entirely. The AI visualizer alone has increased our close rate by 25% — clients can actually see the vision now.', avatar: 'MT', color: 'bg-blue-electric' },
              { name: 'Sarah Jenkins', company: 'Elite Bath & Spa', result: '$80K Job Closed', quote: 'The automated follow-up is a lifesaver. I closed an $80K bathroom remodel from a lead that went cold 3 weeks earlier. The system kept us top of mind.', avatar: 'SJ', color: 'bg-purple-500' },
              { name: 'David Rodriguez', company: 'DR Remodeling', result: '12 Jobs in 30 Days', quote: 'Finally a system that understands the remodeling industry. Booked 12 jobs in the first 30 days. Professional, fast, and it actually works.', avatar: 'DR', color: 'bg-green-500' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                <div className="absolute -top-4 right-6 bg-gradient-to-r from-blue-electric to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-wide">
                  ✅ {item.result}
                </div>
                <div className="flex text-yellow-400 gap-0.5 mb-5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-200 italic leading-relaxed mb-6 text-lg">"{item.quote}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center font-black text-white shadow-lg`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-blue-electric text-sm font-bold">{item.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/results" className="inline-flex items-center gap-2 text-blue-electric font-bold hover:gap-4 transition-all">
              See All Client Results <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-wider mb-4">Simple Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">Start for Less Than One Job</h2>
            <p className="text-xl text-gray-500">Plans starting at $97/month. One closed job pays for the whole year.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              { plan: 'Starter', price: '$97', color: 'border-gray-200', badge: '', features: ['Lead capture website', 'Basic CRM', 'Email follow-ups'] },
              { plan: 'Growth', price: '$197', color: 'border-blue-electric', badge: 'Most Popular', features: ['Everything in Starter', 'AI Visualizer', 'SMS automation', 'Pipeline tracking'] },
              { plan: 'Pro', price: '$497', color: 'border-purple-400', badge: 'Best Value', features: ['Everything in Growth', 'AI ad generator', 'Blog system', 'Priority support'] },
            ].map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative bg-white rounded-2xl p-6 border-2 ${tier.color} shadow-sm hover:shadow-lg transition-all`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white ${i === 1 ? 'bg-blue-electric' : 'bg-purple-500'} shadow-md`}>
                    {tier.badge}
                  </div>
                )}
                <p className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-1">{tier.plan}</p>
                <p className="text-4xl font-black text-navy mb-4">{tier.price}<span className="text-base font-normal text-gray-400">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/signup?plan=${tier.plan.toLowerCase()}`} className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${i === 1 ? 'bg-blue-electric text-white hover:bg-blue-700' : 'border-2 border-current text-navy hover:bg-navy hover:text-white'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
          <Link to="/pricing" className="inline-flex items-center gap-2 text-blue-electric font-bold hover:gap-4 transition-all">
            See Full Pricing Details <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-900 to-navy" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.3),transparent_70%)]" />
        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-electric/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-sm font-bold mb-6">
              🚀 Limited Spots This Month
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Start Closing{' '}
              <span className="text-blue-electric">High-Ticket</span>{' '}
              Remodel Jobs Today
            </h2>
            <p className="text-xl text-gray-300 mb-10">No more chasing leads. No more missed follow-ups. No more losing jobs to less qualified contractors.</p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {['More leads', 'Better close rates', 'Automated follow-up', 'AI visualization'].map((t, i) => (
                <span key={i} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-electric" /> {t}
                </span>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/book-demo"
                onClick={() => trackEvent('final_cta_click')}
                className="inline-flex items-center gap-3 bg-blue-electric text-white px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl shadow-blue-electric/50 hover:bg-blue-electric/90 transition-all">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>👉</motion.span>
                Book My Free Demo
                <ChevronRight size={28} />
              </Link>
            </motion.div>
            <p className="text-gray-400 text-sm mt-6">No credit card required · 15-minute demo · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know before booking your demo.</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'How fast can I get leads with ClosePro?', a: 'Most clients see their first qualified lead within 7 days of going live. Our automated speed-to-lead responds to every inquiry in under 60 seconds, which is the #1 factor in winning more jobs.' },
              { q: 'What is the best CRM for remodelers?', a: 'The best CRM for remodelers handles the unique long-cycle sales of high-ticket projects. ClosePro includes visual pipelines, automated follow-ups, and AI visualization built specifically for this industry.' },
              { q: 'How do I close $20K–$50K remodel jobs?', a: 'Closing high-ticket jobs requires building massive trust. Our AI visualizer helps clients see the vision instantly, while our automated follow-up keeps you top-of-mind throughout their decision process.' },
              { q: 'Do I need tech skills to use ClosePro?', a: 'Zero. We set everything up for you in 7 days or less. After that, everything is designed to be simple enough that you can use it between job sites from your phone.' },
              { q: 'What\'s included in the $97/month plan?', a: 'You get a high-converting lead capture website, basic CRM, and email follow-ups. Upgrade to Growth ($197) for the AI Visualizer, SMS automation, and pipeline tracking.' },
              { q: 'Why do remodeling leads not convert?', a: '80% of sales require 5–12 follow-ups, but most contractors stop after 2. Slow response times and inconsistent follow-up kill conversions. We automate the entire process so you never lose another lead.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-navy pr-4">{item.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className="text-blue-electric flex-shrink-0 text-2xl font-light leading-none">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXIT POPUP ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric to-purple-500" />
              <button onClick={() => setShowExitPopup(false)} className="absolute top-5 right-5 text-gray-300 hover:text-navy transition-colors">
                <X size={22} />
              </button>
              <div className="text-center space-y-6">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 bg-blue-electric rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-electric/30 text-4xl">
                  💰
                </motion.div>
                <h2 className="text-3xl font-black text-navy">Wait — Don't Leave Money on the Table</h2>
                <p className="text-gray-500 text-lg">Contractors using ClosePro close an average of <strong className="text-navy">3 extra $20K+ jobs per month.</strong> That's $60K you might be missing.</p>
                <Link to="/book-demo" onClick={() => { setShowExitPopup(false); trackEvent('exit_popup_cta_click'); }}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-electric/30">
                  👉 Book My Free Demo
                </Link>
                <button onClick={() => setShowExitPopup(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  No thanks, I have enough leads
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

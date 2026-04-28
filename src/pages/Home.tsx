import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Star, CheckCircle2, ArrowRight, Zap, BarChart3, Users, Layout as LayoutIcon, MessageSquare, FileText, X, Phone, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { trackEvent } from '../lib/tracking';

export default function Home() {
  const [sliderValue, setSliderValue] = useState(50);
  const [showExitPopup, setShowExitPopup] = useState(false);

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
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ClosePro Remodel",
          "url": "https://closeproremodel.com",
          "logo": "https://closeproremodel.com/logo.png",
          "description": "High-converting growth platform for kitchen and bathroom remodelers.",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Growth Way",
            "addressLocality": "Austin",
            "addressRegion": "TX",
            "postalCode": "78701",
            "addressCountry": "US"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-800-555-0123",
            "contactType": "sales"
          }
        })}
      </script>

      {/* SECTION 1 – HERO */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-electric/10 text-blue-electric text-sm font-bold">
              <Zap size={14} fill="currentColor" />
              <span>Built for Remodelers & Contractors</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-navy leading-[1.05] tracking-tight">
              We Help Kitchen & Bathroom Remodelers Land <span className="text-blue-electric">$10K–$50K Jobs</span> Consistently
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Close more remodeling jobs with AI visualizations, automated follow-ups, lead capture tools, and a system built specifically for remodelers and general contractors.
            </p>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/book-demo" 
                  className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-2 shadow-xl shadow-blue-electric/20"
                  onClick={() => trackEvent('hero_cta_click', { location: 'hero' })}
                >
                  👉 Book My Demo <ChevronRight size={20} />
                </Link>
                <Link to="/how-it-works" className="btn-secondary text-lg px-10 py-5 flex items-center justify-center">
                  See How It Works
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-navy/60">
                <span className="flex items-center gap-1">✔ No contracts required</span>
                <span className="flex items-center gap-1">✔ Built specifically for remodelers</span>
                <span className="flex items-center gap-1">✔ Start closing deals in 7 days</span>
              </div>
              
              {/* Trust Badges (Fix #11) */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-electric"></div>
                  <span className="text-xs font-bold text-navy uppercase tracking-widest">Built for Remodelers</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-electric"></div>
                  <span className="text-xs font-bold text-navy uppercase tracking-widest">CRM + AI Powered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-electric"></div>
                  <span className="text-xs font-bold text-navy uppercase tracking-widest">All-in-One System</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-navy/60">
                <span className="flex items-center gap-1">⭐ Trusted by Remodelers Nationwide</span>
                <span className="flex items-center gap-1 text-blue-electric">✔ Close $10K–$50K Jobs</span>
                <span className="flex items-center gap-1 text-blue-electric">✔ No More Lost Leads</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <img
                src="https://picsum.photos/seed/remodel-hero/1200/900"
                alt="Kitchen Remodel Transformation"
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                  <p className="text-[10px] font-bold text-blue-electric uppercase tracking-widest mb-1">AI Visualization</p>
                  <p className="text-sm font-bold text-navy">Modern Kitchen Remodel</p>
                </div>
                <div className="bg-blue-electric text-white p-3 rounded-full shadow-lg">
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-electric/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-navy/10 rounded-full blur-3xl -z-0"></div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 – TRUST / CREDIBILITY BAR */}
      <section className="py-12 bg-navy text-white overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-80">
            <div className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="text-blue-electric" />
              <span>Built for Remodelers</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="text-blue-electric" />
              <span>Close More Jobs</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="text-blue-electric" />
              <span>Save Time on Follow-up</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <CheckCircle2 className="text-blue-electric" />
              <span>Professional Sales Process</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 – PROBLEM / PAIN POINTS */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">The "Old Way" of Selling Remodels is Broken</h2>
          <p className="text-xl text-gray-600">Stop letting high-ticket jobs slip through your fingers because of outdated systems.</p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            { title: "Ghosted Estimates", desc: "Sending detailed estimates but never hearing back from the customer." },
            { title: "Leads Slipping Away", desc: "Forgetting to follow up with leads that aren't ready to buy today." },
            { title: "Visualization Gap", desc: "Customers can't see the vision, leading to hesitation and 'let me think about it'." },
            { title: "Inconsistent Follow-up", desc: "No automated system to keep your brand top-of-mind during the decision process." },
            { title: "Referral Dependency", desc: "Waiting for the phone to ring instead of having a predictable lead system." },
            { title: "Messy Sales Process", desc: "Tracking jobs on whiteboards or spreadsheets instead of a professional CRM." },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-10 rounded-3xl bg-gray-50 border border-gray-100 space-y-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                <X size={28} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-navy">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 – SOLUTION OVERVIEW */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-navy tracking-tight">Everything You Need to Close More Remodel Jobs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">A complete sales and marketing engine designed specifically for the remodeling industry.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, benefit: "Close deals faster by showing the vision", title: "AI Remodel Visualizer", desc: "Show customers their future kitchen or bathroom in seconds using AI.", result: "👉 Close deals on the first visit" },
              { icon: <LayoutIcon />, benefit: "Turn visitors into demo bookings", title: "Lead Capture Website", desc: "A high-converting site optimized to turn visitors into demo bookings.", result: "👉 Turn traffic into high-ticket leads" },
              { icon: <BarChart3 />, benefit: "Track every lead to the finish line", title: "CRM Pipeline", desc: "Track every lead from initial contact to signed contract in one place.", result: "👉 Never lose a lead again" },
              { icon: <MessageSquare />, benefit: "Never miss a lead again", title: "Automated Follow-Ups", desc: "Never lose a lead again with automated SMS and email nurturing.", result: "👉 Speed-to-lead in under 60 seconds" },
              { icon: <FileText />, benefit: "Professionalize your bidding", title: "Estimate & Invoice System", desc: "Professional estimates and invoices that get paid faster.", result: "👉 Get paid 2x faster" },
              { icon: <Users />, benefit: "Automate your calendar", title: "Demo Booking Tools", desc: "Let customers book consultations directly on your calendar.", result: "👉 Book demos while you sleep" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="card group border-2 border-transparent hover:border-blue-electric/20"
              >
                <p className="text-blue-electric font-bold text-xs uppercase tracking-widest mb-4">{feature.benefit}</p>
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center mb-6 group-hover:bg-blue-electric group-hover:text-white transition-all shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.desc}</p>
                <p className="text-blue-electric font-bold text-sm mb-8">{feature.result}</p>
                <Link to="/features" className="text-blue-electric font-bold flex items-center gap-2 hover:gap-3 transition-all group-hover:text-navy">
                  Learn More <ArrowRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 – AI REMODEL VISUALIZER SPOTLIGHT */}
      <section className="section-padding bg-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-block px-4 py-1 rounded-full bg-blue-electric/20 text-blue-electric font-bold text-sm">
              THE GAME CHANGER
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-[1.1]">
              Show Them Their Dream Home <span className="text-blue-electric">Before</span> They Sign
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              The biggest hurdle in remodeling is the "Visualization Gap". Our AI tool lets you take a photo of a client's current space and instantly generate a stunning remodel visualization.
            </p>
            <ul className="space-y-5">
              {[
                "Reduce sales friction and hesitation",
                "Increase confidence in high-ticket projects",
                "Stand out from every other contractor",
                "Close deals on the first or second visit"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg">
                  <div className="bg-blue-electric rounded-full p-1">
                    <CheckCircle2 className="text-white" size={18} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link to="/book-demo" className="btn-primary inline-flex items-center gap-2 px-10 py-5 text-xl">
                👉 Book My Demo <ChevronRight size={24} />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border-8 border-white/5 shadow-2xl bg-white/5 p-2">
              <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl">
                {/* Before Image */}
                <img
                  src="https://picsum.photos/seed/kitchen-before/800/800"
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* After Image (Clipped) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 0 0 ${sliderValue}%)` }}
                >
                  <img
                    src="https://picsum.photos/seed/kitchen-after/800/800"
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Slider Handle */}
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-xl cursor-ew-resize z-20"
                  style={{ left: `${sliderValue}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-blue-electric rounded-full"></div>
                      <div className="w-1 h-4 bg-blue-electric rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-6 left-6 bg-navy/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase">Before</div>
                <div className="absolute top-6 right-6 bg-blue-electric/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase">After (AI)</div>
                {/* Invisible Range Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            </div>
            <p className="text-center text-gray-400 mt-6 text-sm font-medium italic">Drag the slider to see the AI transformation</p>
          </div>
        </div>
      </section>

      {/* SECTION 6 – HOW IT WORKS */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">Your Path to More Signed Contracts</h2>
            <p className="text-xl text-gray-600">Four simple steps to professionalize your sales and grow your business.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative mb-16">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-1 bg-gray-100 -z-0"></div>

            {[
              { step: "01", title: "System Setup", desc: "We set up your custom CRM, lead capture site, and AI tools." },
              { step: "02", title: "Capture Leads", desc: "High-quality leads flow directly into your automated pipeline." },
              { step: "03", title: "AI Visualization", desc: "Show customers their dream remodel during the consultation." },
              { step: "04", title: "Close & Grow", desc: "Automated follow-ups ensure you win more $10K–$50K jobs." },
            ].map((item, i) => (
              <div key={i} className="relative z-10 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-electric text-blue-electric flex items-center justify-center mx-auto text-3xl font-bold shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-navy">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/how-it-works" className="text-blue-electric font-bold text-xl flex items-center justify-center gap-2 hover:gap-4 transition-all">
              See How It Works <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7 – RESULTS / OUTCOMES */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-4 -left-4 bg-blue-electric text-white px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest z-20 shadow-lg">
              Example Contractor Results
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/5 rounded-full -mr-16 -mt-16"></div>
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Monthly Revenue</p>
                  <p className="text-5xl font-bold text-navy">$142,500</p>
                </div>
                <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                  <Zap size={14} fill="currentColor" /> +34%
                </div>
              </div>
              <div className="h-56 flex items-end gap-3 relative z-10">
                {[40, 60, 45, 70, 85, 65, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-electric/10 rounded-t-xl relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="absolute bottom-0 left-0 right-0 bg-blue-electric rounded-t-xl transition-all group-hover:bg-navy"
                    ></motion.div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100 relative z-10">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Leads</p>
                  <p className="text-2xl font-bold text-navy">48</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Demos</p>
                  <p className="text-2xl font-bold text-navy">22</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2 font-bold uppercase">Closed</p>
                  <p className="text-2xl font-bold text-navy">9</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-10 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight tracking-tight">Focus on Business Outcomes, Not Just Software Features</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our platform isn't just about "tools"—it's about the results that matter to your bottom line.
            </p>
            <div className="space-y-8">
              {[
                { title: "Close More High-Ticket Jobs", desc: "Increase your average project value by building more trust with AI visuals." },
                { title: "Respond to Leads Faster", desc: "Automated speed-to-lead ensures you're the first one they talk to, every time." },
                { title: "Stop Losing Deals From Poor Follow-Up", desc: "Our automation keeps you top-of-mind until they're ready to sign." },
                { title: "Build Professional Authority", desc: "Look like the premium contractor you are with a high-end sales system." },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-electric text-white flex items-center justify-center mt-1 shadow-lg shadow-blue-electric/30 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-navy mb-1">{item.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 – WHO IT’S FOR (SEO FOCUS) */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">Tailored for the Remodeling Industry</h2>
            <p className="text-xl text-gray-600">Specialized solutions for every type of remodeling professional.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Kitchen Remodelers", href: "/kitchen-remodeling-leads", desc: "Show off high-end cabinetry and layout changes with AI." },
              { title: "Bathroom Remodelers", href: "/bathroom-remodeling-leads", desc: "Help clients visualize tile, fixtures, and modern spa layouts." },
              { title: "Home Remodelers", href: "/home-remodeling-leads", desc: "Manage complex multi-room projects with a streamlined CRM." },
              { title: "General Contractors", href: "/general-contractor-crm", desc: "Professionalize your entire sales process and win bigger bids." },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className="p-10 rounded-3xl bg-gray-50 border-2 border-transparent hover:border-blue-electric hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-navy group-hover:text-blue-electric transition-colors">{item.title}</h3>
                  <ArrowUpRight className="text-gray-300 group-hover:text-blue-electric group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                <span className="text-blue-electric font-bold text-sm uppercase tracking-widest border-b-2 border-blue-electric/20 group-hover:border-blue-electric transition-all pb-1">Learn More</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 – TESTIMONIALS */}
      <section className="section-padding bg-navy text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Clients Are Saying</h2>
            <div className="flex justify-center text-yellow-400 gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={24} fill="currentColor" />)}
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Real Results from Real Contractors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Mark Thompson", company: "Thompson Kitchens", result: "25% Close Rate Increase", quote: "ClosePro changed our business. The AI visualizer alone has increased our close rate by 25%." },
              { name: "Sarah Jenkins", company: "Elite Bath & Spa", result: "$80K Job Closed", quote: "The automated follow-up is a lifesaver. I don't have to worry about leads falling through the cracks anymore." },
              { name: "David Rodriguez", company: "DR Remodeling", result: "Booked 12 Jobs in 30 Days", quote: "Finally, a system that actually understands the remodeling industry. It's professional, fast, and it works." },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 p-10 rounded-3xl border border-white/10 space-y-8 relative group hover:bg-white/10 transition-all">
                {item.result && (
                  <div className="absolute -top-4 right-8 bg-blue-electric text-white px-6 py-2 rounded-full text-sm font-black shadow-lg uppercase tracking-tight">
                    {item.result}
                  </div>
                )}
                <p className="text-2xl font-bold italic text-gray-200 leading-relaxed">"{item.quote}"</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden border-2 border-blue-electric/30">
                    <img src={`https://picsum.photos/seed/client${i}/100/100`} alt={item.name} referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <div>
                    <p className="font-black text-xl">{item.name}</p>
                    <p className="text-sm text-blue-electric font-black uppercase tracking-widest">{item.company}</p>
                  </div>
                </div>
                {/* Logo Placeholder */}
                <div className="pt-6 border-t border-white/5 flex justify-center opacity-30 grayscale group-hover:opacity-60 transition-all">
                  <div className="h-8 w-32 bg-white/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 – FINAL CTA */}
      <section className="section-padding bg-blue-electric text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-electric to-navy opacity-50"></div>
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Start Booking & Closing High-Ticket Remodel Jobs Consistently</h2>
          <p className="text-2xl font-bold text-white/90">No more chasing leads. No more missed follow-ups.</p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-lg font-bold">
            <span className="flex items-center gap-2"><CheckCircle2 size={20} /> More leads</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={20} /> Better close rates</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={20} /> Automated follow-up</span>
          </div>
          <div className="pt-4">
            <Link 
              to="/book-demo" 
              className="bg-white text-blue-electric px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-navy hover:text-white transition-all inline-block shadow-2xl hover:scale-105 active:scale-95"
              onClick={() => trackEvent('final_cta_click', { location: 'footer_section' })}
            >
              👉 Book My Demo Now
            </Link>
          </div>
          <p className="text-sm text-white/70 font-medium">No credit card required. See the platform in action in 15 minutes.</p>
        </div>
      </section>

      {/* SECTION 11 – FAQ (SEO GOLD) */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-navy">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about growing your remodeling business.</p>
          </div>
          <div className="space-y-8">
            {[
              { q: "How to get remodeling leads fast?", a: "The fastest way is to combine a high-converting landing page with automated speed-to-lead. Our system ensures you respond to every new lead in under 60 seconds, which is the #1 factor in closing more jobs." },
              { q: "How much should contractors spend on marketing?", a: "Most successful remodelers reinvest 5-10% of their revenue back into marketing. However, the key is efficiency. Our platform helps you lower your cost-per-lead by converting more of your existing traffic." },
              { q: "What is the best CRM for remodelers?", a: "The best CRM for remodelers is one that handles the unique long-cycle sales process of high-ticket projects. ClosePro includes visual pipelines, automated follow-ups, and AI visualization tools built specifically for this industry." },
              { q: "How do I close high-ticket remodel jobs?", a: "Closing $20K+ jobs requires building massive trust. Our AI visualizer helps clients see the vision instantly, while our automated follow-up ensures you stay top-of-mind throughout their decision-making process." },
              { q: "Why do remodeling leads not convert?", a: "Most leads fail to convert because of slow response times or lack of consistent follow-up. 80% of sales require 5-12 follow-ups, but most contractors stop after 2. We automate this entire process for you." },
              { q: "How do I get remodeling leads?", a: "We provide a high-converting website optimized for SEO and lead capture. Combined with our CRM and automated follow-up, we help you turn traffic into qualified demo bookings consistently." },
              { q: "What features are included?", a: "You get the AI visualizer, a custom lead capture website, our contractor CRM, automated SMS/email follow-ups, and an estimate/invoice system." },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-electric/30 transition-colors">
                <h4 className="font-bold text-navy text-xl mb-4">{item.q}</h4>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exit Intent Popup */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 relative overflow-hidden"
            >
              <button
                onClick={() => setShowExitPopup(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-navy transition-colors"
              >
                <X size={24} />
              </button>
              <div className="space-y-8 text-center">
                <div className="w-20 h-20 bg-blue-electric/10 text-blue-electric rounded-full flex items-center justify-center mx-auto">
                  <Zap size={40} fill="currentColor" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-navy">Before you go — want more remodeling jobs?</h2>
                  <p className="text-lg text-gray-600">
                    Want to see how many more remodel jobs you could be closing each month?
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/book-demo"
                    onClick={() => {
                      setShowExitPopup(false);
                      trackEvent('exit_popup_cta_click');
                    }}
                    className="btn-primary w-full py-5 text-xl shadow-xl shadow-blue-electric/20"
                  >
                    👉 Book Free Demo
                  </Link>
                </div>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="text-sm text-gray-400 hover:text-blue-electric transition-colors font-bold"
                >
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

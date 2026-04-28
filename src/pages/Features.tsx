import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Zap, 
  Layout as LayoutIcon, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Users, 
  Search, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  MousePointerClick,
  Star,
  Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Features() {
  const features = [
    {
      id: "visualizer",
      icon: <Zap size={32} />,
      name: "AI Remodel Visualizer",
      outcome: "Close Deals On The Spot With AI Visuals",
      explanation: "Show homeowners exactly what their remodel could look like before they commit, reduce hesitation, and close high-ticket jobs faster.",
      bullets: [
        "Turn room photos into remodel concepts in seconds",
        "Increase confidence in big-ticket projects",
        "Impress clients during the first consultation"
      ]
    },
    {
      id: "crm",
      icon: <BarChart3 size={32} />,
      name: "Contractor CRM",
      outcome: "Never Lose Another High-Value Lead",
      explanation: "Track every lead from first contact to signed contract using a pipeline built specifically for remodelers and contractors.",
      bullets: [
        "See exactly where every lead stands",
        "Prioritize the highest-value jobs",
        "Keep your team organized and accountable"
      ]
    },
    {
      id: "website",
      icon: <LayoutIcon size={32} />,
      name: "Lead Capture Website",
      outcome: "Get More High-Quality Leads Automatically",
      explanation: "A premium, high-converting website that helps remodelers look more professional, rank better, and generate more booked consultations.",
      bullets: [
        "Built to convert traffic into leads",
        "Mobile-first and SEO-friendly",
        "Designed to support demo bookings and form submissions"
      ]
    },
    {
      id: "automation",
      icon: <MessageSquare size={32} />,
      name: "Automated Follow-Ups",
      outcome: "Follow Up Before Your Competition Does",
      explanation: "Automatically send texts and emails the moment a lead comes in so you never lose deals from slow response times.",
      bullets: [
        "Instant lead response",
        "Automated nurture sequences",
        "Appointment reminders built in"
      ]
    },
    {
      id: "estimates",
      icon: <FileText size={32} />,
      name: "Estimates & Invoices",
      outcome: "Look More Professional And Close Faster",
      explanation: "Send branded estimates and invoices that create trust, reduce friction, and help clients move forward faster.",
      bullets: [
        "Digital signature support",
        "Branded PDF estimate exports",
        "Faster approvals and payment reminders"
      ]
    },
    {
      id: "booking",
      icon: <Users size={32} />,
      name: "Demo Booking Integration",
      outcome: "Fill Your Calendar Automatically",
      explanation: "Let homeowners and prospects book time directly based on your availability instead of going back and forth through calls and emails.",
      bullets: [
        "Real-time scheduling",
        "Booking confirmations",
        "Reduced no-shows with reminders"
      ]
    },
    {
      id: "seo",
      icon: <Search size={32} />,
      name: "SEO Foundation",
      outcome: "Rank Higher On Google And Generate More Free Leads",
      explanation: "We structure your site to help you show up for high-intent remodeling searches and attract leads from organic search.",
      bullets: [
        "Clean URL structure",
        "Schema markup support",
        "Keyword-optimized page structure"
      ]
    },
    {
      id: "reporting",
      icon: <Smartphone size={32} />,
      name: "Reporting Dashboard",
      outcome: "Know Exactly What’s Making You Money",
      explanation: "Track lead sources, booked appointments, conversions, and business performance from one clean dashboard.",
      bullets: [
        "Lead source tracking",
        "Conversion visibility",
        "Better decisions with real numbers"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "This system paid for itself with one extra job.",
      name: "Mike Thompson",
      company: "Thompson Kitchen & Bath",
      tag: "$80K Job Closed"
    },
    {
      quote: "The AI visualizer helped us close clients faster. They can finally see the vision.",
      name: "Sarah Jenkins",
      company: "Jenkins Design Build",
      tag: "25% Close Rate Increase"
    },
    {
      quote: "The follow-up automations keep us top-of-mind. We don't lose leads anymore.",
      name: "David Rodriguez",
      company: "Elite Home Remodeling",
      tag: "Faster Response, More Bookings"
    }
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>ClosePro Remodel Features | CRM, AI Visualizer, Lead Capture & Automation for Remodelers</title>
        <meta name="description" content="Explore ClosePro Remodel features including AI remodel visualizations, contractor CRM, lead capture websites, automated follow-ups, booking integration, reporting dashboards, and SEO tools built to help remodelers close more $10K–$50K jobs." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-navy text-white pt-32 pb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-electric/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            >
              Everything You Need to Consistently <span className="text-blue-electric">Close $10K–$50K</span> Remodeling Jobs
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              From lead capture to signed contracts, ClosePro Remodel helps kitchen remodelers, bathroom remodelers, home remodelers, and general contractors automate the entire sales process.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/book-demo" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
                Book Demo
              </Link>
              <Link to="/how-it-works" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto border border-white/10">
                See How It Works
              </Link>
            </motion.div>

            {/* Trust Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 mt-16"
            >
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                <ShieldCheck className="text-blue-electric" size={18} />
                <span>Built for Remodelers</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                <TrendingUp className="text-blue-electric" size={18} />
                <span>Close Deals Faster</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                <MousePointerClick className="text-blue-electric" size={18} />
                <span>No Tech Skills Needed</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                <Clock className="text-blue-electric" size={18} />
                <span>Works in 24 Hours</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                className="p-8 rounded-3xl bg-white border border-gray-100 flex flex-col h-full transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="space-y-4 flex-grow">
                  <div>
                    <p className="text-xs font-bold text-blue-electric uppercase tracking-wider mb-1">{feature.name}</p>
                    <h3 className="text-xl font-bold text-navy leading-tight">{feature.outcome}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.explanation}</p>
                  <ul className="space-y-3 pt-2">
                    {feature.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-navy font-medium">
                        <CheckCircle2 className="text-blue-electric shrink-0 mt-0.5" size={16} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {feature.id === 'visualizer' && (
                  <Link to="/how-it-works" className="mt-8 text-sm font-bold text-blue-electric flex items-center gap-1 hover:gap-2 transition-all">
                    Learn More <ArrowRight size={16} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 1 */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">See How ClosePro Can Work For Your Business</h2>
          <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
            Book My Demo <ChevronRight size={24} />
          </Link>
        </div>
      </section>

      {/* Sales System Section */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-blue-electric/10 text-blue-electric text-sm font-bold uppercase tracking-widest">
                The Sales System
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
                This Isn’t Just Software. <br />
                <span className="text-blue-electric">It’s A Sales System.</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Most remodelers are not losing deals because they lack skill. 
                  They are losing deals because they do not have a system. 
                  Our <strong>remodeling sales automation</strong> platform is built to solve this.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Slow follow-up",
                    "No clear sales process",
                    "Leads slipping through the cracks",
                    "Weak online presentation",
                    "No way to show the vision"
                  ].map((problem, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-bold text-navy">{problem}</span>
                    </div>
                  ))}
                </div>
                <p>
                  ClosePro Remodel solves those problems by combining your <strong>lead capture website for remodelers</strong>, <strong>contractor CRM</strong>, <strong>AI remodel visualizer</strong>, <strong>automated follow-up for contractors</strong>, and <strong>booking system for contractors</strong> into one platform built to help you close more jobs.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-electric/20 blur-3xl rounded-full"></div>
              <div className="relative bg-navy rounded-3xl p-8 shadow-2xl border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                    <LayoutIcon className="text-blue-electric mx-auto" size={32} />
                    <p className="text-xs font-bold uppercase tracking-tighter">Website</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                    <BarChart3 className="text-blue-electric mx-auto" size={32} />
                    <p className="text-xs font-bold uppercase tracking-tighter">CRM</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                    <Zap className="text-blue-electric mx-auto" size={32} />
                    <p className="text-xs font-bold uppercase tracking-tighter">AI Visuals</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-3">
                    <MessageSquare className="text-blue-electric mx-auto" size={32} />
                    <p className="text-xs font-bold uppercase tracking-tighter">Automation</p>
                  </div>
                </div>
                <div className="mt-4 p-6 bg-blue-electric rounded-2xl text-center">
                  <p className="font-bold text-white">One Integrated Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-navy rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-electric/20 blur-[100px] rounded-full"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  One Extra Deal Can Pay For The Entire System
                </h2>
                <div className="space-y-6 text-lg text-gray-300">
                  <p>
                    If the average kitchen or bathroom remodel is worth $15,000 to $50,000, then one additional signed project can cover your monthly investment many times over.
                  </p>
                  <ul className="space-y-4">
                    {["Respond faster", "Present better", "Follow up automatically", "Close more jobs"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="text-blue-electric" size={24} />
                        <span className="font-bold text-white">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-bold text-white text-2xl pt-4">
                    This is not another software cost. <br />
                    <span className="text-blue-electric">It is a revenue tool.</span>
                  </p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <p className="text-blue-electric font-bold uppercase tracking-widest text-sm">ROI Example</p>
                  <p className="text-4xl font-bold">$15,000 - $50,000</p>
                  <p className="text-gray-400">Average Project Value</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">1 Extra Deal</p>
                    <p className="text-sm text-gray-400">Per Year</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">10x - 50x</p>
                    <p className="text-sm text-gray-400">Potential ROI</p>
                  </div>
                </div>
                <Link to="/pricing" className="btn-primary w-full py-4 text-center block">
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 2 */}
      <section className="py-16 bg-blue-electric text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Get More Remodel Jobs Starting This Month</h2>
          <Link to="/book-demo" className="bg-navy text-white px-10 py-5 text-xl inline-flex items-center gap-2 rounded-xl font-bold hover:bg-navy/90 transition-all">
            Book My Demo <ChevronRight size={24} />
          </Link>
        </div>
      </section>

      {/* AI Showcase Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-electric/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://picsum.photos/seed/remodel-ai/1200/1500" 
                  alt="AI Remodel Visualization Example" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent p-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-blue-electric rounded-full text-xs font-bold uppercase">After AI Remodel</div>
                    <div className="text-sm font-medium">Generated in 4 seconds</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
                  The AI Remodel Visualizer: <br />
                  <span className="text-blue-electric">Your Secret Sales Weapon</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Stop trying to explain your vision with words. Show homeowners what their future remodel could look like before they sign. This helps reduce hesitation and builds confidence during the sales process.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-electric/10 text-blue-electric flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-navy">How it works:</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Upload a room photo, choose a style, and generate a remodel visualization in seconds.
                  </p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-electric/10 text-blue-electric flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-navy">Why it closes deals:</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Clients are much more likely to move forward when they can clearly see the end result.
                  </p>
                </div>
              </div>

              <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
                Book My Demo <ChevronRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Remodelers Are Already Closing More Deals</h2>
            <p className="text-xl text-gray-400">Real results from remodelers using a system built for high-ticket residential sales.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 relative group hover:bg-white/10 transition-all"
              >
                <div className="absolute -top-4 left-8 px-4 py-1 bg-blue-electric rounded-full text-xs font-bold uppercase tracking-widest">
                  {t.tag}
                </div>
                <Quote className="text-blue-electric/20 absolute top-8 right-8" size={48} />
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-blue-electric text-blue-electric" />)}
                  </div>
                  <p className="text-lg font-medium leading-relaxed italic">"{t.quote}"</p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-sm text-gray-400">{t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-electric/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-navy leading-tight">
              Ready to Start Closing <span className="text-blue-electric">$10K–$50K</span> Remodel Jobs More Consistently?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ClosePro Remodel helps you capture more leads, follow up faster, present better, and turn more prospects into signed contracts.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-navy uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-electric" size={20} />
              <span>More Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-electric" size={20} />
              <span>Better Close Rates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-electric" size={20} />
              <span>Automated Follow-Up</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30">
              Book My Demo Now
            </Link>
            <p className="text-gray-500 text-sm">
              No complicated setup. No tech overwhelm. Just a better system for closing more jobs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

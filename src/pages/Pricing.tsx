import { CheckCircle2, ChevronRight, XCircle, Minus, Info, ArrowRight, Star, ShieldCheck, TrendingUp, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';

const plans = [
  {
    name: "Launchpad",
    monthlyPrice: 99,
    label: "For Solo Remodelers",
    revenueStage: "$200K–$500K/yr",
    outcome: "Get your first lead system live in 7 days",
    desc: "Perfect for solo remodelers getting started with automation and lead capture.",
    features: [
      "High-converting lead capture website",
      "Basic contractor CRM (up to 150 leads)",
      "Unlimited AI generations (BYOK — pay Google ~$0.04 each)",
      "Automated email follow-ups (5-touch)",
      "Demo booking calendar",
      "Mobile job tracker",
      "Standard email support"
    ],
    note: "One extra $1,500 job covers 15 months",
    cta: "Start Free Trial",
    color: "border-gray-100"
  },
  {
    name: "Accelerator",
    monthlyPrice: 229,
    label: "MOST POPULAR",
    revenueStage: "$500K–$1M/yr",
    outcome: "Close $10K–$50K jobs on autopilot",
    desc: "Our most popular plan for remodelers ready to scale past $500K.",
    features: [
      "Everything in Launchpad",
      "Full CRM pipeline + deal tracking",
      "Unlimited AI generations (BYOK — your Google key)",
      "SMS + email automation sequences",
      "Estimates & invoice system",
      "Project management tools",
      "Google Review automation",
      "Priority support (same-day)"
    ],
    popular: true,
    highlight: "Best Value — One extra job/month pays for itself 10x over",
    cta: "Start Free Trial",
    color: "border-blue-electric"
  },
  {
    name: "Catalyst",
    monthlyPrice: 499,
    label: "For Scaling Teams",
    revenueStage: "$1M–$1.5M/yr",
    outcome: "Dominate your local market with AI + automation",
    desc: "For remodeling firms ready to dominate their local market.",
    features: [
      "Everything in Accelerator",
      "Multi-user team access (up to 5 seats)",
      "AI-powered ad copy generator",
      "SEO blog content system",
      "Advanced analytics & reporting",
      "Embeddable AI widget for your website",
      "Dedicated account manager",
      "White-glove onboarding call"
    ],
    cta: "Start Free Trial",
    color: "border-gray-100"
  },
  {
    name: "Apex",
    monthlyPrice: 749,
    label: "Enterprise Growth",
    revenueStage: "$1.5M–$2M+/yr",
    outcome: "Full-scale revenue engine for high-volume remodelers",
    desc: "The complete system for high-volume remodeling firms scaling past $1.5M.",
    features: [
      "Everything in Catalyst",
      "Unlimited team seats",
      "Custom AI training on your portfolio",
      "Multi-location management",
      "API access & custom integrations",
      "Quarterly growth strategy calls",
      "White-label reports for clients",
      "24/7 dedicated support line"
    ],
    apex: true,
    cta: "Contact Sales",
    color: "border-amber-400"
  }
];

const comparisonRows = [
  { label: "Lead Capture Website", launchpad: "✔", accelerator: "✔", catalyst: "✔", apex: "✔" },
  { label: "CRM System", launchpad: "Basic (150)", accelerator: "Full Pipeline", catalyst: "Advanced", apex: "Unlimited" },
  { label: "AI Visualizer (BYOK)", launchpad: "Unlimited", accelerator: "Unlimited", catalyst: "Unlimited", apex: "Unlimited + Custom-Trained" },
  { label: "SMS Automation", launchpad: "✖", accelerator: "✔", catalyst: "✔", apex: "✔" },
  { label: "Email Sequences", launchpad: "5-touch", accelerator: "Full 14-day", catalyst: "Full 14-day", apex: "Custom" },
  { label: "Estimates & Invoices", launchpad: "✖", accelerator: "✔", catalyst: "✔", apex: "✔" },
  { label: "Booking System", launchpad: "✔", accelerator: "✔", catalyst: "✔", apex: "✔" },
  { label: "Reporting Dashboard", launchpad: "Basic", accelerator: "Advanced", catalyst: "Custom", apex: "White-Label" },
  { label: "Team Seats", launchpad: "1", accelerator: "1", catalyst: "Up to 5", apex: "Unlimited" },
  { label: "AI Ad Copy Generator", launchpad: "✖", accelerator: "✖", catalyst: "✔", apex: "✔" },
  { label: "SEO Blog System", launchpad: "✖", accelerator: "✖", catalyst: "✔", apex: "✔" },
  { label: "API Access", launchpad: "✖", accelerator: "✖", catalyst: "✖", apex: "✔" },
  { label: "Support Level", launchpad: "Email", accelerator: "Priority", catalyst: "Dedicated", apex: "24/7 Line" },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-white">
      <Helmet>
        <title>ClosePro Remodel Pricing | CRM & AI Tools for Remodelers</title>
        <meta name="description" content="View pricing for ClosePro Remodel — Launchpad $99, Accelerator $229, Catalyst $499, Apex $749. CRM, AI remodel visualizer, lead capture, and automation for remodelers." />
      </Helmet>

      {/* Urgency Bar */}
      <div className="bg-blue-electric/10 text-blue-electric py-3 px-6 text-center text-sm font-bold border-b border-blue-electric/20">
        Limited onboarding spots available this month — <Link to="/book-demo" className="underline">secure your spot now</Link>
      </div>

      {/* Hero */}
      <section className="bg-navy text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-electric rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-electric rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            Choose The System That Helps You <br />
            <span className="text-blue-electric">Close More $10K–$50K Remodel Jobs</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Pick the plan that matches your revenue stage. Every tier is built to help you capture more leads, follow up faster, and close more high-ticket remodel projects.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/book-demo" className="bg-blue-electric text-white px-10 py-5 text-xl rounded-xl font-bold hover:bg-white hover:text-navy transition-all shadow-xl shadow-blue-electric/20 inline-block">
              Book Demo
            </Link>
            <Link to="/how-it-works" className="bg-white/10 text-white px-10 py-5 text-xl rounded-xl font-bold hover:bg-white/20 transition-all inline-block">
              See How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-12 relative z-20">
        {/* Annual toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-full p-1 flex items-center gap-1">
            <button onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!annual ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${annual ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>
              Annual
              <span className="bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-6 items-start">
          {plans.map((plan, i) => {
            const displayPrice = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`p-8 rounded-[2rem] border-2 bg-white flex flex-col h-full transition-all relative shadow-lg ${
                  plan.popular
                    ? 'border-blue-electric ring-4 ring-blue-electric/10 lg:scale-105 z-10'
                    : plan.apex
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : plan.color
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 btn-shimmer px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    {plan.label}
                  </div>
                )}
                {plan.apex && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-navy px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg whitespace-nowrap flex items-center gap-1">
                    <Crown size={12} /> {plan.label}
                  </div>
                )}
                {!plan.popular && !plan.apex && (
                  <div className="text-blue-electric font-bold text-xs uppercase tracking-widest mb-4">{plan.label}</div>
                )}

                <div className={`mb-4 ${(plan.popular || plan.apex) ? 'mt-4' : ''}`}>
                  <h3 className={`text-2xl font-bold mb-1 ${plan.apex ? 'text-amber-500' : 'text-navy'}`}>{plan.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{plan.revenueStage}</p>
                  <p className="text-blue-electric font-bold text-sm mt-1">{plan.outcome}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-navy">$</span>
                  <span className="text-6xl font-black text-navy tracking-tighter">{displayPrice}</span>
                  <span className="text-gray-400 font-bold">/mo</span>
                </div>
                {annual && <p className="text-green-500 text-xs font-bold mb-4">Saving ${(plan.monthlyPrice - displayPrice) * 12}/year</p>}
                {!annual && <p className="text-gray-400 text-xs mb-4">or ${Math.round(plan.monthlyPrice * 0.8)}/mo annually</p>}

                {plan.highlight && (
                  <div className="bg-blue-electric/5 border border-blue-electric/10 p-3 rounded-xl mb-4 flex items-start gap-2">
                    <Star className="text-blue-electric shrink-0 mt-0.5" size={14} />
                    <p className="text-xs font-bold text-navy leading-snug">{plan.highlight}</p>
                  </div>
                )}

                <ul className="space-y-2.5 mb-6 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600 font-medium">
                      <CheckCircle2 className={`shrink-0 mt-0.5 ${plan.apex ? 'text-amber-500' : 'text-blue-electric'}`} size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <Link
                    to={plan.name === 'Apex' ? '/contact' : `/signup?plan=${plan.name.toLowerCase()}`}
                    className={`w-full py-4 rounded-xl font-black text-center block transition-all text-sm ${
                      plan.popular
                        ? 'bg-blue-electric text-white hover:bg-navy shadow-xl shadow-blue-electric/30'
                        : plan.apex
                        ? 'bg-amber-400 text-navy hover:bg-amber-500 shadow-lg'
                        : 'bg-navy text-white hover:bg-blue-electric'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  {plan.note && <p className="text-center text-xs text-green-600 font-bold">{plan.note}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center space-y-4">
          <Link to="/book-demo" className="btn-primary px-12 py-5 text-xl shadow-2xl shadow-blue-electric/20 inline-block">
            Book My Demo Now
          </Link>
          <p className="text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-green-500" />
            Limited onboarding spots available. We only work with select remodelers per market.
          </p>
        </div>

        {/* BYOK wedge */}
        <div className="max-w-5xl mx-auto px-6 mt-16">
          <div className="bg-gradient-to-br from-blue-electric/5 to-blue-electric/10 border-2 border-blue-electric/20 rounded-3xl p-8 md:p-10">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-electric/10 text-blue-electric rounded-full text-xs font-black uppercase tracking-widest">
                  <Zap size={12} /> Bring your own AI key
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-navy leading-tight">
                  Unlimited AI on every plan. You pay Google's price — not a 5× SaaS markup.
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ClosePro is the only contractor visualizer where <strong className="text-navy">you control your AI costs</strong>.
                  Add your own Google API key, pay Google directly (typically <strong className="text-navy">~$0.04 per generation</strong>),
                  and stop subsidizing someone else's margin. Your Stripe bill stays predictable: just the SaaS subscription.
                </p>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm pt-2">
                  {[
                    'Unlimited generations on every plan',
                    'Encrypted (AES-256) per-tenant',
                    'Get a key in 2 minutes from Google AI Studio',
                    'Cancel anytime — your key, your data',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-gray-700 font-medium">
                      <CheckCircle2 size={16} className="text-blue-electric flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3 shadow-lg">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Per generation</p>
                <p className="text-5xl font-black text-blue-electric">$0.04</p>
                <p className="text-xs text-gray-500">paid directly to Google</p>
                <div className="h-px bg-gray-100" />
                <p className="text-xs text-gray-400 line-through">Industry SaaS markup: $0.20+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-navy rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-electric/10 skew-x-12 translate-x-1/4"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-electric/20 text-blue-electric rounded-full text-sm font-bold">
                  <TrendingUp size={16} /> ROI Focused
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  One Remodel Job Can Pay For This Entire System
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed">
                  ClosePro Remodel is not just <strong>remodeling business software</strong>; it's a revenue tool designed to help you respond faster, present better with our <strong>AI remodel visualizer</strong>, and close more deals.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    "Respond to leads instantly",
                    "Present professional AI visuals",
                    "Follow up automatically",
                    "Close more high-ticket deals"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Zap className="text-blue-electric" size={20} />
                      <span className="font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[2rem] space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Average Remodel Job</p>
                  <p className="text-5xl md:text-6xl font-black text-blue-electric">$15,000 – $50,000+</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <p className="text-center text-lg text-gray-300 italic">
                  "Even one additional deal per month can generate thousands in profit. This is the ultimate no-brainer for serious contractors."
                </p>
                <Link to="/book-demo" className="w-full py-5 bg-white text-navy rounded-2xl font-black text-center block hover:bg-blue-electric hover:text-white transition-all text-lg">
                  Book My Demo Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Compare All Plans</h2>
            <p className="text-gray-500 font-medium">Find the perfect <strong>contractor CRM pricing</strong> and <strong>remodeler software</strong> for your revenue stage.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-6 px-4 text-left text-navy font-black text-lg">Feature</th>
                  <th className="py-6 px-4 text-center text-navy font-bold">
                    Launchpad
                    <span className="block text-xs font-normal text-gray-400">$99/mo</span>
                  </th>
                  <th className="py-6 px-4 text-center text-blue-electric font-black bg-blue-electric/5 rounded-t-2xl">
                    Accelerator
                    <span className="block text-xs font-normal text-blue-electric">$229/mo</span>
                  </th>
                  <th className="py-6 px-4 text-center text-navy font-bold">
                    Catalyst
                    <span className="block text-xs font-normal text-gray-400">$499/mo</span>
                  </th>
                  <th className="py-6 px-4 text-center text-amber-500 font-black">
                    Apex
                    <span className="block text-xs font-normal text-amber-400">$749/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-gray-700 font-bold text-sm">{row.label}</td>
                    <td className="py-4 px-4 text-center text-gray-500 text-sm font-medium">{row.launchpad}</td>
                    <td className="py-4 px-4 text-center text-navy text-sm font-black bg-blue-electric/5">{row.accelerator}</td>
                    <td className="py-4 px-4 text-center text-gray-600 text-sm font-medium">{row.catalyst}</td>
                    <td className="py-4 px-4 text-center text-amber-600 text-sm font-bold">{row.apex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <Link to="/book-demo" className="text-blue-electric font-bold flex items-center justify-center gap-2 hover:gap-4 transition-all">
              Still not sure? Let's talk about your business <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Objection Handling */}
      <section className="py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Remodelers Choose ClosePro Remodel</h2>
            <p className="text-gray-400 text-lg">The <strong>lead generation for remodelers</strong> solution that scales with you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 space-y-8">
              <h3 className="text-2xl font-bold text-red-400 flex items-center gap-3">
                <XCircle size={28} /> Without a system:
              </h3>
              <ul className="space-y-6">
                {[
                  "Leads fall through the cracks",
                  "Slow follow-up kills the deal",
                  "Missed opportunities every week",
                  "Inconsistent revenue and stress"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-300">
                    <Minus className="text-red-400/50" size={20} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-electric/10 p-10 rounded-3xl border border-blue-electric/20 space-y-8">
              <h3 className="text-2xl font-bold text-blue-electric flex items-center gap-3">
                <CheckCircle2 size={28} /> With ClosePro:
              </h3>
              <ul className="space-y-6">
                {[
                  "Instant automated follow-up",
                  "Organized visual pipeline",
                  "Better presentation with AI",
                  "More signed contracts and profit"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white">
                    <CheckCircle2 className="text-blue-electric" size={20} />
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-navy text-center mb-16">Pricing FAQ</h2>
          <div className="space-y-6">
            {[
              { q: "Which plan is right for me?", a: "Start with the plan that matches your current revenue stage. Launchpad is for solo remodelers under $500K/yr. Accelerator is our most popular plan for teams between $500K–$1M. Catalyst and Apex are for firms scaling past $1M." },
              { q: "How does BYOK (Bring Your Own Key) work?", a: "Every plan includes unlimited AI remodel generations — but you supply your own Google API key for the AI itself. You get a free key from Google AI Studio in 2 minutes, paste it into Settings, and you're done. AI usage (~$0.04/generation) is billed directly to your Google account, not bundled into your SaaS subscription. The result: you pay Google's actual price, not a 5× SaaS markup, and your monthly ClosePro bill is predictable." },
              { q: "How quickly can I get started?", a: "Most remodelers are up and running within 24–48 hours. Our onboarding team helps you get your website and CRM configured so you can start capturing leads immediately." },
              { q: "Will this actually help me get more jobs?", a: "Yes. The system is designed specifically to improve response time, lead conversion, and closing rates. By responding to leads in seconds and presenting better visuals, you naturally win more bids." },
              { q: "Do I need technical experience?", a: "No. Everything is built to be simple and easy to use. If you can use a smartphone, you can use ClosePro Remodel. Plus, we handle the technical setup for you — including walking you through the Google API key step." },
              { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle." },
              { q: "Do you offer a free trial?", a: "We don't offer a traditional free trial, but we do offer a comprehensive 15-minute demo where you can see exactly how the platform works before committing." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h4 className="font-bold text-navy text-lg flex items-center gap-3">
                  <Info className="text-blue-electric" size={20} />
                  {item.q}
                </h4>
                <p className="text-gray-600 leading-relaxed pl-8">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-electric text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            Ready To Close More <br /> High-Ticket Remodel Jobs?
          </h2>
          <p className="text-xl md:text-2xl font-medium text-white/90">
            Join remodelers using ClosePro to capture more leads, follow up faster, and close more deals every month.
          </p>
          <div className="space-y-6">
            <Link to="/book-demo" className="bg-navy text-white px-12 py-6 text-2xl rounded-2xl font-black hover:bg-white hover:text-navy transition-all shadow-2xl inline-block">
              Book My Demo Now
            </Link>
            <p className="text-sm font-bold text-white/70">
              No complicated setup. No tech overwhelm. Just a better way to grow your business.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

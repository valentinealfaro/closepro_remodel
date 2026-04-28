import { Star, ChevronRight, CheckCircle2, ShieldCheck, TrendingUp, Zap, Clock, Quote, Play, XCircle, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

export default function Results() {
  const caseStudies = [
    {
      company: "Thompson Kitchens",
      headline: "How Thompson Kitchens Increased Close Rate by 40% in 90 Days",
      problem: "Mark was sending 10+ estimates per week but only closing 2. He had no structured follow-up system and was losing high-ticket jobs to competitors who responded faster.",
      solution: "Implemented ClosePro's CRM pipeline, AI Visualizer, and automated follow-up system to improve response time and presentation.",
      outcome: "Close rate increased from 20% to 40% within 90 days. Average job size increased by $8,500. Follow-ups became fully automated.",
      metrics: {
        closeRate: "+40%",
        avgJobIncrease: "+$8,500",
        timeframe: "90 Days"
      },
      image: "https://picsum.photos/seed/case1/1200/900"
    },
    {
      company: "Elite Bath & Spa",
      headline: "How Elite Bath & Spa Tripled Lead Volume and Stopped Relying on Referrals",
      problem: "Sarah's business was 100% dependent on referrals. When referrals slowed down, her pipeline went dry. She had no way to capture new leads online and was missing out on high-ticket bathroom remodels.",
      solution: "Deployed a ClosePro Lead Capture Website and SEO foundation to attract and convert high-intent homeowners searching for remodeling services.",
      outcome: "Generating 15+ high-quality bathroom remodel leads per month. No longer dependent on word-of-mouth. Revenue increased by 35% in the first 6 months.",
      metrics: {
        closeRate: "+35% Revenue",
        avgJobIncrease: "15+ Leads/mo",
        timeframe: "6 Months"
      },
      image: "https://picsum.photos/seed/case2/1200/900"
    },
    {
      company: "DR Remodeling",
      headline: "How DR Remodeling Professionalized Their Sales Process and Scaled to 3 Reps",
      problem: "David was tracking leads in a notebook. He was losing at least 3-4 jobs a month simply because he forgot to follow up. He couldn't scale because his process was entirely manual and disorganized.",
      solution: "Moved all operations to the ClosePro Contractor CRM and Pipeline, enabling automated reminders and clear visibility into every deal stage.",
      outcome: "Zero leads lost to poor follow-up. David now manages a team of 3 sales reps using the ClosePro dashboard. Monthly booked jobs doubled.",
      metrics: {
        closeRate: "2x Booked Jobs",
        avgJobIncrease: "0 Lost Leads",
        timeframe: "4 Months"
      },
      image: "https://picsum.photos/seed/case3/1200/900"
    }
  ];

  const testimonials = [
    {
      quote: "Best investment I've made in 10 years.",
      name: "Jim P.",
      role: "Owner",
      company: "JP Bathrooms",
      image: "https://i.pravatar.cc/150?u=jim"
    },
    {
      quote: "The AI tool is a total game changer for our sales reps. We're closing deals on the spot.",
      name: "Kelly R.",
      role: "Sales Manager",
      company: "Modern Kitchens",
      image: "https://i.pravatar.cc/150?u=kelly"
    },
    {
      quote: "Finally, a CRM that actually works the way I do. It's built for contractors, not techies.",
      name: "Tom S.",
      role: "Contractor",
      company: "Summit Remodeling",
      image: "https://i.pravatar.cc/150?u=tom"
    },
    {
      quote: "Our lead volume has tripled since launching the new site. The follow-up is seamless.",
      name: "Elena M.",
      role: "Owner",
      company: "Design Pro",
      image: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>Remodeler Success Stories | ClosePro Remodel Results</title>
        <meta name="description" content="See real results from remodelers using ClosePro to increase close rates, generate more leads, and close high-ticket remodeling jobs." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-navy text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-electric rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              Real Remodelers. <br />
              Real Results. <br />
              <span className="text-blue-electric">More Closed Deals.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              See how contractors are using ClosePro Remodel to <strong>increase close rate contractor</strong>, generate more leads, and consistently land $10K–$50K+ projects. Our <strong>remodeling sales system</strong> is built for <strong>remodeling business growth</strong>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-10"
          >
            <Link to="/book-demo" className="btn-primary px-12 py-6 text-2xl shadow-2xl shadow-blue-electric/30 inline-block">
              Book My Demo
            </Link>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-electric" size={20} />
                <span>Built for Remodelers</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-blue-electric" size={20} />
                <span>Increase Close Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-blue-electric" size={20} />
                <span>Automate Follow-Ups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-electric" size={20} />
                <span>Close More Jobs</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {caseStudies.map((study, i) => (
            <div key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row gap-16 items-center"
              >
                <div className="flex-1 space-y-8">
                  <h2 className="text-3xl md:text-4xl font-black text-navy leading-tight">
                    {study.headline}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                      <h4 className="font-black text-red-600 uppercase tracking-wider text-xs mb-2">The Problem:</h4>
                      <p className="text-navy/80 font-medium leading-relaxed">{study.problem}</p>
                    </div>
                    
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                      <h4 className="font-black text-blue-600 uppercase tracking-wider text-xs mb-2">The Solution:</h4>
                      <p className="text-navy/80 font-medium leading-relaxed">{study.solution}</p>
                    </div>
                    
                    <div className="p-6 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                      <h4 className="font-black text-green-600 uppercase tracking-wider text-xs mb-2">The Outcome:</h4>
                      <p className="text-navy font-bold leading-relaxed">{study.outcome}</p>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-black text-blue-electric">{study.metrics.closeRate}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Close Rate</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-black text-blue-electric">{study.metrics.avgJobIncrease}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Increase</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-black text-blue-electric">{study.metrics.timeframe}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Timeframe</p>
                    </div>
                  </div>

                  <Link to="/book-demo" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg group">
                    Book Demo & Get Results Like This <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                </div>

                <div className="flex-1 w-full relative">
                  <div className="absolute -inset-4 bg-blue-electric/10 blur-2xl rounded-3xl"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
                    <img 
                      src={study.image} 
                      alt={study.company} 
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </div>
              </motion.div>

              {/* Before vs After Section (After 2nd case study) */}
              {i === 1 && (
                <div className="pt-32 pb-16">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-navy">What Changes When You Use ClosePro?</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
                      <h3 className="text-2xl font-bold text-red-500 flex items-center gap-3">
                        <XCircle size={28} /> Before ClosePro
                      </h3>
                      <ul className="space-y-6">
                        {[
                          "Leads slipping through cracks",
                          "Slow follow-up kills deals",
                          "No structured sales system",
                          "Inconsistent monthly revenue"
                        ].map((item, j) => (
                          <li key={j} className="flex items-center gap-4 text-gray-600 font-medium">
                            <Minus className="text-red-300" size={20} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-navy p-10 rounded-3xl shadow-2xl space-y-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/20 blur-3xl rounded-full"></div>
                      <h3 className="text-2xl font-bold text-blue-electric flex items-center gap-3 relative z-10">
                        <CheckCircle2 size={28} /> After ClosePro
                      </h3>
                      <ul className="space-y-6 relative z-10">
                        {[
                          "Instant follow-up automation",
                          "Organized visual pipeline",
                          "Better presentations with AI",
                          "More signed contracts and profit"
                        ].map((item, j) => (
                          <li key={j} className="flex items-center gap-4 font-bold">
                            <CheckCircle2 className="text-blue-electric" size={20} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-navy rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-electric via-transparent to-transparent"></div>
            </div>
            
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-black leading-tight">
                  One Closed Job Pays for the Entire System
                </h2>
                <div className="flex flex-wrap justify-center gap-8 pt-4">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Average Remodel Job</p>
                    <p className="text-4xl font-black text-blue-electric">$15,000 – $50,000+</p>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Extra Revenue Potential</p>
                    <p className="text-4xl font-black text-blue-electric">$10K – $30K+</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                <p>
                  If ClosePro helps you close just <span className="text-white font-bold">1 additional job per month</span>, that could mean tens of thousands in extra profit.
                </p>
                <p className="font-bold text-white text-2xl">
                  This isn't software. <br />
                  <span className="text-blue-electric">This is a revenue system.</span>
                </p>
              </div>

              <Link to="/book-demo" className="bg-blue-electric text-white px-12 py-6 text-2xl rounded-2xl font-black hover:bg-white hover:text-navy transition-all shadow-2xl inline-block">
                Book My Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-navy">See How Remodelers Are Using ClosePro</h2>
            <p className="text-xl text-gray-500">Real stories from the job site and the office.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative group cursor-pointer">
              <div className="aspect-video bg-navy rounded-[2rem] overflow-hidden relative border-8 border-white shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/video-main/1200/800" 
                  alt="Main Video Testimonial" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-electric rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="text-white fill-current ml-2" size={40} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-navy to-transparent">
                  <p className="text-2xl font-bold text-white">"We closed an $85K kitchen remodel in the first week."</p>
                  <p className="text-blue-electric font-bold">Watch the full story</p>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {[
                { title: "Scaling to $5M/year", img: "https://picsum.photos/seed/v1/400/300" },
                { title: "Automating the follow-up", img: "https://picsum.photos/seed/v2/400/300" },
                { title: "AI Visualizer in action", img: "https://picsum.photos/seed/v3/400/300" }
              ].map((v, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <div className="aspect-video bg-navy rounded-2xl overflow-hidden relative border-4 border-white shadow-lg">
                    <img 
                      src={v.img} 
                      alt={v.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-electric rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="text-white fill-current ml-1" size={20} />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy to-transparent">
                      <p className="text-sm font-bold text-white">{v.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid (Upgraded) */}
      <section className="py-24 bg-navy text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black">More Success Stories & Contractor CRM Results</h2>
            <div className="flex justify-center text-blue-electric gap-1">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={24} fill="currentColor" />)}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative group hover:bg-white/10 transition-all"
              >
                <Quote className="text-blue-electric/20 absolute top-8 right-8" size={48} />
                <p className="text-lg font-medium italic leading-relaxed relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border-2 border-blue-electric" />
                  <div>
                    <p className="font-black text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-4xl font-black text-navy">Who ClosePro Remodel Is Built For</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Kitchen Remodelers",
              "Bathroom Remodelers",
              "General Contractors",
              "High-Ticket Sales Teams"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                <div className="w-10 h-10 rounded-full bg-blue-electric/10 text-blue-electric flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-xl font-bold text-navy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-electric/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-navy leading-tight">
              Ready To Be Our Next Success Story?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If you want more leads, faster follow-up, and higher close rates — this system is built for you.
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
    </div>
  );
}

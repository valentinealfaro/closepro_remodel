import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Zap, BarChart3, MessageSquare, Layout as LayoutIcon, FileText, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const industryData: Record<string, any> = {
  'kitchen-remodeling-leads': {
    title: 'Kitchen Remodeling Leads',
    heroTitle: 'Land More $20K–$60K Kitchen Remodeling Jobs',
    desc: 'The all-in-one growth platform built specifically for kitchen remodelers. Show off high-end cabinetry and layout changes with AI.',
    image: 'https://picsum.photos/seed/kitchen-seo/1200/800',
    benefits: [
      'AI Kitchen Visualizer: Show clients their new kitchen in seconds',
      'High-Converting Kitchen Landing Pages',
      'Automated Lead Nurturing for Homeowners',
      'Professional Kitchen Estimates & Contracts'
    ]
  },
  'bathroom-remodeling-leads': {
    title: 'Bathroom Remodeling Leads',
    heroTitle: 'Close More Bathroom Remodels with AI Visualization',
    desc: 'Help clients visualize tile, fixtures, and modern spa layouts instantly. Professionalize your bathroom remodeling sales process.',
    image: 'https://picsum.photos/seed/bathroom-seo/1200/800',
    benefits: [
      'Instant Bathroom Tile & Fixture Visualization',
      'Lead Capture Optimized for Bathroom Projects',
      'Automated Follow-up for Hesitant Homeowners',
      'Mobile-Friendly Estimates for On-Site Closing'
    ]
  },
  'home-remodeling-leads': {
    title: 'Home Remodeling Leads',
    heroTitle: 'Scale Your Home Remodeling Business to $5M+',
    desc: 'Manage complex multi-room projects with a streamlined CRM and AI visualization tools that build massive trust.',
    image: 'https://picsum.photos/seed/home-seo/1200/800',
    benefits: [
      'Multi-Room AI Visualization Tools',
      'Advanced Project Pipeline Management',
      'Automated Reviews & Referral Generation',
      'Integrated Invoicing & Payment Processing'
    ]
  },
  'general-contractor-crm': {
    title: 'General Contractor CRM',
    heroTitle: 'The CRM Built for General Contractors, Not Techies',
    desc: 'Professionalize your entire sales process, win bigger bids, and never let a high-ticket lead slip through the cracks.',
    image: 'https://picsum.photos/seed/gc-seo/1200/800',
    benefits: [
      'Unified Lead Management for All Project Types',
      'Automated SMS & Email Speed-to-Lead',
      'Professional Bidding & Estimating Tools',
      'Team Management & Subcontractor Tracking'
    ]
  }
};

export default function IndustryLanding() {
  const { industry } = useParams();
  const data = industryData[industry || ''] || industryData['kitchen-remodeling-leads'];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-20 pb-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-electric/10 text-blue-electric text-sm font-bold uppercase tracking-wider">
              <Zap size={14} fill="currentColor" />
              <span>Industry Specific Solution</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-navy leading-tight">
              {data.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {data.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/book-demo" className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-2">
                Book My Demo <ChevronRight size={20} />
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-10 py-5 flex items-center justify-center">
                View Pricing
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
              <img src={data.image} alt={data.title} className="w-full h-auto" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-navy mb-4">Why {data.title} Choose ClosePro</h2>
            <p className="text-xl text-gray-600">Built to solve the unique challenges of your specific remodeling niche.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {data.benefits.map((benefit: string, i: number) => (
              <div key={i} className="flex gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-100 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-electric text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-xl font-bold text-navy">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "AI Visualization", desc: "Show them the dream before they sign the contract." },
              { icon: <BarChart3 />, title: "Lead Tracking", desc: "Never lose a high-ticket lead to poor follow-up again." },
              { icon: <MessageSquare />, title: "Automated SMS", desc: "Respond to leads in seconds, not hours." },
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-electric/10 text-blue-electric flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-navy">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-navy text-white text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-bold">Ready to Dominate the {data.title} Market?</h2>
          <p className="text-xl text-gray-400">Join the top 1% of remodelers who use ClosePro to grow their businesses.</p>
          <div className="pt-4">
            <Link to="/book-demo" className="btn-primary text-xl px-12 py-6">
              Book My Demo Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

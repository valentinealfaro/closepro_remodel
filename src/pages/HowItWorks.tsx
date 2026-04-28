import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      title: "1. System Setup & Integration",
      desc: "We don't just give you software and wish you luck. Our team handles the entire technical setup. We build your lead capture website, configure your CRM, and set up your automated follow-up sequences tailored to your specific remodeling niche.",
      details: ["Custom website deployment", "CRM pipeline configuration", "SMS/Email automation setup", "Calendar integration"]
    },
    {
      title: "2. High-Quality Lead Generation",
      desc: "Once your system is live, we help you fill it with high-intent leads. Whether it's through your new SEO-optimized website or your existing marketing channels, every lead flows directly into your ClosePro CRM for immediate action.",
      details: ["SEO-ready architecture", "Conversion-optimized forms", "Real-time lead alerts", "Lead source tracking"]
    },
    {
      title: "3. The AI Sales Consultation",
      desc: "This is where the magic happens. During your consultation, use the AI Remodel Visualizer to show the client exactly what their new kitchen or bathroom will look like. This removes hesitation and builds massive confidence in your ability to deliver.",
      details: ["Instant AI visualizations", "Mobile-ready interface", "Style & material selection", "Visual project scope"]
    },
    {
      title: "4. Automated Nurture & Closing",
      desc: "Not every lead closes on day one. Our system automatically follows up with every prospect who hasn't signed yet, keeping your brand top-of-mind. When they're ready to move forward, send a professional estimate for digital signature.",
      details: ["Multi-touch follow-up", "Digital estimate signing", "Payment processing", "Contract management"]
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-navy">The Simple Path to More Remodeling Jobs</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've combined the best technology with a proven sales process to help you grow your business without the headache.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding">
        <div className="max-w-5xl mx-auto space-y-24">
          {steps.map((step, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold text-navy">{step.title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">{step.desc}</p>
                <ul className="space-y-3">
                  {step.details.map((detail, j) => (
                    <li key={j} className="flex items-center gap-3 text-navy font-medium">
                      <CheckCircle2 className="text-blue-electric" size={20} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                  <img src={`https://picsum.photos/seed/step${i}/800/450`} alt={step.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why It Works */}
      <section className="section-padding bg-navy text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Remodelers Choose ClosePro</h2>
            <p className="text-gray-400">It's not just software. It's a growth system.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Built for Your Industry", desc: "We don't do generic. Every feature is designed for the specific needs of kitchen, bath, and home remodelers." },
              { title: "Speed to Lead", desc: "The first contractor to respond wins 50% of the time. Our automation ensures you're always first." },
              { title: "Trust & Authority", desc: "Premium websites and AI visuals make you look like the top-tier professional you are." }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-xl font-bold text-blue-electric">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy">Ready to See It in Action?</h2>
          <p className="text-lg text-gray-600">
            Book a 15-minute demo and we'll show you exactly how this system can work for your business.
          </p>
          <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
            👉 Book My Demo <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

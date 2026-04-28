import { Users, Target, Heart, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">Our Mission: Helping Remodelers Grow</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're a team of technologists and industry experts dedicated to professionalizing the remodeling sales process.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">Why We Built ClosePro</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              For years, we watched talented kitchen and bathroom remodelers struggle with the same problems: leads falling through the cracks, inconsistent follow-up, and a lack of professional sales tools.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We realized that while there were plenty of generic CRMs and website builders, there was nothing built specifically for the unique high-ticket, visual nature of the remodeling industry.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              So we built ClosePro. A platform that combines cutting-edge AI visualization with robust automation and a CRM designed for the way contractors actually work.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://picsum.photos/seed/about-team/800/600" alt="Our Team" className="w-full h-auto" referrerPolicy="no-referrer" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-navy">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="text-blue-electric" />, title: "Results First", desc: "We measure our success by the growth and revenue of our clients. If you're not closing more jobs, we're not doing our job." },
              { icon: <Zap className="text-blue-electric" />, title: "Innovation", desc: "We're constantly pushing the boundaries of what's possible with AI and automation in the remodeling space." },
              { icon: <Heart className="text-blue-electric" />, title: "Industry Focus", desc: "We are deep in the remodeling industry. We understand your pains, your workflow, and your customers." }
            ].map((value, i) => (
              <div key={i} className="p-10 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-blue-electric/10 flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-navy">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-navy text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Clients Served", val: "500+" },
            { label: "Jobs Closed", val: "12,000+" },
            { label: "Revenue Generated", val: "$450M+" },
            { label: "AI Visuals Created", val: "100K+" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-blue-electric">{stat.val}</p>
              <p className="text-sm text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-navy">Join the Growth Movement</h2>
          <p className="text-lg text-gray-600">
            Ready to see how ClosePro can transform your remodeling business?
          </p>
          <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
            👉 Book My Demo <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const faqs = [
    {
      category: "SEO & Growth",
      items: [
        { q: "How to get remodeling leads fast?", a: "The fastest way is to combine a high-converting landing page with automated speed-to-lead. Our system ensures you respond to every new lead in under 60 seconds, which is the #1 factor in closing more jobs." },
        { q: "How much should contractors spend on marketing?", a: "Most successful remodelers reinvest 5-10% of their revenue back into marketing. However, the key is efficiency. Our platform helps you lower your cost-per-lead by converting more of your existing traffic." },
        { q: "What is the best CRM for remodelers?", a: "The best CRM for remodelers is one that handles the unique long-cycle sales process of high-ticket projects. ClosePro includes visual pipelines, automated follow-ups, and AI visualization tools built specifically for this industry." },
        { q: "How do I close high-ticket remodel jobs?", a: "Closing $20K+ jobs requires building massive trust. Our AI visualizer helps clients see the vision instantly, while our automated follow-up ensures you stay top-of-mind throughout their decision-making process." },
        { q: "Why do remodeling leads not convert?", a: "Most leads fail to convert because of slow response times or lack of consistent follow-up. 80% of sales require 5-12 follow-ups, but most contractors stop after 2. We automate this entire process for you." }
      ]
    },
    {
      category: "General",
      items: [
        { q: "What is ClosePro Remodel?", a: "ClosePro Remodel is an all-in-one growth platform built specifically for kitchen and bathroom remodelers. It combines a high-converting website, an AI remodel visualizer, a contractor CRM, and automated follow-up tools." },
        { q: "Who is this for?", a: "Our platform is designed for kitchen remodelers, bathroom remodelers, home remodelers, and general contractors who want to professionalize their sales process and land more high-ticket jobs." },
        { q: "How is this different from a generic CRM?", a: "Generic CRMs aren't built for the remodeling workflow. We include industry-specific features like the AI Remodel Visualizer and automated follow-up sequences tailored to remodeling prospects." }
      ]
    },
    {
      category: "Features",
      items: [
        { q: "How does the AI Visualizer work?", a: "You take a photo of a client's current space, and our AI generates a photorealistic remodel visualization in seconds. This helps clients see the vision and reduces hesitation during the sales process." },
        { q: "Can I use my own domain?", a: "Yes! We can host your new lead capture website on your existing domain or help you set up a new one." },
        { q: "Does the CRM integrate with my calendar?", a: "Yes, we integrate with Google Calendar, Outlook, and other major calendar providers to ensure your demo bookings and consultations are always synced." }
      ]
    },
    {
      category: "Pricing & Setup",
      items: [
        { q: "How much does it cost?", a: "We have several plans starting at $499/mo. We also offer custom enterprise solutions for larger firms. Book a demo to get a custom quote for your business." },
        { q: "Do you handle the setup?", a: "Yes, we offer white-glove setup where our team configures your CRM, website, and automation sequences for you." },
        { q: "Is there a long-term contract?", a: "Most of our plans are month-to-month. We believe in earning your business every single month with results." }
      ]
    }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(group => group.items).map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="bg-white">
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
      {/* Hero */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-navy">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about the ClosePro platform and how it can help your business grow.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto space-y-16">
          {faqs.map((group, i) => (
            <div key={i} className="space-y-8">
              <h2 className="text-2xl font-bold text-blue-electric uppercase tracking-widest border-b border-gray-100 pb-4">
                {group.category}
              </h2>
              <div className="space-y-8">
                {group.items.map((item, j) => (
                  <div key={j} className="space-y-3">
                    <h4 className="text-xl font-bold text-navy">{item.q}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy text-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold">Still have questions?</h2>
          <p className="text-lg text-gray-400">
            We're happy to help. Book a demo and we'll answer all your questions live.
          </p>
          <Link to="/book-demo" className="btn-primary px-10 py-5 text-xl inline-flex items-center gap-2">
            Schedule Your Demo <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Book a Demo', to: '/book-demo' },
  { label: 'Client Results', to: '/results' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' }
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Big 404 */}
      <div className="relative mb-8">
        <p className="text-[160px] md:text-[200px] font-black text-gray-100 leading-none select-none">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl">🔨</div>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-lg max-w-md mx-auto mb-10">
        Looks like this page got remodeled out of existence. Let's get you back on track.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-14">
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Home size={18} /> Back to Home
        </Link>
        <Link to="/book-demo" className="btn-secondary flex items-center gap-2">
          Book a Free Demo
        </Link>
      </div>

      {/* Quick links */}
      <div className="max-w-lg w-full">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-4">Popular Pages</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-navy font-medium hover:border-blue-electric hover:text-blue-electric hover:bg-blue-electric/5 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

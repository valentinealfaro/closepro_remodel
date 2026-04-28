import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Phone, MapPin, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { trackEvent } from '../lib/tracking';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollCTA, setShowScrollCTA] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Show scroll CTA bar after 50% scroll
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (window.scrollY / scrollHeight) * 100;
      setShowScrollCTA(scrollPercentage > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  const navLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Results', href: '/results' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-charcoal bg-white">
      {/* Urgency Bar */}
      <div className="bg-blue-electric text-white py-2 px-6 text-center text-xs font-bold tracking-wide z-[60] relative">
        ⚡ Limited onboarding spots available this month — <Link to="/book-demo" className="underline hover:text-navy transition-colors">Secure yours now</Link>
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2 mt-0' : 'bg-transparent py-5 mt-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="ClosePro Remodel" className="h-14 w-auto" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold text-navy/80 hover:text-blue-electric transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              <div className="hidden xl:flex items-center gap-2 text-navy/60 hover:text-blue-electric transition-colors cursor-pointer">
                <Phone size={16} />
                <span className="text-sm font-bold">(800) 555-0123</span>
              </div>
              <Link 
                to="/book-demo" 
                className="btn-primary py-2 px-6 text-sm"
                onClick={() => trackEvent('header_cta_click', { location: 'desktop_nav' })}
              >
                Book My Demo
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link 
              to="/book-demo" 
              className="btn-primary py-1.5 px-4 text-xs sm:hidden"
              onClick={() => trackEvent('header_cta_click', { location: 'mobile_nav_top' })}
            >
              Book My Demo
            </Link>
            <button
              className="text-navy"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-lg font-medium text-navy py-2 border-b border-gray-50"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link 
                  to="/book-demo" 
                  className="btn-primary text-center mt-2"
                  onClick={() => trackEvent('header_cta_click', { location: 'mobile_nav_menu' })}
                >
                  Book My Demo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-28">
        {children}
      </main>

      {/* Sticky CTA (Mobile/Desktop) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4"
          >
            <Link 
              to="/book-demo" 
              className="btn-primary shadow-2xl flex items-center gap-2 px-8 py-4"
              onClick={() => trackEvent('sticky_cta_click')}
            >
              Book My Demo <ChevronRight size={20} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll CTA Bar (Top) */}
      <AnimatePresence>
        {showScrollCTA && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[70] bg-navy text-white py-3 px-6 shadow-2xl flex items-center justify-center gap-6"
          >
            <p className="text-sm font-bold hidden md:block">Want More $20K+ Remodel Jobs?</p>
            <Link 
              to="/book-demo" 
              className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
              onClick={() => trackEvent('scroll_bar_cta_click')}
            >
              Book Demo <ChevronRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-navy text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-5">
              <Link to="/">
                <img src="/logo.png" alt="ClosePro Remodel" className="h-14 w-auto brightness-0 invert" />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                The all-in-one growth platform built for remodelers. Land more $10K–$50K jobs with AI, automation, and a CRM that fits your business.
              </p>
              <div className="text-gray-400 text-sm space-y-2">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-blue-electric" /> 123 Growth Way, Austin, TX 78701</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-blue-electric" /> (800) 555-0123</p>
                <p className="flex items-center gap-2"><MessageSquare size={14} className="text-blue-electric" />
                  <a href="mailto:hello@closeproremodel.com" className="hover:text-white transition-colors">hello@closeproremodel.com</a>
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-electric transition-colors text-xs font-bold">f</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-electric transition-colors text-xs font-bold">in</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-electric transition-colors text-xs font-bold">li</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-electric transition-colors text-xs font-bold">yt</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Solutions</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/kitchen-remodeling-leads" className="hover:text-white transition-colors">Kitchen Remodeling Leads</Link></li>
                <li><Link to="/bathroom-remodeling-leads" className="hover:text-white transition-colors">Bathroom Remodeling Leads</Link></li>
                <li><Link to="/home-remodeling-leads" className="hover:text-white transition-colors">Home Remodeling Leads</Link></li>
                <li><Link to="/general-contractor-crm" className="hover:text-white transition-colors">General Contractor CRM</Link></li>
                <li><Link to="/ai-remodel-visualizer" className="hover:text-white transition-colors">AI Remodel Visualizer</Link></li>
                <li><Link to="/features" className="hover:text-white transition-colors">All Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/results" className="hover:text-white transition-colors">Client Results</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Client Login</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-2">Stay in the Loop</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Weekly growth tips for remodelers. No spam, ever.
                </p>
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-electric text-white rounded-lg text-sm font-bold hover:bg-blue-electric/90 transition-all"
                  >
                    Subscribe Free
                  </button>
                </form>
              </div>
              <Link
                to="/book-demo"
                className="btn-primary inline-flex items-center gap-2 w-full justify-center"
                onClick={() => trackEvent('footer_cta_click')}
              >
                Book My Demo <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 ClosePro Remodel. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps { children: ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0); }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="bg-blue-electric text-white py-2 px-6 text-center text-xs font-bold">
        <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          ⚡
        </motion.span>
        {' '}Limited spots available — <Link to="/signup" className="underline">Start free today</Link>
      </div>

      {/* Navbar */}
      <header className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3 top-0' : 'py-4'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/"><img src="/logo.png" alt="ClosePro" className="h-12 w-auto" /></Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#demo" className="text-sm font-bold text-navy/70 hover:text-blue-electric transition-colors">See Demo</a>
            <a href="#pricing" className="text-sm font-bold text-navy/70 hover:text-blue-electric transition-colors">Pricing</a>
            <Link to="/login" className="text-sm font-bold text-navy/70 hover:text-blue-electric transition-colors">Log In</Link>
            <Link to="/signup" className="bg-blue-electric text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-navy transition-all shadow-lg shadow-blue-electric/20">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
              <a href="#demo" className="block text-sm font-bold text-navy py-2">See Demo</a>
              <a href="#pricing" className="block text-sm font-bold text-navy py-2">Pricing</a>
              <Link to="/login" className="block text-sm font-bold text-navy py-2">Log In</Link>
              <Link to="/signup" className="block bg-blue-electric text-white px-5 py-3 rounded-xl font-bold text-sm text-center">
                Start Free Trial
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-navy text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <img src="/logo.png" alt="ClosePro" className="h-10 w-auto brightness-0 invert" />
            <p className="text-gray-400 text-sm">The AI remodel visualizer contractors add to their website to close more jobs.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Product</p>
            <a href="#demo" className="block text-sm text-gray-300 hover:text-white transition-colors">Live Demo</a>
            <a href="#pricing" className="block text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="block text-sm text-gray-300 hover:text-white transition-colors">Contractor Login</Link>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Legal</p>
            <Link to="/privacy" className="block text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="block text-sm text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ClosePro Remodel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

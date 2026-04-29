import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

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

// Animated broken house SVG
function BrokenHouse() {
  return (
    <motion.svg
      viewBox="0 0 200 180"
      className="w-48 h-48 mx-auto"
      initial={{ y: 0 }}
      animate={{ y: [0, -4, 0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* House body */}
      <motion.rect x="30" y="90" width="140" height="80" fill="#0A2540" stroke="#1E90FF" strokeWidth="2"
        animate={{ skewX: [0, -1, 1, 0] }} transition={{ duration: 4, repeat: Infinity }} />
      {/* Roof left */}
      <motion.polygon points="20,90 100,20 180,90" fill="#0D3060" stroke="#1E90FF" strokeWidth="2"
        animate={{ rotate: [0, -0.5, 0.5, 0], originX: '100px', originY: '90px' }}
        transition={{ duration: 3, repeat: Infinity }} />
      {/* Broken roof piece */}
      <motion.polygon points="120,45 155,65 140,90" fill="#1E90FF" opacity="0.6"
        animate={{ rotate: [0, 5, -3, 0], x: [0, 3, -2, 0], y: [0, 2, -1, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }} />
      {/* Door */}
      <rect x="82" y="130" width="36" height="40" fill="#1E90FF" opacity="0.3" rx="3" />
      {/* Crack lines */}
      <motion.line x1="80" y1="110" x2="95" y2="130" stroke="#00F5FF" strokeWidth="1.5" opacity="0.6"
        animate={{ opacity: [0.6, 0.2, 0.8, 0.4, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.line x1="120" y1="100" x2="110" y2="125" stroke="#00F5FF" strokeWidth="1" opacity="0.5"
        animate={{ opacity: [0.5, 0.8, 0.3, 0.6, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
      {/* Window */}
      <rect x="45" y="105" width="28" height="28" fill="none" stroke="#1E90FF" strokeWidth="1.5" opacity="0.8" />
      <motion.rect x="45" y="105" width="28" height="28" fill="#1E90FF" opacity="0.1"
        animate={{ opacity: [0.1, 0.3, 0.05, 0.2, 0.1] }} transition={{ duration: 1.8, repeat: Infinity }} />
      {/* Debris */}
      <motion.rect x="15" y="160" width="8" height="6" fill="#0A2540" stroke="#1E90FF" strokeWidth="1"
        animate={{ rotate: [0, 15, -10, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.rect x="165" y="155" width="12" height="5" fill="#0A2540" stroke="#1E90FF" strokeWidth="1"
        animate={{ rotate: [0, -20, 10, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity }} />
      {/* Stars/sparks */}
      {[{x:160,y:30},{x:25,y:50},{x:185,y:80}].map((s,i) => (
        <motion.circle key={i} cx={s.x} cy={s.y} r="2" fill="#00F5FF"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 1.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </motion.svg>
  );
}

export default function NotFound() {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    };
    const interval = setInterval(trigger, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[90vh] bg-navy flex flex-col items-center justify-center py-20 px-6 text-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Floating orbs */}
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-20 w-64 h-64 bg-blue-electric/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-8">
        {/* Broken house */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <BrokenHouse />
        </motion.div>

        {/* Glitch 404 */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="relative inline-block">
            <h1
              className="text-[10rem] md:text-[14rem] font-black leading-none text-white select-none"
              style={{
                fontFamily: 'Space Grotesk',
                textShadow: glitchActive
                  ? '4px 0 #00F5FF, -4px 0 #FF0080'
                  : '0 0 40px rgba(30,144,255,0.5)',
                filter: glitchActive ? 'blur(0.5px)' : 'none',
                transform: glitchActive ? `translateX(${Math.random() > 0.5 ? 3 : -3}px)` : 'none',
                transition: 'all 0.05s'
              }}
            >
              404
            </h1>
            {/* Glitch layers */}
            {glitchActive && (
              <>
                <span className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none text-cyan-400 opacity-60"
                  style={{ fontFamily: 'Space Grotesk', transform: 'translate(-3px, 1px)', clipPath: 'inset(20% 0 60% 0)' }}>
                  404
                </span>
                <span className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none text-pink-500 opacity-60"
                  style={{ fontFamily: 'Space Grotesk', transform: 'translate(3px, -1px)', clipPath: 'inset(60% 0 20% 0)' }}>
                  404
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Your remodel{' '}
            <span className="text-gradient">disappeared…</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Even our AI couldn't find this page. It looks like this page got demoed out of existence. Let's get you back on track.
          </p>
        </motion.div>

        {/* Terminal one-liner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="terminal max-w-md mx-auto text-left">
          <div className="terminal-header">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-400" />
            <div className="terminal-dot bg-green-500" />
            <span className="ml-3 text-gray-500 text-xs">closepro-ai error log</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <p className="text-red-400">ERROR 404: Page not found</p>
            <p className="text-gray-500 text-xs mt-1">{">"} Scanning for redirect...</p>
            <p className="text-green-400 text-xs mt-1">{">"} Suggestion: closepro-remodel.vercel.app/ <span className="cursor" /></p>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-shimmer px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
            <Home size={20} /> Rebuild My Home
          </Link>
          <Link to="/book-demo"
            className="border-2 border-blue-electric text-blue-electric px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-electric hover:text-white transition-all">
            <Zap size={20} fill="currentColor" /> Try AI Visualizer
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Popular Pages</p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map(({ label, to }) => (
              <Link key={to} to={to}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 font-medium hover:border-blue-electric hover:text-blue-electric hover:bg-blue-electric/10 transition-all">
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useInView } from 'motion/react';

const LINES = [
  { delay: 0,    text: '> Scanning pipeline for Johnson Kitchen...', type: 'cmd' },
  { delay: 800,  text: '✓ Lead score: 94/100 — HIGH VALUE', type: 'success' },
  { delay: 1400, text: '> Sending automated follow-up SMS...', type: 'cmd' },
  { delay: 2000, text: '✓ Message delivered — "Hey Mike, following up on your kitchen…"', type: 'success' },
  { delay: 2700, text: '> Running AI visualization for Rodriguez Bath ($18K)...', type: 'cmd' },
  { delay: 3500, text: '✓ Visualization ready — sending to client portal', type: 'success' },
  { delay: 4200, text: '> Checking for stale leads (>3 days no contact)...', type: 'cmd' },
  { delay: 4900, text: '⚠ 2 leads need immediate follow-up — scheduling now', type: 'warn' },
  { delay: 5600, text: '> Auto-follow-up sent to Williams ($32K remodel)', type: 'cmd' },
  { delay: 6300, text: '✓ Demo booked: April 30, 10:00 AM 🎯', type: 'success' },
  { delay: 7000, text: '> Monthly close rate: 38% ↑ (+12% vs last month)', type: 'info' },
  { delay: 7700, text: '> Pipeline value: $142,500 across 9 active leads', type: 'info' },
  { delay: 8400, text: '✓ All systems running. ClosePro AI is working for you 24/7.', type: 'success' },
];

export default function TerminalAI() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView) return;
    setVisibleLines([]);
    const timers = LINES.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i]);
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warn':    return 'text-yellow-400';
      case 'info':    return 'text-blue-electric';
      default:        return 'text-gray-300';
    }
  };

  return (
    <div ref={ref} className="terminal shadow-2xl shadow-blue-electric/20 neon-border">
      {/* Window chrome */}
      <div className="terminal-header">
        <div className="terminal-dot bg-red-500" />
        <div className="terminal-dot bg-yellow-400" />
        <div className="terminal-dot bg-green-500" />
        <span className="ml-3 text-gray-500 text-xs font-mono">closepro-ai v2.0 — live pipeline monitor</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-mono">LIVE</span>
        </div>
      </div>

      {/* Terminal body */}
      <div ref={bodyRef} className="p-6 space-y-2 h-80 overflow-hidden relative scanline">
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={visibleLines.includes(i) ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className={`text-sm font-mono leading-relaxed ${getColor(line.type)}`}
          >
            {line.text}
          </motion.div>
        ))}
        {/* Blinking cursor on last visible line */}
        {visibleLines.length > 0 && visibleLines.length < LINES.length && (
          <div className="text-sm font-mono text-gray-300">
            {'>'} <span className="cursor" />
          </div>
        )}
        {visibleLines.length === LINES.length && (
          <div className="text-sm font-mono text-gray-500 mt-2">
            {'>'} <span className="cursor" />
          </div>
        )}
        {/* Bottom scan line overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

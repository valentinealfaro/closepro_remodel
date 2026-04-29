import { motion, AnimatePresence, useInView } from 'motion/react';
import { ChevronRight, Star, CheckCircle2, ArrowRight, Zap, BarChart3, Users, Layout as LayoutIcon, MessageSquare, FileText, X, ArrowUpRight, TrendingUp, Shield, Clock, Wand2, Upload, Download, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { trackEvent } from '../lib/tracking';
import TerminalAI from '../components/TerminalAI';

// ── 3D Tilt Card — must be its own component so the hook is called at the top level ──
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  result: string;
  color: string;
  bg: string;
  text: string;
  delay: number;
}

function FeatureCard({ icon: Icon, title, desc, result, color, bg, text, delay }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(12px)`;
    el.style.boxShadow = `${-x}px ${y}px 30px rgba(30,144,255,0.15)`;
  };

  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    ref.current.style.boxShadow = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay }}>
      <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        className="card-3d group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm overflow-hidden h-full cursor-default transition-shadow">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />
        <div className={`w-14 h-14 ${bg} ${text} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-navy mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
        <div className={`inline-flex items-center gap-1.5 ${text} font-bold text-xs ${bg} px-3 py-1.5 rounded-full`}>
          <CheckCircle2 size={13} /> {result}
        </div>
      </div>
    </motion.div>
  );
}

// ── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = to / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  '⚡ Kitchen Remodeling Leads', '🏆 $50K Jobs Closed', '🤖 AI Visualizer', '📈 Close Rate +40%',
  '🔥 Automated Follow-Up', '💰 $142K Monthly Revenue', '⭐ 4.9 Star Rating', '🏗️ General Contractors',
  '🛁 Bathroom Remodelers', '📊 CRM Built for Remodelers', '✅ 500+ Active Clients', '🚀 Scale to $5M+'
];

function Marquee() {
  return (
    <div className="overflow-hidden bg-blue-electric py-3 relative">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="text-white font-bold text-sm tracking-wide">{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Home Demo Section helpers ─────────────────────────────────────────────────

async function compressForDemo(file: File, maxSide = 1024): Promise<{ base64: string; mimeType: string }> {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const [prefix, data] = dataUrl.split(',');
      resolve({ base64: data, mimeType: prefix.match(/:(.*?);/)?.[1] || 'image/jpeg' });
    };
    img.src = url;
  });
}

async function fetchUrlBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [prefix, data] = dataUrl.split(',');
      resolve({ base64: data, mimeType: prefix.match(/:(.*?);/)?.[1] || 'image/jpeg' });
    };
    reader.readAsDataURL(blob);
  });
}

const DEMO_SAMPLES: Record<string, string> = {
  kitchen:  'https://picsum.photos/seed/kitchen-old-before/1200/900',
  bathroom: 'https://picsum.photos/seed/bath-old-before/1200/900',
};

const DEMO_KITCHEN_STYLES = [
  { id: 'modern',       label: 'Modern',          desc: 'Clean & sleek' },
  { id: 'luxury',       label: 'Luxury',           desc: 'Premium finishes' },
  { id: 'farmhouse',    label: 'Farmhouse',        desc: 'Warm & cozy' },
  { id: 'traditional',  label: 'Traditional',      desc: 'Timeless classic' },
  { id: 'contemporary', label: 'Contemporary',     desc: 'Bold contrast' },
  { id: 'budget',       label: 'Budget-Friendly',  desc: 'Smart & clean' },
];

const DEMO_BATHROOM_STYLES = [
  { id: 'modern',      label: 'Modern',       desc: 'Clean & minimal' },
  { id: 'luxury',      label: 'Spa Luxury',   desc: 'Hotel-inspired' },
  { id: 'minimalist',  label: 'Minimalist',   desc: 'Simple & open' },
  { id: 'traditional', label: 'Traditional',  desc: 'Classic polish' },
  { id: 'budget',      label: 'Budget',       desc: 'Affordable update' },
  { id: 'bold',        label: 'Bold / Dark',  desc: 'High contrast' },
];

const DEMO_BUDGETS = [
  { id: 'basic',    label: 'Basic',     range: '$5K–$15K' },
  { id: 'midrange', label: 'Mid-Range', range: '$15K–$35K' },
  { id: 'highend',  label: 'High-End',  range: '$35K–$75K' },
  { id: 'luxury',   label: 'Luxury',    range: '$75K+' },
];

const DEMO_GEN_STEPS = [
  'Analyzing room dimensions & layout...',
  'Preserving camera angle & perspective...',
  'Applying style parameters...',
  'Generating photorealistic preview...',
  '✓ Visualization complete!',
];

function DemoSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full h-full min-h-[380px] select-none">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute top-4 right-4 bg-blue-electric text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">AI Result</div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute text-white font-bold text-sm whitespace-nowrap"
              style={{ transform: 'rotate(-30deg)', top: `${i * 22 - 5}%`, left: '-10%', right: '-10%', textAlign: 'center', letterSpacing: '0.3em' }}>
              CLOSEPRO DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO DEMO
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-y-0 z-20 cursor-ew-resize" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
          <div className="flex gap-0.5"><div className="w-1 h-5 bg-blue-electric rounded-full" /><div className="w-1 h-5 bg-blue-electric rounded-full" /></div>
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Before</div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">← drag to compare →</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

function HomeDemoSection() {
  const [tab, setTab]           = useState<'sample' | 'upload'>('sample');
  const [room, setRoom]         = useState<'kitchen' | 'bathroom'>('kitchen');
  const [style, setStyle]       = useState('modern');
  const [budget, setBudget]     = useState('midrange');
  const [notes, setNotes]       = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase]           = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [genStep, setGenStep]       = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [resultSrc, setResultSrc]   = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState('');

  const [email, setEmail]         = useState('');
  const [name, setName]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captured, setCaptured]   = useState(false);

  const styles    = room === 'kitchen' ? DEMO_KITCHEN_STYLES : DEMO_BATHROOM_STYLES;
  const beforeImg = (tab === 'upload' && previewUrl) ? previewUrl : DEMO_SAMPLES[room];

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedFile(file);
    setTab('upload');
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const reset = () => { setPhase('idle'); setResultSrc(null); setErrorMsg(''); setGenStep(0); setGenProgress(0); setCaptured(false); };

  const generate = async () => {
    if (phase === 'generating') return;
    reset(); setPhase('generating');
    const interval = setInterval(() => {
      setGenStep(prev => {
        const next = Math.min(prev + 1, DEMO_GEN_STEPS.length - 2);
        setGenProgress(Math.round((next / DEMO_GEN_STEPS.length) * 85));
        return next;
      });
    }, 900);
    try {
      let base64: string, mimeType: string;
      if (tab === 'upload' && uploadedFile) {
        ({ base64, mimeType } = await compressForDemo(uploadedFile));
      } else {
        ({ base64, mimeType } = await fetchUrlBase64(DEMO_SAMPLES[room]));
      }
      const res = await fetch('/api/generate-remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, roomType: room, style, budget, mode: 'realistic', notes: notes || 'Photorealistic remodel preview for contractor sales.' }),
      });
      clearInterval(interval);
      setGenStep(DEMO_GEN_STEPS.length); setGenProgress(100);
      if (!res.ok) { const e = await res.json().catch(() => ({})); setErrorMsg(e.message || e.error || 'Generation failed.'); setPhase('error'); return; }
      const data = await res.json();
      if (!data.imageData) { setErrorMsg('No image returned. Try uploading a clearer, well-lit photo.'); setPhase('error'); return; }
      await new Promise(r => setTimeout(r, 400));
      setResultSrc(`data:${data.mimeType || 'image/jpeg'};base64,${data.imageData}`);
      setPhase('done');
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg('Connection failed. Start the server with: npm run dev');
      setPhase('error');
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await addDoc(collection(db, 'aiDemoLeads'), { email, name, roomType: room, style, budget, source: 'home-demo', createdAt: serverTimestamp() }); } catch {}
    setCaptured(true); setSubmitting(false);
  };

  return (
    <section id="try-it" className="bg-navy relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-40 right-0 w-[700px] h-[700px] bg-blue-electric/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-electric/20 border border-blue-electric/30 text-blue-electric text-sm font-bold">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Wand2 size={14} /></motion.span>
            TRY IT FREE — No Signup Required
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            See Your Remodel <span className="text-blue-electric">Before You Build It</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload a kitchen or bathroom photo. AI generates a photorealistic remodel concept in seconds —
            the same tool contractors use to close $10K–$50K jobs on the first visit.
          </p>
        </motion.div>

        {/* Two-panel demo */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid lg:grid-cols-[400px_1fr] gap-5">

          {/* LEFT: Controls */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
            {/* Photo tabs */}
            <div className="flex gap-1 bg-black/30 rounded-xl p-1">
              {[{ id: 'sample', label: '📷 Sample Photo' }, { id: 'upload', label: '⬆️ Upload Yours' }].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id as any); reset(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-navy shadow' : 'text-gray-400 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'sample' ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DEMO_SAMPLES).map(([key, url]) => (
                  <button key={key} onClick={() => { setRoom(key as any); setStyle('modern'); reset(); }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${room === key ? 'border-blue-electric shadow-lg shadow-blue-electric/30 scale-[1.03]' : 'border-white/10 hover:border-blue-electric/50'}`}>
                    <img src={url} alt={key} className="w-full h-20 object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs font-bold py-1 text-center capitalize">{key}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-electric bg-blue-electric/10' : previewUrl ? 'border-green-400 bg-green-400/10' : 'border-white/20 hover:border-blue-electric hover:bg-white/5'}`}
                onClick={() => fileRef.current?.click()}>
                {previewUrl
                  ? <><img src={previewUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg mb-2" /><p className="text-green-400 text-xs font-bold flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Ready!</p></>
                  : <><Upload size={22} className="text-gray-400 mx-auto mb-2" /><p className="text-white text-sm font-bold">Drop photo here</p><p className="text-gray-500 text-xs mt-1">JPG, PNG, WEBP · up to 20MB</p></>}
                <input ref={fileRef} type="file" accept="image/*"
                  style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}

            {/* Room type */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Room Type</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'kitchen', label: '🍳 Kitchen' }, { id: 'bathroom', label: '🛁 Bathroom' }].map(r => (
                  <button key={r.id} onClick={() => { setRoom(r.id as any); setStyle('modern'); reset(); }}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${room === r.id ? 'bg-blue-electric text-white shadow-lg shadow-blue-electric/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Remodel Style</p>
              <div className="grid grid-cols-2 gap-1.5">
                {styles.map(s => (
                  <button key={s.id} onClick={() => { setStyle(s.id); if (phase === 'done') reset(); }}
                    className={`px-3 py-2 rounded-xl text-left transition-all ${style === s.id ? 'bg-blue-electric text-white shadow-md' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    <div className="text-xs font-bold leading-tight">{s.label}</div>
                    <div className={`text-[10px] mt-0.5 ${style === s.id ? 'text-blue-100' : 'text-gray-500'}`}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Budget Level</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_BUDGETS.map(b => (
                  <button key={b.id} onClick={() => setBudget(b.id)}
                    className={`px-3 py-2 rounded-xl text-left transition-all ${budget === b.id ? 'bg-blue-electric text-white shadow-md' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    <div className="text-xs font-bold">{b.label}</div>
                    <div className={`text-[10px] ${budget === b.id ? 'text-blue-100' : 'text-gray-500'}`}>{b.range}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Optional: e.g. white cabinets, open shelving, bright lighting..."
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-xs focus:outline-none focus:border-blue-electric resize-none" />

            {/* Generate */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={generate} disabled={phase === 'generating'}
              className="btn-shimmer w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-60">
              <Wand2 size={20} />
              {phase === 'generating' ? 'Generating your remodel...' : 'Generate My Remodel →'}
            </motion.button>
            <p className="text-center text-[11px] text-gray-500">✓ No signup &nbsp;·&nbsp; ✓ Real AI &nbsp;·&nbsp; ✓ Free demo</p>
          </div>

          {/* RIGHT: Result */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[560px]">
            <AnimatePresence mode="wait">

              {phase === 'done' && resultSrc ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                  <div className="flex-1"><DemoSlider before={beforeImg} after={resultSrc} /></div>
                  {captured ? (
                    <div className="p-5 border-t border-white/10 text-center space-y-3">
                      <p className="text-green-400 font-bold">🎉 Unlocked! Check your email.</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <a href={resultSrc} download="closepro-remodel.jpg"
                          className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                          <Download size={15} /> Download HD
                        </a>
                        <button onClick={reset} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-all">↺ Try Another</button>
                        <Link to="/ai-demo" className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-all">Full Demo →</Link>
                      </div>
                      <Link to="/signup?plan=accelerator" className="block text-blue-electric font-bold text-sm hover:underline mt-1">
                        Want this on your website? Start Free Trial →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-5 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div><p className="text-white font-bold text-sm">Unlock HD — No Watermark</p><p className="text-gray-400 text-xs">Share with clients · Attach to estimates · Download</p></div>
                        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300">↺ Again</button>
                      </div>
                      <form onSubmit={handleCapture} className="flex flex-col sm:flex-row gap-2">
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                          className="flex-1 px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-electric" />
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email"
                          className="flex-1 px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-electric" />
                        <button type="submit" disabled={submitting}
                          className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-1.5 disabled:opacity-60">
                          <Lock size={13} /> {submitting ? 'Unlocking...' : 'Unlock'}
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              ) : phase === 'generating' ? (
                <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-blue-electric/20 border-t-blue-electric" />
                  <div className="w-full max-w-sm space-y-2 font-mono text-sm">
                    {DEMO_GEN_STEPS.slice(0, genStep).map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        className={s.startsWith('✓') ? 'text-green-400' : 'text-gray-400'}>
                        {s.startsWith('✓') ? s : `> ${s}`}
                      </motion.div>
                    ))}
                    {genStep < DEMO_GEN_STEPS.length && <div className="text-gray-600">&gt; <span className="animate-pulse">_</span></div>}
                  </div>
                  <div className="w-full max-w-sm space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500 font-bold"><span>Processing</span><span>{genProgress}%</span></div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div animate={{ width: `${genProgress}%` }} transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-electric to-purple-500 rounded-full" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm text-center italic">AI image generation takes 15–45 seconds.<br />Preserving your room's exact layout...</p>
                </motion.div>
              ) : phase === 'error' ? (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="text-5xl">⚠️</div>
                  <h3 className="text-white font-bold text-lg">Generation Unavailable</h3>
                  <p className="text-gray-400 text-sm max-w-xs">{errorMsg}</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button onClick={generate}
                      className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                      <RefreshCw size={14} /> Try Again
                    </button>
                    <Link to="/ai-demo"
                      className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-all">
                      Full Demo →
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                  <div className="flex-1 relative cursor-pointer group" onClick={generate}>
                    <img src={beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 bg-blue-electric rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-electric/50">
                        <Wand2 size={32} className="text-white" />
                      </motion.div>
                      <p className="text-white font-black text-2xl drop-shadow-lg">Generate AI Remodel</p>
                      <p className="text-gray-300 text-sm">Select style on the left, then click here</p>
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Current Room</div>
                  </div>
                  <div className="p-5 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
                    <div><p className="text-white font-bold text-sm">Configure & Generate</p><p className="text-gray-400 text-xs">Select room, style & budget on the left</p></div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" /> 4.9/5</span>
                      <span>500+ contractors</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom CTA row */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div>
            <p className="text-white font-bold text-lg">Imagine showing this to every homeowner before they sign.</p>
            <p className="text-gray-400 text-sm mt-1">Close more jobs by helping customers see the finished remodel before work begins.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/signup?plan=accelerator" className="btn-shimmer px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <Link to="/book-demo" className="border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
              Book Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── OLD hero constants removed — replaced by HomeDemoSection above ─────────────
const HERO_SAMPLES: Record<string, string> = {
  kitchen:  'https://picsum.photos/seed/kitchen-old-before/800/600',
  bathroom: 'https://picsum.photos/seed/bath-old-before/800/600',
  living:   'https://picsum.photos/seed/living-old-before/800/600',
  exterior: 'https://picsum.photos/seed/ext-old-before/800/600',
};

const HERO_RESULTS: Record<string, Record<string, string>> = {
  kitchen:  { farmhouse: 'https://picsum.photos/seed/kitchen-mf-result/800/600', contemporary: 'https://picsum.photos/seed/kitchen-lc-result/800/600', transitional: 'https://picsum.photos/seed/kitchen-tr-result/800/600', budget: 'https://picsum.photos/seed/kitchen-bm-result/800/600', european: 'https://picsum.photos/seed/kitchen-eu-result/800/600' },
  bathroom: { farmhouse: 'https://picsum.photos/seed/bath-mf-result/800/600', contemporary: 'https://picsum.photos/seed/bath-lc-result/800/600', transitional: 'https://picsum.photos/seed/bath-tr-result/800/600', budget: 'https://picsum.photos/seed/bath-bm-result/800/600', european: 'https://picsum.photos/seed/bath-eu-result/800/600' },
  living:   { farmhouse: 'https://picsum.photos/seed/living-mf/800/600', contemporary: 'https://picsum.photos/seed/living-lc/800/600', transitional: 'https://picsum.photos/seed/living-tr/800/600', budget: 'https://picsum.photos/seed/living-bm/800/600', european: 'https://picsum.photos/seed/living-eu/800/600' },
  exterior: { farmhouse: 'https://picsum.photos/seed/ext-mf/800/600', contemporary: 'https://picsum.photos/seed/ext-lc/800/600', transitional: 'https://picsum.photos/seed/ext-tr/800/600', budget: 'https://picsum.photos/seed/ext-bm/800/600', european: 'https://picsum.photos/seed/ext-eu/800/600' },
};

const HERO_ROOMS = [
  { id: 'kitchen',  label: 'Kitchen',  emoji: '🍳' },
  { id: 'bathroom', label: 'Bath',     emoji: '🛁' },
  { id: 'living',   label: 'Living',   emoji: '🛋️' },
  { id: 'exterior', label: 'Exterior', emoji: '🏠' },
];

const HERO_STYLES = [
  { id: 'farmhouse',    label: 'Modern Farmhouse' },
  { id: 'contemporary', label: 'Luxury Contemporary' },
  { id: 'transitional', label: 'Transitional' },
  { id: 'budget',       label: 'Budget-Friendly' },
  { id: 'european',     label: 'High-End European' },
];

const HERO_GEN_STEPS = [
  'Analyzing space dimensions...',
  'Applying style parameters...',
  'Rendering material selections...',
  '✓ Visualization complete!',
];

function HeroBeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute top-2 right-2 bg-blue-electric text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">AI Result</div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="absolute text-white font-bold text-xs whitespace-nowrap"
              style={{ transform: 'rotate(-30deg)', top: `${i * 30 - 5}%`, left: '-10%', right: '-10%', textAlign: 'center', letterSpacing: '0.3em' }}>
              CLOSEPRO DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO DEMO
            </div>
          ))}
        </div>
      </div>
      {/* Slider handle */}
      <div className="absolute inset-y-0 z-20 cursor-ew-resize" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-lg" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-electric">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-blue-electric rounded-full" />
            <div className="w-0.5 h-3 bg-blue-electric rounded-full" />
          </div>
        </div>
      </div>
      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Before</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

function HeroAIGenerator() {
  const [room, setRoom] = useState('kitchen');
  const [style, setStyle] = useState('farmhouse');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'generating' | 'done' | 'error'>('idle');
  const [genStep, setGenStep] = useState(0);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const beforeImg = HERO_SAMPLES[room];
  const afterImg = resultSrc;

  const fetchAsBase64 = async (url: string): Promise<{ data: string; mimeType: string }> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const [prefix, data] = dataUrl.split(',');
        const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/jpeg';
        resolve({ data, mimeType });
      };
      reader.readAsDataURL(blob);
    });
  };

  const generate = async () => {
    if (phase === 'loading' || phase === 'generating') return;
    setResultSrc(null);
    setErrorMsg('');
    setPhase('loading');
    setGenStep(0);

    // Start visual steps
    setPhase('generating');
    const interval = setInterval(() => {
      setGenStep(prev => Math.min(prev + 1, HERO_GEN_STEPS.length - 2));
    }, 700);

    try {
      const { data: imageBase64, mimeType } = await fetchAsBase64(beforeImg);
      const res = await fetch('/api/generate-remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64, mimeType, roomType: room, style,
          budget: 'highend', mode: 'realistic',
          notes: 'High-quality remodel preview for contractor sales presentation.',
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.message || err.error || 'Generation failed. Try the full demo.');
        setPhase('error');
        return;
      }

      const data = await res.json();
      if (!data.imageData) {
        setErrorMsg('No image generated. Try the full demo to upload your own photo.');
        setPhase('error');
        return;
      }

      setGenStep(HERO_GEN_STEPS.length);
      setResultSrc(`data:${data.mimeType || 'image/jpeg'};base64,${data.imageData}`);
      setPhase('done');
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg('Server not running. Start with: npm run dev');
      setPhase('error');
    }
  };

  const reset = () => { setPhase('idle'); setResultSrc(null); setErrorMsg(''); setGenStep(0); };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
      {/* Terminal header */}
      <div className="bg-[#0d1117] px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-500 text-xs font-mono ml-1">closepro-ai — remodel visualizer</span>
          </div>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] font-black bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> LIVE
          </motion.span>
        </div>
        {/* Room tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {HERO_ROOMS.map(r => (
            <button key={r.id} onClick={() => { setRoom(r.id); reset(); }}
              className={`text-xs py-2 rounded-lg font-bold transition-all ${
                room === r.id ? 'bg-blue-electric text-white shadow-lg shadow-blue-electric/30' : 'text-gray-500 hover:text-white hover:bg-white/10'
              }`}>
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 bg-gray-50">
        {/* Image area */}
        <AnimatePresence mode="wait">
          {phase === 'done' && afterImg ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              <HeroBeforeAfter before={beforeImg} after={afterImg} />
              <p className="text-center text-[11px] text-gray-400 italic">← drag slider to compare</p>
            </motion.div>
          ) : phase === 'generating' || phase === 'loading' ? (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-[4/3] rounded-xl bg-[#0d1117] flex flex-col items-center justify-center space-y-4 p-5">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-4 border-blue-electric/20 border-t-blue-electric" />
              <div className="w-full space-y-2 font-mono text-xs">
                {HERO_GEN_STEPS.slice(0, genStep).map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className={s.startsWith('✓') ? 'text-green-400' : 'text-gray-400'}>
                    {s.startsWith('✓') ? s : `> ${s}`}
                  </motion.div>
                ))}
                {genStep < HERO_GEN_STEPS.length && <div className="text-gray-600">&gt; <span className="animate-pulse">_</span></div>}
              </div>
              <p className="text-gray-600 text-[10px] italic">This may take 15–30 seconds...</p>
            </motion.div>
          ) : phase === 'error' ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="aspect-[4/3] rounded-xl bg-gray-100 flex flex-col items-center justify-center space-y-3 p-5 text-center">
              <p className="text-2xl">⚠️</p>
              <p className="text-sm font-bold text-gray-700">Generation unavailable</p>
              <p className="text-xs text-gray-500">{errorMsg}</p>
              <Link to="/ai-demo" className="text-xs font-bold text-blue-electric hover:underline">Try the full demo →</Link>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer" onClick={generate}>
              <img src={beforeImg} alt="Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-electric/90 backdrop-blur text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Wand2 size={16} /> Click to Generate
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Before — Click Generate</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Style picker */}
        <div className="grid grid-cols-5 gap-1">
          {HERO_STYLES.map(s => (
            <button key={s.id} onClick={() => { setStyle(s.id); reset(); }}
              className={`text-[10px] py-1.5 px-0.5 rounded-lg font-bold transition-all leading-tight text-center ${
                style === s.id ? 'bg-blue-electric text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Action button */}
        {phase === 'done' ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset}
              className="py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:border-blue-electric hover:text-blue-electric transition-all flex items-center justify-center gap-1.5">
              ↺ Try Again
            </button>
            <Link to="/ai-demo"
              className="btn-shimmer py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
              Full Demo <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={generate} disabled={phase === 'generating' || phase === 'loading'}
            className="btn-shimmer w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Wand2 size={16} />
            {phase === 'generating' || phase === 'loading' ? 'Generating your remodel...' : 'Generate My Remodel →'}
          </motion.button>
        )}

        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium">
          <span>✓ No signup needed</span>
          <span>✓ Real AI generation</span>
          <span>✓ Free demo</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('exit-popup-shown')) {
        setShowExitPopup(true);
        localStorage.setItem('exit-popup-shown', 'true');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <div className="overflow-hidden">
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "Organization",
        "name": "ClosePro Remodel", "url": "https://closeproremodel.com",
        "description": "High-converting growth platform for kitchen and bathroom remodelers.",
      })}</script>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-navy overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-electric/20 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-electric/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-electric/20 border border-blue-electric/30 text-blue-electric text-sm font-bold">
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Zap size={14} fill="currentColor" />
            </motion.span>
            The #1 AI Remodel Visualization Tool for Contractors
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Show Homeowners Their{' '}
            <span className="text-blue-electric">Dream Remodel</span>{' '}
            Before You Start
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Upload any kitchen or bathroom photo. AI generates a photorealistic remodel concept in seconds.
            Contractors using ClosePro close <strong className="text-white">3X more $10K–$50K jobs</strong> — on the first visit.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#try-it"
              onClick={() => trackEvent('hero_cta_click')}
              className="btn-shimmer px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-2xl shadow-blue-electric/40">
              <Wand2 size={20} /> Try It Free Below ↓
            </a>
            <Link to="/book-demo"
              className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-white/10 hover:border-white/40 transition-all">
              Book My Demo
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 pt-4">
            {[
              { value: '500', suffix: '+', label: 'Active Contractors' },
              { prefix: '$', value: '450', suffix: 'M+', label: 'Revenue Generated' },
              { value: '4.9', suffix: '/5', label: 'Avg Rating' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-white">{s.prefix}<Counter to={parseFloat(s.value)} />{s.suffix}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── AI DEMO — MAIN PRODUCT ───────────────────────────────────────────── */}
      <HomeDemoSection />

      {/* ── STATS BANNER ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: '+', label: 'Active Remodelers', icon: Users, color: 'text-blue-electric', bg: 'bg-blue-electric/10' },
              { value: 12000, suffix: '+', label: 'Jobs Closed', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
              { prefix: '$', value: 450, suffix: 'M+', label: 'Revenue Generated', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
              { value: 97, suffix: '%', label: 'Client Satisfaction', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            ].map(({ value, suffix, prefix, label, icon: Icon, color, bg }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center space-y-3">
                <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mx-auto shadow-sm`}>
                  <Icon size={24} />
                </div>
                <p className={`text-4xl font-black ${color}`}>
                  <Counter to={value} prefix={prefix || ''} suffix={suffix} />
                </p>
                <p className="text-gray-500 font-medium text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ──────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-sm font-bold uppercase tracking-wider">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">The "Old Way" is Costing You Jobs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Stop losing $50K jobs to contractors with better systems.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '👻', title: 'Ghosted Estimates', desc: 'Sending detailed estimates and never hearing back from the customer.', color: 'border-red-100 hover:border-red-300' },
              { emoji: '🕳️', title: 'Leads Slipping Away', desc: 'Forgetting to follow up with leads that aren\'t ready to buy today.', color: 'border-orange-100 hover:border-orange-300' },
              { emoji: '🤷', title: 'Visualization Gap', desc: 'Customers can\'t see the vision, leading to hesitation and "let me think about it".', color: 'border-yellow-100 hover:border-yellow-300' },
              { emoji: '🔁', title: 'Inconsistent Follow-up', desc: 'No automated system to keep your brand top-of-mind during the decision process.', color: 'border-red-100 hover:border-red-300' },
              { emoji: '📞', title: 'Referral Dependency', desc: 'Waiting for the phone to ring instead of having a predictable lead system.', color: 'border-orange-100 hover:border-orange-300' },
              { emoji: '📋', title: 'Messy Sales Process', desc: 'Tracking jobs on whiteboards or spreadsheets instead of a professional CRM.', color: 'border-yellow-100 hover:border-yellow-300' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`bg-white p-8 rounded-2xl border-2 ${item.color} shadow-sm hover:shadow-lg transition-all duration-300`}>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Arrow pointing down */}
          <div className="text-center mt-12">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex flex-col items-center gap-2 text-gray-400 font-bold text-sm">
              <span>There's a better way</span>
              <span className="text-2xl">↓</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION FEATURES ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-electric/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-wider">
              The Solution
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-navy">Everything You Need to Close More Jobs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">One platform. Every tool a remodeler needs to grow.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Zap}          title="AI Remodel Visualizer" desc="Show customers their dream kitchen or bath in seconds. Close deals on the first visit."       result="Close rate +40%"   color="from-blue-500 to-blue-electric" bg="bg-blue-50"   text="text-blue-electric" delay={0} />
            <FeatureCard icon={LayoutIcon}   title="Lead Capture Website"  desc="High-converting site optimized to turn visitors into demo bookings automatically."          result="Leads +3x"         color="from-purple-500 to-purple-700"  bg="bg-purple-50" text="text-purple-600"    delay={0.08} />
            <FeatureCard icon={BarChart3}    title="CRM Pipeline"          desc="Track every lead from initial contact to signed contract. Never lose a deal again."          result="Zero lost leads"   color="from-green-500 to-green-700"    bg="bg-green-50"  text="text-green-600"     delay={0.16} />
            <FeatureCard icon={MessageSquare} title="Automated Follow-Ups"  desc="Auto SMS and email sequences that nurture leads until they're ready to sign."               result="Response in 60s"   color="from-orange-400 to-orange-600"  bg="bg-orange-50" text="text-orange-600"    delay={0.24} />
            <FeatureCard icon={FileText}     title="Estimates & Invoices"  desc="Professional estimates that get approved faster and invoices that get paid on time."         result="Paid 2x faster"    color="from-teal-400 to-teal-600"      bg="bg-teal-50"   text="text-teal-600"      delay={0.32} />
            <FeatureCard icon={Users}        title="Demo Booking Tools"    desc="Let customers book consultations directly to your calendar while you sleep."                 result="More demos booked" color="from-pink-400 to-pink-600"      bg="bg-pink-50"   text="text-pink-600"      delay={0.4} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-bold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">Up and Running in 4 Steps</h2>
            <p className="text-xl text-gray-500">No tech skills required. We set everything up for you.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-electric/20 via-blue-electric to-blue-electric/20 z-0" />
            {[
              { step: '01', title: 'Quick Setup', desc: 'We build your custom CRM, lead capture site, and AI tools — done in 7 days.', color: 'border-blue-electric bg-blue-electric text-white', icon: '🔧' },
              { step: '02', title: 'Capture Leads', desc: 'High-quality leads flow directly into your automated pipeline 24/7.', color: 'border-purple-500 bg-purple-500 text-white', icon: '🎯' },
              { step: '03', title: 'AI Visualization', desc: 'Show customers their dream remodel during consultations. Close on the spot.', color: 'border-green-500 bg-green-500 text-white', icon: '🤖' },
              { step: '04', title: 'Close & Scale', desc: 'Automated follow-ups ensure you win more $10K–$50K jobs every month.', color: 'border-orange-400 bg-orange-400 text-white', icon: '💰' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative z-10 text-center space-y-4">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 rounded-2xl border-4 ${item.color} flex flex-col items-center justify-center mx-auto shadow-xl text-2xl`}>
                  {item.icon}
                </motion.div>
                <div className="font-black text-4xl text-gray-100">{item.step}</div>
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-blue-electric font-bold text-lg hover:gap-4 transition-all">
              See Full Walkthrough <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TERMINAL AI SECTION ──────────────────────────────────────────────── */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 right-10 w-96 h-96 bg-blue-electric/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm font-bold mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  LIVE AI PIPELINE
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                  Your AI Works{' '}
                  <span className="text-gradient">24/7</span>{' '}
                  While You Sleep
                </h2>
                <p className="text-gray-400 text-xl leading-relaxed">
                  Watch ClosePro AI automatically track your leads, send follow-ups, score opportunities, and book demos — all without you lifting a finger.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: '⚡', text: 'Responds to every lead in under 60 seconds' },
                  { icon: '🤖', text: 'AI scores and prioritizes your highest-value leads' },
                  { icon: '📱', text: 'Auto-sends personalized SMS + email sequences' },
                  { icon: '📅', text: 'Books demos directly to your calendar' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 glass rounded-xl px-4 py-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-200 font-medium text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/book-demo" className="btn-shimmer inline-flex items-center gap-2 px-8 py-4 text-lg">
                See It Live <ChevronRight size={20} />
              </Link>
            </motion.div>

            {/* Right — Terminal */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <TerminalAI />
              <p className="text-center text-gray-500 text-xs mt-4 font-mono">
                ↑ Live simulation of ClosePro AI managing your pipeline
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BANNER ───────────────────────────────────────────────── */}
      <section className="py-12 bg-gradient-to-r from-navy via-blue-900 to-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.15),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '< 60s', label: 'Auto Lead Response', icon: '⚡' },
              { value: '+40%', label: 'Avg Close Rate Lift', icon: '📈' },
              { value: '$28K', label: 'Avg Job Value Closed', icon: '💰' },
              { value: '7 Days', label: 'To Go Live', icon: '🚀' }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="space-y-2">
                <div className="text-3xl">{s.icon}</div>
                <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
                <p className="text-gray-400 text-sm font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Chart card */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative">
            <div className="absolute -top-5 -left-5 bg-blue-electric text-white px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg z-10">
              📊 Example Client Results
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-electric/5 rounded-full -mr-20 -mt-20" />
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Monthly Revenue</p>
                  <p className="text-5xl font-black text-navy">$142,500</p>
                </div>
                <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-1">
                  <TrendingUp size={14} /> +34%
                </span>
              </div>
              <div className="h-48 flex items-end gap-2 mb-6">
                {[40, 60, 45, 70, 85, 65, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t-lg relative">
                    <motion.div initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-electric to-blue-electric/70 rounded-t-lg" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                {[{ label: 'New Leads', value: '48' }, { label: 'Demos Booked', value: '22' }, { label: 'Jobs Closed', value: '9' }].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-black text-navy">{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="space-y-8">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-bold uppercase tracking-wider">Real Results</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight">Focus on Business Outcomes, Not Just Features</h2>
            <p className="text-xl text-gray-500 leading-relaxed">Our platform isn't just tools — it's the results that matter to your bottom line.</p>
            <div className="space-y-6">
              {[
                { icon: TrendingUp, title: 'Close More High-Ticket Jobs', desc: 'Increase your average project value by building trust with AI visuals.', color: 'bg-blue-electric text-white', glow: 'shadow-blue-electric/30' },
                { icon: Clock, title: 'Respond to Leads in Under 60 Seconds', desc: 'Automated speed-to-lead ensures you\'re first — every single time.', color: 'bg-green-500 text-white', glow: 'shadow-green-500/30' },
                { icon: MessageSquare, title: 'Stop Losing Deals to Poor Follow-Up', desc: 'Our automation keeps you top-of-mind until they\'re ready to sign.', color: 'bg-purple-500 text-white', glow: 'shadow-purple-500/30' },
                { icon: Shield, title: 'Look Like the Premium Contractor', desc: 'A high-end sales system that positions you above all competition.', color: 'bg-orange-500 text-white', glow: 'shadow-orange-500/30' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg ${item.glow} group-hover:scale-110 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-sm font-bold uppercase tracking-wider">Who It's For</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy">Built for Your Trade</h2>
            <p className="text-xl text-gray-500">Specialized tools for every type of remodeling professional.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🍳', title: 'Kitchen Remodelers', href: '/kitchen-remodeling-leads', desc: 'Show off high-end cabinetry, layout changes, and countertops with AI.', gradient: 'from-blue-electric to-blue-700' },
              { emoji: '🛁', title: 'Bathroom Remodelers', href: '/bathroom-remodeling-leads', desc: 'Help clients visualize tile, fixtures, and modern spa-inspired layouts.', gradient: 'from-purple-500 to-purple-700' },
              { emoji: '🏠', title: 'Home Remodelers', href: '/home-remodeling-leads', desc: 'Manage complex multi-room projects with a streamlined CRM system.', gradient: 'from-green-500 to-green-700' },
              { emoji: '🔨', title: 'General Contractors', href: '/general-contractor-crm', desc: 'Professionalize your entire sales process and win bigger bids.', gradient: 'from-orange-400 to-orange-600' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}>
                <Link to={item.href}
                  className="block group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
                  <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
                  <div className="p-8 space-y-4">
                    <div className="text-4xl">{item.emoji}</div>
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-navy group-hover:text-blue-electric transition-colors">{item.title}</h3>
                      <ArrowUpRight className="text-gray-300 group-hover:text-blue-electric transition-all group-hover:translate-x-1 group-hover:-translate-y-1 flex-shrink-0 mt-1" size={20} />
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    <span className="inline-block text-blue-electric font-bold text-sm border-b-2 border-blue-electric/20 group-hover:border-blue-electric transition-all pb-0.5">Learn More</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(30,144,255,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-bold uppercase tracking-wider mb-4">Client Results</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real Remodelers. Real Revenue.</h2>
            <div className="flex justify-center text-yellow-400 gap-1">
              {[1,2,3,4,5].map((i) => <Star key={i} size={22} fill="currentColor" />)}
            </div>
            <p className="text-gray-400 text-sm mt-2 font-medium">4.9/5 from 200+ contractor reviews</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Mark Thompson', company: 'Thompson Kitchens', result: '25% Close Rate Increase', quote: 'ClosePro changed our business entirely. The AI visualizer alone has increased our close rate by 25% — clients can actually see the vision now.', avatar: 'MT', color: 'bg-blue-electric' },
              { name: 'Sarah Jenkins', company: 'Elite Bath & Spa', result: '$80K Job Closed', quote: 'The automated follow-up is a lifesaver. I closed an $80K bathroom remodel from a lead that went cold 3 weeks earlier. The system kept us top of mind.', avatar: 'SJ', color: 'bg-purple-500' },
              { name: 'David Rodriguez', company: 'DR Remodeling', result: '12 Jobs in 30 Days', quote: 'Finally a system that understands the remodeling industry. Booked 12 jobs in the first 30 days. Professional, fast, and it actually works.', avatar: 'DR', color: 'bg-green-500' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                <div className="absolute -top-4 right-6 bg-gradient-to-r from-blue-electric to-purple-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-wide">
                  ✅ {item.result}
                </div>
                <div className="flex text-yellow-400 gap-0.5 mb-5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-200 italic leading-relaxed mb-6 text-lg">"{item.quote}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center font-black text-white shadow-lg`}>
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-blue-electric text-sm font-bold">{item.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/results" className="inline-flex items-center gap-2 text-blue-electric font-bold hover:gap-4 transition-all">
              See All Client Results <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-wider mb-4">Simple Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">Start for Less Than One Job</h2>
            <p className="text-xl text-gray-500">Plans starting at $97/month. One closed job pays for the whole year.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              { plan: 'Starter', price: '$97', color: 'border-gray-200', badge: '', features: ['Lead capture website', 'Basic CRM', 'Email follow-ups'] },
              { plan: 'Growth', price: '$197', color: 'border-blue-electric', badge: 'Most Popular', features: ['Everything in Starter', 'AI Visualizer', 'SMS automation', 'Pipeline tracking'] },
              { plan: 'Pro', price: '$497', color: 'border-purple-400', badge: 'Best Value', features: ['Everything in Growth', 'AI ad generator', 'Blog system', 'Priority support'] },
            ].map((tier, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative bg-white rounded-2xl p-6 border-2 ${tier.color} shadow-sm hover:shadow-lg transition-all`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white ${i === 1 ? 'bg-blue-electric' : 'bg-purple-500'} shadow-md`}>
                    {tier.badge}
                  </div>
                )}
                <p className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-1">{tier.plan}</p>
                <p className="text-4xl font-black text-navy mb-4">{tier.price}<span className="text-base font-normal text-gray-400">/mo</span></p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to={`/signup?plan=${tier.plan.toLowerCase()}`} className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${i === 1 ? 'bg-blue-electric text-white hover:bg-blue-700' : 'border-2 border-current text-navy hover:bg-navy hover:text-white'}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
          <Link to="/pricing" className="inline-flex items-center gap-2 text-blue-electric font-bold hover:gap-4 transition-all">
            See Full Pricing Details <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-blue-900 to-navy" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.3),transparent_70%)]" />
        <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-electric/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 text-white rounded-full text-sm font-bold mb-6">
              🚀 Limited Spots This Month
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Start Closing{' '}
              <span className="text-blue-electric">High-Ticket</span>{' '}
              Remodel Jobs Today
            </h2>
            <p className="text-xl text-gray-300 mb-10">No more chasing leads. No more missed follow-ups. No more losing jobs to less qualified contractors.</p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {['More leads', 'Better close rates', 'Automated follow-up', 'AI visualization'].map((t, i) => (
                <span key={i} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold">
                  <CheckCircle2 size={16} className="text-blue-electric" /> {t}
                </span>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/book-demo"
                onClick={() => trackEvent('final_cta_click')}
                className="btn-shimmer inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl shadow-blue-electric/50">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>👉</motion.span>
                Book My Free Demo
                <ChevronRight size={28} />
              </Link>
            </motion.div>
            <p className="text-gray-400 text-sm mt-6">No credit card required · 15-minute demo · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know before booking your demo.</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'How fast can I get leads with ClosePro?', a: 'Most clients see their first qualified lead within 7 days of going live. Our automated speed-to-lead responds to every inquiry in under 60 seconds, which is the #1 factor in winning more jobs.' },
              { q: 'What is the best CRM for remodelers?', a: 'The best CRM for remodelers handles the unique long-cycle sales of high-ticket projects. ClosePro includes visual pipelines, automated follow-ups, and AI visualization built specifically for this industry.' },
              { q: 'How do I close $20K–$50K remodel jobs?', a: 'Closing high-ticket jobs requires building massive trust. Our AI visualizer helps clients see the vision instantly, while our automated follow-up keeps you top-of-mind throughout their decision process.' },
              { q: 'Do I need tech skills to use ClosePro?', a: 'Zero. We set everything up for you in 7 days or less. After that, everything is designed to be simple enough that you can use it between job sites from your phone.' },
              { q: 'What\'s included in the $97/month plan?', a: 'You get a high-converting lead capture website, basic CRM, and email follow-ups. Upgrade to Growth ($197) for the AI Visualizer, SMS automation, and pipeline tracking.' },
              { q: 'Why do remodeling leads not convert?', a: '80% of sales require 5–12 follow-ups, but most contractors stop after 2. Slow response times and inconsistent follow-up kill conversions. We automate the entire process so you never lose another lead.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-navy pr-4">{item.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className="text-blue-electric flex-shrink-0 text-2xl font-light leading-none">+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXIT POPUP ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExitPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-electric to-purple-500" />
              <button onClick={() => setShowExitPopup(false)} className="absolute top-5 right-5 text-gray-300 hover:text-navy transition-colors">
                <X size={22} />
              </button>
              <div className="text-center space-y-6">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 bg-blue-electric rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-electric/30 text-4xl">
                  💰
                </motion.div>
                <h2 className="text-3xl font-black text-navy">Wait — Don't Leave Money on the Table</h2>
                <p className="text-gray-500 text-lg">Contractors using ClosePro close an average of <strong className="text-navy">3 extra $20K+ jobs per month.</strong> That's $60K you might be missing.</p>
                <Link to="/book-demo" onClick={() => { setShowExitPopup(false); trackEvent('exit_popup_cta_click'); }}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-electric/30">
                  👉 Book My Free Demo
                </Link>
                <button onClick={() => setShowExitPopup(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  No thanks, I have enough leads
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

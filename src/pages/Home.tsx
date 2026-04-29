import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, CheckCircle2, Star, ArrowRight, Zap, Upload, Download, Lock, RefreshCw, ChevronDown } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Image helpers ─────────────────────────────────────────────────────────────

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

// ── Config ────────────────────────────────────────────────────────────────────

const SAMPLES: Record<string, string> = {
  kitchen:  '/samples/kitchen.jpg',
  bathroom: '/samples/bathroom.jpg',
};

const KITCHEN_STYLES = [
  { id: 'modern',       label: 'Modern' },
  { id: 'luxury',       label: 'Luxury' },
  { id: 'farmhouse',    label: 'Farmhouse' },
  { id: 'traditional',  label: 'Traditional' },
  { id: 'contemporary', label: 'Contemporary' },
  { id: 'budget',       label: 'Budget-Friendly' },
];

const BATHROOM_STYLES = [
  { id: 'modern',      label: 'Modern' },
  { id: 'luxury',      label: 'Spa Luxury' },
  { id: 'minimalist',  label: 'Minimalist' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'budget',      label: 'Budget' },
  { id: 'bold',        label: 'Bold / Dark' },
];

const GEN_STEPS = [
  'Analyzing room layout...',
  'Applying style parameters...',
  'Generating photorealistic preview...',
  '✓ Done!',
];

// ── Before/After Slider ───────────────────────────────────────────────────────

function Slider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none bg-gray-100">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute top-3 right-3 bg-blue-electric text-white text-xs font-black px-2 py-0.5 rounded-full">AI Result</div>
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
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
          <div className="flex gap-0.5"><div className="w-1 h-4 bg-blue-electric rounded-full" /><div className="w-1 h-4 bg-blue-electric rounded-full" /></div>
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-widest">Before</div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">← drag to compare →</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

// ── Live Demo ─────────────────────────────────────────────────────────────────

function LiveDemo() {
  const [tab, setTab]         = useState<'sample' | 'upload'>('sample');
  const [room, setRoom]       = useState<'kitchen' | 'bathroom'>('kitchen');
  const [style, setStyle]     = useState('modern');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase]       = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [genStep, setGenStep]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [email, setEmail]         = useState('');
  const [name, setName]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captured, setCaptured]   = useState(false);

  const styles    = room === 'kitchen' ? KITCHEN_STYLES : BATHROOM_STYLES;
  const beforeImg = (tab === 'upload' && previewUrl) ? previewUrl : SAMPLES[room];

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

  const reset = () => { setPhase('idle'); setResultSrc(null); setErrorMsg(''); setGenStep(0); setProgress(0); setCaptured(false); };

  const generate = async () => {
    if (phase === 'generating') return;
    reset(); setPhase('generating');
    const interval = setInterval(() => {
      setGenStep(prev => { const next = Math.min(prev + 1, GEN_STEPS.length - 2); setProgress(Math.round((next / GEN_STEPS.length) * 85)); return next; });
    }, 900);
    try {
      let base64: string, mimeType: string;
      if (tab === 'upload' && uploadedFile) {
        ({ base64, mimeType } = await compressForDemo(uploadedFile));
      } else {
        ({ base64, mimeType } = await fetchUrlBase64(SAMPLES[room]));
      }
      const res = await fetch('/api/generate-remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, roomType: room, style, budget: 'highend', mode: 'realistic', notes: 'Photorealistic contractor sales preview.' }),
      });
      clearInterval(interval);
      setGenStep(GEN_STEPS.length); setProgress(100);
      if (!res.ok) { const e = await res.json().catch(() => ({})); setErrorMsg(e.message || 'Generation failed. Try again.'); setPhase('error'); return; }
      const data = await res.json();
      if (!data.imageData) { setErrorMsg('No image returned. Please try again.'); setPhase('error'); return; }
      await new Promise(r => setTimeout(r, 400));
      setResultSrc(`data:${data.mimeType || 'image/jpeg'};base64,${data.imageData}`);
      setPhase('done');
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg('Connection error. Please try again.');
      setPhase('error');
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await addDoc(collection(db, 'aiDemoLeads'), { email, name, roomType: room, style, source: 'home-demo', createdAt: serverTimestamp() }); } catch {}
    setCaptured(true); setSubmitting(false);
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-5">
      {/* Controls */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
        {/* Photo source */}
        <div className="flex gap-1 bg-black/30 rounded-xl p-1">
          {[{ id: 'sample', label: '📷 Sample' }, { id: 'upload', label: '⬆️ Upload Yours' }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as any); reset(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-navy shadow' : 'text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'sample' ? (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SAMPLES).map(([key, url]) => (
              <button key={key} onClick={() => { setRoom(key as any); setStyle('modern'); reset(); }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${room === key ? 'border-blue-electric scale-[1.03] shadow-lg shadow-blue-electric/30' : 'border-white/10 hover:border-blue-electric/50'}`}>
                <img src={url} alt={key} className="w-full h-20 object-cover" referrerPolicy="no-referrer" />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs font-bold py-1 text-center capitalize">{key}</div>
              </button>
            ))}
          </div>
        ) : (
          <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-electric bg-blue-electric/10' : previewUrl ? 'border-green-400 bg-green-400/10' : 'border-white/20 hover:border-blue-electric'}`}
            onClick={() => fileRef.current?.click()}>
            {previewUrl
              ? <><img src={previewUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg mb-2" /><p className="text-green-400 text-xs font-bold">✓ Ready!</p></>
              : <><Upload size={22} className="text-gray-400 mx-auto mb-2" /><p className="text-white text-sm font-bold">Drop photo here</p><p className="text-gray-500 text-xs mt-1">JPG, PNG up to 20MB</p></>}
            <input ref={fileRef} type="file" accept="image/*"
              style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        )}

        {/* Room */}
        <div className="grid grid-cols-2 gap-2">
          {[{ id: 'kitchen', label: '🍳 Kitchen' }, { id: 'bathroom', label: '🛁 Bathroom' }].map(r => (
            <button key={r.id} onClick={() => { setRoom(r.id as any); setStyle('modern'); reset(); }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${room === r.id ? 'bg-blue-electric text-white shadow-lg shadow-blue-electric/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Style */}
        <div className="grid grid-cols-3 gap-1.5">
          {styles.map(s => (
            <button key={s.id} onClick={() => { setStyle(s.id); if (phase === 'done') reset(); }}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${style === s.id ? 'bg-blue-electric text-white shadow-md' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {s.label}
            </button>
          ))}
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={generate} disabled={phase === 'generating'}
          className="btn-shimmer w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-60">
          <Wand2 size={20} />
          {phase === 'generating' ? 'Generating...' : 'Generate My Remodel →'}
        </motion.button>

        <p className="text-center text-[11px] text-gray-500">✓ No signup &nbsp;·&nbsp; ✓ Real AI &nbsp;·&nbsp; ✓ Free demo</p>
      </div>

      {/* Result panel */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
        <AnimatePresence mode="wait">
          {phase === 'done' && resultSrc ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
              <div className="flex-1"><Slider before={beforeImg} after={resultSrc} /></div>
              {captured ? (
                <div className="p-5 border-t border-white/10 text-center space-y-3">
                  <p className="text-green-400 font-bold">🎉 Unlocked! This is what contractors show homeowners to close deals.</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <a href={resultSrc} download="closepro-remodel.jpg"
                      className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                      <Download size={15} /> Download
                    </a>
                    <button onClick={reset} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/10">↺ Try Another</button>
                  </div>
                  <Link to="/signup" className="block text-blue-electric font-bold text-sm hover:underline">
                    Add this tool to your contractor website → Start Free Trial
                  </Link>
                </div>
              ) : (
                <div className="p-5 border-t border-white/10 space-y-3">
                  <p className="text-white font-bold text-sm">Unlock your HD result — free</p>
                  <form onSubmit={handleCapture} className="flex flex-col sm:flex-row gap-2">
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                      className="flex-1 px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-electric" />
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email"
                      className="flex-1 px-3 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-blue-electric" />
                    <button type="submit" disabled={submitting}
                      className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap">
                      <Lock size={13} /> {submitting ? 'Saving...' : 'Unlock'}
                    </button>
                  </form>
                  <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 float-right">↺ Try again</button>
                </div>
              )}
            </motion.div>
          ) : phase === 'generating' ? (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-4 border-blue-electric/20 border-t-blue-electric" />
              <div className="w-full max-w-xs space-y-2 font-mono text-sm">
                {GEN_STEPS.slice(0, genStep).map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className={s.startsWith('✓') ? 'text-green-400' : 'text-gray-400'}>
                    {s.startsWith('✓') ? s : `> ${s}`}
                  </motion.div>
                ))}
                {genStep < GEN_STEPS.length && <div className="text-gray-600">&gt; <span className="animate-pulse">_</span></div>}
              </div>
              <div className="w-full max-w-xs space-y-1">
                <div className="flex justify-between text-xs text-gray-500"><span>Processing</span><span>{progress}%</span></div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-electric to-purple-500 rounded-full" />
                </div>
              </div>
              <p className="text-gray-500 text-xs text-center">Takes 15–45 seconds...</p>
            </motion.div>
          ) : phase === 'error' ? (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <p className="text-4xl">⚠️</p>
              <p className="text-white font-bold">Generation failed</p>
              <p className="text-gray-400 text-sm max-w-xs">{errorMsg}</p>
              <button onClick={generate} className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                <RefreshCw size={14} /> Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
              <div className="flex-1 relative cursor-pointer group" onClick={generate}>
                <img src={beforeImg} alt="Before" className="absolute inset-0 w-full h-full object-cover group-hover:brightness-75 transition-all duration-300" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div whileHover={{ scale: 1.1 }}
                    className="w-18 h-18 w-20 h-20 bg-blue-electric rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-electric/50">
                    <Wand2 size={32} className="text-white" />
                  </motion.div>
                  <p className="text-white font-black text-xl drop-shadow-lg">Click to Generate</p>
                  <p className="text-gray-300 text-sm">Select room & style on the left</p>
                </div>
                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Before</div>
              </div>
              <div className="p-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-gray-400 text-xs">Select a style, then click the image or the button</p>
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden pt-12 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,144,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-40 right-0 w-[600px] h-[600px] bg-blue-electric/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 pt-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-electric/20 border border-blue-electric/30 text-blue-electric text-sm font-bold">
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Zap size={14} fill="currentColor" />
            </motion.span>
            The AI Tool 500+ Contractors Add to Their Website
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05]">
            Show Homeowners Their<br />
            <span className="text-blue-electric">Dream Remodel</span><br />
            Before You Start
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto">
            One snippet on your website. Homeowners upload a photo. AI shows the finished remodel in seconds. You get the lead — with before & after photos saved automatically.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup"
              className="btn-shimmer px-8 py-4 rounded-xl font-black text-lg flex items-center gap-2 shadow-2xl shadow-blue-electric/30">
              Start Free Trial — $149/mo <ArrowRight size={20} />
            </Link>
            <a href="#demo"
              className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-white/10 transition-all">
              See It Live ↓
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 pt-2 text-sm text-gray-400 font-medium">
            <span>✓ No long-term contract</span>
            <span>✓ Works on any website</span>
            <span>✓ Setup in 5 minutes</span>
            <span>✓ 300 generations/month</span>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE DEMO ── */}
      <section id="demo" className="bg-navy border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-electric/20 border border-blue-electric/30 text-blue-electric text-sm font-bold">
              <Wand2 size={14} /> TRY IT FREE — No Signup Required
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">This Goes on Your Website</h2>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">Try it yourself. This is exactly what your customers will see.</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 space-y-3">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-bold uppercase tracking-wider">Dead Simple</span>
            <h2 className="text-4xl md:text-5xl font-black text-navy">Up and Running in 5 Minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '🔑', title: 'Sign Up', desc: 'Create your account. You get a unique embed code tied to your contractor dashboard.' },
              { step: '2', icon: '💻', title: 'Paste One Line', desc: 'Copy your embed snippet and paste it into your website — works on Wix, Squarespace, WordPress, any site builder.' },
              { step: '3', icon: '📥', title: 'Get Leads', desc: 'Homeowners generate remodel concepts on your site. Their name, email, and both photos appear instantly in your dashboard.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-electric rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-electric/20 text-3xl">
                  {item.icon}
                </div>
                <div className="text-5xl font-black text-gray-100">{item.step}</div>
                <h3 className="text-xl font-bold text-navy">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-4xl md:text-5xl font-black text-navy">Everything Included</h2>
            <p className="text-gray-500 text-lg">One simple tool. No bloated features you'll never use.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🤖', title: 'AI Remodel Visualizer Widget', desc: 'The interactive tool lives on YOUR website. Homeowners upload their kitchen or bathroom photo. AI generates a photorealistic remodel in 30–60 seconds.' },
              { icon: '📥', title: 'Automatic Lead Capture', desc: 'Every homeowner who generates a visualization enters their name and email to unlock the result. That lead is instantly saved to your dashboard.' },
              { icon: '📸', title: 'Before & After Photos Saved', desc: 'Both the original photo and the AI result are saved under the homeowner\'s name. You can download them to use in estimates and presentations.' },
              { icon: '📁', title: 'Simple Project Folders', desc: 'Organize leads into project folders by customer name. No complicated pipeline stages — just a clean list of who\'s interested and their photos.' },
              { icon: '🔗', title: 'Your Embed Code', desc: 'One iframe snippet. Works on any website in minutes. No developer needed — if you can edit your own website, you can install this.' },
              { icon: '⚡', title: '300 Generations/Month', desc: 'That\'s 300 homeowner sessions on your website. Most active contractors use 40–80/month. More than enough to drive serious leads.' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <div className="flex justify-center text-yellow-400 gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <h2 className="text-4xl font-black">Contractors Are Closing More Jobs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'Used it on my first consultation. Client signed a $32K deal on the spot after seeing the AI result. Worth every penny.', name: 'Mike T.', company: 'Thompson Kitchens, OK' },
              { quote: 'I embedded it on my Wix site in 10 minutes. Had my first lead come through that same day. This thing actually works.', name: 'Sarah J.', company: 'Elite Bath & Spa, TX' },
              { quote: 'Homeowners are blown away when they see their own kitchen transformed. It separates me from every competitor bidding the same job.', name: 'David R.', company: 'DR Remodeling, CO' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex text-yellow-400 gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="text-gray-200 italic text-sm leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-blue-electric text-xs font-bold">{t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-lg mx-auto px-6 text-center space-y-8">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 bg-blue-electric/10 text-blue-electric rounded-full text-sm font-bold uppercase tracking-wider">Simple Pricing</span>
            <h2 className="text-4xl md:text-5xl font-black text-navy">One Plan. Everything Included.</h2>
            <p className="text-gray-500 text-lg">One extra closed job pays for a full year.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-navy rounded-3xl p-8 text-white text-left space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-electric/10 rounded-full -mr-20 -mt-20" />
            <div className="relative z-10">
              <p className="text-blue-electric font-bold text-sm uppercase tracking-widest mb-2">ClosePro AI Widget</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">$</span>
                <span className="text-7xl font-black tracking-tighter">149</span>
                <span className="text-gray-400 font-bold">/month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">No contracts. Cancel anytime.</p>

              <ul className="space-y-3 mb-8">
                {[
                  'AI remodel visualizer on YOUR website',
                  '300 homeowner generations/month',
                  'Lead inbox (name, email + photos)',
                  'Before & after photos saved',
                  'Simple project folders',
                  'Your unique embed code',
                  'Works on any website builder',
                  'Email support',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-200">
                    <CheckCircle2 size={16} className="text-blue-electric shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Link to="/signup"
                className="btn-shimmer w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 block text-center">
                Start Free Trial <ArrowRight size={20} />
              </Link>
              <p className="text-center text-gray-500 text-xs mt-3">No credit card required to start</p>
            </div>
          </motion.div>

          <p className="text-gray-500 text-sm">
            Need more than 300 generations? Extra generations are <strong className="text-navy">$0.25 each</strong>. Most contractors never need it.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black text-navy text-center mb-12">Questions</h2>
          <div className="space-y-3">
            {[
              { q: 'What exactly is a "generation"?', a: 'One generation = one homeowner uploading a photo and receiving an AI remodel result. You get 300 of these per month. Most contractors use 20–80/month.' },
              { q: 'How do I add it to my website?', a: 'You get a simple iframe code snippet. Paste it anywhere on your website — a new page, a sidebar, anywhere. It takes about 5 minutes. Works on Wix, Squarespace, WordPress, GoDaddy, and any other website builder.' },
              { q: 'What do I see in my dashboard?', a: 'Every homeowner who uses your widget shows up with their name, email, the photo they uploaded, and the AI result. You can organize them into project folders by customer name and download the photos.' },
              { q: 'Does this replace my CRM?', a: "No — it's intentionally simple. It's a lead capture and photo storage tool, not a full CRM. Use it alongside whatever you already use for managing jobs." },
              { q: 'What if the AI result doesn\'t look right?', a: 'The AI works best with well-lit, wide-angle photos of the full room. We provide tips inside the widget to help homeowners take better photos. Results improve significantly with good lighting and a clear room view.' },
              { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no cancellation fees. Cancel from your account settings and you will not be billed again.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-navy text-sm pr-4">{item.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="text-gray-400 shrink-0"><ChevronDown size={18} /></motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.2),transparent_70%)]" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 space-y-6">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Your competitors don't have this.<br />
            <span className="text-blue-electric">Yet.</span>
          </h2>
          <p className="text-xl text-gray-300">
            Add the AI remodel visualizer to your website today and start capturing leads that close into $10K–$50K jobs.
          </p>
          <Link to="/signup"
            className="btn-shimmer inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-electric/40">
            Start Free Trial — $149/mo <ArrowRight size={24} />
          </Link>
          <p className="text-gray-500 text-sm">No credit card required · Cancel anytime · Up in 5 minutes</p>
        </div>
      </section>

    </div>
  );
}

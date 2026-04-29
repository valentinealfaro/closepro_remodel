import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Wand2, ChevronRight, Download, Share2, Lock, CheckCircle2, Star, ArrowRight, X, Zap, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Step = 'upload' | 'configure' | 'generating' | 'result' | 'captured';

interface Config { roomType: string; style: string; budget: string; notes: string; }

// Demo result image pairs by room + style
const DEMO_RESULTS: Record<string, Record<string, string>> = {
  kitchen: {
    farmhouse:   'https://picsum.photos/seed/kitchen-mf-result/1200/900',
    contemporary:'https://picsum.photos/seed/kitchen-lc-result/1200/900',
    transitional:'https://picsum.photos/seed/kitchen-tr-result/1200/900',
    budget:      'https://picsum.photos/seed/kitchen-bm-result/1200/900',
    european:    'https://picsum.photos/seed/kitchen-eu-result/1200/900',
  },
  bathroom: {
    farmhouse:   'https://picsum.photos/seed/bath-mf-result/1200/900',
    contemporary:'https://picsum.photos/seed/bath-lc-result/1200/900',
    transitional:'https://picsum.photos/seed/bath-tr-result/1200/900',
    budget:      'https://picsum.photos/seed/bath-bm-result/1200/900',
    european:    'https://picsum.photos/seed/bath-eu-result/1200/900',
  },
  living: {
    farmhouse:   'https://picsum.photos/seed/living-mf/1200/900',
    contemporary:'https://picsum.photos/seed/living-lc/1200/900',
    transitional:'https://picsum.photos/seed/living-tr/1200/900',
    budget:      'https://picsum.photos/seed/living-bm/1200/900',
    european:    'https://picsum.photos/seed/living-eu/1200/900',
  },
  exterior: {
    farmhouse:   'https://picsum.photos/seed/ext-mf/1200/900',
    contemporary:'https://picsum.photos/seed/ext-lc/1200/900',
    transitional:'https://picsum.photos/seed/ext-tr/1200/900',
    budget:      'https://picsum.photos/seed/ext-bm/1200/900',
    european:    'https://picsum.photos/seed/ext-eu/1200/900',
  },
};

const SAMPLE_BEFORES: Record<string, string> = {
  kitchen:  'https://picsum.photos/seed/kitchen-old-before/1200/900',
  bathroom: 'https://picsum.photos/seed/bath-old-before/1200/900',
  living:   'https://picsum.photos/seed/living-old-before/1200/900',
  exterior: 'https://picsum.photos/seed/ext-old-before/1200/900',
};

const ROOM_TYPES = [
  { id: 'kitchen',  label: 'Kitchen',      emoji: '🍳' },
  { id: 'bathroom', label: 'Bathroom',     emoji: '🛁' },
  { id: 'living',   label: 'Living Room',  emoji: '🛋️' },
  { id: 'exterior', label: 'Exterior',     emoji: '🏠' },
];

const STYLES = [
  { id: 'farmhouse',    label: 'Modern Farmhouse',    desc: 'Shaker cabinets, warm wood tones' },
  { id: 'contemporary', label: 'Luxury Contemporary', desc: 'Waterfall islands, premium finishes' },
  { id: 'transitional', label: 'Transitional',        desc: 'Classic meets modern elegance' },
  { id: 'budget',       label: 'Budget-Friendly',     desc: 'High impact, smart spending' },
  { id: 'european',     label: 'High-End European',   desc: 'Bold veining, custom millwork' },
];

const BUDGETS = [
  { id: 'economy',  label: 'Economy',  range: '$5K–$15K' },
  { id: 'standard', label: 'Standard', range: '$15K–$35K' },
  { id: 'premium',  label: 'Premium',  range: '$35K–$75K' },
  { id: 'luxury',   label: 'Luxury',   range: '$75K+' },
];

const GEN_STEPS = [
  '> Analyzing room dimensions and lighting...',
  '> Detecting existing fixtures and materials...',
  '> Applying style parameters: {style}...',
  '> Generating {budget} material selections...',
  '> Rendering 3D spatial mapping...',
  '> Applying texture and color correction...',
  '> Compositing final visualization...',
  '✓ Remodel visualization complete!',
];

// Slider component
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden select-none">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="absolute text-white font-bold text-sm whitespace-nowrap"
              style={{ transform: 'rotate(-30deg)', top: `${i * 20 - 10}%`, left: '-10%', right: '-10%', textAlign: 'center', letterSpacing: '0.2em', opacity: 0.6 }}>
              CLOSEPRO REMODEL DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO REMODEL DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO REMODEL DEMO
            </div>
          ))}
        </div>
        <div className="absolute top-3 right-3 bg-blue-electric text-white text-xs font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
          AI Result
        </div>
      </div>
      {/* Slider handle */}
      <div className="absolute inset-y-0 z-20 cursor-ew-resize" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-lg" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
          <div className="flex gap-0.5"><div className="w-1 h-4 bg-blue-electric rounded-full" /><div className="w-1 h-4 bg-blue-electric rounded-full" /></div>
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-widest">Before</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

export default function AiDemo() {
  const [step, setStep] = useState<Step>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [config, setConfig] = useState<Config>({ roomType: 'kitchen', style: 'farmhouse', budget: 'premium', notes: '' });
  const [genStep, setGenStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const beforeImage = uploadedImage || SAMPLE_BEFORES[config.roomType];
  const afterImage = DEMO_RESULTS[config.roomType]?.[config.style] || DEMO_RESULTS.kitchen.modern;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => { setUploadedImage(e.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const runGeneration = () => {
    setStep('generating');
    setGenStep(0);
    setGenProgress(0);
    const total = GEN_STEPS.length;
    GEN_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setGenStep(i + 1);
        setGenProgress(Math.round(((i + 1) / total) * 100));
        if (i === total - 1) setTimeout(() => setStep('result'), 600);
      }, i * 700);
    });
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'aiDemoLeads'), {
        email, name,
        roomType: config.roomType,
        style: config.style,
        budget: config.budget,
        notes: config.notes,
        source: 'ai-demo-page',
        createdAt: serverTimestamp(),
      });
    } catch { /* Firebase optional */ }
    setStep('captured');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div className="bg-navy text-white py-10 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-electric/20 border border-blue-electric/30 text-blue-electric px-4 py-1.5 rounded-full text-sm font-bold">
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Zap size={14} fill="currentColor" /></motion.span>
            FREE DEMO — No signup required
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            See Your Remodel <span className="text-gradient">Before You Build It</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upload a photo of any room and our AI generates a stunning remodel visualization in seconds. Used by 500+ contractors to close $10K–$50K jobs.
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 md:gap-6">
          {[
            { id: 'upload', label: '1. Upload Photo' },
            { id: 'configure', label: '2. Choose Style' },
            { id: 'generating', label: '3. AI Generates' },
            { id: 'result', label: '4. See Result' },
          ].map((s, i, arr) => {
            const steps: Step[] = ['upload', 'configure', 'generating', 'result', 'captured'];
            const active = steps.indexOf(step) >= steps.indexOf(s.id as Step);
            return (
              <div key={s.id} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold ${active ? 'text-blue-electric' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${active ? 'bg-blue-electric text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:block">{s.label.replace(/^\d\. /, '')}</span>
                </div>
                {i < arr.length - 1 && <div className={`w-8 md:w-16 h-0.5 ${active && steps.indexOf(step) > i ? 'bg-blue-electric' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: UPLOAD ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-navy">See Your Room Transformed Instantly</h2>
                <p className="text-gray-500">No account needed. Pick a sample or upload your own photo.</p>
              </div>

              {/* Sample photos — PRIMARY option (kills upload friction) */}
              <div className="bg-blue-electric/5 border-2 border-blue-electric/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-electric text-white text-xs font-black px-2 py-0.5 rounded-full">FASTEST</span>
                  <p className="text-sm font-bold text-navy">Try with a sample room — no upload needed</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {ROOM_TYPES.map(room => (
                    <button key={room.id}
                      onClick={() => { setConfig(c => ({ ...c, roomType: room.id })); setUploadedImage(null); }}
                      className={`rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${config.roomType === room.id && !uploadedImage ? 'border-blue-electric shadow-lg shadow-blue-electric/30 scale-105' : 'border-gray-200 hover:border-blue-electric'}`}>
                      <img src={SAMPLE_BEFORES[room.id]} alt={room.label} className="w-full h-20 object-cover" referrerPolicy="no-referrer" />
                      <div className="p-1.5 text-center text-xs font-bold text-navy">{room.emoji} {room.label}</div>
                    </button>
                  ))}
                </div>
                {!uploadedImage && (
                  <p className="text-xs text-blue-electric font-bold text-center">
                    ✓ {ROOM_TYPES.find(r => r.id === config.roomType)?.label} selected — ready to go!
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm font-medium">or upload your own</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Drop zone — secondary option */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging ? 'border-blue-electric bg-blue-electric/5 scale-105' :
                  uploadedImage ? 'border-green-400 bg-green-50' :
                  'border-gray-200 hover:border-blue-electric hover:bg-blue-electric/5'
                }`}>
                {uploadedImage ? (
                  <div className="space-y-3">
                    <img src={uploadedImage} alt="Preview" className="w-40 h-28 object-cover rounded-xl mx-auto shadow-md" />
                    <p className="text-green-600 font-bold flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Your photo ready!</p>
                    <button onClick={() => setUploadedImage(null)} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto"><X size={13} /> Remove & use sample</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                      <Upload size={22} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-navy font-bold">Drop your photo here</p>
                      <p className="text-gray-400 text-sm">or <span className="text-blue-electric underline">click to browse</span></p>
                    </div>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 10MB</p>
                    {/* Input inside label so clicking anywhere in the zone triggers it */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep('configure')}
                className="btn-shimmer w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                Next: Choose Your Style <ChevronRight size={20} />
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 2: CONFIGURE ── */}
          {step === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">Customize Your Remodel</h2>
                <p className="text-gray-500">Tell the AI what you're going for.</p>
              </div>

              {/* Preview strip */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={uploadedImage || SAMPLE_BEFORES[config.roomType]} alt="Your photo"
                  className="w-20 h-16 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-navy text-sm">Your photo is ready</p>
                  <p className="text-xs text-gray-400">Customize the options below, then generate your remodel</p>
                </div>
                <button onClick={() => setStep('upload')} className="ml-auto text-xs text-blue-electric hover:underline font-bold">Change photo</button>
              </div>

              {/* Room type */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Room Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {ROOM_TYPES.map(r => (
                    <button key={r.id} onClick={() => setConfig(c => ({ ...c, roomType: r.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${config.roomType === r.id ? 'border-blue-electric bg-blue-electric/5 text-blue-electric' : 'border-gray-200 hover:border-blue-electric/50 text-navy'}`}>
                      <div className="text-2xl mb-1">{r.emoji}</div>
                      <div className="text-xs font-bold">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Design Style</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={() => setConfig(c => ({ ...c, style: s.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${config.style === s.id ? 'border-blue-electric bg-blue-electric/5' : 'border-gray-200 hover:border-blue-electric/50'}`}>
                      <div className={`text-sm font-bold mb-0.5 ${config.style === s.id ? 'text-blue-electric' : 'text-navy'}`}>{s.label}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Budget Range</label>
                <div className="grid grid-cols-4 gap-3">
                  {BUDGETS.map(b => (
                    <button key={b.id} onClick={() => setConfig(c => ({ ...c, budget: b.id }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${config.budget === b.id ? 'border-blue-electric bg-blue-electric/5' : 'border-gray-200 hover:border-blue-electric/50'}`}>
                      <div className={`text-sm font-bold ${config.budget === b.id ? 'text-blue-electric' : 'text-navy'}`}>{b.label}</div>
                      <div className="text-xs text-gray-400">{b.range}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Special Requests <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <textarea value={config.notes} onChange={e => setConfig(c => ({ ...c, notes: e.target.value }))}
                  placeholder="e.g. White cabinets, quartz countertops, subway tile backsplash, waterfall island..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm resize-none" />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('upload')} className="px-6 py-3 rounded-xl border border-gray-200 font-bold text-navy hover:bg-gray-50 transition-all">← Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={runGeneration}
                  className="btn-shimmer flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3">
                  <Wand2 size={22} /> Generate My Remodel
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: GENERATING ── */}
          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center space-y-8 py-8">
              <div className="space-y-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 rounded-full border-4 border-blue-electric/20 border-t-blue-electric mx-auto" />
                <h2 className="text-2xl font-bold text-navy">AI is generating your remodel...</h2>
                <p className="text-gray-500">Analyzing your space and applying {config.style} style</p>
              </div>

              {/* Terminal output */}
              <div className="terminal text-left">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" /><div className="terminal-dot bg-yellow-400" /><div className="terminal-dot bg-green-500" />
                  <span className="ml-3 text-gray-500 text-xs">closepro-ai — generating visualization</span>
                </div>
                <div className="p-5 space-y-2 min-h-[200px]">
                  {GEN_STEPS.slice(0, genStep).map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className={`text-sm font-mono ${line.startsWith('✓') ? 'text-green-400' : 'text-gray-300'}`}>
                      {line.replace('{style}', config.style).replace('{budget}', config.budget)}
                    </motion.div>
                  ))}
                  {genStep < GEN_STEPS.length && <div className="text-gray-300 font-mono text-sm">{'>'} <span className="cursor" /></div>}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Processing</span><span>{genProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${genProgress}%` }} transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-electric to-purple-500 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: RESULT ── */}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8">
              <div className="text-center space-y-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </motion.div>
                <h2 className="text-3xl font-bold text-navy">Your AI Remodel is Ready!</h2>
                <p className="text-gray-500">Drag the slider to compare before & after</p>
              </div>

              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Slider */}
                <div className="lg:col-span-3 space-y-4">
                  <BeforeAfterSlider before={beforeImage} after={afterImage} />
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-amber-700 text-sm font-bold">⚠️ This is a DEMO result with watermark</p>
                    <p className="text-amber-600 text-xs mt-1">Enter your info below to unlock HD download + remove watermark</p>
                  </div>
                </div>

                {/* Email capture */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-navy">Unlock Your Full Result</h3>
                      <p className="text-gray-500 text-sm">Get HD download, no watermark, and share link — free.</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: '📥', text: 'HD download (no watermark)' },
                        { icon: '🔗', text: 'Shareable client link' },
                        { icon: '💼', text: 'Attach to estimates' },
                        { icon: '🎯', text: '1 more free generation' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                          <span className="text-lg">{item.icon}</span> {item.text}
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleCapture} className="space-y-3">
                      <input required type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm" />
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Work email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm" />
                      <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="btn-shimmer w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                        {submitting ? 'Unlocking...' : <><Lock size={16} /> Unlock My Free Result</>}
                      </motion.button>
                    </form>
                    <p className="text-xs text-gray-400 text-center">No spam. We help contractors close jobs.</p>
                  </div>

                  {/* Locked action buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {[{ icon: Download, label: 'Download HD', locked: true }, { icon: Share2, label: 'Share Link', locked: true }].map(({ icon: Icon, label, locked }) => (
                      <button key={label} disabled
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm font-bold cursor-not-allowed bg-gray-50">
                        <Lock size={14} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: CAPTURED ── */}
          {step === 'captured' && (
            <motion.div key="captured" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-10">
              {/* Unlocked result */}
              <div className="text-center space-y-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}
                  className="text-5xl mx-auto">🎉</motion.div>
                <h2 className="text-3xl font-bold text-navy">Result Unlocked, {name}!</h2>
                <p className="text-gray-500">Your HD visualization is ready. Download or share it.</p>
              </div>

              {/* Full result (no watermark message) */}
              <div className="relative">
                <BeforeAfterSlider before={beforeImage} after={afterImage} />
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full z-10">
                  ✓ UNLOCKED
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <a href={afterImage} download className="btn-shimmer px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                  <Download size={18} /> Download HD
                </a>
                <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="border-2 border-blue-electric text-blue-electric px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-electric hover:text-white transition-all">
                  <Share2 size={18} /> Copy Share Link
                </button>
                <button onClick={() => { setStep('upload'); setUploadedImage(null); }}
                  className="border border-gray-200 text-navy px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Generate Another
                </button>
              </div>

              <div className="section-divider" />

              {/* Upgrade CTA */}
              <div className="bg-navy rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 mesh-bg" />
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-blue-electric/20 border border-blue-electric/30 text-blue-electric px-4 py-1.5 rounded-full text-sm font-bold">
                    <Zap size={14} fill="currentColor" /> Want This on YOUR Website?
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">
                    Give Every Contractor on Your Team This Power
                  </h3>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    This AI tool + full CRM + automated follow-ups + lead capture website — all in one platform. Starting at just <strong className="text-white">$99/month</strong>.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      '✅ Unlimited AI visualizations',
                      '✅ Full CRM pipeline',
                      '✅ Auto SMS follow-ups',
                      '✅ Estimates & invoices',
                      '✅ Lead capture website',
                    ].map((f, i) => (
                      <span key={i} className="glass px-4 py-2 rounded-full text-white text-sm font-medium">{f}</span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup?plan=starter" className="btn-shimmer px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                      Start Free Trial <ArrowRight size={20} />
                    </Link>
                    <Link to="/book-demo" className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                      Book a Demo First
                    </Link>
                  </div>
                  <p className="text-gray-400 text-sm">No credit card required · Cancel anytime · Live in 7 days</p>
                </div>
              </div>

              {/* Testimonials */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { quote: "Used this on the first consultation. Client signed a $32K deal on the spot.", name: "Mike T.", company: "Thompson Kitchens" },
                  { quote: "The AI visualization is what separates us from every other contractor.", name: "Sarah J.", company: "Elite Bath & Spa" },
                  { quote: "Booked 12 jobs in 30 days after adding ClosePro to our sales process.", name: "David R.", company: "DR Remodeling" },
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex text-yellow-400 gap-0.5">{Array.from({length:5}).map((_,s)=><Star key={s} size={14} fill="currentColor"/>)}</div>
                    <p className="text-gray-600 text-sm italic leading-relaxed">"{t.quote}"</p>
                    <div>
                      <p className="font-bold text-navy text-sm">{t.name}</p>
                      <p className="text-blue-electric text-xs font-bold">{t.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom trust bar */}
      {step !== 'captured' && (
        <div className="bg-white border-t border-gray-100 py-8 px-6">
          <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 text-center text-sm text-gray-500">
            {[
              { icon: '🔒', text: 'No signup required for demo' },
              { icon: '⚡', text: 'Results in under 10 seconds' },
              { icon: '⭐', text: '4.9/5 rating from 500+ contractors' },
              { icon: '🎯', text: 'Used to close $10K–$50K jobs' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2 font-medium">
                <span className="text-lg">{t.icon}</span> {t.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

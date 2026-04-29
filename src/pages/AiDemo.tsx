import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Wand2, ChevronRight, Download, Share2, Lock, CheckCircle2, Star,
  ArrowRight, X, Zap, AlertTriangle, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Step = 'upload' | 'configure' | 'generating' | 'result' | 'captured';
type RoomType = 'kitchen' | 'bathroom';

// ── Image helpers ─────────────────────────────────────────────────────────────

async function compressImage(file: File, maxSide = 1024): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
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

function fileToPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

// ── Before/After Slider ───────────────────────────────────────────────────────

function BeforeAfterSlider({ before, after, watermark = false }: { before: string; after: string; watermark?: boolean }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none bg-gray-100">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-blue-electric text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wide">AI Result</div>
        {watermark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute text-white font-bold text-sm whitespace-nowrap"
                style={{ transform: 'rotate(-30deg)', top: `${i * 20 - 10}%`, left: '-10%', right: '-10%', textAlign: 'center', letterSpacing: '0.3em' }}>
                CLOSEPRO REMODEL DEMO &nbsp;&nbsp;&nbsp; CLOSEPRO REMODEL DEMO
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Handle */}
      <div className="absolute inset-y-0 z-20 cursor-ew-resize" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-blue-electric">
          <div className="flex gap-0.5"><div className="w-1 h-4 bg-blue-electric rounded-full" /><div className="w-1 h-4 bg-blue-electric rounded-full" /></div>
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Before</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

// ── Option Button ─────────────────────────────────────────────────────────────

function Opt({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center ${active ? 'bg-blue-electric text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
      {children}
    </button>
  );
}

// ── Config data ───────────────────────────────────────────────────────────────

const KITCHEN_STYLES = [
  { id: 'modern',       label: 'Modern',         desc: 'Clean, sleek, minimal' },
  { id: 'luxury',       label: 'Luxury',          desc: 'Premium, magazine-quality' },
  { id: 'farmhouse',    label: 'Farmhouse',       desc: 'Warm, shaker, cozy' },
  { id: 'traditional',  label: 'Traditional',     desc: 'Classic, timeless' },
  { id: 'contemporary', label: 'Contemporary',    desc: 'Bold contrast, refined' },
  { id: 'budget',       label: 'Budget-Friendly', desc: 'Affordable, practical' },
];

const BATHROOM_STYLES = [
  { id: 'modern',      label: 'Modern',         desc: 'Clean, sleek, bright' },
  { id: 'luxury',      label: 'Spa / Luxury',   desc: 'Hotel-inspired, elegant' },
  { id: 'minimalist',  label: 'Minimalist',     desc: 'Simple, uncluttered' },
  { id: 'traditional', label: 'Traditional',    desc: 'Classic, warm, polished' },
  { id: 'budget',      label: 'Budget',         desc: 'Clean, affordable' },
  { id: 'bold',        label: 'Bold / Dark',    desc: 'Dramatic, high-contrast' },
];

const BUDGETS = [
  { id: 'basic',    label: 'Basic',     range: '$5K–$15K' },
  { id: 'midrange', label: 'Mid-Range', range: '$15K–$35K' },
  { id: 'highend',  label: 'High-End',  range: '$35K–$75K' },
  { id: 'luxury',   label: 'Luxury',    range: '$75K+' },
];

const KITCHEN_MATS = {
  cabinetStyle: ['Shaker', 'Flat Panel', 'Raised Panel', 'Glass Front', 'Two-Tone', 'Custom'],
  cabinetColor: ['White', 'Soft Gray', 'Charcoal', 'Black', 'Navy Blue', 'Natural Wood', 'Walnut', 'Espresso', 'Greige'],
  countertop:   ['Quartz', 'Granite', 'Marble-look Quartz', 'Butcher Block', 'Concrete-look', 'Solid Surface'],
  backsplash:   ['White Subway Tile', 'Zellige Tile', 'Marble Slab', 'Herringbone', 'Mosaic', 'Ceramic Tile', 'Full-Height Slab'],
  flooring:     ['Hardwood', 'Luxury Vinyl Plank', 'Large Format Tile', 'Wood-look Tile', 'Polished Concrete'],
  hardware:     ['Matte Black', 'Brushed Nickel', 'Chrome', 'Brushed Gold', 'Bronze'],
  lighting:     ['Recessed Lighting', 'Pendant Lights', 'Under-Cabinet LED', 'Warm LED', 'Statement Lighting'],
  appliances:   ['Stainless Steel', 'Black Stainless', 'Built-in', 'Panel-Ready'],
};

const BATH_MATS = {
  showerTub:   ['Walk-in Glass Shower', 'Tub & Shower Combo', 'Freestanding Tub', 'Custom Tiled Shower', 'Curbless Shower'],
  tile:        ['Large Format Marble-look', 'White Subway Tile', 'Gray Porcelain', 'Zellige', 'Mosaic Floor', 'Herringbone', 'Stone-look', 'Matte Ceramic'],
  vanityType:  ['Single Vanity', 'Double Vanity', 'Floating Vanity', 'Furniture-Style', 'Custom Built'],
  vanityColor: ['White', 'Natural Wood', 'Black', 'Navy Blue', 'Gray', 'Walnut', 'Espresso'],
  countertop:  ['Quartz', 'Marble-look Quartz', 'Granite', 'Solid Surface'],
  fixtures:    ['Matte Black', 'Chrome', 'Brushed Nickel', 'Brushed Gold', 'Bronze'],
  flooring:    ['Large Format Tile', 'Marble-look Tile', 'Wood-look Tile', 'Luxury Vinyl Plank', 'Porcelain'],
  lighting:    ['LED Vanity Lighting', 'Recessed Lighting', 'Warm Spa Lighting', 'Backlit Mirror', 'Wall Sconces'],
  mirror:      ['Framed Mirror', 'Round Mirror', 'Backlit Mirror', 'Large Rectangular', 'Medicine Cabinet'],
};

const GEN_STEPS = [
  '> Uploading your photo securely...',
  '> Analyzing room dimensions and layout...',
  '> Preserving camera angle and perspective...',
  '> Applying style parameters and materials...',
  '> Generating photorealistic remodel preview...',
  '> Rendering lighting and textures...',
  '✓ Remodel visualization complete!',
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function AiDemo() {
  const [step, setStep] = useState<Step>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageWarning, setImageWarning] = useState('');

  const [roomType, setRoomType] = useState<RoomType>('kitchen');
  const [style, setStyle] = useState('modern');
  const [budget, setBudget] = useState('midrange');
  const [mode, setMode] = useState('realistic');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [kitchenMats, setKitchenMats] = useState<Record<string, string>>({
    cabinetStyle: 'Shaker', cabinetColor: 'White', countertop: 'Quartz',
    backsplash: 'White Subway Tile', flooring: 'Luxury Vinyl Plank',
    hardware: 'Matte Black', lighting: 'Recessed Lighting', appliances: 'Stainless Steel',
  });
  const [bathMats, setBathMats] = useState<Record<string, string>>({
    showerTub: 'Walk-in Glass Shower', tile: 'Large Format Marble-look',
    vanityType: 'Floating Vanity', vanityColor: 'White', countertop: 'Quartz',
    fixtures: 'Brushed Nickel', flooring: 'Large Format Tile',
    lighting: 'LED Vanity Lighting', mirror: 'Large Rectangular',
  });

  const [genStep, setGenStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState('');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageWarning('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }
    setImageWarning('');
    setUploadedFile(file);
    const url = fileToPreviewUrl(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runGeneration = async () => {
    if (!uploadedFile) return;
    setStep('generating');
    setGenStep(0);
    setGenProgress(0);
    setGenerationError('');
    setGeneratedImageSrc(null);

    // Animate steps in parallel with the real API call
    const total = GEN_STEPS.length;
    const stepInterval = setInterval(() => {
      setGenStep(prev => {
        const next = Math.min(prev + 1, total - 1); // hold on last step until API responds
        setGenProgress(Math.round((next / total) * 90));
        return next;
      });
    }, 900);

    try {
      const { base64, mimeType } = await compressImage(uploadedFile);
      const materials = roomType === 'kitchen' ? kitchenMats : bathMats;

      const res = await fetch('/api/generate-remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, roomType, style, budget, materials, mode, notes }),
      });

      clearInterval(stepInterval);
      setGenStep(total);
      setGenProgress(100);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed' }));
        setGenerationError(err.message || err.error || 'Generation failed. Please try again.');
        setStep('upload');
        return;
      }

      const data = await res.json();
      if (!data.imageData) {
        setGenerationError('AI could not generate a remodel image. Try uploading a clearer, well-lit photo.');
        setStep('upload');
        return;
      }

      const mimeOut = data.mimeType || 'image/jpeg';
      setGeneratedImageSrc(`data:${mimeOut};base64,${data.imageData}`);

      await new Promise(r => setTimeout(r, 600));
      setStep('result');
    } catch (err: any) {
      clearInterval(stepInterval);
      setGenerationError(err.message || 'Network error. Make sure the server is running.');
      setStep('upload');
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'aiDemoLeads'), {
        email, name, roomType, style, budget, mode, notes,
        source: 'ai-demo-page', createdAt: serverTimestamp(),
      });
    } catch { /* optional */ }
    setStep('captured');
    setSubmitting(false);
  };

  const styles = roomType === 'kitchen' ? KITCHEN_STYLES : BATHROOM_STYLES;
  const mats = roomType === 'kitchen' ? KITCHEN_MATS : BATH_MATS;
  const matState = roomType === 'kitchen' ? kitchenMats : bathMats;
  const setMat = (key: string, val: string) => {
    if (roomType === 'kitchen') setKitchenMats(p => ({ ...p, [key]: val }));
    else setBathMats(p => ({ ...p, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div className="bg-navy text-white py-10 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-electric/20 border border-blue-electric/30 text-blue-electric px-4 py-1.5 rounded-full text-sm font-bold">
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Zap size={14} fill="currentColor" />
            </motion.span>
            FREE DEMO — No signup required
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            See Your Remodel <span className="text-gradient">Before You Build It</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upload a photo of your kitchen or bathroom. Our AI generates a photorealistic remodel preview — the same tool contractors use to close $10K–$50K jobs on the first visit.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 md:gap-6">
          {[
            { id: 'upload',     label: '1. Upload Photo' },
            { id: 'configure',  label: '2. Choose Style' },
            { id: 'generating', label: '3. AI Generates' },
            { id: 'result',     label: '4. See Result' },
          ].map((s, i, arr) => {
            const order: Step[] = ['upload', 'configure', 'generating', 'result', 'captured'];
            const active = order.indexOf(step) >= order.indexOf(s.id as Step);
            return (
              <div key={s.id} className="flex items-center gap-2 md:gap-4">
                <div className={`flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold ${active ? 'text-blue-electric' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${active ? 'bg-blue-electric text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                  <span className="hidden sm:block">{s.label.replace(/^\d\. /, '')}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 ${active && order.indexOf(step) > i ? 'bg-blue-electric' : 'bg-gray-200'}`} />
                )}
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
                <h2 className="text-2xl md:text-3xl font-bold text-navy">Upload Your Room Photo</h2>
                <p className="text-gray-500">For best results: good lighting, wide angle, show the full room. JPG, PNG, or WEBP up to 20MB.</p>
              </div>

              {generationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-bold text-sm">Generation issue</p>
                    <p className="text-red-600 text-sm mt-0.5">{generationError}</p>
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all ${
                  isDragging ? 'border-blue-electric bg-blue-electric/5 scale-105' :
                  previewUrl ? 'border-green-400 bg-green-50' :
                  'border-gray-200 hover:border-blue-electric hover:bg-blue-electric/5'
                }`}>
                {previewUrl ? (
                  <div className="p-6 space-y-4">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-xl mx-auto shadow-md" />
                    <div className="flex items-center justify-between">
                      <p className="text-green-600 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> Photo ready!</p>
                      <button onClick={() => { setUploadedFile(null); setPreviewUrl(null); setImageWarning(''); }}
                        className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"><X size={13} /> Remove</button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload size={28} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-navy font-bold text-lg">Drop your photo here</p>
                      <p className="text-gray-400 text-sm mt-1">or <span className="text-blue-electric underline font-bold">click to browse</span></p>
                    </div>
                    <p className="text-xs text-gray-400">Kitchen or bathroom photos work best · JPG, PNG, WEBP · Max 20MB</p>
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </label>
                )}
              </div>

              {imageWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <AlertTriangle size={16} className="shrink-0" /> {imageWarning}
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-navy">📸 Tips for best results:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Good natural or artificial lighting (avoid dark or blown-out shots)</li>
                  <li>• Shoot from a corner or doorway to show the whole room</li>
                  <li>• Horizontal (landscape) orientation preferred</li>
                  <li>• The AI preserves your room's exact layout and camera angle</li>
                </ul>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={!previewUrl}
                onClick={() => setStep('configure')}
                className="btn-shimmer w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
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
                <p className="text-gray-500">The AI uses these settings to build a photorealistic preview.</p>
              </div>

              {/* Photo preview strip */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={previewUrl!} alt="Your photo" className="w-20 h-16 object-cover rounded-xl" />
                <div>
                  <p className="font-bold text-navy text-sm">Your photo is ready</p>
                  <p className="text-xs text-gray-400">Configure the style below, then generate</p>
                </div>
                <button onClick={() => setStep('upload')} className="ml-auto text-xs text-blue-electric hover:underline font-bold">Change photo</button>
              </div>

              {/* Room type */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Room Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ id: 'kitchen', label: '🍳 Kitchen' }, { id: 'bathroom', label: '🛁 Bathroom' }].map(r => (
                    <button key={r.id} onClick={() => { setRoomType(r.id as RoomType); setStyle(r.id === 'kitchen' ? 'modern' : 'modern'); }}
                      className={`p-4 rounded-xl border-2 text-center font-bold transition-all ${roomType === r.id ? 'border-blue-electric bg-blue-electric/5 text-blue-electric' : 'border-gray-200 text-navy hover:border-blue-electric/50'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Remodel Style</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styles.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${style === s.id ? 'border-blue-electric bg-blue-electric/5' : 'border-gray-200 hover:border-blue-electric/50'}`}>
                      <div className={`text-sm font-bold mb-0.5 ${style === s.id ? 'text-blue-electric' : 'text-navy'}`}>{s.label}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Budget Level</label>
                <div className="grid grid-cols-4 gap-3">
                  {BUDGETS.map(b => (
                    <button key={b.id} onClick={() => setBudget(b.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${budget === b.id ? 'border-blue-electric bg-blue-electric/5' : 'border-gray-200 hover:border-blue-electric/50'}`}>
                      <div className={`text-sm font-bold ${budget === b.id ? 'text-blue-electric' : 'text-navy'}`}>{b.label}</div>
                      <div className="text-xs text-gray-400">{b.range}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode */}
              <div className="space-y-3">
                <label className="text-sm font-black text-navy uppercase tracking-wider">Generation Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'realistic', label: '🎯 Realistic Mode', desc: 'Preserve layout closely. Focus on finishes.' },
                    { id: 'creative', label: '✨ Creative Mode', desc: 'More dramatic design while keeping structure.' },
                  ].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${mode === m.id ? 'border-blue-electric bg-blue-electric/5' : 'border-gray-200 hover:border-blue-electric/50'}`}>
                      <div className={`text-sm font-bold mb-1 ${mode === m.id ? 'text-blue-electric' : 'text-navy'}`}>{m.label}</div>
                      <div className="text-xs text-gray-400">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced materials */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setShowAdvanced(v => !v)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-navy text-sm">Advanced Material Options</span>
                  {showAdvanced ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {showAdvanced && (
                  <div className="p-4 border-t border-gray-100 space-y-5 bg-gray-50/50">
                    {Object.entries(mats).map(([key, options]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {(options as string[]).map(opt => (
                            <Opt key={opt} active={matState[key] === opt} onClick={() => setMat(key, opt)}>{opt}</Opt>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-black text-navy uppercase tracking-wider">
                  Special Requests <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Make it brighter, add an island, keep the same window locations..."
                  rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm resize-none" />
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
                <p className="text-gray-500">Preserving your room layout while applying {style} style</p>
              </div>

              <div className="terminal text-left">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" /><div className="terminal-dot bg-yellow-400" /><div className="terminal-dot bg-green-500" />
                  <span className="ml-3 text-gray-500 text-xs">closepro-ai — remodel visualizer</span>
                </div>
                <div className="p-5 space-y-2 min-h-[200px]">
                  {GEN_STEPS.slice(0, genStep).map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className={`text-sm font-mono ${line.startsWith('✓') ? 'text-green-400' : 'text-gray-300'}`}>
                      {line}
                    </motion.div>
                  ))}
                  {genStep < GEN_STEPS.length && <div className="text-gray-500 font-mono text-sm">{'>'} <span className="cursor" /></div>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Processing</span><span>{genProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${genProgress}%` }} transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-electric to-purple-500 rounded-full" />
                </div>
              </div>

              <p className="text-xs text-gray-400 italic">AI image generation typically takes 15–45 seconds. Please wait...</p>
            </motion.div>
          )}

          {/* ── STEP 4: RESULT ── */}
          {step === 'result' && generatedImageSrc && (
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
                <div className="lg:col-span-3 space-y-4">
                  <BeforeAfterSlider before={previewUrl!} after={generatedImageSrc} watermark />
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-amber-700 text-sm font-bold">⚠️ Demo result — watermark applied</p>
                    <p className="text-amber-600 text-xs mt-1">Enter your info to unlock the HD version with no watermark</p>
                  </div>
                  <button onClick={() => { setStep('upload'); setGeneratedImageSrc(null); }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-electric font-bold transition-colors mx-auto">
                    <RefreshCw size={14} /> Generate another variation
                  </button>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-navy">Unlock Your Full Result</h3>
                      <p className="text-gray-500 text-sm mt-1">Get HD download, no watermark, and share link — free.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: '📥', text: 'HD download (no watermark)' },
                        { icon: '🔗', text: 'Shareable client presentation link' },
                        { icon: '💼', text: 'Attach to estimate documents' },
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

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[{ icon: Download, label: 'Download HD' }, { icon: Share2, label: 'Share Link' }].map(({ icon: Icon, label }) => (
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
          {step === 'captured' && generatedImageSrc && (
            <motion.div key="captured" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}
                  className="text-5xl mx-auto">🎉</motion.div>
                <h2 className="text-3xl font-bold text-navy">Result Unlocked, {name}!</h2>
                <p className="text-gray-500">Your HD remodel visualization is ready.</p>
              </div>

              <div className="relative">
                <BeforeAfterSlider before={previewUrl!} after={generatedImageSrc} watermark={false} />
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full z-10">✓ UNLOCKED</div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <a href={generatedImageSrc} download="closepro-remodel.jpg"
                  className="btn-shimmer px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                  <Download size={18} /> Download HD
                </a>
                <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="border-2 border-blue-electric text-blue-electric px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-electric hover:text-white transition-all">
                  <Share2 size={18} /> Copy Share Link
                </button>
                <button onClick={() => { setStep('upload'); setGeneratedImageSrc(null); setPreviewUrl(null); setUploadedFile(null); setGenerationError(''); }}
                  className="border border-gray-200 text-navy px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Generate Another Room
                </button>
              </div>

              {/* Sales CTA */}
              <div className="bg-navy rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 mesh-bg" />
                <div className="relative z-10 space-y-6">
                  <p className="text-blue-electric font-bold text-sm uppercase tracking-widest">Close More Jobs</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">
                    Imagine showing this to every homeowner before they sign.
                  </h3>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Close more jobs by helping customers see the finished remodel before work begins. Starting at just <strong className="text-white">$99/month</strong>.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['✅ Unlimited AI visualizations', '✅ Full CRM pipeline', '✅ Auto SMS follow-ups', '✅ Lead capture website'].map((f, i) => (
                      <span key={i} className="glass px-4 py-2 rounded-full text-white text-sm font-medium">{f}</span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup?plan=accelerator" className="btn-shimmer px-10 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                      Start Free Trial <ArrowRight size={20} />
                    </Link>
                    <Link to="/book-demo" className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                      Book a Demo First
                    </Link>
                  </div>
                  <p className="text-gray-400 text-sm">No credit card required · Cancel anytime · Live in 7 days</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { quote: "Used this on the first consultation. Client signed a $32K deal on the spot.", name: "Mike T.", company: "Thompson Kitchens" },
                  { quote: "The AI visualization is what separates us from every other contractor.", name: "Sarah J.", company: "Elite Bath & Spa" },
                  { quote: "Booked 12 jobs in 30 days after adding ClosePro to our sales process.", name: "David R.", company: "DR Remodeling" },
                ].map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex text-yellow-400 gap-0.5">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}</div>
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
              { icon: '🎯', text: 'Preserves your real room layout' },
              { icon: '⭐', text: '4.9/5 rating from 500+ contractors' },
              { icon: '💼', text: 'Used to close $10K–$50K jobs' },
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

import { useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Wand2, CheckCircle2, Download, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function compressImage(file: File, maxSide = 1024): Promise<{ base64: string; mimeType: string }> {
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

const KITCHEN_STYLES = [
  { id: 'modern',       label: 'Modern',          desc: 'Clean & sleek' },
  { id: 'luxury',       label: 'Luxury',           desc: 'Premium finishes' },
  { id: 'farmhouse',    label: 'Farmhouse',        desc: 'Warm & cozy' },
  { id: 'traditional',  label: 'Traditional',      desc: 'Classic look' },
  { id: 'contemporary', label: 'Contemporary',     desc: 'Bold contrast' },
  { id: 'budget',       label: 'Budget-Friendly',  desc: 'Smart & clean' },
];

const BATHROOM_STYLES = [
  { id: 'modern',      label: 'Modern',      desc: 'Clean & minimal' },
  { id: 'luxury',      label: 'Spa Luxury',  desc: 'Hotel-inspired' },
  { id: 'minimalist',  label: 'Minimalist',  desc: 'Simple & open' },
  { id: 'traditional', label: 'Traditional', desc: 'Classic finish' },
  { id: 'budget',      label: 'Budget',      desc: 'Affordable update' },
  { id: 'bold',        label: 'Bold / Dark', desc: 'High contrast' },
];

const BUDGETS = [
  { id: 'basic',    label: 'Basic',     range: '$5K–$15K' },
  { id: 'midrange', label: 'Mid-Range', range: '$15K–$35K' },
  { id: 'highend',  label: 'High-End',  range: '$35K–$75K' },
  { id: 'luxury',   label: 'Luxury',    range: '$75K+' },
];

const GEN_STEPS = [
  'Analyzing your room layout...',
  'Applying style parameters...',
  'Generating your remodel preview...',
  '✓ Visualization complete!',
];

// ── Slider ────────────────────────────────────────────────────────────────────

function BeforeAfterSlider({ before, after, watermark }: { before: string; after: string; watermark?: boolean }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none bg-gray-100">
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-blue-electric text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">AI Result</div>
        {watermark && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="absolute text-white font-bold text-sm whitespace-nowrap"
                style={{ transform: 'rotate(-30deg)', top: `${i * 22 - 5}%`, left: '-10%', right: '-10%', textAlign: 'center', letterSpacing: '0.3em' }}>
                ENTER INFO TO UNLOCK &nbsp;&nbsp;&nbsp; ENTER INFO TO UNLOCK &nbsp;&nbsp;&nbsp; ENTER INFO TO UNLOCK
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-y-0 z-20 cursor-ew-resize" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center border-3 border-blue-electric">
          <div className="flex gap-0.5"><div className="w-0.5 h-3.5 bg-blue-electric rounded-full" /><div className="w-0.5 h-3.5 bg-blue-electric rounded-full" /></div>
        </div>
      </div>
      <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Before</div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">← drag to compare →</div>
      <input type="range" min="0" max="100" value={pos} onChange={e => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
    </div>
  );
}

// ── Widget ────────────────────────────────────────────────────────────────────

export default function Widget() {
  const { tenantId } = useParams<{ tenantId: string }>();

  const [step, setStep]         = useState<'upload' | 'configure' | 'generating' | 'result' | 'done'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [room, setRoom]     = useState<'kitchen' | 'bathroom'>('kitchen');
  const [style, setStyle]   = useState('modern');
  const [budget, setBudget] = useState('midrange');
  const [notes, setNotes]   = useState('');

  const [genStep, setGenStep]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]   = useState('');

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const styles = room === 'kitchen' ? KITCHEN_STYLES : BATHROOM_STYLES;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedFile(file);
  }, [previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const runGeneration = async () => {
    if (!uploadedFile) return;
    setStep('generating'); setGenStep(0); setProgress(0); setResultSrc(null); setErrorMsg('');
    const interval = setInterval(() => {
      setGenStep(prev => { const next = Math.min(prev + 1, GEN_STEPS.length - 2); setProgress(Math.round((next / GEN_STEPS.length) * 85)); return next; });
    }, 900);
    try {
      const { base64, mimeType } = await compressImage(uploadedFile);
      const res = await fetch('/api/generate-remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, roomType: room, style, budget, mode: 'realistic', notes }),
      });
      clearInterval(interval); setGenStep(GEN_STEPS.length); setProgress(100);
      if (!res.ok) { const e = await res.json().catch(() => ({})); setErrorMsg(e.message || 'Generation failed. Please try again.'); setStep('result'); return; }
      const data = await res.json();
      if (!data.imageData) { setErrorMsg('No image generated. Please try again with a clearer photo.'); setStep('result'); return; }
      await new Promise(r => setTimeout(r, 500));
      setResultSrc(`data:${data.mimeType || 'image/jpeg'};base64,${data.imageData}`);
      setStep('result');
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg('Connection error. Please try again.');
      setStep('result');
    }
  };

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      // Save to contractor's widgetLeads collection
      const leadData: any = {
        name, email, phone,
        roomType: room, style, budget, notes,
        tenantId,
        beforeImageUrl: previewUrl,
        afterImageUrl: resultSrc,
        source: 'widget',
        createdAt: serverTimestamp(),
      };
      if (tenantId) {
        await addDoc(collection(db, `tenants/${tenantId}/widgetLeads`), leadData);
      }
      // Also save globally for admin visibility
      await addDoc(collection(db, 'widgetLeads'), leadData);
    } catch { /* optional */ }
    setStep('done');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Minimal header */}
      <div className="bg-navy py-4 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-white text-sm font-bold">
          <Wand2 size={16} className="text-blue-electric" />
          AI Remodel Visualizer — See Your Dream Remodel Before You Start
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 py-3 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 md:gap-6">
          {[
            { id: 'upload', label: '1. Upload Photo' },
            { id: 'configure', label: '2. Choose Style' },
            { id: 'generating', label: '3. AI Generates' },
            { id: 'result', label: '4. See Result' },
          ].map((s, i, arr) => {
            const order = ['upload', 'configure', 'generating', 'result', 'done'];
            const active = order.indexOf(step) >= order.indexOf(s.id);
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${active ? 'text-blue-electric' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${active ? 'bg-blue-electric text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                  <span className="hidden sm:block">{s.label.replace(/^\d\. /, '')}</span>
                </div>
                {i < arr.length - 1 && <div className={`w-6 md:w-12 h-0.5 ${active && order.indexOf(step) > i ? 'bg-blue-electric' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── UPLOAD ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="space-y-5 max-w-xl mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-navy">Upload Your Room Photo</h2>
                <p className="text-gray-500 text-sm">Best results: good lighting, wide angle, full room visible.</p>
              </div>

              <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl transition-all ${isDragging ? 'border-blue-electric bg-blue-electric/5' : previewUrl ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-electric hover:bg-blue-electric/5'}`}>
                {previewUrl ? (
                  <div className="p-6 text-center space-y-3">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-xl mx-auto shadow-md" />
                    <p className="text-green-600 font-bold flex items-center justify-center gap-2 text-sm"><CheckCircle2 size={16} /> Photo ready!</p>
                    <button onClick={() => { setUploadedFile(null); setPreviewUrl(null); }} className="text-xs text-gray-400 hover:text-red-500">Remove & upload different photo</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block p-10 text-center space-y-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-navy font-bold">Drop your photo here</p>
                      <p className="text-gray-400 text-sm mt-1">or <span className="text-blue-electric underline font-bold">click to browse</span></p>
                    </div>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 20MB</p>
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                      onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                <p className="font-bold text-navy">📸 Tips for best results:</p>
                <p>• Shoot from a doorway or corner to show the full room</p>
                <p>• Good lighting — avoid dark or blown-out photos</p>
                <p>• Horizontal (landscape) orientation works best</p>
              </div>

              <button onClick={() => setStep('configure')} disabled={!previewUrl}
                className="widget-btn w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                Next: Choose Your Style <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* ── CONFIGURE ── */}
          {step === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-navy">Customize Your Remodel</h2>
                <p className="text-gray-500 text-sm">Tell the AI what you're going for.</p>
              </div>

              {/* Preview strip */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={previewUrl!} alt="Your photo" className="w-20 h-14 object-cover rounded-xl" />
                <div>
                  <p className="font-bold text-navy text-sm">Your photo is loaded</p>
                  <p className="text-xs text-gray-400">Configure below, then generate your remodel</p>
                </div>
                <button onClick={() => setStep('upload')} className="ml-auto text-xs text-blue-electric font-bold hover:underline">Change</button>
              </div>

              {/* Room type */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Room Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ id: 'kitchen', label: '🍳 Kitchen' }, { id: 'bathroom', label: '🛁 Bathroom' }].map(r => (
                    <button key={r.id} onClick={() => { setRoom(r.id as any); setStyle('modern'); }}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${room === r.id ? 'bg-blue-electric text-white shadow-lg shadow-blue-electric/30' : 'bg-gray-100 text-navy hover:bg-gray-200'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Remodel Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)}
                      className={`px-3 py-3 rounded-xl text-left transition-all ${style === s.id ? 'bg-blue-electric text-white shadow-md' : 'bg-gray-100 text-navy hover:bg-gray-200'}`}>
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className={`text-[10px] mt-0.5 ${style === s.id ? 'text-blue-100' : 'text-gray-500'}`}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Budget Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {BUDGETS.map(b => (
                    <button key={b.id} onClick={() => setBudget(b.id)}
                      className={`px-2 py-3 rounded-xl text-center transition-all ${budget === b.id ? 'bg-blue-electric text-white shadow-md' : 'bg-gray-100 text-navy hover:bg-gray-200'}`}>
                      <div className="text-xs font-bold">{b.label}</div>
                      <div className={`text-[10px] ${budget === b.id ? 'text-blue-100' : 'text-gray-500'}`}>{b.range}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Special Requests <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g. White cabinets, marble countertops, open shelving..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="px-5 py-3 border border-gray-200 rounded-xl font-bold text-navy text-sm hover:bg-gray-50">← Back</button>
                <button onClick={runGeneration}
                  className="widget-btn flex-1 py-3 rounded-xl font-black text-base flex items-center justify-center gap-2">
                  <Wand2 size={20} /> Generate My Remodel
                </button>
              </div>
            </motion.div>
          )}

          {/* ── GENERATING ── */}
          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto text-center space-y-8 py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-blue-electric/20 border-t-blue-electric mx-auto" />
              <div>
                <h2 className="text-xl font-black text-navy mb-1">Generating your remodel...</h2>
                <p className="text-gray-500 text-sm">Applying {style} style to your {room}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left space-y-2">
                {GEN_STEPS.slice(0, genStep).map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className={`text-sm font-mono ${s.startsWith('✓') ? 'text-green-500' : 'text-gray-500'}`}>
                    {s.startsWith('✓') ? s : `> ${s}`}
                  </motion.div>
                ))}
                {genStep < GEN_STEPS.length && <div className="text-gray-400 font-mono text-sm">&gt; <span className="animate-pulse">_</span></div>}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500"><span>Processing</span><span>{progress}%</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-electric to-purple-500 rounded-full" />
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">Usually takes 15–45 seconds...</p>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
              {errorMsg ? (
                <div className="text-center space-y-4 py-8">
                  <p className="text-4xl">⚠️</p>
                  <h2 className="text-xl font-black text-navy">Generation Issue</h2>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">{errorMsg}</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={runGeneration} className="widget-btn px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"><RefreshCw size={14} /> Try Again</button>
                    <button onClick={() => setStep('upload')} className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-navy hover:bg-gray-50">Upload New Photo</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
                      className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={24} />
                    </motion.div>
                    <h2 className="text-2xl font-black text-navy">Your Remodel is Ready!</h2>
                    <p className="text-gray-500 text-sm">Drag the slider to compare before & after</p>
                  </div>

                  <BeforeAfterSlider before={previewUrl!} after={resultSrc!} watermark />

                  {/* Lead capture */}
                  <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-6 space-y-4">
                    <div>
                      <h3 className="font-black text-navy text-lg">Get Your Free HD Result</h3>
                      <p className="text-gray-500 text-sm">Enter your info and we'll send your high-resolution remodel — no watermark, free.</p>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>📥 HD download</span>
                      <span>📞 Contractor follow-up</span>
                      <span>💼 Free quote</span>
                    </div>
                    <form onSubmit={handleCapture} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                          className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                          className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
                      </div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number (optional)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-electric" />
                      <button type="submit" disabled={submitting}
                        className="widget-btn w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-60">
                        <Lock size={16} /> {submitting ? 'Saving...' : 'Unlock My Free Result'}
                      </button>
                    </form>
                    <p className="text-xs text-gray-400 text-center">Your info is sent directly to the contractor. No spam.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}
                className="text-5xl">🎉</motion.div>
              <h2 className="text-2xl font-black text-navy">Here's your result, {name}!</h2>
              <p className="text-gray-500">Your remodel visualization is ready. A contractor will be in touch soon about your free quote.</p>

              <BeforeAfterSlider before={previewUrl!} after={resultSrc!} watermark={false} />

              <div className="flex flex-wrap justify-center gap-3">
                <a href={resultSrc!} download={`${name.replace(/\s+/g, '-')}-remodel.jpg`}
                  className="widget-btn px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                  <Download size={16} /> Download HD
                </a>
                <button onClick={() => { setStep('upload'); setUploadedFile(null); setPreviewUrl(null); setResultSrc(null); }}
                  className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-navy hover:bg-gray-50 transition-all">
                  Try Another Room
                </button>
              </div>

              <div className="bg-navy rounded-2xl p-6 text-white text-center space-y-3">
                <p className="font-bold text-lg">Imagine seeing this for every room in your home.</p>
                <p className="text-gray-300 text-sm">Your contractor uses ClosePro AI to help you visualize any remodel before work begins.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

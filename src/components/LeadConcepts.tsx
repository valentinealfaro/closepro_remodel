// Lead-driven concept generator. Loads a homeowner's photo from a widget lead
// and lets the contractor crank out 2–3 alternative remodel concepts to send back.
// Lean by design — no project/room hierarchy, just photo → style → generate.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Wand2,
  Loader2,
  Download,
  Mail,
  Copy,
  CheckCircle2,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { authedFetch } from '../lib/authedFetch';
import toast from 'react-hot-toast';

interface LeadConceptsProps {
  byokConfigured?: boolean;
}

interface LeadDoc {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  roomType?: string;
  style?: string;
  budget?: string;
  notes?: string;
  beforeImageUrl?: string; // data URL or http URL
  afterImageUrl?: string;
  source?: string;
}

interface Concept {
  id: string;
  style: string;
  imageDataUrl: string;
  generatedAt: number;
}

const STYLES = [
  { id: 'modern', label: 'Modern', desc: 'Clean & sleek' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium finishes' },
  { id: 'farmhouse', label: 'Farmhouse', desc: 'Warm & cozy' },
  { id: 'traditional', label: 'Traditional', desc: 'Classic look' },
  { id: 'contemporary', label: 'Contemporary', desc: 'Bold contrast' },
];

export default function LeadConcepts({ byokConfigured }: LeadConceptsProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const leadId = searchParams.get('leadId');
  const sourceCollection = searchParams.get('source') === 'leads' ? 'leads' : 'widgetLeads';

  const [lead, setLead] = useState<LeadDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!leadId || !userData?.tenantId) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, `tenants/${userData.tenantId}/${sourceCollection}/${leadId}`);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('That lead could not be found.');
          return;
        }
        if (cancelled) return;
        const data = snap.data() as LeadDoc;
        setLead({ id: snap.id, ...data });
        if (data.style) setSelectedStyle(data.style);
      } catch (e: any) {
        setError(e?.message || 'Failed to load lead.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId, sourceCollection, userData?.tenantId]);

  const inputBase64 = useMemo(() => {
    if (!lead?.beforeImageUrl) return null;
    if (lead.beforeImageUrl.startsWith('data:')) {
      const match = lead.beforeImageUrl.match(/^data:(.*?);base64,(.*)$/);
      if (!match) return null;
      return { base64: match[2], mime: match[1] || 'image/jpeg' };
    }
    return null; // http(s) URLs aren't supported until we move to Storage
  }, [lead?.beforeImageUrl]);

  const generate = async () => {
    if (!inputBase64 || !lead) return;
    setGenerating(true);
    try {
      const res = await authedFetch('/api/generate-remodel', {
        method: 'POST',
        body: JSON.stringify({
          surface: 'app',
          imageBase64: inputBase64.base64,
          mimeType: inputBase64.mime,
          roomType: (lead.roomType || 'kitchen').toLowerCase().includes('bath') ? 'bathroom' : 'kitchen',
          style: selectedStyle,
          budget: lead.budget || 'midrange',
          mode: 'realistic',
          notes: lead.notes || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.imageData) {
        const code = data?.code as string | undefined;
        if (code === 'NO_KEY' || code === 'INVALID_KEY') {
          toast.error('Activate your Google API key in Settings.');
          navigate('/app/settings?tab=ai');
        } else {
          toast.error(data?.error || 'Generation failed');
        }
        return;
      }
      const imageDataUrl = `data:${data.mimeType || 'image/png'};base64,${data.imageData}`;
      setConcepts(prev => [
        { id: crypto.randomUUID(), style: selectedStyle, imageDataUrl, generatedAt: Date.now() },
        ...prev,
      ]);
      toast.success('Concept ready — generate another style or download.');
    } catch (e: any) {
      toast.error(e?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const downloadConcept = (c: Concept) => {
    const a = document.createElement('a');
    a.href = c.imageDataUrl;
    a.download = `${(lead?.name || 'concept').replace(/\s+/g, '-')}-${c.style}.jpg`;
    a.click();
  };

  const copyEmailDraft = async (c: Concept) => {
    if (!lead?.email) {
      toast('No email on this lead — nothing to send.');
      return;
    }
    const subject = `Your ${c.style} concept for ${lead.roomType || 'your space'}`;
    const body =
      `Hi ${lead.name || 'there'},\n\n` +
      `Here's a ${c.style} concept for the ${lead.roomType || 'space'} you shared with me. ` +
      `Happy to talk through pricing and timeline whenever works for you.\n\n` +
      `— ${userData?.businessName || userData?.displayName || 'Your contractor'}`;
    const url = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  // ── Activation gate ─────────────────────────────────────────────────────────
  if (byokConfigured === false) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => navigate('/app/leads')} className="text-sm text-electric font-bold inline-flex items-center gap-1 mb-4 hover:underline">
          <ArrowLeft size={14} /> Back to Leads
        </button>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
          <KeyRound size={32} className="text-amber-600 mx-auto" />
          <h2 className="text-xl font-black text-navy">Activate AI to generate concepts</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Add your Google API key in Settings to start generating remodel concepts for this lead.
          </p>
          <button
            onClick={() => navigate('/app/settings?tab=ai')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg"
          >
            Activate AI
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading lead…
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-3">
        <p className="text-sm text-red-600">{error || 'Lead not found.'}</p>
        <button onClick={() => navigate('/app/leads')} className="text-sm text-electric font-bold hover:underline">
          ← Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate('/app/leads')} className="text-sm text-gray-500 inline-flex items-center gap-1 hover:text-electric mb-2">
          <ArrowLeft size={14} /> Back to Leads
        </button>
        <h1 className="text-2xl font-black text-navy">Generate concepts for {lead.name || 'this lead'}</h1>
        <p className="text-sm text-gray-500">
          {lead.roomType ? `${lead.roomType} • ` : ''}
          Submitted {(lead as any).createdAt?.toDate ? (lead as any).createdAt.toDate().toLocaleDateString() : 'recently'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: Photo + style picker */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {lead.beforeImageUrl ? (
              <img src={lead.beforeImageUrl} alt="Homeowner photo" className="w-full max-h-[480px] object-contain bg-gray-50" />
            ) : (
              <div className="aspect-video bg-gray-50 flex items-center justify-center text-sm text-gray-400">
                No photo on this lead
              </div>
            )}
          </div>

          {!inputBase64 && lead.beforeImageUrl && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
              This lead's photo is stored externally and can't be re-used here yet.
              <span className="block text-xs text-orange-600 mt-1">
                (Older leads created before May 2026 may not have inline photo data.)
              </span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-bold text-navy mb-3">Style</p>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedStyle === s.id
                      ? 'bg-electric text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !inputBase64}
            className="w-full py-4 bg-electric text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-3"
          >
            {generating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
            {generating ? 'Generating…' : `Generate ${concepts.length === 0 ? 'first' : 'another'} concept`}
          </button>
          <p className="text-xs text-center text-gray-400">~$0.04 per generation, billed to your Google account.</p>
        </div>

        {/* Right: Concept timeline */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          <p className="text-sm font-bold text-navy">Concepts ({concepts.length})</p>
          {concepts.length === 0 && (
            <p className="text-xs text-gray-500 leading-relaxed">
              Generate a concept on the left. Each one takes ~10 seconds. Generate multiple styles
              and send the homeowner the one they love.
            </p>
          )}
          <AnimatePresence>
            {concepts.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <img src={c.imageDataUrl} alt={c.style} className="w-full aspect-[4/3] object-cover" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy capitalize">{c.style}</span>
                    <span className="text-gray-400">{new Date(c.generatedAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadConcept(c)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download size={12} /> Download
                    </button>
                    <button
                      onClick={() => copyEmailDraft(c)}
                      className="flex-1 bg-electric hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      disabled={!lead.email}
                    >
                      <Mail size={12} /> Email
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

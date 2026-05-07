import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, ShieldCheck, ExternalLink, Loader2, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { ByokClient, ByokStatus } from '../services/ByokClient';

export default function AiKeySettings() {
  const [status, setStatus] = useState<ByokStatus>({ configured: false });
  const [loading, setLoading] = useState(true);
  const [keyInput, setKeyInput] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await ByokClient.status();
        if (!cancelled) setStatus(s);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = async () => {
    if (!keyInput) return;
    setSaving(true);
    try {
      const next = await ByokClient.save(keyInput);
      setStatus(next);
      setKeyInput('');
      toast.success('API key saved and verified.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not save key');
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    if (!keyInput) {
      toast('Paste a key first to test it.');
      return;
    }
    setTesting(true);
    try {
      await ByokClient.test(keyInput);
      toast.success('Key works. Click Save to store it.');
    } catch (e: any) {
      toast.error(e?.message || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const onRemove = async () => {
    if (!confirm('Remove your Google API key? Generation will be paused until you add one again.')) return;
    setRemoving(true);
    try {
      await ByokClient.remove();
      setStatus({ configured: false });
      toast.success('Key removed.');
    } catch (e: any) {
      toast.error(e?.message || 'Could not remove');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center flex-shrink-0">
            <KeyRound size={20} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-navy text-lg">Google Cloud API Key</h2>
            <p className="text-sm text-gray-500 mt-1">
              ClosePro uses Google's Gemini AI to generate remodel previews. Add your own Google
              Cloud API key here — usage is billed directly to your Google account at Google's
              standard rates (typically <strong className="text-navy">~$0.04 per generation</strong>).
            </p>
          </div>
        </div>

        <div className="bg-electric/5 border border-electric/20 rounded-xl p-4 flex items-start gap-3">
          <Sparkles size={16} className="text-electric flex-shrink-0 mt-0.5" />
          <p className="text-xs text-navy">
            <strong>Why BYOK?</strong> ClosePro is the only contractor AI visualizer where you
            control your AI costs. Pay Google's price — not a 5× SaaS markup.
          </p>
        </div>

        {loading ? (
          <div className="py-6 flex items-center justify-center text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin mr-2" /> Loading…
          </div>
        ) : status.configured ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck size={20} className="text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900">Key configured</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Ending in <strong>•••• {status.last4 || '????'}</strong>
                  {status.updatedAt ? ` • saved ${new Date(status.updatedAt).toLocaleDateString()}` : ''}
                </p>
              </div>
              <button
                onClick={onRemove}
                disabled={removing}
                className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-1.5"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove
              </button>
            </div>

            <details className="text-sm">
              <summary className="text-electric font-bold cursor-pointer">Replace my key</summary>
              <div className="mt-3">
                <KeyInput
                  keyInput={keyInput}
                  setKeyInput={setKeyInput}
                  show={show}
                  setShow={setShow}
                />
                <ActionRow saving={saving} testing={testing} onSave={onSave} onTest={onTest} />
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-4">
            <KeyInput
              keyInput={keyInput}
              setKeyInput={setKeyInput}
              show={show}
              setShow={setShow}
            />
            <ActionRow saving={saving} testing={testing} onSave={onSave} onTest={onTest} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setHelpOpen(o => !o)}
          className="text-sm text-electric font-bold hover:text-blue-700 flex items-center gap-1"
        >
          <ChevronDown size={14} className={`transition-transform ${helpOpen ? 'rotate-180' : ''}`} />
          How do I get a Google API key?
        </button>
        {helpOpen && (
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside bg-gray-50 rounded-xl p-4">
            <li>
              Go to{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-electric font-bold hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio <ExternalLink size={12} />
              </a>
            </li>
            <li>Click <strong className="text-navy">Create API Key</strong> and pick a project (or create one).</li>
            <li>Copy the key (starts with <code className="bg-white px-1 rounded text-xs">AIza...</code>) and paste it above.</li>
            <li>
              Make sure billing is enabled on your Google Cloud project so generations don't fail
              past the free tier. Gemini image generations cost roughly $0.04 each.
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}

function KeyInput({
  keyInput,
  setKeyInput,
  show,
  setShow,
}: {
  keyInput: string;
  setKeyInput: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-700">Google API key</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          placeholder="AIza..."
          className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 focus:border-electric focus:ring-2 focus:ring-electric/20 outline-none text-sm font-mono"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Hide key' : 'Show key'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Stored encrypted (AES-256-GCM). Never sent back to your browser.
      </p>
    </div>
  );
}

function ActionRow({
  saving,
  testing,
  onSave,
  onTest,
}: {
  saving: boolean;
  testing: boolean;
  onSave: () => void;
  onTest: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-electric hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Save
      </button>
      <button
        onClick={onTest}
        disabled={testing}
        className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-navy font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
      >
        {testing && <Loader2 size={14} className="animate-spin" />}
        Test connection
      </button>
    </div>
  );
}

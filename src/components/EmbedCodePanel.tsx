import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Copy, CheckCircle2, ExternalLink, Code2, Globe, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export default function EmbedCodePanel() {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'iframe' | 'page'>('iframe');

  const tenantId = userData?.tenantId || 'YOUR_TENANT_ID';
  const baseUrl = window.location.origin;

  const iframeCode = `<!-- ClosePro AI Remodel Visualizer -->
<iframe
  src="${baseUrl}/widget/${tenantId}"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius:16px; max-width:1100px; display:block; margin:0 auto;"
  allow="camera"
  title="AI Remodel Visualizer"
></iframe>`;

  const pageUrl = `${baseUrl}/widget/${tenantId}`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Your Embed Code</h1>
        <p className="text-gray-500 mt-1">Add the AI remodel visualizer to your contractor website in minutes.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 max-w-xs">
        <button onClick={() => setActiveTab('iframe')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'iframe' ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-navy'}`}>
          <Code2 size={14} /> Embed Code
        </button>
        <button onClick={() => setActiveTab('page')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'page' ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-navy'}`}>
          <Globe size={14} /> Direct Link
        </button>
      </div>

      {activeTab === 'iframe' ? (
        <div className="space-y-4">
          <div className="bg-[#0d1117] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-gray-500 text-xs font-mono">embed-code.html</span>
              <button onClick={() => copy(iframeCode)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {copied ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <pre className="p-5 text-sm font-mono text-green-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {iframeCode}
            </pre>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="font-bold text-navy text-sm">How to install:</p>
            <ol className="space-y-1.5 text-sm text-gray-600">
              <li><span className="font-bold text-blue-electric">1.</span> Copy the code above</li>
              <li><span className="font-bold text-blue-electric">2.</span> Go to your website editor (Wix, Squarespace, WordPress, etc.)</li>
              <li><span className="font-bold text-blue-electric">3.</span> Add an "HTML" or "Embed" block on any page</li>
              <li><span className="font-bold text-blue-electric">4.</span> Paste the code and publish — done</li>
            </ol>
          </div>

          {/* Platform guides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Wix', step: 'Add → Embed → HTML iframe' },
              { name: 'Squarespace', step: 'Edit page → Code Block' },
              { name: 'WordPress', step: 'Add block → Custom HTML' },
              { name: 'GoDaddy', step: 'Add section → HTML' },
            ].map(p => (
              <div key={p.name} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="font-bold text-navy text-sm">{p.name}</p>
                <p className="text-gray-400 text-xs mt-1">{p.step}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">Share this link directly with homeowners or link to it from your website navigation.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <Globe size={18} className="text-blue-electric shrink-0" />
            <p className="text-navy font-mono text-sm flex-1 break-all">{pageUrl}</p>
            <button onClick={() => copy(pageUrl)}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-electric text-white hover:bg-navy'}`}>
              {copied ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <a href={pageUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-electric font-bold text-sm hover:underline">
            <ExternalLink size={14} /> Preview your widget page
          </a>
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy flex items-center gap-2"><Smartphone size={18} className="text-blue-electric" /> Live Preview</h3>
          <a href={pageUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold text-blue-electric hover:underline flex items-center gap-1">
            Open full page <ExternalLink size={12} />
          </a>
        </div>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '400px' }}>
          <iframe src={pageUrl} width="100%" height="100%" frameBorder="0" title="Widget Preview" />
        </div>
      </div>
    </div>
  );
}

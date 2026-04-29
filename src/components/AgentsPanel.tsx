import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Brain, Code, TestTube, Play, FileText, Video,
  Image, Globe, Kanban, Calculator, MessageSquare,
  Target, DollarSign, Search, BarChart3, Shield,
  TrendingUp, ChevronRight, X, Send, Copy, CheckCircle2,
  Loader2, Bot, Sparkles, PlayCircle, Download
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// ── Default prompts for batch "Run All" mode ──────────────────────────────────
const BATCH_PROMPTS: Record<string, string> = {
  "ceo":              "ClosePro Remodel is a SaaS platform for kitchen/bathroom remodelers. Plans: Starter $97/mo, Growth $197/mo, Pro $497/mo. Platform is built and live at closepro-remodel.vercel.app. We have 0 paying customers. What are our top 5 revenue-driving priorities to reach 100 paying customers in 90 days?",
  "product-architect":"ClosePro Remodel needs to scale from MVP to full SaaS. Current features: CRM, AI visualizer, estimates, invoices, automation, lead capture, blog. What are the 5 most important product improvements needed to increase trial-to-paid conversion from 18% to 35%?",
  "ai-generator":     "Write 5 optimized AI image generation prompts for a kitchen remodel visualizer. Each prompt should produce a stunning transformation photo. Include: modern farmhouse, luxury contemporary, transitional, budget-friendly modern, and high-end European styles. Format for Stable Diffusion / DALL-E.",
  "ai-tester":        "We use an AI remodel visualizer where contractors upload a room photo and see a remodeled version. Common issues: dark photos produce bad results, cluttered rooms confuse the AI, small bathrooms get distorted proportions. Write a testing protocol with 10 test cases, expected results, and improvement prompts for each failure scenario.",
  "demo-experience":  "ClosePro Remodel has a free AI demo at /ai-demo. Users upload a room photo, pick a style, see a before/after result, then are asked for their email. Current problem: we think users are dropping off before uploading. Write a full optimization plan for the demo flow to maximize email captures and trial signups.",
  "sales-page":       "Write high-converting copy for ClosePro Remodel's homepage hero section. Target: kitchen remodelers making $200K-$1M/year who are tired of losing jobs to competitors. Include: headline, subheadline, 3 bullet benefits, CTA button text, and a trust-building element. Make it bold and results-focused.",
  "product-showcase": "Create a 5-step product showcase script for ClosePro Remodel's demo call. Walk a potential contractor customer through: (1) AI visualizer, (2) lead capture, (3) CRM pipeline, (4) automated follow-up, (5) estimates. Each step should have a wow moment and clear benefit statement.",
  "video-script":     "Write a 45-second explainer video script for ClosePro Remodel. Open with a pain point (contractors losing jobs because customers can't visualize the remodel). Show the solution (AI visualization + CRM). End with a strong CTA. Include: voiceover text, on-screen text overlays, and scene descriptions.",
  "content":          "Write a complete SEO blog post titled 'How Kitchen Remodelers Are Using AI to Close $30K Jobs on the First Visit'. Target keyword: AI remodel visualizer. Include: meta description, H1, 4 H2 sections, conclusion, and internal CTA to try ClosePro Remodel free. Minimum 800 words.",
  "widget":           "Design the ClosePro Remodel embeddable AI widget product. This widget lets contractors add our AI remodel visualizer to THEIR website. Write: (1) product description, (2) key features list, (3) pricing ($97/mo basic, $197/mo with custom branding), (4) installation instructions, (5) marketing copy for the widget landing page.",
  "crm":              "A kitchen remodeler has 24 leads in their pipeline: 8 new, 6 contacted, 5 estimate sent, 3 scheduled, 2 closed won. They haven't followed up with 4 leads in over 7 days. Write a prioritized action plan for this week to maximize closings, including specific follow-up messages for each cold lead.",
  "estimate":         "Generate a professional estimate for a kitchen remodel project: 200 sq ft kitchen, gut renovation, semi-custom cabinets, quartz countertops, tile backsplash, new appliances (mid-range), LVP flooring, recessed lighting. Location: suburban Oklahoma. Include line items, labor, materials, timeline, payment schedule, and warranty.",
  "automation":       "Write a 7-touch follow-up sequence for a contractor who just received a new kitchen remodel lead. The lead filled out a form but hasn't responded to the first call. Sequence should span 14 days. Include: SMS messages, email subject lines, email body, and timing. Make it personal and urgency-building without being pushy.",
  "lead-capture":     "Write all copy for ClosePro Remodel's lead capture assets: (1) Homepage exit popup, (2) AI demo email gate, (3) Free guide offer ('5 Ways AI Is Changing Remodeling'), (4) Webinar registration page, (5) SMS opt-in confirmation message. Each should have a compelling headline, 2-3 benefit bullets, and CTA.",
  "pricing":          "Analyze ClosePro Remodel's pricing: Starter $97/mo, Growth $197/mo, Pro $497/mo. Annual discount at 20% off. Target market: contractors making $200K-$2M/year. Recommend: (1) optimal price points, (2) what features to gate at each tier, (3) upsell triggers, (4) annual vs monthly conversion strategy, (5) competitive positioning vs JobNimbus ($25/mo) and Buildertrend ($99+/mo).",
  "seo":              "Create a 90-day SEO strategy for ClosePro Remodel. Target keywords: 'AI remodel visualizer', 'contractor CRM software', 'kitchen remodel software', 'bathroom remodel tool', 'remodeling business software'. Include: keyword priority list, content calendar (12 posts), technical SEO checklist, and local SEO tactics for contractor markets.",
  "analytics":        "ClosePro Remodel key metrics to track: demo usage rate, email capture rate from demo, trial signup rate, trial-to-paid conversion, monthly churn, average revenue per user, CAC, LTV. We currently have 0 paying customers. Design a metrics dashboard and weekly reporting template. Include which metrics matter most in the first 90 days.",
  "qa":               "Create a comprehensive QA checklist for ClosePro Remodel before launching paid advertising. Test all critical paths: (1) homepage to demo flow, (2) demo to email capture, (3) email to signup, (4) signup to dashboard, (5) dashboard core features, (6) mobile experience, (7) payment flow. Flag any must-fix issues that would kill conversions.",
  "growth":           "Build a 90-day growth playbook for ClosePro Remodel to acquire first 100 paying customers. Budget: $0 (organic only) for first 30 days, then $1,000/mo for paid. Tactics: contractor Facebook groups, YouTube, cold outreach, partnerships with lumber yards/suppliers, affiliate with remodel coaches. Include week-by-week action plan.",
};

// ── Agent Definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  // Revenue
  { id: 'ceo',             name: 'CEO / Boss Agent',       role: 'Strategy, KPIs & vision',        icon: Brain,        cat: 'strategy', badge: '#1',  color: 'bg-purple-500',  placeholder: 'Describe a business challenge or ask for strategic advice...' },
  { id: 'pricing',         name: 'Pricing Strategy Agent', role: 'Revenue & plan optimization',     icon: DollarSign,   cat: 'strategy', badge: '#15', color: 'bg-green-600',   placeholder: 'What pricing question or scenario do you want analyzed?' },
  { id: 'growth',          name: 'Growth & Scaling Agent', role: 'Scale to $1M+ MRR',               icon: TrendingUp,   cat: 'strategy', badge: '#19', color: 'bg-orange-500',  placeholder: 'What growth challenge or opportunity to analyze?' },
  { id: 'analytics',       name: 'Analytics Agent',        role: 'Data insights & metrics',         icon: BarChart3,    cat: 'strategy', badge: '#17', color: 'bg-blue-500',    placeholder: 'Share metrics or ask for analytics recommendations...' },
  // Product
  { id: 'product-architect', name: 'Product Architect',    role: 'System design & features',        icon: Code,         cat: 'product',  badge: '#2',  color: 'bg-blue-600',    placeholder: 'Describe a feature or system you want designed...' },
  { id: 'ai-generator',    name: 'AI Generator Agent',     role: 'Optimize remodel AI prompts',     icon: Sparkles,     cat: 'product',  badge: '#3',  color: 'bg-cyan-500',    placeholder: 'Describe the room type, style, and what you want to generate...' },
  { id: 'ai-tester',       name: 'AI Testing Agent',       role: 'Test & improve AI outputs',       icon: TestTube,     cat: 'product',  badge: '#4',  color: 'bg-yellow-500',  placeholder: 'Describe the AI output you want to test or improve...' },
  { id: 'demo-experience', name: 'Demo Experience Agent',  role: 'Optimize conversion funnel',      icon: Play,         cat: 'product',  badge: '#5',  color: 'bg-pink-500',    placeholder: 'Describe the demo flow you want to optimize...' },
  { id: 'widget',          name: 'Widget / Embed Agent',   role: 'AI widget for contractor sites',  icon: Globe,        cat: 'product',  badge: '#10', color: 'bg-teal-500',    placeholder: 'Describe the widget feature or contractor use case...' },
  { id: 'qa',              name: 'QA Agent',               role: 'Test & find bugs',                icon: Shield,       cat: 'product',  badge: '#18', color: 'bg-red-500',     placeholder: 'Describe what feature or flow you want tested...' },
  // Content
  { id: 'sales-page',      name: 'Sales Page Agent',       role: 'High-converting copy',            icon: FileText,     cat: 'content',  badge: '#6',  color: 'bg-indigo-500',  placeholder: 'What page section or copy do you need written?' },
  { id: 'content',         name: 'Content / Blog Agent',   role: 'SEO content & blog posts',        icon: FileText,     cat: 'content',  badge: '#9',  color: 'bg-green-500',   placeholder: 'What topic or keyword should the content target?' },
  { id: 'video-script',    name: 'Video Script Agent',     role: 'Explainer video scripts',         icon: Video,        cat: 'content',  badge: '#8',  color: 'bg-red-400',     placeholder: 'What video do you need a script for? (15-60 sec)' },
  { id: 'product-showcase',name: 'Product Showcase Agent', role: 'Demo scripts & walkthroughs',     icon: Image,        cat: 'content',  badge: '#7',  color: 'bg-violet-500',  placeholder: 'What product feature should be showcased?' },
  // Operations
  { id: 'crm',             name: 'CRM Pipeline Agent',     role: 'Lead management & pipeline',      icon: Kanban,       cat: 'ops',      badge: '#11', color: 'bg-blue-400',    placeholder: 'Describe your lead situation or pipeline challenge...' },
  { id: 'estimate',        name: 'Estimate Generator',     role: 'Professional estimates',          icon: Calculator,   cat: 'ops',      badge: '#12', color: 'bg-amber-500',   placeholder: 'Describe the remodeling project (type, size, materials)...' },
  { id: 'automation',      name: 'Automation Agent',       role: 'Follow-up SMS & email sequences', icon: MessageSquare, cat: 'ops',     badge: '#13', color: 'bg-purple-400',  placeholder: 'What trigger or scenario needs automated follow-up?' },
  { id: 'lead-capture',    name: 'Lead Capture Agent',     role: 'Forms, popups & capture copy',    icon: Target,       cat: 'ops',      badge: '#14', color: 'bg-rose-500',    placeholder: 'What lead capture asset or scenario do you need?' },
  { id: 'seo',             name: 'SEO & Traffic Agent',    role: 'Keywords & content strategy',     icon: Search,       cat: 'ops',      badge: '#16', color: 'bg-emerald-500', placeholder: 'What keyword, page, or SEO challenge to address?' },
];

const CATS = [
  { id: 'all',      label: 'All Agents',   count: AGENTS.length },
  { id: 'strategy', label: 'Strategy',     count: AGENTS.filter(a => a.cat === 'strategy').length },
  { id: 'product',  label: 'Product',      count: AGENTS.filter(a => a.cat === 'product').length },
  { id: 'content',  label: 'Content',      count: AGENTS.filter(a => a.cat === 'content').length },
  { id: 'ops',      label: 'Operations',   count: AGENTS.filter(a => a.cat === 'ops').length },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface AgentRun { output: string; prompt: string; timestamp: Date; }

// ── AgentCard ─────────────────────────────────────────────────────────────────
function AgentCard({ agent, onRun, lastRun }: { agent: typeof AGENTS[0]; onRun: () => void; lastRun?: AgentRun }) {
  const Icon = agent.icon;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={onRun}
    >
      <div className={`h-1.5 ${agent.color}`} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 ${agent.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
            <Icon size={20} className={agent.color.replace('bg-', 'text-')} />
          </div>
          <span className="text-xs font-black text-gray-300 font-mono">{agent.badge}</span>
        </div>
        <div>
          <h3 className="font-bold text-navy text-sm leading-tight">{agent.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{agent.role}</p>
        </div>
        {lastRun ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-green-500" />
            <span className="text-xs text-gray-400">Last run {lastRun.timestamp.toLocaleTimeString()}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-blue-electric transition-colors">
            <span>Click to run</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── AgentRunner Modal ─────────────────────────────────────────────────────────
function AgentRunner({ agent, onClose, onSave }: {
  agent: typeof AGENTS[0];
  onClose: () => void;
  onSave: (run: AgentRun) => void;
}) {
  const Icon = agent.icon;
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setOutput('');
    setDone(false);
    setError('');

    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Agent request failed');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { setDone(true); continue; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              fullOutput += parsed.text;
              setOutput(fullOutput);
              if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
            }
          } catch {}
        }
      }

      if (fullOutput) {
        onSave({ output: fullOutput, prompt, timestamp: new Date() });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <div className={`w-12 h-12 ${agent.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-navy text-lg leading-none">{agent.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{agent.role}</p>
          </div>
          <div className="flex items-center gap-2">
            {running && (
              <div className="flex items-center gap-1.5 text-blue-electric text-xs font-bold">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={14} />
                </motion.div>
                Running...
              </div>
            )}
            {done && !running && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Done</span>}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-navy transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-6 space-y-3 border-b border-gray-100">
          <label className="text-xs font-bold text-navy uppercase tracking-wider">Your Input</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
              placeholder={agent.placeholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm resize-none pr-24"
            />
            <button
              onClick={run}
              disabled={!prompt.trim() || running}
              className="absolute right-3 bottom-3 btn-shimmer px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={12} /> Run {running ? '' : '⌘↵'}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error.includes('ANTHROPIC_API_KEY') ? (
                <div>
                  <strong>API Key not set.</strong> Add <code className="bg-red-100 px-1 rounded">ANTHROPIC_API_KEY=your_key</code> to your <code className="bg-red-100 px-1 rounded">.env</code> file and restart the server.
                </div>
              ) : error}
            </div>
          )}
          {(output || running) && (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Bot size={14} /> AI Output
                </div>
                {output && (
                  <button onClick={copy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-electric transition-colors font-medium">
                    {copied ? <><CheckCircle2 size={12} className="text-green-500" /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                )}
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto p-6">
                {running && !output && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Loader2 size={18} className="animate-spin text-blue-electric" />
                    </motion.div>
                    <span className="text-sm font-mono">Agent thinking...</span>
                  </div>
                )}
                {output && (
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-sm font-mono">
                    {output}
                    {running && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-4 bg-blue-electric ml-0.5 align-middle" />}
                  </div>
                )}
              </div>
            </>
          )}
          {!output && !running && !error && (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="space-y-3">
                <div className={`w-16 h-16 ${agent.color} bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto`}>
                  <Icon size={28} className={agent.color.replace('bg-', 'text-')} />
                </div>
                <p className="text-gray-400 text-sm">Enter your input above and press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">⌘↵</kbd> to run</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Batch Runner (rate-limited for free tier) ─────────────────────────────────
// Free tier: 5 RPM per model, 4K output tokens/min
// Strategy: 3 agents per batch, 65s cooldown → ~2.8 req/min (safe buffer)
const BATCH_SIZE = 19; // paid tier — run all at once, no cooldown needed
const BATCH_DELAY_MS = 0;
const TOTAL_BATCHES = 1;
// Pre-assign each agent to a batch number
const AGENT_BATCH = AGENTS.reduce<Record<string, number>>((acc, agent, i) => {
  acc[agent.id] = Math.floor(i / BATCH_SIZE) + 1;
  return acc;
}, {});

type BatchStatus = 'queued' | 'running' | 'done' | 'error';
interface BatchResult { agentId: string; output: string; error?: string; duration: number; }

function BatchRunner({ onClose, onComplete }: { onClose: () => void; onComplete: (results: BatchResult[]) => void }) {
  const [statuses, setStatuses] = useState<Record<string, BatchStatus>>({});
  const [results, setResults] = useState<BatchResult[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cooling, setCooling] = useState(false);

  const sleep = (ms: number) => new Promise<void>(resolve => {
    let remaining = Math.round(ms / 1000);
    setCooling(true);
    setCountdown(remaining);
    const tick = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) { clearInterval(tick); setCooling(false); resolve(); }
    }, 1000);
  });

  const runQueue = async () => {
    setStarted(true);
    // Mark all as queued
    const init: Record<string, BatchStatus> = {};
    AGENTS.forEach(a => { init[a.id] = 'queued'; });
    setStatuses(init);

    const allResults: BatchResult[] = [];

    for (let b = 0; b < TOTAL_BATCHES; b++) {
      const batchAgents = AGENTS.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      setCurrentBatch(b + 1);

      // Mark this batch as running
      setStatuses(prev => {
        const next = { ...prev };
        batchAgents.forEach(a => { next[a.id] = 'running'; });
        return next;
      });

      // Fire all agents in this batch in parallel
      const batchResults = await Promise.allSettled(
        batchAgents.map(async (agent) => {
          const start = Date.now();
          try {
            const res = await fetch(`/api/agents/${agent.id}/run`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: BATCH_PROMPTS[agent.id] }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setStatuses(prev => ({ ...prev, [agent.id]: 'done' }));
            return { agentId: agent.id, output: data.output, duration: Date.now() - start } as BatchResult;
          } catch (err: any) {
            setStatuses(prev => ({ ...prev, [agent.id]: 'error' }));
            return { agentId: agent.id, output: '', error: err.message, duration: Date.now() - start } as BatchResult;
          }
        })
      );

      batchResults.forEach(r => {
        if (r.status === 'fulfilled') allResults.push(r.value);
      });

      // Cooldown between batches (not after the last one)
      if (b < TOTAL_BATCHES - 1) await sleep(BATCH_DELAY_MS);
    }

    setResults(allResults);
    setFinished(true);
    onComplete(allResults);

    // Save to Firebase + local project file
    try {
      await addDoc(collection(db, 'agentBatchRuns'), {
        results: allResults.reduce((acc, r) => ({ ...acc, [r.agentId]: { output: r.output, error: r.error, duration: r.duration } }), {}),
        totalAgents: AGENTS.length,
        successCount: allResults.filter(r => !r.error).length,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch { /* Firebase optional */ }

    // Auto-save to local project file so Claude can read and implement changes
    try {
      await fetch('/api/agents/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: allResults }),
      });
    } catch { /* local save optional */ }
  };

  const downloadAll = () => {
    const text = results.map(r => {
      const agent = AGENTS.find(a => a.id === r.agentId);
      return `${'='.repeat(60)}\n${agent?.name?.toUpperCase()} — ${agent?.role}\n${'='.repeat(60)}\n\n${r.output || `ERROR: ${r.error}`}\n\n`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `closepro-agents-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doneCount = Object.values(statuses).filter(s => s === 'done').length;
  const errorCount = Object.values(statuses).filter(s => s === 'error').length;
  const progress = started ? Math.round(((doneCount + errorCount) / AGENTS.length) * 100) : 0;
  const estMinutes = Math.ceil((TOTAL_BATCHES * 65) / 60);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={!started ? onClose : undefined}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-navy text-xl flex items-center gap-2">
              <PlayCircle className="text-blue-electric" size={24} /> Run All 19 Agents
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {!started
                ? `${TOTAL_BATCHES} batches of ${BATCH_SIZE} · respects free tier (5 RPM) · ~${estMinutes} min total`
                : finished
                ? `Complete! ${doneCount} succeeded${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
                : cooling
                ? `Batch ${currentBatch - 1}/${TOTAL_BATCHES} done · cooldown to respect rate limits...`
                : `Running batch ${currentBatch}/${TOTAL_BATCHES} · ${doneCount} of ${AGENTS.length} done`}
            </p>
          </div>
          {!started && <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={18} /></button>}
        </div>

        {/* Progress + countdown */}
        {started && (
          <div className="px-6 py-3 border-b border-gray-100 space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500">
              <span>
                {cooling
                  ? <span className="text-amber-500">⏳ Rate-limit cooldown — next batch in {countdown}s</span>
                  : `Batch ${currentBatch} of ${TOTAL_BATCHES} running`}
              </span>
              <span className={finished ? 'text-green-500' : 'text-blue-electric'}>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }}
                className={`h-full rounded-full ${cooling ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-electric to-purple-500'}`} />
            </div>
            {cooling && (
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: BATCH_DELAY_MS / 1000, ease: 'linear' }}
                  className="h-full bg-amber-300 rounded-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Agent grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {!started ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
                <p className="font-bold text-green-800 mb-2">⚡ Paid Tier — All 19 Run Simultaneously</p>
                <div className="grid grid-cols-3 gap-3 text-xs text-green-700">
                  <div className="bg-white rounded-xl p-2 text-center border border-green-100">
                    <p className="font-black text-green-800 text-base">19</p>
                    <p>run at once</p>
                  </div>
                  <div className="bg-white rounded-xl p-2 text-center border border-green-100">
                    <p className="font-black text-green-800 text-base">0s</p>
                    <p>cooldown</p>
                  </div>
                  <div className="bg-white rounded-xl p-2 text-center border border-green-100">
                    <p className="font-black text-green-800 text-base">~1m</p>
                    <p>total runtime</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {AGENTS.map((agent, i) => {
                  const Icon = agent.icon;
                  const batchNum = AGENT_BATCH[agent.id];
                  return (
                    <div key={agent.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
                      <div className={`w-6 h-6 ${agent.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon size={12} className="text-white" />
                      </div>
                      <span className="font-medium truncate flex-1">{agent.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">B{batchNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {AGENTS.map(agent => {
                const Icon = agent.icon;
                const status = statuses[agent.id] || 'queued';
                const result = results.find(r => r.agentId === agent.id);
                const batchNum = AGENT_BATCH[agent.id];
                return (
                  <motion.div key={agent.id} layout
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      status === 'done'    ? 'bg-green-50 border-green-200' :
                      status === 'error'   ? 'bg-red-50 border-red-200' :
                      status === 'running' ? 'bg-blue-electric/5 border-blue-electric/30' :
                                            'bg-gray-50 border-gray-100 opacity-50'
                    }`}>
                    <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center flex-shrink-0 ${status === 'queued' ? 'opacity-40' : ''}`}>
                      <Icon size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{agent.name}</p>
                      {status === 'done'    && result && <p className="text-[10px] text-green-600 font-medium">{(result.duration / 1000).toFixed(1)}s ✓</p>}
                      {status === 'error'   && <p className="text-[10px] text-red-500">{result?.error?.slice(0, 30)}</p>}
                      {status === 'running' && <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-[10px] text-blue-electric font-medium">Running...</motion.p>}
                      {status === 'queued'  && <p className="text-[10px] text-gray-400">Batch {batchNum} — queued</p>}
                    </div>
                    <div className="flex-shrink-0">
                      {status === 'done'    && <CheckCircle2 size={16} className="text-green-500" />}
                      {status === 'error'   && <X size={16} className="text-red-500" />}
                      {status === 'running' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 size={16} className="text-blue-electric" /></motion.div>}
                      {status === 'queued'  && <span className="text-[10px] font-mono text-gray-300">B{batchNum}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {!started ? (
            <>
              <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 font-bold text-navy hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={runQueue}
                className="btn-shimmer flex-1 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                <PlayCircle size={20} /> Start — {TOTAL_BATCHES} Batches
              </button>
            </>
          ) : finished ? (
            <>
              <button onClick={downloadAll}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-navy text-white font-bold hover:bg-blue-electric transition-all">
                <Download size={18} /> Download All Results
              </button>
              <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 font-bold text-navy hover:bg-gray-50 text-sm text-center">
                {saved ? '✓ Saved' : 'Close'}
              </button>
            </>
          ) : (
            <div className="flex-1 text-center space-y-1">
              {cooling ? (
                <p className="text-amber-600 font-bold text-sm">⏳ Cooling down {countdown}s to respect rate limits...</p>
              ) : (
                <p className="text-blue-electric font-bold text-sm">Running batch {currentBatch}/{TOTAL_BATCHES}...</p>
              )}
              <p className="text-gray-400 text-xs">Safe to step away — results auto-save to Firebase when done</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main AgentsPanel ──────────────────────────────────────────────────────────
export default function AgentsPanel() {
  const [activeCat, setActiveCat] = useState('all');
  const [activeAgent, setActiveAgent] = useState<typeof AGENTS[0] | null>(null);
  const [runs, setRuns] = useState<Record<string, AgentRun>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showBatchRunner, setShowBatchRunner] = useState(false);

  const filtered = AGENTS.filter(a => {
    const matchesCat = activeCat === 'all' || a.cat === activeCat;
    const matchesSearch = searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalRuns = Object.keys(runs).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-navy">AI Agent Team</h1>
            <span className="bg-blue-electric/10 text-blue-electric px-2.5 py-1 rounded-full text-xs font-black">
              {AGENTS.length} Agents
            </span>
          </div>
          <p className="text-gray-500 text-sm">Your autonomous AI team — each agent is a specialist powered by Claude.</p>
        </div>
        <div className="flex items-center gap-3">
          {totalRuns > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-xs font-bold text-green-700">{totalRuns} agents run this session</span>
            </div>
          )}
          <button onClick={() => setShowBatchRunner(true)}
            className="btn-shimmer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
            <PlayCircle size={16} /> Run All 19
          </button>
          <div className="flex items-center gap-1.5 glass-dark px-3 py-2 rounded-xl neon-border">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs font-bold text-white">Claude AI Active</span>
          </div>
        </div>
      </div>

      {/* Setup notice if no API key */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">🔑</span>
        <div>
          <p className="font-bold text-amber-800 text-sm">Setup Required</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Add <code className="bg-amber-100 px-1 rounded font-mono">ANTHROPIC_API_KEY=your_key</code> to your <code className="bg-amber-100 px-1 rounded font-mono">.env</code> file, then restart the server. Get your key at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a>
          </p>
        </div>
      </div>

      {/* Search + Category tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 outline-none text-sm"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {CATS.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeCat === cat.id ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-navy'
              }`}>
              {cat.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCat === cat.id ? 'bg-blue-electric text-white' : 'bg-gray-200 text-gray-500'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onRun={() => setActiveAgent(agent)}
            lastRun={runs[agent.id]}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Bot size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No agents match "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Recent runs */}
      {totalRuns > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-navy text-sm uppercase tracking-wider">Recent Runs This Session</h2>
          <div className="space-y-2">
            {Object.entries(runs).slice(-5).reverse().map(([id, run]) => {
              const agent = AGENTS.find(a => a.id === id);
              if (!agent) return null;
              const Icon = agent.icon;
              return (
                <div key={id} onClick={() => setActiveAgent(agent)}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-electric cursor-pointer group transition-all">
                  <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy">{agent.name}</p>
                    <p className="text-xs text-gray-400 truncate">{run.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{run.timestamp.toLocaleTimeString()}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch Runner Modal */}
      <AnimatePresence>
        {showBatchRunner && (
          <BatchRunner
            onClose={() => setShowBatchRunner(false)}
            onComplete={(results) => {
              const newRuns: Record<string, AgentRun> = {};
              results.forEach(r => {
                if (r.output) newRuns[r.agentId] = { output: r.output, prompt: BATCH_PROMPTS[r.agentId] || '', timestamp: new Date() };
              });
              setRuns(prev => ({ ...prev, ...newRuns }));
            }}
          />
        )}
      </AnimatePresence>

      {/* Agent Runner Modal */}
      <AnimatePresence>
        {activeAgent && (
          <AgentRunner
            agent={activeAgent}
            onClose={() => setActiveAgent(null)}
            onSave={(run) => {
              setRuns(prev => ({ ...prev, [activeAgent.id]: run }));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

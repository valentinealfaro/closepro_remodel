import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { getAdmin, getFirestoreAdmin } from "./lib/firebase-admin";
import { handleGenerateRemodel } from "./lib/generate-handler";
import { handleByokSave, handleByokTest, handleByokDelete, handleByokStatus } from "./lib/byok-handlers";

dotenv.config();

// Initialize Firebase Admin via the shared singleton.
getAdmin();
const dbAdmin = getFirestoreAdmin();

// ── Gemini client (server-side only — key never sent to browser) ─────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash";
const getAI = () => new GoogleGenAI({ apiKey: GEMINI_KEY });


// ── Agent definitions (Gemini-powered, no model field needed) ────────────────
const AGENTS: Record<string, { system: string }> = {
  "ceo":              { system: `You are the CEO Agent for ClosePro Remodel, a SaaS platform for remodeling contractors. Analyze business situations and provide strategic recommendations. Focus on: Revenue growth, product-market fit, feature prioritization, KPIs. Always ask: Will this make money? Will this help contractors close deals? Format: Lead with a clear recommendation, then reasoning. Be direct and decisive.` },
  "product-architect":{ system: `You are the Product Architect Agent for ClosePro Remodel. Design scalable SaaS system structures, user flows, database schemas, and feature modules. Always design for: Scalability, revenue generation, fast time-to-value for contractors. Format: Structured technical recommendations with clear implementation steps.` },
  "ai-generator":     { system: `You are the AI Generator Agent for ClosePro Remodel's AI Remodel Visualizer. Write and optimize AI image generation prompts that produce stunning remodel visualizations. Focus: Kitchen remodels, bathroom remodels, exterior, living rooms. Styles: modern, luxury, farmhouse, traditional. Format: Return optimized prompts with style parameters and quality enhancers.` },
  "ai-tester":        { system: `You are the AI Testing Agent for ClosePro Remodel. Evaluate AI remodel visualization outputs. Identify what works, what looks bad, what confuses users. Output: Clear pass/fail assessments, specific improvement recommendations, and revised prompts.` },
  "demo-experience":  { system: `You are the Demo Experience Agent — you design conversion funnels for ClosePro Remodel's AI demo. Optimize the visitor → trial → paid conversion flow. Focus: Reduce friction, maximize wow moments, strategic email capture, CTA placement. Output: Specific, actionable UX recommendations with conversion psychology rationale.` },
  "sales-page":       { system: `You are the Sales Page Agent for ClosePro Remodel. Write high-converting copy for landing pages, hero sections, feature descriptions, and CTAs. Audience: Kitchen/bathroom remodelers who want to close $10K-$50K jobs. Tone: Bold, direct, results-focused. Format: Complete copy sections with headlines, subheadlines, and body text.` },
  "product-showcase": { system: `You are the Product Showcase Agent for ClosePro Remodel. Create compelling demo scripts, feature walkthroughs, and screenshot descriptions. Goal: Help users understand platform value within 10 seconds. Format: Step-by-step showcase scripts with talking points and visual cues.` },
  "video-script":     { system: `You are the Video Script Agent for ClosePro Remodel. Write short, punchy explainer video scripts (15-60 seconds). Focus: Show results fast, no fluff. Target: remodelers who want to close more jobs. Format: Scene-by-scene script with voiceover text, on-screen text, and visual descriptions.` },
  "content":          { system: `You are the Content Agent for ClosePro Remodel. Write SEO-optimized blog posts, landing page content, and marketing copy. Target keywords: AI remodel tool, contractor software, kitchen remodel visualizer, bathroom remodel AI. Format: Complete, publish-ready content with H1/H2/H3 structure, meta description, and internal links.` },
  "widget":           { system: `You are the Widget/Embed Agent for ClosePro Remodel. Design and describe the embeddable AI remodel widget that contractors add to their own websites. Features: Custom branding, lead capture, dashboard connection. Format: Widget description, implementation guide, and marketing copy for the widget product.` },
  "crm":              { system: `You are the CRM Agent for ClosePro Remodel. Provide recommendations for managing contractor leads and sales pipelines. Pipeline stages: New Lead → Contacted → Estimate Sent → Scheduled → Closed Won/Lost. Format: Specific, actionable recommendations for moving leads through the pipeline faster.` },
  "estimate":         { system: `You are the Estimate Generator Agent for ClosePro Remodel. Generate professional remodeling estimates and invoice content. Output: Detailed line-item estimates with materials, labor, timeline, and payment terms. Format: Professional estimate document ready to send to homeowners.` },
  "automation":       { system: `You are the Automation Agent for ClosePro Remodel. Write follow-up SMS and email sequences that help contractors close more jobs. Tone: Professional but friendly. Personal, not corporate. Urgency without pressure. Format: Complete sequences with timing, subject lines, and message body. Include variations.` },
  "lead-capture":     { system: `You are the Lead Capture Agent for ClosePro Remodel. Write high-converting form copy, exit popup text, and lead capture messaging. Goal: No visitor leaves without being captured. Minimize friction, maximize conversions. Format: Complete lead capture assets with headlines, form labels, button text, and follow-up messaging.` },
  "pricing":          { system: `You are the Pricing Strategy Agent for ClosePro Remodel. Analyze pricing models and recommend revenue-maximizing strategies. Current plans: Starter $97/mo, Growth $197/mo, Pro $497/mo. Format: Specific pricing recommendations with psychological pricing rationale and upsell paths.` },
  "seo":              { system: `You are the SEO & Traffic Agent for ClosePro Remodel. Generate keyword strategies, content plans, and traffic-driving recommendations. Target: "AI remodel tool", "contractor software", "kitchen remodel visualizer", "bathroom remodel AI". Format: Prioritized keyword list, content calendar, and actionable SEO improvements.` },
  "analytics":        { system: `You are the Analytics Agent for ClosePro Remodel. Analyze business metrics and identify growth opportunities. Track: Demo usage, conversion rate, signup rate, drop-off points, revenue. Format: Clear insights with specific action items ranked by impact.` },
  "qa":               { system: `You are the QA Agent for ClosePro Remodel. Test and verify all platform features. Find bugs, UX issues, and conversion killers. Test areas: Signup, login, AI generator, dashboard, payments, mobile, speed. Format: Detailed test cases, pass/fail results, and prioritized bug report.` },
  "growth":           { system: `You are the Growth & Scaling Agent for ClosePro Remodel. Build strategies to scale to $1M+ MRR. Strategies: Paid ads, affiliate program, contractor partnerships, white-label, upsells. Format: Specific, executable growth playbooks with expected ROI and resource requirements.` },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-11-preview" })
  : null;

// ── Simple in-memory per-IP rate limiter ──────────────────────────────────────
// For production, replace with Upstash/Redis. This guards against casual abuse
// only — multi-instance deployments need a shared store.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count++;
  return true;
}
function clientIp(req: any): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe webhook needs the raw body for signature verification — must be
  // registered BEFORE express.json().
  app.post(
    '/api/stripe-webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET not set' });

      const sig = req.headers['stripe-signature'] as string;
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const tenantId = session.metadata?.tenantId;
          const invoiceId = session.metadata?.invoiceId;
          console.log(`[stripe] checkout.session.completed tenant=${tenantId} invoice=${invoiceId} amount=${session.amount_total}`);
          
          if (tenantId && invoiceId) {
            try {
              // Update tenant status to active
              await dbAdmin.collection('tenants').doc(tenantId).update({
                status: 'active',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              
              // Update invoice status to paid
              await dbAdmin.collection('tenants').doc(tenantId).collection('invoices').doc(invoiceId).update({
                status: 'paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              
              console.log(`[stripe] Updated Firestore for tenant ${tenantId}, invoice ${invoiceId}`);
            } catch (error) {
              console.error('[stripe] Failed to update Firestore:', error);
            }
          }
          break;
        }
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated':
          console.log(`[stripe] ${event.type}`);
          break;
        default:
          console.log(`[stripe] unhandled event ${event.type}`);
      }
      res.json({ received: true });
    }
  );

  app.use(express.json({ limit: '30mb' }));

  // ── Agent API — streaming (Gemini) ────────────────────────────────────────
  app.post("/api/agents/:agentId", async (req, res) => {
    const ip = clientIp(req);
    if (!rateLimit(`agent:1m:${ip}`, 10, 60_000)) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    const { agentId } = req.params;
    const { prompt } = req.body;
    const agent = AGENTS[agentId];
    if (!agent) return res.status(404).json({ error: `Unknown agent: ${agentId}` });
    if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not set in .env" });
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const stream = await getAI().models.generateContentStream({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { systemInstruction: agent.system },
      });
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
      res.end();
    }
  });

  // ── Save agent results to project file (so Claude can read & act on them) ───
  app.post("/api/agents/save-results", async (req, res) => {
    const { results } = req.body;
    if (!results) return res.status(400).json({ error: "results required" });
    try {
      const fs = await import("fs");
      const dir = path.join(__dirname, "agent-results");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const timestamp = new Date().toISOString().slice(0, 10);
      const filePath = path.join(dir, `results-${timestamp}.json`);
      const latest = path.join(dir, "latest.json");
      const data = JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2);
      fs.writeFileSync(filePath, data);
      fs.writeFileSync(latest, data);
      console.log(`Agent results saved to ${filePath}`);
      res.json({ saved: true, path: filePath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Agent API — batch/non-streaming with auto-retry on 503 ──────────────────
  app.post("/api/agents/:agentId/run", async (req, res) => {
    const { agentId } = req.params;
    const { prompt } = req.body;
    const agent = AGENTS[agentId];
    if (!agent) return res.status(404).json({ error: `Unknown agent: ${agentId}` });
    if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not set in .env" });
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const MAX_RETRIES = 5;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await getAI().models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: { systemInstruction: agent.system },
        });
        return res.json({ output: result.text, agentId, model: GEMINI_MODEL });
      } catch (err: any) {
        const is503 = err.message?.includes('503') || err.message?.includes('high demand') || err.message?.includes('UNAVAILABLE');
        if (is503 && attempt < MAX_RETRIES) {
          const wait = attempt * 8000; // 8s, 16s, 24s, 32s
          console.log(`Agent ${agentId} got 503, retrying in ${wait/1000}s (attempt ${attempt}/${MAX_RETRIES})`);
          await sleep(wait);
        } else {
          return res.status(500).json({ error: err.message });
        }
      }
    }
  });

  // ── Stripe / Payments ────────────────────────────────────────────────────────
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { amount, invoiceId, tenantId, clientEmail, projectName } = req.body;

      if (!stripe) {
        return res.status(500).json({ error: "Stripe secret key not configured" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Payment for ${projectName}`,
                description: `Invoice #${invoiceId}`,
              },
              unit_amount: Math.round(amount * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/app/invoices?success=true&invoiceId=${invoiceId}`,
        cancel_url: `${req.headers.origin}/app/invoices?canceled=true`,
        customer_email: clientEmail,
        metadata: {
          invoiceId,
          tenantId,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── AI Remodel Image Generation (BYOK via Gemini 2.5 Flash Image) ─────────
  app.post('/api/generate-remodel', (req, res) => handleGenerateRemodel(req as any, res as any));

  // ── BYOK CRUD ─────────────────────────────────────────────────────────────
  app.get('/api/byok', (req, res) => handleByokStatus(req as any, res as any));
  app.post('/api/byok/save', (req, res) => handleByokSave(req as any, res as any));
  app.post('/api/byok/test', (req, res) => handleByokTest(req as any, res as any));
  app.post('/api/byok/delete', (req, res) => handleByokDelete(req as any, res as any));
  app.delete('/api/byok', (req, res) => handleByokDelete(req as any, res as any));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

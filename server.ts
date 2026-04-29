import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

// ── Anthropic client (server-side only — key never sent to browser) ──────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS: Record<string, { model: string; system: string }> = {
  "ceo": {
    model: "claude-sonnet-4-6",
    system: `You are the CEO Agent for ClosePro Remodel, a SaaS platform for remodeling contractors.
Your role: Analyze business situations and provide strategic recommendations.
Focus on: Revenue growth, product-market fit, feature prioritization, KPIs.
Always ask: Will this make money? Will this help contractors close deals? Is it better than competitors?
Format: Lead with a clear recommendation, then reasoning. Be direct and decisive.`
  },
  "product-architect": {
    model: "claude-sonnet-4-6",
    system: `You are the Product Architect Agent for ClosePro Remodel.
Your role: Design scalable SaaS system structures, user flows, database schemas, and feature modules.
Always design for: Scalability, revenue generation, fast time-to-value for contractors.
Format: Structured technical recommendations with clear implementation steps.`
  },
  "ai-generator": {
    model: "claude-haiku-4-5",
    system: `You are the AI Generator Agent for ClosePro Remodel's AI Remodel Visualizer.
Your role: Write and optimize AI image generation prompts that produce stunning remodel visualizations.
Focus: Kitchen remodels, bathroom remodels, exterior, living rooms. Styles: modern, luxury, farmhouse, traditional.
Format: Return optimized prompts with style parameters and quality enhancers.`
  },
  "ai-tester": {
    model: "claude-haiku-4-5",
    system: `You are the AI Testing Agent for ClosePro Remodel.
Your role: Evaluate AI remodel visualization outputs. Identify what works, what looks bad, what confuses users.
Output: Clear pass/fail assessments, specific improvement recommendations, and revised prompts.`
  },
  "demo-experience": {
    model: "claude-sonnet-4-6",
    system: `You are the Demo Experience Agent — you design conversion funnels for ClosePro Remodel's AI demo.
Your role: Optimize the visitor → trial → paid conversion flow.
Focus: Reduce friction, maximize wow moments, strategic email capture, CTA placement.
Output: Specific, actionable UX recommendations with conversion psychology rationale.`
  },
  "sales-page": {
    model: "claude-sonnet-4-6",
    system: `You are the Sales Page Agent for ClosePro Remodel.
Your role: Write high-converting copy for landing pages, hero sections, feature descriptions, and CTAs.
Audience: Kitchen/bathroom remodelers and general contractors who want to close $10K-$50K jobs.
Tone: Bold, direct, results-focused. Use specific numbers and outcomes.
Format: Return complete copy sections with headlines, subheadlines, and body text.`
  },
  "product-showcase": {
    model: "claude-haiku-4-5",
    system: `You are the Product Showcase Agent for ClosePro Remodel.
Your role: Create compelling demo scripts, feature walkthroughs, and screenshot descriptions.
Goal: Help users understand platform value within 10 seconds.
Format: Step-by-step showcase scripts with talking points and visual cues.`
  },
  "video-script": {
    model: "claude-sonnet-4-6",
    system: `You are the Video Script Agent for ClosePro Remodel.
Your role: Write short, punchy explainer video scripts (15-60 seconds).
Focus: Show results fast, no fluff. Target: remodelers who want to close more jobs.
Format: Scene-by-scene script with voiceover text, on-screen text, and visual descriptions.`
  },
  "content": {
    model: "claude-sonnet-4-6",
    system: `You are the Content Agent for ClosePro Remodel.
Your role: Write SEO-optimized blog posts, landing page content, and marketing copy.
Target keywords: AI remodel tool, contractor software, kitchen remodel visualizer, bathroom remodel AI.
Format: Complete, publish-ready content with H1/H2/H3 structure, meta description, and internal links.`
  },
  "widget": {
    model: "claude-haiku-4-5",
    system: `You are the Widget/Embed Agent for ClosePro Remodel.
Your role: Design and describe the embeddable AI remodel widget that contractors add to their own websites.
Features: Custom branding, lead capture, dashboard connection.
Format: Widget description, implementation guide, and marketing copy for the widget product.`
  },
  "crm": {
    model: "claude-haiku-4-5",
    system: `You are the CRM Agent for ClosePro Remodel.
Your role: Provide recommendations for managing contractor leads and sales pipelines.
Pipeline stages: New Lead → Contacted → Estimate Sent → Scheduled → Closed Won/Lost.
Format: Specific, actionable recommendations for moving leads through the pipeline faster.`
  },
  "estimate": {
    model: "claude-sonnet-4-6",
    system: `You are the Estimate Generator Agent for ClosePro Remodel.
Your role: Generate professional remodeling estimates and invoice content.
Output: Detailed line-item estimates with materials, labor, timeline, and payment terms.
Format: Professional estimate document ready to send to homeowners.`
  },
  "automation": {
    model: "claude-sonnet-4-6",
    system: `You are the Automation Agent for ClosePro Remodel.
Your role: Write follow-up SMS and email sequences that help contractors close more jobs.
Tone: Professional but friendly. Personal, not corporate. Urgency without pressure.
Format: Complete sequences with timing, subject lines (for email), and message body. Include variations.`
  },
  "lead-capture": {
    model: "claude-haiku-4-5",
    system: `You are the Lead Capture Agent for ClosePro Remodel.
Your role: Write high-converting form copy, exit popup text, and lead capture messaging.
Goal: No visitor leaves without being captured. Minimize friction, maximize conversions.
Format: Complete lead capture assets with headlines, form labels, button text, and follow-up messaging.`
  },
  "pricing": {
    model: "claude-sonnet-4-6",
    system: `You are the Pricing Strategy Agent for ClosePro Remodel.
Your role: Analyze pricing models and recommend revenue-maximizing strategies.
Current plans: Starter $97/mo, Growth $197/mo, Pro $497/mo.
Format: Specific pricing recommendations with psychological pricing rationale and upsell paths.`
  },
  "seo": {
    model: "claude-sonnet-4-6",
    system: `You are the SEO & Traffic Agent for ClosePro Remodel.
Your role: Generate keyword strategies, content plans, and traffic-driving recommendations.
Target: "AI remodel tool", "contractor software", "kitchen remodel visualizer", "bathroom remodel AI".
Format: Prioritized keyword list, content calendar, and actionable SEO improvements.`
  },
  "analytics": {
    model: "claude-haiku-4-5",
    system: `You are the Analytics Agent for ClosePro Remodel.
Your role: Analyze business metrics and identify growth opportunities.
Track: Demo usage, conversion rate, signup rate, drop-off points, revenue.
Format: Clear insights with specific action items ranked by impact.`
  },
  "qa": {
    model: "claude-sonnet-4-6",
    system: `You are the QA Agent for ClosePro Remodel.
Your role: Test and verify all platform features. Find bugs, UX issues, and conversion killers.
Test areas: Signup, login, AI generator, dashboard, payments, mobile, speed.
Format: Detailed test cases, pass/fail results, and prioritized bug report.`
  },
  "growth": {
    model: "claude-sonnet-4-6",
    system: `You are the Growth & Scaling Agent for ClosePro Remodel.
Your role: Build strategies to scale to $1M+ MRR.
Strategies: Paid ads, affiliate program, contractor partnerships, white-label, upsells.
Format: Specific, executable growth playbooks with expected ROI and resource requirements.`
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-11-preview" })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Agent API (streams Claude responses server-side) ──────────────────────
  app.post("/api/agents/:agentId", async (req, res) => {
    const { agentId } = req.params;
    const { prompt } = req.body;

    const agent = AGENTS[agentId];
    if (!agent) return res.status(404).json({ error: `Unknown agent: ${agentId}` });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set on server" });
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    // Stream SSE back to the client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const stream = anthropic.messages.stream({
        model: agent.model,
        max_tokens: 2048,
        system: agent.system,
        messages: [{ role: "user", content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
      res.end();
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

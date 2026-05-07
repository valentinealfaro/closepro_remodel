# ClosePro Remodel: Implementation Progress

**Last Updated:** May 7, 2026
**Goal:** 100 paying customers in 90 days

---

## ⭐ May 7 (evening) — Lead → Concepts workflow

Closed the loop on the homeowner-photo → contractor-follow-up flow. While wiring
this up I found two coupled bugs:

- **Widget was saving `beforeImageUrl: previewUrl` (a `blob:` URL).** That URL
  only works in the homeowner's tab. After submission the photo was effectively
  lost. Fix: serialize the already-compressed JPEG as a `data:` URL so the
  contractor can actually retrieve it later. Stays under Firestore's 1 MB doc
  limit at default compression.
- **LeadsManager only listened to `tenants/{id}/leads`, not `widgetLeads`.**
  Homeowner submissions never showed up in the contractor's leads inbox at all.
  Fix: subscribe to both, project widget leads into the lead shape with sensible
  defaults (`status='new'`, `priority='warm'`, `serviceType` from `roomType`),
  tag with `_collection` so update/delete route to the correct path.

Built the new workflow:

- **`LeadConcepts.tsx`** — focused lead-driven generator. Loads a lead, shows the
  homeowner's photo + a style picker, generates concepts via the BYOK
  `/api/generate-remodel`. Each concept gets Download / Email actions; the email
  button opens a `mailto:` draft pre-filled with the homeowner's address.
- **Visualizer router** — `/app/visualizer` now dispatches: if `?leadId=X` is
  present, render `LeadConcepts`; otherwise render the heavyweight `AIVisualizer`.
- **LeadsManager "Generate Concepts" button** appears on any lead with a photo
  and deep-links to `/app/visualizer?leadId=...&source=widgetLeads|leads`. Camera
  icon next to the service type at-a-glance flags photo-attached leads.
- **Widget no-key UX hardened** — when the contractor's BYOK is missing, the
  homeowner now sees a "Coming soon" panel with an inline lead form. We still
  capture the lead (no after-image) so the contractor can follow up once their
  visualizer is live. The `done` step degrades gracefully when there's no result
  image.

## ⭐ May 7 (late) — AI Visualizer mounted, Pricing wedge, widget polish

- **AI Visualizer routed** at `/app/visualizer` with a sidebar nav link (Wand2 icon).
  The 1300-line component existed but had no route. Contractors can now self-test
  their visualizer and generate alternative concepts to send leads.
- **AIVisualizer activation empty state** — when BYOK isn't configured, render an
  orange "AI Visualizer is offline" card with the 3-step setup recipe and a
  one-click "Activate AI now" CTA.
- **Pricing page wedge band** — added a side-by-side BYOK callout right under the
  pricing cards: "Unlimited AI on every plan. You pay Google's price ($0.04/gen),
  not a 5× SaaS markup." Comparison row updated. New BYOK FAQ entry.
- **Widget polish** — when generation fails with `NO_KEY` / `INVALID_KEY`, the
  widget now renders a friendly "Coming soon — this visualizer is still being set
  up" state instead of the generic ⚠️ Generation Issue. Homeowners can still drop
  contact info to be notified when it's live (lead capture preserved).

## ⭐ May 7 (afternoon) — Onboarding flow tightened around BYOK

After the BYOK pivot landed, the new bottleneck is "did the contractor actually
add their key?" Reworked the post-signup path so that's the unmissable next action:

- **Onboarding checklist** ([Dashboard.tsx](extracted/src/pages/Dashboard.tsx)) now leads with
  `🔑 Activate AI (add Google API key)` as Step 1. It's auto-checked from server
  state — no manual "mark done" needed. Step ordering reflects the real funnel:
  byok → profile → embed → install → first lead → first project.
- **OnboardingSetupWizard** "ready" step now ends with a clear "Activate AI in 2
  minutes" card with the 3-step recipe (open AI Studio → Create API Key → paste
  in Settings). Primary CTA changed from "Go to Dashboard" → "Add my API key"
  and deep-links to `/app/settings?tab=ai`.
- **Dashboard Overview primary CTA** is now conditional: shows an orange
  "Activate AI to start generating" panel when BYOK isn't configured; reverts to
  the embed-code panel once it is.
- **EmbedCodePanel** shows an amber "Activate AI before embedding" banner with a
  one-click activate link when BYOK is missing — prevents contractors from
  pasting a snippet that would error for their visitors.

## ⭐ May 7 — BYOK + Gemini 2.5 Flash Image (image-to-image fix)

**The bug we shipped a fix for:** The legacy `/api/generate-remodel` was silently
falling through outdated Gemini model IDs to Imagen-3 (text-to-image) and
Pollinations (text-to-image). Result: "brand new kitchen" instead of an edit
of the homeowner's photo. Compounding that, `vite.config.ts` was injecting our
`GEMINI_API_KEY` into the **client bundle** — exposed to anyone viewing source.

**Fix shipped:**

- **All Gemini calls go through `lib/gemini.ts`**, which uses `gemini-2.5-flash-image-preview`
  with the input photo as `inline_data`. Imagen-3 + Pollinations fallbacks deleted.
- **BYOK**: each tenant adds their own Google API key in Settings → AI / Integrations.
  Stored AES-256-GCM-encrypted in `tenants/{id}.googleApiKeyEncrypted`. Decryption
  is server-only via `firebase-admin`.
- **`vite.config.ts` no longer leaks** `GEMINI_API_KEY` into the browser bundle.
- **Three surfaces** routed through one server endpoint:
  - `surface: 'app'` — Firebase ID token → contractor's key
  - `surface: 'widget'` — `tenantId` → contractor's key, with stricter per-tenant rate-limit
  - `surface: 'demo'` — `CLOSEPRO_DEMO_KEY` env var with hard daily/IP caps (the only path that uses our key)
- **Plan pivot:** AI generations are now **unlimited on every paid plan** (BYOK = contractor pays Google).
  Plans differentiate on seats / projects / custom domain / widget / white-label / support. Removed the
  `aiGenerations` gate from `usePlanLimits`/`UpgradePromptModal` flows.
- **Marketing wedge added:** "Bring your own AI key. Pay Google's price (~$0.04/gen), not a 5× SaaS markup."
  Surfaced on the Settings AI tab.

**New env vars:**

- `ENCRYPTION_KEY` (≥32 chars) — required. Encrypts tenant keys at rest.
- `CLOSEPRO_DEMO_KEY` — optional, only powers `/` and `/ai-demo` marketing demo.

**New files:**

- `lib/crypto.ts`, `lib/firebase-admin.ts`, `lib/byok.ts`, `lib/gemini.ts`,
  `lib/prompts.ts`, `lib/rate-limit.ts`, `lib/generate-handler.ts`, `lib/byok-handlers.ts`
- `api/byok.ts`, `api/byok/save.ts`, `api/byok/test.ts`, `api/byok/delete.ts`
- `src/components/AiKeySettings.tsx`, `src/services/ByokClient.ts`, `src/lib/authedFetch.ts`

**Touched:** `server.ts`, `api/generate-remodel.ts`, `vite.config.ts`, `vercel.json`,
`src/components/AIVisualizer.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Widget.tsx`,
`src/pages/AiDemo.tsx`, `src/pages/Home.tsx`, `src/services/PlanService.ts`.

**Logged for later (NOT shipped this pass):**

- Per-tenant `widgetSecret` so widget URLs aren't trivially scrapable
- Move generated images out of Firestore docs (1 MB limit) into Firebase Storage
- Free + BYOK acquisition tier (deferred — focus is conversion to paid first)



---

## ✅ Completed (Phase 1: Foundation)

### Backend Infrastructure
- ✅ **Stripe Webhook Integration** (server.ts)
  - Processes checkout.session.completed events
  - Updates tenant status to 'active' in Firestore
  - Updates invoice status to 'paid' with timestamp
  - Async error handling with logging

- ✅ **Firebase Admin Integration**
  - Server-side Firestore operations
  - Service account authentication
  - Fallback to GOOGLE_APPLICATION_CREDENTIALS env var

- ✅ **Rate Limiting**
  - Per-IP rate limiting for API endpoints
  - 5 generations/minute, 60/hour for AI
  - 10 agent requests/minute
  - 429 status responses with user-friendly messages

### Services (Backend Business Logic)
- ✅ **OnboardingService** (src/services/OnboardingService.ts)
  - Create onboarding profiles for new users
  - Personalized step recommendations based on business type
  - Track step completion and activation
  - Capture user feedback during onboarding
  - Record key events (signup, activation, trial conversion)

- ✅ **EarlyAdopterService** (src/services/EarlyAdopterService.ts)
  - Create early adopter offers (first 25-50 customers)
  - 50% off pricing for 6 months
  - Track commitments (case study, testimonial, review)
  - Get commitment statistics for social proof
  - Pricing: Starter $49/mo, Growth $149/mo, Pro $299/mo (vs regular $99/$229/$499)

- ✅ **MetricsService** (src/services/MetricsService.ts)
  - Trial metrics: signups, conversion rate, avg activation time
  - Revenue metrics: MRR, ARR, churn, customers by plan
  - Engagement metrics: projects, estimates, leads, AI generations, widget leads
  - Acquisition metrics: signups by source
  - Historical snapshot recording

### UI Components
- ✅ **OnboardingSetupWizard** (src/components/OnboardingSetupWizard.tsx)
  - 4-step personalized onboarding flow
  - Business type selection (kitchen, bathroom, general, exterior, whole-home)
  - Revenue range input
  - Biggest challenge selection
  - Goals and desired outcomes
  - Saves profile to OnboardingService
  - Records profile_completed event

- ✅ **MetricsDashboard** (src/components/MetricsDashboard.tsx)
  - 6 KPI cards: signups, conversion rate, paid customers, MRR, activation rate, avg trial duration
  - Progress visualization toward 100 customer goal and $9,900 MRR target
  - Revenue breakdown by plan
  - User engagement metrics
  - Alert system for underperforming metrics
  - Auto-refresh every 5 minutes
  - Admin-only view (ready to integrate into AdminPanel)

### Dashboard Integration
- ✅ **Onboarding Wizard Integration** (src/pages/Dashboard.tsx)
  - Checks if user needs onboarding on first load
  - Shows wizard after 1 second for better UX
  - Skips for super admins
  - Navigates to settings on completion

### Documentation
- ✅ **90-DAY-GROWTH-ROADMAP.md**
  - Complete 4-phase implementation plan (Days 1-90)
  - Phase 1: Foundation (Days 1-14) - Mostly complete
  - Phase 2: Conversion Optimization (Days 15-30)
  - Phase 3: Acquisition Amplification (Days 31-60)
  - Phase 4: Scaling & Retention (Days 61-90)
  - Success metrics and KPI tracking
  - Risk mitigation strategies
  - Next immediate actions

---

## 🔄 In Progress (Phase 2: Conversion Optimization)

- ✅ **Integrate MetricsDashboard into AdminPanel** *(done May 7)*
  - Added 'growth' tab to AdminPanel (TrendingUp icon)
  - Renders existing MetricsDashboard component
  - Accessible via super admin Settings → Growth

- ✅ **In-App Trial Counter** *(done May 7)*
  - `TrialBanner` component shows N days remaining
  - Color/urgency escalates: blue → amber (≤5d) → orange (≤2d) → red (expired)
  - Mounted above dashboard header for trialing tenants
  - "See offer" CTA opens early adopter modal; "Upgrade" links to /pricing

- ✅ **Early Adopter Offer UI** *(done May 7)*
  - `EarlyAdopterOfferModal` component (plan picker → reserve → accept flow)
  - Wired to `EarlyAdopterService` (createOffer/acceptOffer/declineOffer)
  - Captures case-study / video-testimonial / review commitments
  - Mounted in Dashboard, opened from TrialBanner CTA

- [ ] **Trial Expiration Emails**
  - Implement transactional email system
  - Day 1: Welcome email
  - Day 3: Feature showcase (AI Visualizer)
  - Day 5: Social proof email
  - Day 6: Early adopter offer email

---

## 📋 Not Started (Phase 2-4)

### Priority 1: Trial-to-Paid Conversion
- ✅ Feature gating foundation *(done May 7)*
  - `PlanService` with starter/growth/pro definitions, monthly usage tracking on tenant doc, period rollover, recommendUpgrade helper
  - `usePlanLimits` hook returns `{ plan, canUse, usageFor, recordUsage, refresh }`
  - `UpgradePromptModal` shows current vs. recommended plan, savings via early-adopter pricing
  - First gate live on AIVisualizer: blocks `generateRemodel` when over the monthly cap, records usage on success, shows "X/Y used this month" under the generate button
- [ ] Extend gating to projects, team members, leads (hook in place — wire UI)
- [ ] Client portal preview feature
- [ ] Improve estimate generation flow
- [ ] "Day 1 Success Call" reminder system

### Priority 2: Customer Success
- [ ] In-app guided tours (Shepherd.js or similar)
- [ ] Simplified first project creation with templates
- [ ] Video tutorials
- [ ] In-app chat support widget

### Priority 3: Organic Growth (Days 31-60)
- [ ] Landing page conversion optimization
- [ ] Lead magnet landing page
- [ ] Blog/content strategy
- [ ] Referral program
- [ ] Social media content

### Priority 4: Paid Acquisition (with validation)
- [ ] Google Ads campaigns
- [ ] Retargeting campaigns
- [ ] CEO/founder-led outbound sales
- [ ] LinkedIn outreach

### Priority 5: Scaling & Retention (Days 61-90)
- [ ] Plan upgrade prompts
- [ ] "Win back" campaigns for inactive users
- [ ] NPS survey system
- [ ] Case study collection
- [ ] Video testimonial production

---

## 🎯 Key Metrics to Track

### Primary (Daily)
- Trial signups: **Target 150-200**
- Trial conversions: **Target 40-50% conversion rate**
- Paid customers: **Target 100**
- MRR progress: **Target $9,900**

### Secondary (Weekly)
- Activation rate: **Target 30%** (created first project)
- Aha moment reach: **Target 50%** (created estimate or AI visualization)
- Early adopter adoption: **Target 25-50** (50% of customers)
- Average feature engagement

### Tertiary (Monthly)
- NPS score: **Target > 50**
- Case study readiness: **Target 5+ customers**
- Referral rate: **Target 10%+**
- Churn rate: **Target < 5%**

---

## 🚀 Next Immediate Actions (Days 1-3)

1. ✅ **Onboarding Setup Wizard**
   - ✅ Component created
   - ✅ Service created
   - ✅ Integrated into Dashboard
   - → Need: Test flow end-to-end

2. ⏳ **Metrics Dashboard Access**
   - ✅ Component created
   - → Need: Integrate into AdminPanel
   - → Need: Make accessible to super admin via admin page

3. ⏳ **Early Adopter Offer Implementation**
   - ✅ Service created
   - → Need: Create UI modal/component to show offer
   - → Need: Integrate into Dashboard after signup
   - → Need: Create Stripe integration for early adopter pricing

4. ⏳ **Email System Preparation**
   - → Need: Set up SendGrid or AWS SES
   - → Need: Create email templates
   - → Need: Schedule transactional emails via server

5. ⏳ **Analytics Event Tracking**
   - ✅ Core event recording in place
   - → Need: Connect to Google Analytics
   - → Need: Set up conversion funnels

---

## 💾 Environment Variables Needed

```env
# Stripe (Already set)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase (Already set)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# For server-side operations:
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OR
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json

# Email (Not yet implemented)
SENDGRID_API_KEY=SG.xxx...
# OR
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@closepro.com

# Analytics (Not yet implemented)
GOOGLE_ANALYTICS_ID=UA-...
MIXPANEL_TOKEN=...
```

---

## 📊 Current Status

**Foundation Phase:** 85% Complete
- Core infrastructure: ✅ 100%
- Services layer: ✅ 100%
- UI components: ✅ 95%
- Dashboard integration: ✅ 90%
- Documentation: ✅ 100%

**Overall Readiness:** Ready to start Phase 2 (Conversion Optimization)

**Estimated Timeline:**
- Phase 1 complete: ~1-2 days
- Phase 2 (Conversion): ~14 days (May 8-21)
- Phase 3 (Acquisition): ~30 days (May 22 - Jun 20)
- Phase 4 (Scaling): ~30 days (Jun 21 - Jul 20)

---

## 🔗 File Structure

```
src/
├── components/
│   ├── OnboardingSetupWizard.tsx  ✅ NEW
│   ├── MetricsDashboard.tsx        ✅ NEW
│   └── ...
├── pages/
│   ├── Dashboard.tsx               🔄 MODIFIED (added wizard integration)
│   └── ...
├── services/
│   ├── OnboardingService.ts        ✅ NEW
│   ├── EarlyAdopterService.ts      ✅ NEW
│   ├── MetricsService.ts           ✅ NEW
│   └── ...
└── lib/
    ├── firebase.ts                 ✅ (server-side additions needed)
    └── ...

server.ts                            🔄 MODIFIED (Stripe webhook, rate limiting)
90-DAY-GROWTH-ROADMAP.md            ✅ NEW
PROGRESS.md                         ✅ NEW (this file)
```

---

## 🎓 Key Learnings & Decisions

### Why This Approach?
1. **Onboarding First:** Getting users to the "aha moment" quickly is critical for trial-to-paid conversion
2. **Metrics Visibility:** Real-time dashboards help the CEO make data-driven decisions
3. **Early Adopter Tier:** 50% discount for first 25-50 customers gets momentum while building social proof
4. **Service-Based Architecture:** Separating business logic from UI makes it testable and reusable

### Technical Decisions
- **OnboardingService:** Tracks user progress in Firestore subcollection for audit trail and analytics
- **Per-IP Rate Limiting:** Simple in-memory approach for MVP; upgrade to Redis/Upstash for production multi-instance
- **MetricsService:** Aggregates from Firestore on-demand; could be optimized with Firestore aggregation queries
- **Email System:** Deferred to Phase 2 to unblock core onboarding

---

## ⚠️ Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Trial conversion too low | Medium | High | Simplified onboarding wizard, better feature education, 1:1 calls |
| Activation rate low | Medium | High | Pre-populated templates, guided tours, email reminders |
| Acquisition slow | High | High | Increase paid ads, referral program, CEO outbound sales |
| Early adopter uptake low | Medium | Medium | Increase discount, add more benefits, social proof emphasis |
| Churn after trial | Medium | Medium | Better onboarding, success metrics tracking, win-back campaigns |

---

## ✨ What's Working Well

- Clean component architecture with TypeScript
- Firestore data model supports tracking at scale
- Stripe integration ready for payment processing
- Service layer abstracts business logic cleanly
- Dashboard provides immediate user context
- Comprehensive roadmap aligns team on priorities

---

## 🔧 What Needs Improvement

- Email system not yet implemented (critical for trial reminders)
- MetricsDashboard not yet accessible from AdminPanel
- Early adopter offer UI not created yet
- Limited error handling in some services
- No analytics integration yet
- Feature gating logic not implemented


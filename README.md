<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ClosePro Remodel

ClosePro Remodel is the AI remodel visualizer for kitchen and bathroom contractors.
Homeowners upload a photo of their actual room, the contractor describes the remodel,
and the AI returns a photorealistic preview that **preserves the real room's layout
and camera angle** — only the finishes change.

## Run Locally

**Prerequisites:** Node.js 20+

```bash
npm install
```

Required environment variables in `.env.local` (or `.env`):

| Var | Required | Purpose |
|---|---|---|
| `ENCRYPTION_KEY` | **yes** | ≥32-char secret for encrypting tenant API keys at rest. Generate with `openssl rand -base64 32`. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | yes (server) | Service-account JSON, single line. Used by `firebase-admin`. Or set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`. |
| `VITE_FIREBASE_*` | yes (client) | Firebase web SDK config. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | optional | Billing flows. |
| `CLOSEPRO_DEMO_KEY` | optional | Server-side Gemini key used **only** by the public marketing demo (`/`, `/ai-demo`). Hard-capped at 200 generations/day globally. |

```bash
npm run dev    # tsx server.ts — Express + Vite middleware on :3000
```

## Bring Your Own Key (BYOK)

ClosePro is the only contractor AI visualizer where **you control your own AI costs**.
Each contractor adds their own Google Cloud API key in **Settings → AI / Integrations**.
Generations are billed directly to your Google account at Google's standard rate
(roughly $0.04 per generation) — no 5× SaaS markup.

**How keys are stored:** AES-256-GCM, salted-scrypt-derived from `ENCRYPTION_KEY`,
written to `tenants/{tenantId}.googleApiKeyEncrypted` in Firestore. Decryption only
happens server-side, only for the duration of a single Gemini call. The decrypted
key is never logged or returned to the browser.

**Image generation pipeline:** All `/api/generate-remodel` calls go through the
shared `lib/gemini.ts` helper, which uses `gemini-2.5-flash-image-preview` for
true image-to-image edits (input photo + prompt → modified photo with the same
layout). The legacy Imagen-3 / Pollinations text-to-image fallbacks were removed —
they were the source of the "brand new kitchen" bug.

**Surfaces:**

- `surface: 'app'` (Dashboard AIVisualizer) — Firebase ID token verifies the user; tenant key is used.
- `surface: 'widget'` (`/widget/:tenantId` embedded on contractor sites) — `tenantId` in body resolves the contractor's key.
- `surface: 'demo'` (`/`, `/ai-demo`) — uses `CLOSEPRO_DEMO_KEY` with hard daily caps.

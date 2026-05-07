// Shared HTTP handler for /api/generate-remodel. Used by both server.ts (Express)
// and api/generate-remodel.ts (Vercel function). Keep all logic here; the two
// thin wrappers just delegate.

import { rateLimit, clientIp } from './rate-limit';
import { generateRemodel, GenerateRemodelResult } from './gemini';
import { getDecryptedKeyForTenant, recordGenerationUsage } from './byok';
import { verifyAuth } from './firebase-admin';
import { getFirestoreAdmin } from './firebase-admin';

interface MinimalReq {
  method?: string;
  headers: Record<string, any>;
  body: any;
  ip?: string;
  socket?: any;
}
interface MinimalRes {
  status(code: number): MinimalRes;
  json(body: any): any;
  setHeader(name: string, value: string): void;
  end(): any;
}

export async function handleGenerateRemodel(req: MinimalReq, res: MinimalRes) {
  // CORS — the embeddable widget loads cross-origin from contractor sites
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = clientIp(req);
  if (!rateLimit(`gen:1m:${ip}`, 5, 60_000) || !rateLimit(`gen:1h:${ip}`, 60, 60 * 60_000)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      code: 'OTHER',
    });
  }

  const body = req.body || {};
  const {
    imageBase64,
    mimeType = 'image/jpeg',
    roomType = 'kitchen',
    style = 'modern',
    budget = 'midrange',
    materials = {},
    mode = 'realistic',
    notes = '',
    tenantId: bodyTenantId,
    surface = 'app', // 'app' | 'widget' | 'demo'
  } = body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required', code: 'OTHER' });
  }

  // Resolve which API key to use:
  //   - 'app':    authenticated dashboard user → look up their tenant key
  //   - 'widget': public widget/iframe → look up the tenantId in the body
  //   - 'demo':   public marketing demo → use server-side CLOSEPRO_DEMO_KEY w/ hard caps
  let apiKey: string | null = null;
  let tenantIdForUsage: string | null = null;

  if (surface === 'demo') {
    if (!rateLimit(`demo:1m:${ip}`, 3, 60_000) || !rateLimit(`demo:1d:${ip}`, 10, 24 * 3600_000)) {
      return res.status(429).json({
        error: 'Demo limit reached for today. Sign up to keep going.',
        code: 'OTHER',
      });
    }
    if (!rateLimit('demo:global:1d', 200, 24 * 3600_000)) {
      return res.status(429).json({
        error: 'The free demo is at capacity for today. Sign up to use your own key.',
        code: 'OTHER',
      });
    }
    apiKey = process.env.CLOSEPRO_DEMO_KEY || '';
    if (!apiKey) {
      return res.status(503).json({
        error: 'Demo is offline right now — please try the dashboard.',
        code: 'OTHER',
      });
    }
  } else if (surface === 'widget') {
    if (!bodyTenantId) {
      return res.status(400).json({ error: 'tenantId is required for widget calls', code: 'OTHER' });
    }
    // Validate tenant exists & is active
    const tenantSnap = await getFirestoreAdmin().doc(`tenants/${bodyTenantId}`).get();
    const tenantData = tenantSnap.data();
    if (!tenantData) {
      return res.status(404).json({ error: 'Unknown contractor.', code: 'OTHER' });
    }
    if (!['trialing', 'active'].includes(tenantData.status)) {
      return res.status(403).json({
        error: 'This contractor\'s subscription is inactive.',
        code: 'OTHER',
      });
    }
    if (!rateLimit(`tenant:${bodyTenantId}:1m`, 5, 60_000) || !rateLimit(`tenant:${bodyTenantId}:1h`, 30, 60 * 60_000)) {
      return res.status(429).json({
        error: 'This widget is rate-limited. Please try again shortly.',
        code: 'OTHER',
      });
    }
    apiKey = await getDecryptedKeyForTenant(bodyTenantId);
    tenantIdForUsage = bodyTenantId;
    if (!apiKey) {
      return res.status(409).json({
        error: 'This contractor hasn\'t activated AI yet.',
        code: 'NO_KEY',
      });
    }
  } else {
    // 'app' — authenticated dashboard user
    let auth;
    try {
      auth = await verifyAuth(req as any);
    } catch (e: any) {
      return res.status(401).json({ error: 'Sign in required.', code: 'OTHER' });
    }
    apiKey = await getDecryptedKeyForTenant(auth.tenantId);
    tenantIdForUsage = auth.tenantId;
    if (!apiKey) {
      return res.status(409).json({
        error: 'Add your Google API key in Settings to start generating.',
        code: 'NO_KEY',
      });
    }
  }

  const result: GenerateRemodelResult = await generateRemodel({
    apiKey,
    inputImageBase64: imageBase64,
    inputImageMimeType: mimeType,
    roomType,
    style,
    budget,
    materials,
    mode,
    notes,
  });

  if (result.ok === false) {
    const status = result.code === 'INVALID_KEY' || result.code === 'NO_KEY' ? 401
      : result.code === 'QUOTA' ? 429
      : result.code === 'IMAGE_TOO_LARGE' ? 413
      : 422;
    return res.status(status).json({ error: result.error, code: result.code });
  }

  // Best-effort usage record (don't fail the response if Firestore is grumpy)
  if (tenantIdForUsage) {
    recordGenerationUsage(tenantIdForUsage).catch(() => {});
  }

  return res.status(200).json({
    success: true,
    imageData: result.outputImageBase64,
    mimeType: result.mimeType,
    model: result.model,
  });
}

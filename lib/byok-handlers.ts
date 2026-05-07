// HTTP handlers for the BYOK CRUD endpoints. All require a Firebase ID token.

import { verifyAuth } from './firebase-admin';
import { saveTenantApiKey, removeTenantApiKey, getByokStatus } from './byok';
import { testApiKey } from './gemini';

interface MinimalReq {
  method?: string;
  headers: Record<string, any>;
  body: any;
}
interface MinimalRes {
  status(code: number): MinimalRes;
  json(body: any): any;
  setHeader(name: string, value: string): void;
  end(): any;
}

function cors(res: MinimalRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export async function handleByokSave(req: MinimalReq, res: MinimalRes) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try { auth = await verifyAuth(req as any); }
  catch { return res.status(401).json({ error: 'Sign in required.' }); }

  const apiKey = (req.body?.apiKey || '').toString();
  if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

  // Verify the key works *before* persisting it. Saves a support ticket later.
  const probe = await testApiKey(apiKey);
  if (probe.ok === false) {
    return res.status(400).json({ error: probe.error, code: probe.code });
  }

  const status = await saveTenantApiKey(auth.tenantId, apiKey);
  return res.status(200).json({ ok: true, status });
}

export async function handleByokTest(req: MinimalReq, res: MinimalRes) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth required — we don't want this to be a free key-validation oracle.
  try { await verifyAuth(req as any); }
  catch { return res.status(401).json({ error: 'Sign in required.' }); }

  const apiKey = (req.body?.apiKey || '').toString();
  if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

  const probe = await testApiKey(apiKey);
  if (probe.ok === false) return res.status(400).json({ error: probe.error, code: probe.code });
  return res.status(200).json({ ok: true });
}

export async function handleByokDelete(req: MinimalReq, res: MinimalRes) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let auth;
  try { auth = await verifyAuth(req as any); }
  catch { return res.status(401).json({ error: 'Sign in required.' }); }

  await removeTenantApiKey(auth.tenantId);
  return res.status(200).json({ ok: true });
}

export async function handleByokStatus(req: MinimalReq, res: MinimalRes) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try { auth = await verifyAuth(req as any); }
  catch { return res.status(401).json({ error: 'Sign in required.' }); }

  const status = await getByokStatus(auth.tenantId);
  return res.status(200).json(status);
}

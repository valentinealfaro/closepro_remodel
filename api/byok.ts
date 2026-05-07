// Vercel serverless function — handles GET (status), POST (save), DELETE (remove)
// for /api/byok. POST /api/byok/save and /api/byok/test live in their own files
// so Vercel maps each predictably.
import { handleByokStatus, handleByokDelete } from '../lib/byok-handlers';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') return handleByokStatus(req, res);
  if (req.method === 'DELETE' || req.method === 'POST') return handleByokDelete(req, res);
  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}

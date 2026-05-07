// Vercel serverless function — thin wrapper around the shared handler.
// Same logic runs in dev via server.ts.
import { handleGenerateRemodel } from '../lib/generate-handler';

export default async function handler(req: any, res: any) {
  return handleGenerateRemodel(req, res);
}

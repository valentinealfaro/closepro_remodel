import { handleByokTest } from '../../lib/byok-handlers';

export default async function handler(req: any, res: any) {
  return handleByokTest(req, res);
}

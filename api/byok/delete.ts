import { handleByokDelete } from '../../lib/byok-handlers';

export default async function handler(req: any, res: any) {
  return handleByokDelete(req, res);
}

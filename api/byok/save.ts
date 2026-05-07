import { handleByokSave } from '../../lib/byok-handlers';

export default async function handler(req: any, res: any) {
  return handleByokSave(req, res);
}

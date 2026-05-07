// Client-side wrapper around the /api/byok/* endpoints. The plaintext API key
// is sent over HTTPS to the server which encrypts it before storing.

import { authedFetch } from '../lib/authedFetch';

export interface ByokStatus {
  configured: boolean;
  last4?: string;
  updatedAt?: number;
}

export const ByokClient = {
  async status(): Promise<ByokStatus> {
    const res = await authedFetch('/api/byok');
    if (!res.ok) return { configured: false };
    return res.json();
  },

  async save(apiKey: string): Promise<ByokStatus> {
    const res = await authedFetch('/api/byok/save', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Could not save key');
    return data.status as ByokStatus;
  },

  async test(apiKey: string): Promise<void> {
    const res = await authedFetch('/api/byok/test', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Test failed');
  },

  async remove(): Promise<void> {
    const res = await authedFetch('/api/byok/delete', { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Could not remove key');
    }
  },
};

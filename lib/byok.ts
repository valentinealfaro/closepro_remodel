// Server-only. Centralizes BYOK persistence + retrieval.
// The encrypted blob lives at tenants/{tenantId}.googleApiKeyEncrypted.
// Never returns the decrypted key to anything but lib/gemini.ts.

import { getFirestoreAdmin } from './firebase-admin';
import { encryptApiKey, decryptApiKey, last4 } from './crypto';

const TENANTS = 'tenants';

export interface ByokStatus {
  configured: boolean;
  last4?: string;
  updatedAt?: number;
}

export async function getByokStatus(tenantId: string): Promise<ByokStatus> {
  if (!tenantId) return { configured: false };
  const snap = await getFirestoreAdmin().doc(`${TENANTS}/${tenantId}`).get();
  const data = snap.data() || {};
  return {
    configured: Boolean(data.googleApiKeyConfigured),
    last4: data.googleApiKeyLast4,
    updatedAt: data.googleApiKeyUpdatedAt?.toMillis?.(),
  };
}

export async function saveTenantApiKey(tenantId: string, plaintext: string): Promise<ByokStatus> {
  if (!tenantId) throw new Error('tenantId is required');
  const trimmed = plaintext.trim();
  if (trimmed.length < 16) throw new Error('That doesn\'t look like a valid Google API key.');

  const encrypted = encryptApiKey(trimmed);
  const tail = last4(trimmed);
  const now = new Date();

  await getFirestoreAdmin().doc(`${TENANTS}/${tenantId}`).set(
    {
      googleApiKeyEncrypted: encrypted,
      googleApiKeyLast4: tail,
      googleApiKeyConfigured: true,
      googleApiKeyUpdatedAt: now,
    },
    { merge: true },
  );

  return { configured: true, last4: tail, updatedAt: now.getTime() };
}

export async function removeTenantApiKey(tenantId: string): Promise<void> {
  if (!tenantId) throw new Error('tenantId is required');
  const FieldValue = (await import('firebase-admin')).default.firestore.FieldValue;
  await getFirestoreAdmin().doc(`${TENANTS}/${tenantId}`).set(
    {
      googleApiKeyEncrypted: FieldValue.delete(),
      googleApiKeyLast4: FieldValue.delete(),
      googleApiKeyConfigured: false,
      googleApiKeyUpdatedAt: new Date(),
    },
    { merge: true },
  );
}

/** Returns the decrypted key for server-side use, or null if not configured. */
export async function getDecryptedKeyForTenant(tenantId: string): Promise<string | null> {
  if (!tenantId) return null;
  const snap = await getFirestoreAdmin().doc(`${TENANTS}/${tenantId}`).get();
  const enc = snap.data()?.googleApiKeyEncrypted as string | undefined;
  if (!enc) return null;
  try {
    return decryptApiKey(enc);
  } catch {
    return null;
  }
}

/** Increment a monthly counter on the tenant doc (for analytics — no longer a hard gate). */
export async function recordGenerationUsage(tenantId: string): Promise<void> {
  if (!tenantId) return;
  const FieldValue = (await import('firebase-admin')).default.firestore.FieldValue;
  const periodKey = (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  })();

  const ref = getFirestoreAdmin().doc(`${TENANTS}/${tenantId}`);
  await getFirestoreAdmin().runTransaction(async tx => {
    const snap = await tx.get(ref);
    const usage = snap.data()?.usage || {};
    if (usage.periodKey !== periodKey) {
      tx.set(
        ref,
        {
          usage: {
            ...usage,
            periodKey,
            aiGenerations: 1,
            updatedAt: new Date(),
          },
        },
        { merge: true },
      );
    } else {
      tx.update(ref, {
        'usage.aiGenerations': FieldValue.increment(1),
        'usage.updatedAt': new Date(),
      });
    }
  });
}

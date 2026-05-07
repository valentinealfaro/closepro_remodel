// Server-only — do NOT import from anything under src/ (the Vite-bundled browser code).
// AES-256-GCM with a key derived from ENCRYPTION_KEY via scrypt.
//
// Layout of the base64 ciphertext: iv (16) | tag (16) | ciphertext (rest)

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_KEY env var must be at least 32 characters');
  }
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptApiKey(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

/** Last 4 chars of the plaintext key — safe to surface in UI. */
export function last4(plaintext: string): string {
  return plaintext.slice(-4);
}

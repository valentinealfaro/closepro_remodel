// Server-only Firebase Admin singleton. Both server.ts and api/*.ts import this.
// Vercel cold-starts a fresh module per function invocation — guard with admin.apps.length.

import admin from 'firebase-admin';

export function getAdmin(): typeof admin {
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    } else {
      // Falls back to GOOGLE_APPLICATION_CREDENTIALS for local dev
      admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
  }
  return admin;
}

export function getFirestoreAdmin(): admin.firestore.Firestore {
  return getAdmin().firestore();
}

export interface VerifiedAuth {
  uid: string;
  email?: string;
  tenantId: string;
}

/**
 * Verify the Authorization: Bearer <id_token> header and resolve the user's tenantId.
 * Throws on missing/invalid token or missing tenant.
 */
export async function verifyAuth(req: { headers: Record<string, any> }): Promise<VerifiedAuth> {
  const header = (req.headers.authorization || req.headers.Authorization || '') as string;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing Authorization header');
  const decoded = await getAdmin().auth().verifyIdToken(match[1]);
  const userSnap = await getFirestoreAdmin().doc(`users/${decoded.uid}`).get();
  const tenantId = userSnap.data()?.tenantId as string | undefined;
  if (!tenantId) throw new Error('User has no tenant');
  return { uid: decoded.uid, email: decoded.email, tenantId };
}

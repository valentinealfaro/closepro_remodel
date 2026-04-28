import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Validate that all required env vars are present at startup.
// If missing, render a visible setup screen instead of a blank white page.
const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED.filter((key) => !import.meta.env[key]);

if (missing.length > 0) {
  // Replace the entire page with a helpful setup guide instead of crashing silently
  document.body.innerHTML = `
    <div style="font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A2540;padding:24px;">
      <div style="background:white;border-radius:16px;padding:40px;max-width:600px;width:100%;box-shadow:0 25px 50px rgba(0,0,0,0.4);">
        <div style="color:#dc2626;font-size:32px;margin-bottom:8px;">⚠️</div>
        <h1 style="color:#0A2540;font-size:22px;font-weight:800;margin:0 0 8px;">Firebase Environment Variables Missing</h1>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
          The app cannot start because the following environment variables are not set in Vercel:
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px;">
          ${missing.map(k => `<code style="display:block;color:#dc2626;font-size:13px;padding:2px 0;">${k}</code>`).join('')}
        </div>
        <h2 style="color:#0A2540;font-size:16px;font-weight:700;margin:0 0 12px;">How to fix:</h2>
        <ol style="color:#374151;font-size:14px;padding-left:20px;line-height:2;margin:0 0 24px;">
          <li>Go to <strong>vercel.com → your project → Settings → Environment Variables</strong></li>
          <li>Add each variable listed above with values from your Firebase Console</li>
          <li>Firebase Console → Project Settings → Your Apps → SDK setup and configuration</li>
          <li>After saving, click <strong>Redeploy</strong> in Vercel</li>
        </ol>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;font-size:13px;color:#0369a1;">
          <strong>Variables needed:</strong><br/>
          VITE_FIREBASE_API_KEY<br/>
          VITE_FIREBASE_AUTH_DOMAIN<br/>
          VITE_FIREBASE_PROJECT_ID<br/>
          VITE_FIREBASE_STORAGE_BUCKET<br/>
          VITE_FIREBASE_MESSAGING_SENDER_ID<br/>
          VITE_FIREBASE_APP_ID<br/>
          VITE_FIREBASE_MEASUREMENT_ID<br/>
          VITE_FIREBASE_FIRESTORE_DB_ID
        </div>
      </div>
    </div>
  `;
  // Stop further JS execution — nothing else can work without Firebase
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || '(default)';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: (auth.currentUser as any)?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log('Firebase connection successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase configuration error: The client is offline.');
    }
  }
}

testConnection();

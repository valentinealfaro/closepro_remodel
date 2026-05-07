// Helpers for calling our authenticated API endpoints from the browser.
// Always attaches the Firebase ID token; never touches the Gemini API key.

import { auth } from './firebase';

export async function getIdToken(): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  return u.getIdToken();
}

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(input, { ...init, headers });
}

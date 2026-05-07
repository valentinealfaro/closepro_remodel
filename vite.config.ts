import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// We deliberately do NOT inject GEMINI_API_KEY into the client bundle. All
// Gemini calls go through /api/generate-remodel on the server, which uses the
// contractor's BYOK key (encrypted in Firestore) or — for the marketing demo
// only — the server-side CLOSEPRO_DEMO_KEY env var.
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
}));

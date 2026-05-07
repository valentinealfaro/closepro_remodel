// Server-only. The single place that calls the Gemini image-to-image endpoint.
//
// Uses gemini-2.5-flash-image-preview (the new image editing model that accepts
// an input image + text prompt and returns a modified version). REST call rather
// than the @google/genai SDK so we have direct, predictable control over the
// response shape and per-call API key (BYOK).

import { buildPrompt, BuildPromptOpts } from './prompts';

export type GenerateErrorCode =
  | 'NO_KEY'
  | 'INVALID_KEY'
  | 'QUOTA'
  | 'IMAGE_TOO_LARGE'
  | 'NO_IMAGE_RETURNED'
  | 'OTHER';

export interface GenerateRemodelInput extends BuildPromptOpts {
  apiKey: string;            // already-decrypted Google API key
  inputImageBase64: string;  // raw base64 (no data: prefix)
  inputImageMimeType: string;
}

export type GenerateRemodelResult =
  | { ok: true; outputImageBase64: string; mimeType: string; model: string }
  | { ok: false; code: GenerateErrorCode; error: string };

const PRIMARY_MODEL = 'gemini-2.5-flash-image-preview';
// If -preview is unavailable in some regions, the GA model id is the same family.
const FALLBACK_MODEL = 'gemini-2.5-flash-image';

// Gemini accepts inline images up to 7 MB binary (~9.3 MB base64). Cap below that.
const MAX_BASE64_LENGTH = 9_000_000;

export async function generateRemodel(opts: GenerateRemodelInput): Promise<GenerateRemodelResult> {
  if (!opts.apiKey) {
    return { ok: false, code: 'NO_KEY', error: 'Google API key not configured.' };
  }
  if (!opts.inputImageBase64) {
    return { ok: false, code: 'OTHER', error: 'Input image is required.' };
  }
  if (opts.inputImageBase64.length > MAX_BASE64_LENGTH) {
    return {
      ok: false,
      code: 'IMAGE_TOO_LARGE',
      error: 'Photo is too large. Try a smaller one (under 6 MB).',
    };
  }

  const prompt = buildPrompt(opts);

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: opts.inputImageMimeType || 'image/jpeg',
              data: opts.inputImageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      temperature: 0.4,
    },
  };

  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err: any) {
      // Network-level failure — try fallback model rather than aborting
      if (model === PRIMARY_MODEL) continue;
      return { ok: false, code: 'OTHER', error: err?.message || 'Network error reaching Gemini.' };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        code: 'INVALID_KEY',
        error: 'Your Google API key is invalid or lacks permission for Gemini. Please update it in Settings.',
      };
    }
    if (response.status === 429) {
      return {
        ok: false,
        code: 'QUOTA',
        error: 'Your Google API quota was exceeded. Increase your quota in Google Cloud Console.',
      };
    }
    if (!response.ok) {
      // 404 / NOT_FOUND on the primary model id → try fallback
      const text = await response.text().catch(() => '');
      if (model === PRIMARY_MODEL && (response.status === 404 || /not found|NOT_FOUND/.test(text))) {
        continue;
      }
      return {
        ok: false,
        code: 'OTHER',
        error: sanitizeError(text) || `Generation failed (${response.status}).`,
      };
    }

    const data: any = await response.json().catch(() => null);
    const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p?.inline_data?.data || p?.inlineData?.data);
    const inline = imagePart?.inline_data || imagePart?.inlineData;

    if (!inline?.data) {
      // Some safety blocks return text-only with a finishReason; surface a helpful message
      const finishReason = data?.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        return {
          ok: false,
          code: 'NO_IMAGE_RETURNED',
          error: `Generation blocked (${finishReason}). Try a different prompt or photo.`,
        };
      }
      if (model === PRIMARY_MODEL) continue;
      return {
        ok: false,
        code: 'NO_IMAGE_RETURNED',
        error: 'No image was returned. Try a different prompt or photo.',
      };
    }

    return {
      ok: true,
      outputImageBase64: inline.data,
      mimeType: inline.mime_type || inline.mimeType || 'image/png',
      model,
    };
  }

  return {
    ok: false,
    code: 'OTHER',
    error: 'No Gemini image model available right now. Please try again later.',
  };
}

/** Trim Gemini's verbose JSON error blobs to a single human-readable line. */
function sanitizeError(raw: string): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return (parsed?.error?.message || parsed?.message || raw).slice(0, 280);
  } catch {
    return raw.slice(0, 280);
  }
}

/**
 * Tiny "is the key valid for Gemini?" probe. Used by the Settings → Test connection button.
 * We do a *text-only* generateContent request — cheap, doesn't burn image quota.
 */
export async function testApiKey(apiKey: string): Promise<{ ok: true } | { ok: false; code: GenerateErrorCode; error: string }> {
  if (!apiKey) return { ok: false, code: 'NO_KEY', error: 'API key is required.' };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with the single word "ok".' }] }],
      generationConfig: { temperature: 0 },
    }),
  }).catch(err => {
    throw new Error(err?.message || 'Network error');
  });

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      code: 'INVALID_KEY',
      error: 'Your Google API key was rejected. Make sure billing is enabled and the Gemini API is allowed.',
    };
  }
  if (response.status === 429) {
    return { ok: false, code: 'QUOTA', error: 'Quota exceeded — but the key itself is valid.' };
  }
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return { ok: false, code: 'OTHER', error: sanitizeError(text) || `Test failed (${response.status}).` };
  }
  return { ok: true };
}

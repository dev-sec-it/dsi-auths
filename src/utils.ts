/**
 * Utility functions for dsi-auth
 */

export class DsiAuthError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'DsiAuthError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Normalizes base URL, stripping trailing slashes
 */
export function normalizeBaseUrl(url?: string): string {
  const base = url || 'https://accounts.devsecit.com';
  return base.replace(/\/+$/, '');
}

/**
 * Generates a random crypto string for state or verifier
 */
export function generateRandomString(length: number = 43): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  // Fallback for older environments
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Creates SHA-256 base64url string for PKCE code_challenge
 */
export async function sha256Base64Url(plain: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hash);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Node.js crypto module fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    return nodeCrypto
      .createHash('sha256')
      .update(plain)
      .digest('base64url');
  } catch {
    throw new DsiAuthError('Crypto API is unavailable to compute PKCE challenge.');
  }
}

/**
 * Creates a PKCE code_verifier and code_challenge pair
 */
export async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  return { codeVerifier, codeChallenge };
}


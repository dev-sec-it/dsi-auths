/**
 * DEV SEC IT SSO - Client / Browser SDK
 * Suitable for React, Vue, Svelte, Next.js client components, Vanilla JS SPAs
 */

import {
  DsiAuthConfig,
  DsiAuthorizationUrlOptions,
  DsiPopupOptions,
  DsiPopupResult,
} from './types';
import {
  DsiAuthError,
  normalizeBaseUrl,
  generateRandomString,
  createPkcePair,
} from './utils';

export class DsiClient {
  private clientId: string;
  private redirectUri?: string;
  private baseUrl: string;
  private defaultScope: string;

  constructor(config: DsiAuthConfig) {
    if (!config.clientId) {
      throw new DsiAuthError('clientId is required to initialize DsiClient.');
    }
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.defaultScope = config.scope || 'read_profile email phone';
  }

  /**
   * Generates authorization URL for client-side login
   */
  public getAuthorizationUrl(options: DsiAuthorizationUrlOptions = {}): string {
    const redirect = options.redirectUri || this.redirectUri;
    if (!redirect) {
      throw new DsiAuthError('redirectUri must be provided.');
    }

    const url = new URL(`${this.baseUrl}/oauth/authorize`);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', redirect);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', options.scope || this.defaultScope);

    if (options.state) {
      url.searchParams.set('state', options.state);
    }
    if (options.codeChallenge) {
      url.searchParams.set('code_challenge', options.codeChallenge);
      url.searchParams.set('code_challenge_method', options.codeChallengeMethod || 'S256');
    }

    return url.toString();
  }

  /**
   * Redirects the current browser window to the DEV SEC IT login screen
   */
  public loginWithRedirect(options: DsiAuthorizationUrlOptions = {}): void {
    if (typeof window === 'undefined') {
      throw new DsiAuthError('loginWithRedirect can only be executed in a browser environment.');
    }
    const state = options.state || generateRandomString(32);
    const url = this.getAuthorizationUrl({ ...options, state });
    window.location.href = url;
  }

  /**
   * Opens DEV SEC IT SSO in a centered popup window and returns the authorization code
   */
  public async loginWithPopup(options: DsiPopupOptions = {}): Promise<DsiPopupResult> {
    if (typeof window === 'undefined') {
      throw new DsiAuthError('loginWithPopup can only be executed in a browser environment.');
    }

    const width = options.width || 520;
    const height = options.height || 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const state = options.state || generateRandomString(32);

    const authUrl = this.getAuthorizationUrl({
      state,
      scope: options.scope,
    });

    const popup = window.open(
      authUrl,
      'dsi_auth_popup',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,status=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      throw new DsiAuthError('Popup window was blocked by the browser. Please allow popups.');
    }

    return new Promise((resolve, reject) => {
      let resolved = false;

      const handleMessage = (event: MessageEvent) => {
        // Only accept DSI messages
        if (event.data && event.data.type === 'DSI_AUTH_SUCCESS') {
          cleanup();
          resolved = true;
          resolve({
            code: event.data.code,
            state: event.data.state,
          });
        } else if (event.data && event.data.type === 'DSI_AUTH_ERROR') {
          cleanup();
          resolved = true;
          reject(new DsiAuthError(event.data.error_description || event.data.error || 'Authentication failed.'));
        }
      };

      const pollTimer = window.setInterval(() => {
        if (!popup || popup.closed) {
          cleanup();
          if (!resolved) {
            reject(new DsiAuthError('Sign in popup was closed before completing authorization.'));
          }
        }
      }, 500);

      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        window.clearInterval(pollTimer);
        if (popup && !popup.closed) {
          try {
            popup.close();
          } catch {
            // ignore
          }
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  /**
   * Helper for the redirect callback page when used in popup mode.
   * Put this on your callback route to notify the parent window and automatically close.
   */
  public static handlePopupCallback(targetOrigin: string = '*'): boolean {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (window.opener) {
      if (code) {
        window.opener.postMessage(
          { type: 'DSI_AUTH_SUCCESS', code, state },
          targetOrigin
        );
        window.close();
        return true;
      } else if (error) {
        window.opener.postMessage(
          { type: 'DSI_AUTH_ERROR', error, error_description: errorDescription },
          targetOrigin
        );
        window.close();
        return true;
      }
    }
    return false;
  }

  /**
   * Extracts query parameters from callback URL
   */
  public static parseCallbackUrl(url?: string): {
    code?: string;
    state?: string;
    error?: string;
    errorDescription?: string;
  } {
    const search = url
      ? new URL(url).search
      : typeof window !== 'undefined'
      ? window.location.search
      : '';
    const params = new URLSearchParams(search);

    return {
      code: params.get('code') || undefined,
      state: params.get('state') || undefined,
      error: params.get('error') || undefined,
      errorDescription: params.get('error_description') || undefined,
    };
  }

  /**
   * Creates a PKCE code challenge & verifier pair in the browser
   */
  public async createPkce(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    return createPkcePair();
  }
}


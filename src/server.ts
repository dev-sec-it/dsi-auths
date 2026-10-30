/**
 * DEV SEC IT SSO - Server-side SDK
 * Suitable for Node.js, Next.js API Routes, Express, NestJS, Remix, etc.
 */

import {
  DsiAuthConfig,
  DsiAuthorizationUrlOptions,
  DsiTokenResponse,
  DsiUser,
  DsiAuthResult,
} from './types';
import {
  DsiAuthError,
  normalizeBaseUrl,
  createPkcePair,
} from './utils';

export class DsiAuth {
  private clientId: string;
  private clientSecret?: string;
  private redirectUri?: string;
  private baseUrl: string;
  private defaultScope: string;

  constructor(config: DsiAuthConfig) {
    if (!config.clientId) {
      throw new DsiAuthError('clientId is required to initialize DsiAuth.');
    }
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.defaultScope = config.scope || 'read_profile email phone';
  }

  /**
   * Generates the DEV SEC IT SSO Authorization URL
   */
  public getAuthorizationUrl(options: DsiAuthorizationUrlOptions = {}): string {
    const redirect = options.redirectUri || this.redirectUri;
    if (!redirect) {
      throw new DsiAuthError('redirectUri must be provided either in config or in getAuthorizationUrl options.');
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
   * Exchange authorization code for access and refresh tokens
   */
  public async exchangeCode(
    code: string,
    redirectUri?: string,
    codeVerifier?: string
  ): Promise<DsiTokenResponse> {
    if (!code) {
      throw new DsiAuthError('Authorization code is required.');
    }
    if (!this.clientSecret) {
      throw new DsiAuthError('clientSecret is required to exchange authorization code for tokens.');
    }

    const targetRedirect = redirectUri || this.redirectUri;
    if (!targetRedirect) {
      throw new DsiAuthError('redirectUri is required to exchange code for tokens.');
    }

    const tokenUrl = `${this.baseUrl}/api/oauth/token`;
    const payload: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: targetRedirect,
    };

    if (codeVerifier) {
      payload.code_verifier = codeVerifier;
    }

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new DsiAuthError(
        data.error_description || data.error || 'Failed to exchange authorization code.',
        data.error,
        res.status
      );
    }

    return data as DsiTokenResponse;
  }

  /**
   * Fetches the user profile from DEV SEC IT UserInfo endpoint using an access token
   */
  public async getUserInfo(accessToken: string): Promise<DsiUser> {
    if (!accessToken) {
      throw new DsiAuthError('accessToken is required to fetch user info.');
    }

    const userinfoUrl = `${this.baseUrl}/api/oauth/userinfo`;
    const res = await fetch(userinfoUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new DsiAuthError(
        data.error_description || data.error || 'Failed to fetch user profile.',
        data.error,
        res.status
      );
    }

    const user: DsiUser = {
      sub: String(data.sub || data.id || ''),
      id: String(data.sub || data.id || ''),
      name: data.name || '',
      email: data.email,
      email_verified: data.email_verified,
      phone: data.phone,
      phone_verified: data.phone_verified,
      picture: data.picture,
      role: data.role || 'user',
    };

    return user;
  }

  /**
   * Complete all-in-one helper: exchanges code and retrieves user profile in one call
   */
  public async authenticate(
    code: string,
    redirectUri?: string,
    codeVerifier?: string
  ): Promise<DsiAuthResult> {
    const tokens = await this.exchangeCode(code, redirectUri, codeVerifier);
    const user = await this.getUserInfo(tokens.access_token);
    return { tokens, user };
  }

  /**
   * Generate PKCE code verifier and code challenge pair
   */
  public async createPkce(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    return createPkcePair();
  }
}


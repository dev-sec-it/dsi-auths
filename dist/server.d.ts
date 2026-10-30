/**
 * DEV SEC IT SSO - Server-side SDK
 * Suitable for Node.js, Next.js API Routes, Express, NestJS, Remix, etc.
 */
import { DsiAuthConfig, DsiAuthorizationUrlOptions, DsiTokenResponse, DsiUser, DsiAuthResult } from './types';
export declare class DsiAuth {
    private clientId;
    private clientSecret?;
    private redirectUri?;
    private baseUrl;
    private defaultScope;
    constructor(config: DsiAuthConfig);
    /**
     * Generates the DEV SEC IT SSO Authorization URL
     */
    getAuthorizationUrl(options?: DsiAuthorizationUrlOptions): string;
    /**
     * Exchange authorization code for access and refresh tokens
     */
    exchangeCode(code: string, redirectUri?: string, codeVerifier?: string): Promise<DsiTokenResponse>;
    /**
     * Fetches the user profile from DEV SEC IT UserInfo endpoint using an access token
     */
    getUserInfo(accessToken: string): Promise<DsiUser>;
    /**
     * Complete all-in-one helper: exchanges code and retrieves user profile in one call
     */
    authenticate(code: string, redirectUri?: string, codeVerifier?: string): Promise<DsiAuthResult>;
    /**
     * Generate PKCE code verifier and code challenge pair
     */
    createPkce(): Promise<{
        codeVerifier: string;
        codeChallenge: string;
    }>;
}

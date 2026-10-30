/**
 * DEV SEC IT SSO - Client / Browser SDK
 * Suitable for React, Vue, Svelte, Next.js client components, Vanilla JS SPAs
 */
import { DsiAuthConfig, DsiAuthorizationUrlOptions, DsiPopupOptions, DsiPopupResult } from './types';
export declare class DsiClient {
    private clientId;
    private redirectUri?;
    private baseUrl;
    private defaultScope;
    constructor(config: DsiAuthConfig);
    /**
     * Generates authorization URL for client-side login
     */
    getAuthorizationUrl(options?: DsiAuthorizationUrlOptions): string;
    /**
     * Redirects the current browser window to the DEV SEC IT login screen
     */
    loginWithRedirect(options?: DsiAuthorizationUrlOptions): void;
    /**
     * Opens DEV SEC IT SSO in a centered popup window and returns the authorization code
     */
    loginWithPopup(options?: DsiPopupOptions): Promise<DsiPopupResult>;
    /**
     * Helper for the redirect callback page when used in popup mode.
     * Put this on your callback route to notify the parent window and automatically close.
     */
    static handlePopupCallback(targetOrigin?: string): boolean;
    /**
     * Extracts query parameters from callback URL
     */
    static parseCallbackUrl(url?: string): {
        code?: string;
        state?: string;
        error?: string;
        errorDescription?: string;
    };
    /**
     * Creates a PKCE code challenge & verifier pair in the browser
     */
    createPkce(): Promise<{
        codeVerifier: string;
        codeChallenge: string;
    }>;
}

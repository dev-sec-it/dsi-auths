/**
 * Utility functions for dsi-auth
 */
export declare class DsiAuthError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, code?: string, status?: number);
}
/**
 * Normalizes base URL, stripping trailing slashes
 */
export declare function normalizeBaseUrl(url?: string): string;
/**
 * Generates a random crypto string for state or verifier
 */
export declare function generateRandomString(length?: number): string;
/**
 * Creates SHA-256 base64url string for PKCE code_challenge
 */
export declare function sha256Base64Url(plain: string): Promise<string>;
/**
 * Creates a PKCE code_verifier and code_challenge pair
 */
export declare function createPkcePair(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
}>;

/**
 * DEV SEC IT SSO Authentication SDK Types
 * https://accounts.devsecit.com
 */
export interface DsiAuthConfig {
    /**
     * OAuth Client ID registered at DEV SEC IT Account Portal
     * https://accounts.devsecit.com/developers/apps
     */
    clientId: string;
    /**
     * OAuth Client Secret (Required for server-side token exchange)
     */
    clientSecret?: string;
    /**
     * Default Callback/Redirect URI registered in your app console
     */
    redirectUri?: string;
    /**
     * Accounts Server Base URL (Defaults to https://accounts.devsecit.com)
     */
    baseUrl?: string;
    /**
     * Default OAuth scopes (Defaults to "read_profile email phone")
     */
    scope?: string;
}
export interface DsiAuthorizationUrlOptions {
    /**
     * Specific redirect URI for this authorization request (Overrides default redirectUri)
     */
    redirectUri?: string;
    /**
     * Space-delimited scopes: "read_profile", "email", "phone"
     */
    scope?: string;
    /**
     * Optional CSRF protection state parameter
     */
    state?: string;
    /**
     * Optional PKCE code_challenge
     */
    codeChallenge?: string;
    /**
     * Optional PKCE code_challenge_method ('S256')
     */
    codeChallengeMethod?: 'S256';
}
export interface DsiTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    error?: string;
    error_description?: string;
}
export interface DsiUser {
    /**
     * DEV SEC IT Subject / Unique User ID
     */
    sub: string;
    /**
     * Convenience alias for sub
     */
    id: string;
    /**
     * Full name of user
     */
    name: string;
    /**
     * Verified email address
     */
    email?: string;
    /**
     * Whether email is verified
     */
    email_verified?: boolean;
    /**
     * User contact phone number
     */
    phone?: string | null;
    /**
     * Whether phone is verified
     */
    phone_verified?: boolean;
    /**
     * Profile picture / avatar URL
     */
    picture?: string;
    /**
     * Role (user, admin, developer, etc.)
     */
    role?: string;
}
export interface DsiAuthResult {
    tokens: DsiTokenResponse;
    user: DsiUser;
}
export interface DsiPopupOptions {
    width?: number;
    height?: number;
    state?: string;
    scope?: string;
}
export interface DsiPopupResult {
    code: string;
    state?: string;
}

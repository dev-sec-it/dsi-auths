import React from 'react';
import { DsiClient } from './client';
import { DsiAuthConfig, DsiPopupResult } from './types';
export interface DsiAuthContextType {
    client: DsiClient;
    loginWithPopup: (options?: {
        scope?: string;
        state?: string;
    }) => Promise<DsiPopupResult>;
    loginWithRedirect: (options?: {
        scope?: string;
        state?: string;
    }) => void;
    isLoading: boolean;
}
export interface DsiAuthProviderProps {
    config: DsiAuthConfig;
    children: React.ReactNode;
}
export declare function DsiAuthProvider({ config, children }: DsiAuthProviderProps): React.JSX.Element;
export declare function useDsiAuth(): DsiAuthContextType;
export interface DsiSignInButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError'> {
    clientId?: string;
    redirectUri?: string;
    baseUrl?: string;
    scope?: string;
    mode?: 'popup' | 'redirect';
    theme?: 'dark' | 'light' | 'outline';
    text?: string;
    onSuccess?: (result: DsiPopupResult) => void;
    onError?: (error: Error) => void;
}
export declare function DsiSignInButton({ clientId, redirectUri, baseUrl, scope, mode, theme, text, onSuccess, onError, className, disabled, ...props }: DsiSignInButtonProps): React.JSX.Element;

import React, { createContext, useContext, useState, useMemo } from 'react';
import { DsiClient } from './client';
import { DsiAuthConfig, DsiPopupResult } from './types';

export interface DsiAuthContextType {
  client: DsiClient;
  loginWithPopup: (options?: { scope?: string; state?: string }) => Promise<DsiPopupResult>;
  loginWithRedirect: (options?: { scope?: string; state?: string }) => void;
  isLoading: boolean;
}

const DsiAuthContext = createContext<DsiAuthContextType | null>(null);

export interface DsiAuthProviderProps {
  config: DsiAuthConfig;
  children: React.ReactNode;
}

export function DsiAuthProvider({ config, children }: DsiAuthProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const client = useMemo(() => new DsiClient(config), [config.clientId, config.redirectUri, config.baseUrl]);

  const loginWithPopup = async (options?: { scope?: string; state?: string }) => {
    setIsLoading(true);
    try {
      const res = await client.loginWithPopup(options);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithRedirect = (options?: { scope?: string; state?: string }) => {
    client.loginWithRedirect(options);
  };

  return (
    <DsiAuthContext.Provider value={{ client, loginWithPopup, loginWithRedirect, isLoading }}>
      {children}
    </DsiAuthContext.Provider>
  );
}

export function useDsiAuth(): DsiAuthContextType {
  const ctx = useContext(DsiAuthContext);
  if (!ctx) {
    throw new Error('useDsiAuth must be used within a <DsiAuthProvider>');
  }
  return ctx;
}

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

export function DsiSignInButton({
  clientId,
  redirectUri,
  baseUrl,
  scope,
  mode = 'popup',
  theme = 'light',
  text = 'Sign in with DEV SEC IT',
  onSuccess,
  onError,
  className = '',
  disabled,
  ...props
}: DsiSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  // If inside DsiAuthProvider, use context; otherwise instantiate a client on the fly
  const ctx = useContext(DsiAuthContext);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) props.onClick(e);
    if (loading || disabled) return;

    try {
      setLoading(true);
      const activeClient = ctx ? ctx.client : new DsiClient({
        clientId: clientId || '',
        redirectUri,
        baseUrl,
        scope,
      });

      if (mode === 'redirect') {
        activeClient.loginWithRedirect({ scope });
      } else {
        const result = await activeClient.loginWithPopup({ scope });
        if (onSuccess) onSuccess(result);
      }
    } catch (err: any) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px 18px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    outline: 'none',
    opacity: loading || disabled ? 0.7 : 1,
    boxShadow: theme === 'outline' ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
  };

  const themeStyles: Record<string, React.CSSProperties> = {
    light: {
      backgroundColor: '#ffffff',
      color: '#1f2937',
      border: '1px solid #e5e7eb',
    },
    dark: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      border: '1px solid #1e293b',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#1a73e8',
      border: '1.5px solid #1a73e8',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.light;

  return (
    <button
      type="button"
      style={{ ...baseStyles, ...currentTheme }}
      className={`dsi-signin-btn ${className}`}
      onClick={handleClick}
      disabled={loading || disabled}
      {...props}
    >
      {/* DEV SEC IT Shield Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
          fill="#1a73e8"
        />
        <path
          d="M10.5 15.5L7 12L8.41 10.59L10.5 12.67L15.59 7.58L17 9L10.5 15.5Z"
          fill="#ffffff"
        />
      </svg>
      <span>{loading ? 'Connecting...' : text}</span>
    </button>
  );
}

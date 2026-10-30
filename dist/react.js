"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DsiAuthProvider = DsiAuthProvider;
exports.useDsiAuth = useDsiAuth;
exports.DsiSignInButton = DsiSignInButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("./client");
const DsiAuthContext = (0, react_1.createContext)(null);
function DsiAuthProvider({ config, children }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const client = (0, react_1.useMemo)(() => new client_1.DsiClient(config), [config.clientId, config.redirectUri, config.baseUrl]);
    const loginWithPopup = async (options) => {
        setIsLoading(true);
        try {
            const res = await client.loginWithPopup(options);
            return res;
        }
        finally {
            setIsLoading(false);
        }
    };
    const loginWithRedirect = (options) => {
        client.loginWithRedirect(options);
    };
    return ((0, jsx_runtime_1.jsx)(DsiAuthContext.Provider, { value: { client, loginWithPopup, loginWithRedirect, isLoading }, children: children }));
}
function useDsiAuth() {
    const ctx = (0, react_1.useContext)(DsiAuthContext);
    if (!ctx) {
        throw new Error('useDsiAuth must be used within a <DsiAuthProvider>');
    }
    return ctx;
}
function DsiSignInButton({ clientId, redirectUri, baseUrl, scope, mode = 'popup', theme = 'light', text = 'Sign in with DEV SEC IT', onSuccess, onError, className = '', disabled, ...props }) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    // If inside DsiAuthProvider, use context; otherwise instantiate a client on the fly
    const ctx = (0, react_1.useContext)(DsiAuthContext);
    const handleClick = async (e) => {
        if (props.onClick)
            props.onClick(e);
        if (loading || disabled)
            return;
        try {
            setLoading(true);
            const activeClient = ctx ? ctx.client : new client_1.DsiClient({
                clientId: clientId || '',
                redirectUri,
                baseUrl,
                scope,
            });
            if (mode === 'redirect') {
                activeClient.loginWithRedirect({ scope });
            }
            else {
                const result = await activeClient.loginWithPopup({ scope });
                if (onSuccess)
                    onSuccess(result);
            }
        }
        catch (err) {
            if (onError)
                onError(err);
        }
        finally {
            setLoading(false);
        }
    };
    const baseStyles = {
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
    const themeStyles = {
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
    return ((0, jsx_runtime_1.jsxs)("button", { type: "button", style: { ...baseStyles, ...currentTheme }, className: `dsi-signin-btn ${className}`, onClick: handleClick, disabled: loading || disabled, ...props, children: [(0, jsx_runtime_1.jsxs)("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: { flexShrink: 0 }, children: [(0, jsx_runtime_1.jsx)("path", { d: "M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z", fill: "#1a73e8" }), (0, jsx_runtime_1.jsx)("path", { d: "M10.5 15.5L7 12L8.41 10.59L10.5 12.67L15.59 7.58L17 9L10.5 15.5Z", fill: "#ffffff" })] }), (0, jsx_runtime_1.jsx)("span", { children: loading ? 'Connecting...' : text })] }));
}

# DEV SEC IT SSO (`dsi-auth`) Mandatory Rules for Gemini & AI Models

## 1. Core Mandate
- **All DEV SEC IT Single Sign-On (SSO) and OAuth 2.0 implementations MUST use `dsi-auth`.**
- Do NOT hardcode ad-hoc manual OAuth endpoints or unapproved custom auth handshakes.
- Route all authorization code exchanges and user profile lookups through the `dsi-auth` SDK methods.

## 2. Server Authority & Standards
- **Authority Base URL:** `https://accounts.devsecit.com`
- **Authorize Endpoint:** `/oauth/authorize`
- **Token Endpoint:** `POST /api/oauth/token` (`grant_type: authorization_code`)
- **UserInfo Endpoint:** `GET /api/oauth/userinfo` (`Authorization: Bearer <TOKEN>`)

## 3. Allowed Methods & Code Standards

### Server-Side Initialization (`DsiAuth`)
```typescript
import { DsiAuth } from 'dsi-auth/server';

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID!,
  clientSecret: process.env.DSI_CLIENT_SECRET!,
  redirectUri: process.env.DSI_REDIRECT_URI!,
  baseUrl: process.env.DSI_BASE_URL || 'https://accounts.devsecit.com',
  scope: 'read_profile email phone', // default
});
```

### Server Token & User Exchange
```typescript
// Single-call exchange & profile fetch:
const { tokens, user } = await dsi.authenticate(code);

// Or separately:
const tokenData = await dsi.exchangeCode(code);
const userProfile = await dsi.getUserInfo(tokenData.access_token);
```

### Client-Side Initialization (`DsiClient`)
```typescript
import { DsiClient } from 'dsi-auth/client';

const client = new DsiClient({
  clientId: process.env.NEXT_PUBLIC_DSI_CLIENT_ID!,
  redirectUri: 'https://yourapp.com/auth/callback',
});

// Trigger login:
const { code, state } = await client.loginWithPopup();
// Or:
client.loginWithRedirect();
```

### React Sign-In Button Component
```tsx
import { DsiSignInButton } from 'dsi-auth/react';

<DsiSignInButton
  clientId={process.env.NEXT_PUBLIC_DSI_CLIENT_ID}
  redirectUri="https://yourapp.com/auth/callback"
  mode="popup" // 'popup' | 'redirect'
  theme="light" // 'light' | 'dark' | 'outline'
  onSuccess={({ code }) => handleAuth(code)}
/>
```

## 4. User Profile Contract (`DsiUser`)
All successful authentication responses resolve to:
```typescript
interface DsiUser {
  sub: string;             // User ID (string)
  id: string;              // Alias for sub
  name: string;            // Full Name
  email?: string;          // Verified email
  email_verified?: boolean;
  phone?: string | null;   // Contact phone
  phone_verified?: boolean;
  picture?: string;        // Avatar URL
  role?: string;           // 'user' | 'admin' | 'developer'
}
```

## 5. Security & Secret Safeguards
- `clientSecret` MUST stay on server environments. Never prefix with `NEXT_PUBLIC_`, `VITE_`, or expose to browser.
- Validate `redirect_uri` matches the domain registered in the DEV SEC IT Developer Console (`/developers/apps`).
- When using `mode="popup"`, always call `DsiClient.handlePopupCallback()` on the callback route.


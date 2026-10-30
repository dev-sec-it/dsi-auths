# dsi-auth

Official Single Sign-On (SSO) and OAuth 2.0 SDK for **DEV SEC IT Accounts** ([https://accounts.devsecit.com](https://accounts.devsecit.com)).

Easily add DEV SEC IT authentication to any project: **React**, **Next.js**, **Node.js / Express**, **Vue**, or **Vanilla JavaScript**.

---

## 📦 Installation

```bash
npm install dsi-auth
```
*(Or install locally from the package directory: `npm install /path/to/devsecit/auth/package`)*

---

## 🚀 Quick Start

### 1. React / Next.js (Client Component)

#### A. One-Click Sign In Button (Popup Mode)
```tsx
import React from 'react';
import { DsiSignInButton } from 'dsi-auth/react';

export default function LoginPage() {
  const handleSuccess = async ({ code, state }) => {
    // Send code to your backend to exchange for tokens / session
    const res = await fetch('/api/auth/dsi/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    console.log('Logged in user:', data.user);
  };

  return (
    <DsiSignInButton
      clientId="your_client_id"
      redirectUri="https://yourapp.com/auth/callback"
      mode="popup"
      theme="light" // 'light' | 'dark' | 'outline'
      onSuccess={handleSuccess}
      onError={(err) => console.error(err)}
    />
  );
}
```

#### B. Handle Popup Callback Page (`/auth/callback`)
On the page configured as your `redirectUri`, add this one-liner to close the popup and pass the code to the parent window:

```tsx
// app/auth/callback/page.tsx or pages/auth/callback.tsx
'use client';
import { useEffect } from 'react';
import { DsiClient } from 'dsi-auth/client';

export default function CallbackPage() {
  useEffect(() => {
    DsiClient.handlePopupCallback();
  }, []);

  return <p>Signing in with DEV SEC IT...</p>;
}
```

---

### 2. Next.js App Router (Server Route)

```ts
// app/api/auth/dsi/callback/route.ts
import { NextResponse } from 'next/server';
import { DsiAuth } from 'dsi-auth/server';

const dsiAuth = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID!,
  clientSecret: process.env.DSI_CLIENT_SECRET!,
  redirectUri: process.env.DSI_REDIRECT_URI!, // e.g. https://yourapp.com/auth/callback
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // Exchanges code and gets user profile in one call
    const { tokens, user } = await dsiAuth.authenticate(code);

    // Set your session cookie or JWT
    return NextResponse.json({
      success: true,
      user,
      accessToken: tokens.access_token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

---

### 3. Node.js / Express

```javascript
const express = require('express');
const { DsiAuth } = require('dsi-auth/server');

const app = express();
app.use(express.json());

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID,
  clientSecret: process.env.DSI_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/callback',
});

// Step 1: Redirect user to DEV SEC IT SSO
app.get('/login', (req, res) => {
  const authUrl = dsi.getAuthorizationUrl({
    scope: 'read_profile email phone',
    state: 'csrf_token_here',
  });
  res.redirect(authUrl);
});

// Step 2: Handle redirect callback
app.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens, user } = await dsi.authenticate(code);

    // User is authenticated!
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    res.status(400).send('Authentication failed: ' + err.message);
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));
```

---

### 4. Vanilla JavaScript / SPA (Popup or Redirect)

```javascript
import { DsiClient } from 'dsi-auth/client';

const client = new DsiClient({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'https://yourapp.com/callback',
});

// A. Login using Popup
document.getElementById('login-btn').addEventListener('click', async () => {
  try {
    const { code, state } = await client.loginWithPopup();
    console.log('Received auth code:', code);
    // Send code to backend to complete login
  } catch (err) {
    console.error('Sign-in failed:', err.message);
  }
});

// B. Or Login using standard full-page redirect
// client.loginWithRedirect();
```

---

## 🔑 User Object Structure (`DsiUser`)

When `getUserInfo()` or `authenticate()` succeeds, it returns the verified user profile:

```json
{
  "sub": "1004",
  "id": "1004",
  "name": "Kanai Shil",
  "email": "kanai@devsecit.com",
  "email_verified": true,
  "phone": "+8801700000000",
  "phone_verified": true,
  "picture": "https://accounts.devsecit.com/uploads/avatars/...",
  "role": "user"
}
```

---

## 🛠️ API Reference

### `DsiAuth` (Server)

```ts
import { DsiAuth } from 'dsi-auth/server';

const dsi = new DsiAuth({
  clientId: string,
  clientSecret: string,
  redirectUri?: string,
  baseUrl?: string, // Defaults to 'https://accounts.devsecit.com'
  scope?: string,   // Defaults to 'read_profile email phone'
});
```

- `dsi.getAuthorizationUrl(options)`: Generate login URL.
- `dsi.exchangeCode(code, redirectUri?, codeVerifier?)`: Exchange auth code for `{ access_token, refresh_token, ... }`.
- `dsi.getUserInfo(accessToken)`: Get user profile.
- `dsi.authenticate(code, redirectUri?, codeVerifier?)`: All-in-one helper that exchanges code and returns `{ tokens, user }`.
- `dsi.createPkce()`: Generates `{ codeVerifier, codeChallenge }` for PKCE.

---

### `DsiClient` (Browser)

```ts
import { DsiClient } from 'dsi-auth/client';

const client = new DsiClient({
  clientId: string,
  redirectUri?: string,
  baseUrl?: string,
});
```

- `client.loginWithPopup(options)`: Opens popup and resolves with `{ code, state }`.
- `client.loginWithRedirect(options)`: Redirects current window.
- `DsiClient.handlePopupCallback(targetOrigin?)`: Call on your callback page in popup mode.
- `DsiClient.parseCallbackUrl(url?)`: Parse callback query parameters.

---

### `DsiSignInButton` (React)

```tsx
import { DsiSignInButton } from 'dsi-auth/react';

<DsiSignInButton
  clientId="your_client_id"
  redirectUri="https://yourapp.com/auth/callback"
  mode="popup" | "redirect"
  theme="light" | "dark" | "outline"
  text="Sign in with DEV SEC IT"
  onSuccess={({ code, state }) => {}}
  onError={(err) => {}}
/>
```

---

## 🔒 Security
- All requests communicate securely over TLS with `https://accounts.devsecit.com`.
- Supports PKCE (`S256` SHA-256 challenge) for public clients and SPAs.
- Tokens expire securely and can be revoked from the DEV SEC IT Account Portal.

---

## 📄 License
MIT © DEV SEC IT


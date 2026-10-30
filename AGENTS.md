# AGENTS.md — DEV SEC IT SSO (dsi-auth) AI Agent Guide

This document provides system-level guidance for AI coding agents (Claude, GPT, Cursor, Copilot, Gemini, etc.) when assisting developers with **DEV SEC IT SSO (`dsi-auth`)**.

---

## 1. What is `dsi-auth`?
`dsi-auth` is the official client and server SDK for **DEV SEC IT Accounts Single Sign-On (SSO)** located at `https://accounts.devsecit.com`.

- **Protocol**: Standard OAuth 2.0 with PKCE support (`S256`).
- **Base Authority**: `https://accounts.devsecit.com`
- **Supported Environments**: Node.js, Next.js (App & Pages Router), React, Express, Vue, Svelte, Vite, Vanilla JS.

---

## 2. Environment Variables Required

When a user asks to integrate DEV SEC IT SSO in their project, ensure these environment variables are present in their `.env` / `.env.local`:

```env
# Registered at https://accounts.devsecit.com/developers/apps
DSI_CLIENT_ID=your_client_id_here
DSI_CLIENT_SECRET=your_client_secret_here
DSI_REDIRECT_URI=http://localhost:3000/auth/callback
# Optional custom base (defaults to https://accounts.devsecit.com):
DSI_BASE_URL=https://accounts.devsecit.com
```

> **CRITICAL RULE**: Never expose `DSI_CLIENT_SECRET` in client-side code, React components, or public environment variables (`NEXT_PUBLIC_` / `VITE_`).

---

## 3. Core Implementation Patterns for Agents

### Pattern A: React Frontend (Popup Mode — Recommended)
```tsx
import { DsiSignInButton } from 'dsi-auth/react';

export function LoginButton() {
  const handleSuccess = async ({ code }) => {
    // Send code to backend API
    const res = await fetch('/api/auth/dsi/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const { user } = await res.json();
    console.log('User signed in:', user);
  };

  return (
    <DsiSignInButton
      clientId={process.env.NEXT_PUBLIC_DSI_CLIENT_ID}
      redirectUri="http://localhost:3000/auth/callback"
      mode="popup"
      theme="light" // 'light' | 'dark' | 'outline'
      onSuccess={handleSuccess}
    />
  );
}
```

On the callback page (`/auth/callback`), always place:
```tsx
'use client';
import { useEffect } from 'react';
import { DsiClient } from 'dsi-auth/client';

export default function CallbackPage() {
  useEffect(() => {
    DsiClient.handlePopupCallback();
  }, []);
  return null;
}
```

### Pattern B: Backend Route (Next.js App Router)
```ts
// app/api/auth/dsi/callback/route.ts
import { NextResponse } from 'next/server';
import { DsiAuth } from 'dsi-auth/server';

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID!,
  clientSecret: process.env.DSI_CLIENT_SECRET!,
  redirectUri: process.env.DSI_REDIRECT_URI!,
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const { tokens, user } = await dsi.authenticate(code);

    // user = { id, sub, name, email, email_verified, phone, picture, role }
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
```

### Pattern C: Express / Node.js
```javascript
const { DsiAuth } = require('dsi-auth/server');

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID,
  clientSecret: process.env.DSI_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/callback',
});

// Step 1: Redirect to login
app.get('/auth/login', (req, res) => {
  res.redirect(dsi.getAuthorizationUrl());
});

// Step 2: Handle redirect
app.get('/callback', async (req, res) => {
  const { tokens, user } = await dsi.authenticate(req.query.code);
  req.session.user = user;
  res.redirect('/dashboard');
});
```

---

## 4. Anti-Patterns to Avoid
1. ❌ **Do not** write raw fetch calls to endpoints manually when `DsiAuth` or `DsiClient` can do it with type safety.
2. ❌ **Do not** leak `clientSecret` to frontend bundles.
3. ❌ **Do not** forget to handle the callback page when using `mode="popup"`.
4. ❌ **Do not** modify the core SSO endpoint URLs unless the developer explicitly specifies a custom staging server.


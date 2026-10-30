# skills.md — DEV SEC IT SSO (`dsi-auth`) Recipes & Capabilities

This file contains step-by-step recipes that AI models and developers can execute to accomplish common integration tasks with `dsi-auth`.

---

## 🛠️ Skill 1: Integrate SSO into a Next.js App Router Project

### Goal: Add "Sign in with DEV SEC IT" to a Next.js app with popup login.

#### Step 1: Install dependency
```bash
npm install dsi-auth
```

#### Step 2: Configure Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_DSI_CLIENT_ID=your_client_id
DSI_CLIENT_ID=your_client_id
DSI_CLIENT_SECRET=your_client_secret
DSI_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Step 3: Create Login Component (`app/login/page.tsx`)
```tsx
'use client';
import { DsiSignInButton } from 'dsi-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = async ({ code }: { code: string }) => {
    const res = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Login failed');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Sign In</h2>
        <DsiSignInButton
          clientId={process.env.NEXT_PUBLIC_DSI_CLIENT_ID}
          redirectUri="http://localhost:3000/auth/callback"
          mode="popup"
          onSuccess={handleSuccess}
        />
      </div>
    </main>
  );
}
```

#### Step 4: Create Popup Callback Page (`app/auth/callback/page.tsx`)
```tsx
'use client';
import { useEffect } from 'react';
import { DsiClient } from 'dsi-auth/client';

export default function CallbackPage() {
  useEffect(() => {
    // Notify opener window and close popup
    DsiClient.handlePopupCallback();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center font-sans text-gray-500">
      Signing in with DEV SEC IT...
    </div>
  );
}
```

#### Step 5: Create Backend Token Exchange Route (`app/api/auth/callback/route.ts`)
```ts
import { NextResponse } from 'next/server';
import { DsiAuth } from 'dsi-auth/server';
import { cookies } from 'next/headers';

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID!,
  clientSecret: process.env.DSI_CLIENT_SECRET!,
  redirectUri: process.env.DSI_REDIRECT_URI!,
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const { tokens, user } = await dsi.authenticate(code);

    const cookieStore = await cookies();
    cookieStore.set('session_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
```

---

## 🛠️ Skill 2: Integrate SSO into Express / Node.js

### Goal: Add OAuth 2.0 Authorization Code flow with session support.

```javascript
const express = require('express');
const session = require('express-session');
const { DsiAuth } = require('dsi-auth/server');

const app = express();
app.use(session({ secret: 'session-secret', resave: false, saveUninitialized: true }));

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID,
  clientSecret: process.env.DSI_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/auth/callback',
});

// 1. Send user to DEV SEC IT Accounts
app.get('/login', (req, res) => {
  const url = dsi.getAuthorizationUrl({ scope: 'read_profile email phone' });
  res.redirect(url);
});

// 2. Callback listener
app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens, user } = await dsi.authenticate(code);

    req.session.user = user;
    req.session.token = tokens.access_token;

    res.redirect('/profile');
  } catch (err) {
    res.status(400).send('SSO Error: ' + err.message);
  }
});
```

---

## 🛠️ Skill 3: Authenticate User with PKCE (No Client Secret Required)

### Goal: Pure browser or mobile SPA login using SHA-256 PKCE challenge.

```typescript
import { DsiClient } from 'dsi-auth/client';

const client = new DsiClient({
  clientId: 'your_public_client_id',
  redirectUri: 'https://yourapp.com/callback',
});

// 1. Generate PKCE pair
const { codeVerifier, codeChallenge } = await client.createPkce();

// Store codeVerifier in sessionStorage for callback verification
sessionStorage.setItem('dsi_code_verifier', codeVerifier);

// 2. Login with challenge
const authUrl = client.getAuthorizationUrl({
  codeChallenge,
  codeChallengeMethod: 'S256',
});
window.location.href = authUrl;
```

---

## 🛠️ Skill 4: Troubleshooting Common Error Codes

| Error | Cause | Resolution |
|---|---|---|
| `invalid_client` | Client ID or Client Secret incorrect | Verify credentials in Account Portal (`/developers/apps`) |
| `invalid_grant` | Code is expired, already used, or redirectUri does not match | Code expires in 10 minutes. Ensure exact `redirect_uri` match |
| `redirect_uri_mismatch` | Redirect URI is not registered in developer console | Add callback URL in `/developers/apps` under the application settings |
| `Popup blocked` | Browser blocked pop-up window | Trigger `loginWithPopup` from direct user click event or switch to `mode="redirect"` |


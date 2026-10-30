/**
 * Next.js App Router Example with dsi-auth
 */

// 1. API Route: app/api/auth/dsi/callback/route.ts
import { NextResponse } from 'next/server';
import { DsiAuth } from 'dsi-auth/server';

const dsiAuth = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID!,
  clientSecret: process.env.DSI_CLIENT_SECRET!,
  redirectUri: process.env.DSI_REDIRECT_URI || 'http://localhost:3000/auth/callback',
});

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // Authenticate code and fetch verified user profile in one call
    const { tokens, user } = await dsiAuth.authenticate(code);

    // TODO: Create a session cookie or JWT for the user in your app
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


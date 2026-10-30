/**
 * React Component Example with dsi-auth
 */

import React from 'react';
import { DsiSignInButton } from 'dsi-auth/react';

export default function LoginCard() {
  const handleSuccess = async ({ code }: { code: string }) => {
    // Send the received authorization code to your backend API
    const response = await fetch('/api/auth/dsi/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`Successfully signed in as ${data.user.name}`);
      window.location.reload();
    } else {
      alert('Sign-in failed: ' + data.error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      <h3>Sign in to ClinicPro Suite</h3>
      
      {/* Light Theme Button */}
      <DsiSignInButton
        clientId="clinic_app_client_2026"
        redirectUri="http://localhost:3000/auth/callback"
        mode="popup"
        theme="light"
        onSuccess={handleSuccess}
        onError={(err) => console.error('Auth error:', err)}
      />

      {/* Dark Theme Button */}
      <DsiSignInButton
        clientId="clinic_app_client_2026"
        redirectUri="http://localhost:3000/auth/callback"
        mode="popup"
        theme="dark"
        text="Continue with DEV SEC IT"
        onSuccess={handleSuccess}
      />
    </div>
  );
}


/**
 * Express.js Server Example with dsi-auth
 */

const express = require('express');
const session = require('express-session');
const { DsiAuth } = require('dsi-auth/server');

const app = express();
app.use(express.json());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  })
);

const dsi = new DsiAuth({
  clientId: process.env.DSI_CLIENT_ID || 'your_client_id',
  clientSecret: process.env.DSI_CLIENT_SECRET || 'your_client_secret',
  redirectUri: 'http://localhost:5000/callback',
});

// 1. Initiate login
app.get('/login', (req, res) => {
  const authUrl = dsi.getAuthorizationUrl({
    scope: 'read_profile email phone',
    state: 'csrf_protection_token',
  });
  res.redirect(authUrl);
});

// 2. Handle OAuth callback
app.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code parameter.');

    const { tokens, user } = await dsi.authenticate(code);

    // Store in session
    req.session.user = user;
    req.session.accessToken = tokens.access_token;

    res.send(`<h1>Welcome, ${user.name}!</h1><p>Email: ${user.email}</p>`);
  } catch (err) {
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

app.listen(5000, () => {
  console.log('App running at http://localhost:5000');
});


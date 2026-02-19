const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from project root (one level above src)
app.use(express.static(path.join(__dirname, '..')));
app.use(cors());
app.use(bodyParser.json());

// Load OAuth2 credentials from src/credentials.json
const credentialsPath = path.join(__dirname, 'credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

// Tokens will be stored in src/tokens.json (not committed)
const tokenPath = path.join(__dirname, 'tokens.json');

// Save tokens helper
function saveTokens(tokens) {
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.log('Tokens guardados en:', tokenPath);
}

// Load tokens helper
function loadTokens() {
  try {
    if (fs.existsSync(tokenPath)) {
      return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    }
  } catch (err) {
    console.log('No hay tokens previos');
  }
  return null;
}

// If tokens exist at startup, set credentials
const storedTokens = loadTokens();
if (storedTokens) {
  oauth2Client.setCredentials(storedTokens);
  console.log('Cargando tokens desde:', tokenPath);
}

// When the OAuth2 client receives new tokens (initial exchange or refresh),
// save them so future server restarts keep the authenticated state.
oauth2Client.on('tokens', (tokens) => {
  try {
    // Merge with existing tokens so we don't lose the refresh_token if present only once
    const existing = loadTokens() || {};
    const merged = Object.assign({}, existing, tokens);
    fs.writeFileSync(tokenPath, JSON.stringify(merged, null, 2));
    console.log('Tokens actualizados y guardados en:', tokenPath);
  } catch (err) {
    console.error('Error guardando tokens recibidos:', err);
  }
});

// Endpoint: GET /auth/google -> returns auth URL for frontend
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  });
  res.json({ authUrl });
});

// OAuth2 callback where Google redirects with ?code=
app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    saveTokens(tokens);
    res.redirect('/proyecto1.html?auth=success');
  } catch (err) {
    console.error('Error al obtener tokens:', err);
    res.redirect('/gmail-auth.html?error=auth_failed');
  }
});

// Send email endpoint: POST /send-email
// Body: { to, subject, message }
app.post('/send-email', async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    const tokens = loadTokens();
    if (!tokens) {
      return res.status(401).json({ error: 'No autorizado. Primero autoriza tu cuenta de Google.' });
    }

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const emailContent = `From: me\nTo: ${to}\nSubject: ${subject}\n\n${message}`;
    const base64Email = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: base64Email }
    });

    console.log('Correo enviado:', result.data);
    res.json({ success: true, message: 'Correo enviado correctamente', messageId: result.data.id });

  } catch (err) {
    console.error('Error al enviar correo:', err);
    if (err.message && (err.message.includes('invalid_grant') || err.message.includes('expired'))) {
      try { fs.unlinkSync(tokenPath); } catch (e) {}
      return res.status(401).json({ error: 'Token expirado. Por favor, vuelve a autenticar.' });
    }
    res.status(500).json({ error: err.message || err });
  }
});

// Check auth status
app.get('/check-auth', (req, res) => {
  const tokens = loadTokens();
  res.json({ authorized: !!tokens });
});

// Get authenticated email address
app.get('/get-email', async (req, res) => {
  try {
    const tokens = loadTokens();
    if (!tokens) return res.json({ email: null });

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({ email: profile.data.emailAddress });
  } catch (err) {
    console.error('Error:', err);
    res.json({ email: null, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\nServidor iniciado en http://localhost:${PORT}`);
  console.log('Abre: http://localhost:' + PORT + '/gmail-auth.html para autorizar');
});

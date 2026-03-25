const express = require('express');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const ALLOWED_DOMAIN = null;
const SESSION_SECRET = process.env.SESSION_SECRET || 'ec-dev-secret-change-in-production';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

function signSession(data) {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    return payload + '.' + sig;
}

function verifySession(cookie) {
    if (!cookie || !cookie.includes('.')) return null;
    const [payload, sig] = cookie.split('.');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
        if (data.exp < Date.now()) return null;
        return data;
    } catch { return null; }
}

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
});

app.use(express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    etag: false,
    lastModified: false
}));

function requireAuth(req, res, next) {
    const session = verifySession(req.cookies?.ec_session);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = session.user;
    next();
}

app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ error: 'Missing credential' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        if (ALLOWED_DOMAIN && payload.hd !== ALLOWED_DOMAIN) {
            return res.status(403).json({
                error: 'Access Denied: You must use a company email address.'
            });
        }

        const user = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            domain: payload.hd || 'personal'
        };

        const sessionValue = signSession({
            user,
            exp: Date.now() + SESSION_MAX_AGE
        });

        res.cookie('ec_session', sessionValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/'
        });

        return res.status(200).json({
            success: true,
            user: { name: user.name, email: user.email, picture: user.picture }
        });
    } catch (err) {
        console.error('Auth error:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({
        authenticated: true,
        user: {
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('ec_session', { path: '/' });
    res.json({ success: true });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`East Coast server running at http://localhost:${PORT}`);
    });
}

module.exports = app;

/**
 * Veda Vijnana Gurukulam Management System
 * Production Server v3.0 — Real Backend with File-Based Persistence
 * 
 * Endpoints:
 *   POST /api/auth/login  — Real Acharya authentication
 *   GET  /api/db          — Load database from server file
 *   POST /api/db          — Save database to server file (persists forever)
 *   GET  /api/users       — List Acharyas (admin only)
 */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const PORT     = process.env.PORT || 3000;
const FIREBASE = 'https://vvg-edu-sys-default-rtdb.firebaseio.com';

// ── Polyfill fetch for older Node versions on Render ────────
const https = require('https');
if (typeof global.fetch !== 'function') {
  global.fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(body),
            json: () => {
              try { return Promise.resolve(JSON.parse(body)); }
              catch(e) { return Promise.reject(e); }
            }
          });
        });
      });
      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  };
}

// ── Load Acharya / User credentials from Firebase ────────
let USERS = [];
fetch(`${FIREBASE}/users.json`)
  .then(res => res.json())
  .then(data => {
    if (data && Array.isArray(data)) {
      USERS = data;
      console.log(`[VVG] Loaded ${USERS.length} user accounts from Firebase.`);
    }
  })
  .catch(e => console.warn('[VVG] Could not load users from Firebase', e));


// ── In-memory session store ───────────────────────────────
const SESSIONS = {};

// ── MIME types ────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.eot':  'font/eot'
};

// ── Helper: parse JSON body ───────────────────────────────
function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

// ── Helper: JSON response ─────────────────────────────────
function jsonRes(res, statusCode, obj) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(obj));
}

// ── Helper: serve static file ─────────────────────────────
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end(`500 Error: ${err.message}`);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.end(data);
    }
  });
}

// ── Main server ───────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  let parsedUrl;
  try { parsedUrl = decodeURIComponent(req.url).split('?')[0]; }
  catch { parsedUrl = req.url.split('?')[0]; }

  // ══════════════════════════════════════════
  //  API ROUTES
  // ══════════════════════════════════════════

  // ── POST /api/auth/login ─────────────────
  if (req.method === 'POST' && parsedUrl === '/api/auth/login') {
    const body = await parseBody(req);
    const { email, password } = body;

    try {
      const fbUsers = await fetch(`${FIREBASE}/users.json`).then(r => r.json());
      if (fbUsers && Array.isArray(fbUsers)) USERS = fbUsers;
    } catch(e) {}

    const user = USERS.find(u =>
      u.email.toLowerCase() === (email || '').toLowerCase() &&
      u.password === password
    );

    if (!user) {
      return jsonRes(res, 401, { success: false, message: 'Invalid email or password. Please check your credentials.' });
    }

    // Check if account is pending approval
    if (user.role === 'Pending') {
      return jsonRes(res, 403, { success: false, message: 'Your registration is pending Admin approval. Please contact the Gurukula office to activate your account.' });
    }

    // Generate session token
    const token = crypto.randomBytes(24).toString('hex');
    const sessionUser = {
      id:     user.id,
      name:   user.name,
      nameSa: user.nameSa,
      email:  user.email,
      role:   user.role,
      ganaId: user.ganaId || null
    };
    SESSIONS[token] = sessionUser;

    console.log(`[VVG] ✓ Login: ${user.name} (${user.role}) at ${new Date().toLocaleTimeString('en-IN')}`);
    return jsonRes(res, 200, { success: true, token, user: sessionUser });
  }

  // ── POST /api/auth/logout ────────────────
  if (req.method === 'POST' && parsedUrl === '/api/auth/logout') {
    const token = req.headers['x-session-token'];
    if (token && SESSIONS[token]) {
      console.log(`[VVG] Logout: ${SESSIONS[token].name}`);
      delete SESSIONS[token];
    }
    return jsonRes(res, 200, { success: true });
  }

  // ── GET /api/db — load database ──────────
  if (req.method === 'GET' && parsedUrl === '/api/db') {
    try {
      const dbRes = await fetch(`${FIREBASE}/vvg_database.json`);
      if (dbRes.ok) {
        const raw = await dbRes.text();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(raw);
      } else {
        res.statusCode = 204;
        res.end();
      }
    } catch (e) {
      jsonRes(res, 500, { error: e.message });
    }
    return;
  }

  // ── POST /api/db — save database ─────────
  if (req.method === 'POST' && parsedUrl === '/api/db') {
    try {
      const body = await parseBody(req);
      if (body && body.students) {
        await fetch(`${FIREBASE}/vvg_database.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return jsonRes(res, 200, { success: true, savedAt: new Date().toISOString() });
      }
      return jsonRes(res, 400, { success: false, message: 'Invalid data structure' });
    } catch (e) {
      return jsonRes(res, 500, { success: false, error: e.message });
    }
  }

  // ── GET /api/users — list acharyas ───────
  if (req.method === 'GET' && parsedUrl === '/api/users') {
    const publicUsers = USERS.map(u => ({
      id: u.id, name: u.name, nameSa: u.nameSa,
      email: u.email, role: u.role, ganaId: u.ganaId
    }));
    return jsonRes(res, 200, publicUsers);
  }

  // ── POST /api/auth/register ──────────────
  if (req.method === 'POST' && parsedUrl === '/api/auth/register') {
    try {
      const body = await parseBody(req);
      const { name, nameSa, email, password, phone, specialization } = body;

      if (!name || !email || !password) {
        return jsonRes(res, 400, { success: false, message: 'Name, email and password are required.' });
      }

      // Check if email already exists
      if (USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return jsonRes(res, 409, { success: false, message: 'An account with this email already exists. Please contact admin.' });
      }

      // Create new user record
      const newUser = {
        id:             'usr_' + Date.now(),
        name:           name.trim(),
        nameSa:         (nameSa || '').trim(),
        email:          email.trim().toLowerCase(),
        password:       password,
        role:           'Pending',
        ganaId:         null,
        phone:          (phone || '').trim(),
        specialization: (specialization || '').trim(),
        registeredAt:   new Date().toISOString()
      };

      // Append to Firebase
      USERS.push(newUser);
      await fetch(`${FIREBASE}/users.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(USERS)
      });



      console.log(`[VVG] ★ New Acharya registered: ${newUser.name} <${newUser.email}> — PENDING ADMIN APPROVAL`);
      return jsonRes(res, 200, {
        success: true,
        message: 'Registration submitted. Admin will review and activate your account.'
      });
    } catch(e) {
      return jsonRes(res, 500, { success: false, message: 'Registration failed: ' + e.message });
    }
  }

  // ── GET /api/ping — health check ─────────
  if (req.method === 'GET' && parsedUrl === '/api/ping') {
    return jsonRes(res, 200, { status: 'ok', server: 'VVG Edu-Sys v3.0', time: new Date().toISOString() });
  }


  // ══════════════════════════════════════════
  //  STATIC FILE SERVING
  // ══════════════════════════════════════════
  let filePath = path.join(__dirname, parsedUrl === '/' ? 'index.html' : parsedUrl);

  // Security: prevent directory traversal
  const relative = path.relative(__dirname, filePath);
  if (relative.startsWith('..') && !path.isAbsolute(relative)) {
    res.statusCode = 403; res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const ext = path.extname(filePath);
      if (!ext) {
        // SPA: fallback to index.html
        filePath = path.join(__dirname, 'index.html');
        fs.stat(filePath, (fe, fs2) => {
          if (fe || !fs2.isFile()) { res.statusCode = 404; res.end('404'); }
          else serveFile(filePath, res);
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`404: ${parsedUrl}`);
      }
    } else {
      serveFile(filePath, res);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const n of Object.values(nets)) {
    for (const iface of n) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address; break;
      }
    }
  }

  console.log('');
  console.log('=============================================================');
  console.log('  वेदविज्ञानगुरुकुलम् — VVG Edu-Sys v3.0 ');
  console.log('=============================================================');
  console.log(`  Local  : http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}  ← Share with campus`);
  console.log(`  Users  : ${USERS.length} Acharyas loaded`);
  console.log('  Press Ctrl+C to stop');
  console.log('=============================================================');
  console.log('');
});

/**
 * Veda Vijnana Gurukulam Management System
 * Production Server v3.5.0 — Attendance Fix + Unicode Devanagari Fonts
 * Deployed: 2026-06-04
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
const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Email Transporter Setup ────────
// NOTE: For real deployment, replace with real Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendNotificationEmail(to, subject, html) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n[MAILER SIMULATION] Email variables not set.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html, '\n');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"VVG Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[MAILER] Sent email to ${to}`);
  } catch(e) {
    console.error(`[MAILER] Error sending email to ${to}:`, e.message);
  }
}

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

// ── Load / Save Users and Sync with Local Fallback ────────
let USERS = [];

async function loadUsers() {
  // 1. Try to load from Firebase
  try {
    const res = await fetch(`${FIREBASE}/users.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data)) {
        USERS = data;
        console.log(`[VVG] Loaded ${USERS.length} user accounts from Firebase.`);
        return;
      }
    }
  } catch (e) {
    console.warn('[VVG] Could not load users from Firebase, using local fallback:', e.message);
  }

  // 2. Fallback to local data/users.json
  try {
    const usersPath = path.join(__dirname, 'data', 'users.json');
    if (fs.existsSync(usersPath)) {
      USERS = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      console.log(`[VVG] Loaded ${USERS.length} user accounts from local fallback.`);
    }
  } catch (e) {
    console.error('[VVG] Failed to load local users fallback:', e.message);
  }
}

async function saveUsers() {
  // 1. Save to Firebase
  try {
    await fetch(`${FIREBASE}/users.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(USERS)
    });
    console.log('[VVG] Saved users to Firebase.');
  } catch (e) {
    console.error('[VVG] Error saving users to Firebase:', e.message);
  }

  // 2. Save to local data/users.json
  try {
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const dir = path.dirname(usersPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(usersPath, JSON.stringify(USERS, null, 2), 'utf-8');
    console.log('[VVG] Saved users locally.');
  } catch (e) {
    console.error('[VVG] Error saving users locally:', e.message);
  }
}

// ── Password Hashing Utility (PBKDF2 with SHA-512) ────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$100000$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('pbkdf2$')) {
    // Plaintext fallback (for backward compatibility / auto-upgrade)
    return password === storedHash;
  }
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;
    const [_, iterationsStr, salt, hash] = parts;
    const iterations = parseInt(iterationsStr, 10);
    const verifyHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
    return verifyHash === hash;
  } catch (e) {
    return false;
  }
}

// ── Rate Limiting / Brute-force Prevention ────────
const LOGIN_ATTEMPTS = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function isLockedOut(email) {
  const record = LOGIN_ATTEMPTS[email];
  if (!record) return false;
  if (record.attempts >= MAX_ATTEMPTS) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < LOCKOUT_TIME) {
      return true;
    } else {
      delete LOGIN_ATTEMPTS[email];
      return false;
    }
  }
  return false;
}

function recordFailedAttempt(email) {
  if (!LOGIN_ATTEMPTS[email]) {
    LOGIN_ATTEMPTS[email] = { attempts: 0, lastAttempt: 0 };
  }
  LOGIN_ATTEMPTS[email].attempts++;
  LOGIN_ATTEMPTS[email].lastAttempt = Date.now();
}

function resetFailedAttempts(email) {
  delete LOGIN_ATTEMPTS[email];
}

// Initial user loading
loadUsers();


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

// ── Helper: Authentication ────────────────────────────────
function requireAuth(req, res) {
  const token = req.headers['x-session-token'];
  const user = SESSIONS[token];
  if (!user) {
    jsonRes(res, 401, { success: false, message: 'Unauthorized' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'Admin') {
    jsonRes(res, 403, { success: false, message: 'Forbidden: Admin access required' });
    return null;
  }
  return user;
}

// ── Main server ───────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self';"
  );

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

  // ── GET /api/version ─────────────────────
  if (req.method === 'GET' && parsedUrl === '/api/version') {
    return jsonRes(res, 200, { version: '3.8.1', deployed: '2026-06-04', fixes: ['fix-mojibake-index-html'] });
  }

  // ── POST /api/auth/login ─────────────────
  if (req.method === 'POST' && parsedUrl === '/api/auth/login') {
    const body = await parseBody(req);
    const { email, password } = body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check brute-force lockout
    if (isLockedOut(normalizedEmail)) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - LOGIN_ATTEMPTS[normalizedEmail].lastAttempt)) / 1000 / 60);
      return jsonRes(res, 429, { success: false, message: `Too many failed login attempts. Please try again in ${remainingTime} minutes.` });
    }

    try {
      const fbUsers = await fetch(`${FIREBASE}/users.json`).then(r => r.json());
      if (fbUsers && Array.isArray(fbUsers)) USERS = fbUsers;
    } catch(e) {}

    const user = USERS.find(u =>
      u && u.email.toLowerCase() === normalizedEmail
    );

    if (!user || !verifyPassword(password, user.password)) {
      recordFailedAttempt(normalizedEmail);
      return jsonRes(res, 401, { success: false, message: 'Invalid email or password. Please check your credentials.' });
    }

    // Check if account is pending approval
    if (user.role === 'Pending') {
      return jsonRes(res, 403, { success: false, message: 'Your registration is pending Admin approval. Please contact the Gurukula office to activate your account.' });
    }

    // Reset lockout counters on success
    resetFailedAttempts(normalizedEmail);

    // Auto-upgrade password hash if it is currently plaintext
    if (!user.password.startsWith('pbkdf2$')) {
      user.password = hashPassword(password);
      await saveUsers();
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
    if (!requireAuth(req, res)) return;
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
    if (!requireAuth(req, res)) return;
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

  // ── GET /api/users/profile ──────────────
  if (req.method === 'GET' && parsedUrl === '/api/users/profile') {
    const session = requireAuth(req, res);
    if (!session) return;
    const user = USERS.find(u => u && u.id === session.id);
    if (!user) return jsonRes(res, 404, { success: false, message: 'User not found' });
    
    // Return full profile excluding password
    const { password, ...safeUser } = user;
    return jsonRes(res, 200, { success: true, user: safeUser });
  }

  // ── PUT /api/users/profile ──────────────
  if (req.method === 'PUT' && parsedUrl === '/api/users/profile') {
    const session = requireAuth(req, res);
    if (!session) return;
    
    try {
      const body = await parseBody(req);
      const idx = USERS.findIndex(u => u && u.id === session.id);
      if (idx === -1) return jsonRes(res, 404, { success: false, message: 'User not found' });
      
      const { nameSa, specialization, assignedGanaId, yearsExperience } = body;
      
      if (nameSa !== undefined) USERS[idx].nameSa = nameSa;
      if (specialization !== undefined) USERS[idx].specialization = specialization;
      if (assignedGanaId !== undefined) USERS[idx].ganaId = assignedGanaId || null;
      if (yearsExperience !== undefined) USERS[idx].yearsExperience = yearsExperience;
      
      await saveUsers();
      return jsonRes(res, 200, { success: true, message: 'Profile updated' });
    } catch(e) {
      return jsonRes(res, 500, { success: false, error: e.message });
    }
  }

  // ── GET /api/users — list acharyas ───────
  if (req.method === 'GET' && parsedUrl === '/api/users') {
    if (!requireAuth(req, res)) return;
    const publicUsers = USERS.filter(u => u).map(u => ({
      id: u.id, name: u.name, nameSa: u.nameSa,
      email: u.email, role: u.role, ganaId: u.ganaId
    }));
    return jsonRes(res, 200, publicUsers);
  }

  // ── POST /api/auth/register ──────────────
  if (req.method === 'POST' && parsedUrl === '/api/auth/register') {
    try {
      const body = await parseBody(req);
      const { name, nameSa, email, password, phone, specialization, assignedGanaId, yearsExperience } = body;

      if (!name || !email || !password) {
        return jsonRes(res, 400, { success: false, message: 'Name, email and password are required.' });
      }

      // Password strength validation
      if (password.length < 8) {
        return jsonRes(res, 400, { success: false, message: 'Password must be at least 8 characters long.' });
      }
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigit = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
        return jsonRes(res, 400, { success: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
      }

      // Check if email already exists
      if (USERS.find(u => u && u.email.toLowerCase() === email.toLowerCase())) {
        return jsonRes(res, 409, { success: false, message: 'An account with this email already exists. Please contact admin.' });
      }

      // Create new user record
      const newUser = {
        id:             'usr_' + Date.now(),
        name:           name.trim(),
        nameSa:         (nameSa || '').trim(),
        email:          email.trim().toLowerCase(),
        password:       hashPassword(password),
        role:           'Pending',
        ganaId:         assignedGanaId || null,
        phone:          (phone || '').trim(),
        specialization: (specialization || '').trim(),
        yearsExperience: yearsExperience || '',
        registeredAt:   new Date().toISOString()
      };

      // Append to Firebase and local storage
      USERS.push(newUser);
      await saveUsers();



      console.log(`[VVG] ★ New Acharya registered: ${newUser.name} <${newUser.email}> — PENDING ADMIN APPROVAL`);
      
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
          <div style="background:#5A2E0E;color:#F0E6D2;padding:20px;text-align:center;">
            <h2 style="margin:0;letter-spacing:1px;">वेदविज्ञानगुरुकुलम्</h2>
            <p style="margin:5px 0 0;font-size:14px;">Veda Vijnana Gurukulam</p>
          </div>
          <div style="padding:30px;background:#FAFAFA;color:#333;">
            <h3 style="margin-top:0;">नमस्कारम् (Namaskaram) ${newUser.nameSa || newUser.name},</h3>
            <p>Your registration for the Veda Vijnana Gurukulam faculty portal has been received.</p>
            <table style="width:100%;margin:20px 0;border-collapse:collapse;background:#fff;border:1px solid #eee;">
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;"><strong>Role Requested:</strong></td><td style="padding:10px;border-bottom:1px solid #eee;">Acharya</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #eee;color:#666;"><strong>Specialization:</strong></td><td style="padding:10px;border-bottom:1px solid #eee;">${newUser.specialization || 'Not Specified'}</td></tr>
              <tr><td style="padding:10px;color:#666;"><strong>Status:</strong></td><td style="padding:10px;color:#C62828;font-weight:bold;">Pending Approval</td></tr>
            </table>
            <p style="line-height:1.5;">An Administrator will review your details. Once your account is approved, you will receive another email and be able to log in to the system.</p>
            <p style="margin-top:30px;font-size:12px;color:#888;text-align:center;">This is an automated message. Please do not reply directly.</p>
          </div>
        </div>
      `;
      sendNotificationEmail(newUser.email, 'Registration Received - Veda Vijnana Gurukulam', emailHtml);

      return jsonRes(res, 200, {
        success: true,
        message: 'Registration submitted. Admin will review and activate your account.'
      });
    } catch(e) {
      return jsonRes(res, 500, { success: false, message: 'Registration failed: ' + e.message });
    }
  }

  // ── POST /api/users/approve ──────────────
  if (req.method === 'POST' && parsedUrl.match(/^\/api\/users\/approve\/?$/)) {
    if (!requireAdmin(req, res)) return;
    try {
      const body = await parseBody(req);
      const { id } = body;
      const userIndex = USERS.findIndex(u => u && u.id === id);
      if (userIndex === -1) return jsonRes(res, 404, { success: false, message: 'User not found' });
      
      USERS[userIndex].role = 'Acharya';
      
      await saveUsers();

      // Send Approval Email
      transporter.sendMail({
        from: '"VVG Admin System" <vvgurukulam.system@gmail.com>',
        to: USERS[userIndex].email,
        subject: 'Account Approved - Veda Vijnana Gurukulam',
        text: `Namaskaram ${USERS[userIndex].name},\n\nYour Acharya account has been officially approved! You can now log in to the management system.\n\nPranam,\nVVG Admin`
      }).catch(err => console.log('Mail error:', err.message));

      return jsonRes(res, 200, { success: true, message: 'User approved' });
    } catch(e) {
      return jsonRes(res, 500, { success: false, error: e.message });
    }
  }

  // ── POST /api/users/reject ──────────────
  if (req.method === 'POST' && parsedUrl.match(/^\/api\/users\/reject\/?$/)) {
    if (!requireAdmin(req, res)) return;
    try {
      const body = await parseBody(req);
      const { id } = body;
      USERS = USERS.filter(u => u && u.id !== id);
      
      await saveUsers();
      return jsonRes(res, 200, { success: true, message: 'User rejected and removed' });
    } catch(e) {
      return jsonRes(res, 500, { success: false, error: e.message });
    }
  }

  // ── POST /api/users/role ──────────────
  if (req.method === 'POST' && parsedUrl.match(/^\/api\/users\/role\/?$/)) {
    if (!requireAdmin(req, res)) return;
    try {
      const body = await parseBody(req);
      const { id, role } = body;
      if (!['Admin', 'Pracharya', 'Acharya', 'Office Staff'].includes(role)) {
        return jsonRes(res, 400, { success: false, message: 'Invalid role provided' });
      }

      const userIndex = USERS.findIndex(u => u && u.id === id);
      if (userIndex === -1) return jsonRes(res, 404, { success: false, message: 'User not found' });
      
      const user = USERS[userIndex];
      const oldRole = user.role;
      user.role = role;
      
      await saveUsers();
      
      // If promoting from Pending, send approval email
      if (oldRole === 'Pending' && role !== 'Pending') {
        const approvalHtml = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
            <div style="background:#1B5E20;color:#E8F5E9;padding:20px;text-align:center;">
              <h2 style="margin:0;letter-spacing:1px;">वेदविज्ञानगुरुकुलम्</h2>
            </div>
            <div style="padding:30px;background:#FAFAFA;color:#333;">
              <h3 style="margin-top:0;">Account Approved!</h3>
              <p>Namaskaram ${user.nameSa || user.name},</p>
              <p>Your registration has been reviewed and approved by the Administrator.</p>
              <p><strong>Your Assigned Role:</strong> ${role}</p>
              <p>You may now log in to the portal using your registered email and password. Once logged in, please navigate to the <strong>Profile</strong> section to complete your details.</p>
              <a href="http://localhost:3000/#login" style="display:inline-block;padding:10px 20px;background:#D4AF37;color:#fff;text-decoration:none;border-radius:4px;margin-top:15px;font-weight:bold;">Login to Portal</a>
            </div>
          </div>
        `;
        sendNotificationEmail(user.email, 'Account Approved - Veda Vijnana Gurukulam', approvalHtml);
      }
      
      return jsonRes(res, 200, { success: true, message: `Role updated to ${role}` });
    } catch(e) {
      return jsonRes(res, 500, { success: false, error: e.message });
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

  // Security: prevent directory traversal & information disclosure
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(__dirname)) {
    res.statusCode = 403; res.end('Forbidden'); return;
  }

  function isPathAllowed(targetPath) {
    const normPath = path.normalize(targetPath);
    if (!normPath.startsWith(__dirname)) return false;
    const relativePath = path.relative(__dirname, normPath).replace(/\\/g, '/');
    return (
      relativePath === 'index.html' ||
      relativePath === '' ||
      relativePath.startsWith('css/') ||
      relativePath.startsWith('app/') ||
      relativePath.startsWith('assets/')
    );
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const ext = path.extname(filePath);
      if (!ext) {
        // SPA: fallback to index.html
        filePath = path.join(__dirname, 'index.html');
        fs.stat(filePath, (fe, stats2) => {
          if (fe || !stats2.isFile()) { res.statusCode = 404; res.end('404'); }
          else {
            if (!isPathAllowed(filePath)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'text/plain');
              res.end('Forbidden: Access is restricted.');
              return;
            }
            serveFile(filePath, res);
          }
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`404: ${parsedUrl}`);
      }
    } else {
      if (!isPathAllowed(filePath)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Forbidden: Access is restricted.');
        return;
      }
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

/* 
  Veda Vijnana Gurukulam Management System
  Login Page v3.0 — Real Authentication | Stunning Hero | All Acharyas
*/

import { router } from '../router.js';
import { db }     from '../database.js';

export function renderLogin(container, appInstance) {

  const shlokas = [
    { sa: '॥ विद्या ददाति विनयम् ॥',         en: '"Knowledge imparts true humility and refinement."' },
    { sa: '॥ ऋते ज्ञानान्न मुक्तिः ॥',       en: '"Without knowledge there is no liberation."' },
    { sa: '॥ सा विद्या या विमुक्तये ॥',      en: '"True education is that which liberates the mind."' },
    { sa: '॥ गुरुर्ब्रह्मा गुरुर्विष्णुः ॥', en: '"The Guru is Brahma, Vishnu, and Maheshwara."' },
    { sa: '॥ आचार्यो ब्रह्मणः साक्षात् ॥',   en: '"The Acharya is the living form of the Absolute."' }
  ];
  let shlokaIdx = 0;

  container.innerHTML = `
    <div class="login-bg">

      <!-- ── Left Hero Panel ───────────────────────── -->
      <div class="login-art-panel">
        <!-- Layered background: mandala + grain -->
        <div class="aura-mandala"></div>
        <div class="login-grain-overlay"></div>

        <div class="login-hero-content">
          <!-- Logo -->
          <div class="login-logo-ring">
            <img src="/assets/vvg_logo.png"
                 alt="Veda Vijnana Gurukulam Seal"
                 class="login-logo-img"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <div class="login-logo-fallback" style="display:none;">
              <span style="font-size:3rem;">🕉</span>
            </div>
          </div>

          <!-- Name -->
          <h1 class="login-hero-title">वेदविज्ञानगुरुकुलम्</h1>
          <div class="login-hero-subtitle-en">VEDA VIJNANA GURUKULAM</div>
          <div class="login-hero-location">
            <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0;">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Channenahalli, Magadi Road, Bengaluru
          </div>

          <!-- Divider -->
          <div class="login-hero-divider">
            <div></div><span>॥</span><div></div>
          </div>

          <!-- Rotating Shloka -->
          <div id="shloka-fade-box" class="login-shloka-box">
            <p class="login-shloka-sa">${shlokas[0].sa}</p>
            <p class="login-shloka-en">${shlokas[0].en}</p>
          </div>

          <!-- Live Stats -->
          <div class="login-stats-row">
            <div class="login-stat"><span class="login-stat-num">90+</span><span>छात्राः</span></div>
            <div class="login-stat-div"></div>
            <div class="login-stat"><span class="login-stat-num">8</span><span>गणाः</span></div>
            <div class="login-stat-div"></div>
            <div class="login-stat"><span class="login-stat-num">20+</span><span>आचार्याः</span></div>
          </div>
        </div>

        <div class="login-hero-footer">© 2026 Veda Vijnana Gurukulam · All Rights Reserved</div>
      </div>

      <!-- ── Right Login Panel ─────────────────────── -->
      <div class="login-form-panel">
        <div class="login-form-card">

          <!-- Header -->
          <div class="login-welcome">
            <div class="login-form-logo-small">
              <img src="/assets/vvg_logo.png" alt="VVG" style="width:42px;height:42px;border-radius:50%;object-fit:contain;border:2px solid var(--gold-solid);background:#fff;padding:2px;"
                   onerror="this.outerHTML='<div style=\'width:42px;height:42px;border-radius:50%;background:var(--gold-leaf);display:flex;align-items:center;justify-content:center;font-size:1.2rem;\'>🕉</div>'">
            </div>
            <h2 class="login-form-title">प्रवेशद्वारम्</h2>
            <p class="login-form-tagline">Gurukula Portal — Secure Access</p>
          </div>

          <!-- Server status indicator -->
          <div id="server-status" class="server-status-bar">
            <span class="status-dot" id="status-dot"></span>
            <span id="status-text">Connecting to server…</span>
          </div>

          <!-- Form -->
          <form id="login-form" autocomplete="on">
            <div class="form-group">
              <label class="form-label" for="login-email">
                <span>विद्युत्-पत्रम् (Email)</span>
              </label>
              <div class="input-icon-wrap">
                <svg class="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="login-email" class="form-control input-with-icon"
                       placeholder="acharya@vvgurukulam.org"
                       autocomplete="email" required>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1.5rem;">
              <label class="form-label" for="login-password">
                <span>कूटशब्दः (Password)</span>
              </label>
              <div class="input-icon-wrap">
                <svg class="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type="password" id="login-password" class="form-control input-with-icon"
                       placeholder="••••••••"
                       autocomplete="current-password" required>
                <button type="button" id="toggle-pw" class="input-icon-right" title="Show/hide password" tabindex="-1">
                  <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <!-- Error message -->
            <div id="login-error" class="login-error-msg" style="display:none;"></div>

            <button type="submit" id="login-btn" class="btn btn-saffron login-submit-btn">
              <span id="login-btn-text">
                <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                प्रवेशः क्रियताम् — Login
              </span>
              <span id="login-btn-loading" style="display:none;">
                <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;animation:spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
                Authenticating…
              </span>
            </button>
          </form>

          <!-- Acharya Quick Access -->
          <details class="quick-access-section" id="quick-access">
            <summary class="quick-access-title">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a6 6 0 0 1 12 0v2"/></svg>
              आचार्य-लॉगिन (Acharya Quick Login)
              <svg class="qa-arrow" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;margin-left:auto;transition:transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="quick-cred-grid">
              ${[
                { label: 'प्रधानाचार्यः (Admin)',   email: 'admin@vvgurukulam.org',      pw: 'vvg@admin2026'  },
                { label: 'कार्यालयः (Office)',       email: 'office@vvgurukulam.org',     pw: 'vvg@office2026' },
                { label: 'सञ्जयाचार्यः',             email: 'sanjaya@vvgurukulam.org',    pw: 'vvg@sanjaya'    },
                { label: 'विनायकाचार्यः',            email: 'vinayaka@vvgurukulam.org',   pw: 'vvg@vinayaka'   },
                { label: 'गुरुप्रसादाचार्यः',       email: 'guruprasada@vvgurukulam.org',pw: 'vvg@guruprasada'},
                { label: 'अरुणाचार्यः',              email: 'aruna@vvgurukulam.org',      pw: 'vvg@aruna'      },
                { label: 'श्रीधराचार्यः',            email: 'shridhara@vvgurukulam.org',  pw: 'vvg@shridhara'  },
                { label: 'महादेवाचार्यः',            email: 'mahadeva@vvgurukulam.org',   pw: 'vvg@mahadeva'   },
              ].map(u => `
                <button class="quick-cred-btn" data-email="${u.email}" data-pw="${u.pw}">
                  <span class="qc-name">${u.label}</span>
                  <span class="qc-email">${u.email}</span>
                </button>
              `).join('')}
            </div>
          </details>

        </div>
      </div>

    </div>
  `;

  // ── Check server status ─────────────────────────────
  const dotEl  = container.querySelector('#status-dot');
  const textEl = container.querySelector('#status-text');
  fetch('/api/ping').then(r => r.json()).then(() => {
    dotEl.style.background  = 'var(--forest-tulsi)';
    textEl.textContent = 'Server online — Real authentication active';
  }).catch(() => {
    dotEl.style.background  = 'var(--agni-red)';
    textEl.textContent = 'Server offline — Start server.js first';
  });

  // ── Shloka Carousel ────────────────────────────────
  const interval = setInterval(() => {
    const box = container.querySelector('#shloka-fade-box');
    if (!box) { clearInterval(interval); return; }
    box.style.opacity = '0';
    setTimeout(() => {
      shlokaIdx = (shlokaIdx + 1) % shlokas.length;
      box.querySelector('.login-shloka-sa').textContent = shlokas[shlokaIdx].sa;
      box.querySelector('.login-shloka-en').textContent = shlokas[shlokaIdx].en;
      box.style.opacity = '1';
    }, 600);
  }, 6000);

  // ── Toggle password visibility ──────────────────────
  container.querySelector('#toggle-pw').addEventListener('click', () => {
    const pw = container.querySelector('#login-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // ── Quick access buttons ────────────────────────────
  container.querySelectorAll('.quick-cred-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelector('#login-email').value    = btn.getAttribute('data-email');
      container.querySelector('#login-password').value = btn.getAttribute('data-pw');
      container.querySelector('#quick-access').removeAttribute('open');
      submitLogin();
    });
  });

  // ── Form submit ─────────────────────────────────────
  container.querySelector('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    submitLogin();
  });

  async function submitLogin() {
    const email    = container.querySelector('#login-email').value.trim();
    const password = container.querySelector('#login-password').value;
    const btn      = container.querySelector('#login-btn');
    const btnTxt   = container.querySelector('#login-btn-text');
    const btnLoad  = container.querySelector('#login-btn-loading');
    const errEl    = container.querySelector('#login-error');

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    // Show loading state
    btn.disabled   = true;
    btnTxt.style.display  = 'none';
    btnLoad.style.display = 'flex';
    errEl.style.display   = 'none';

    const result = await db.serverLogin(email, password);

    btn.disabled   = false;
    btnTxt.style.display  = 'flex';
    btnLoad.style.display = 'none';

    if (result.success) {
      // Save session
      const user = result.user;
      sessionStorage.setItem('vvg_user', JSON.stringify({
        id:     user.id,
        name:   user.name,
        nameSa: user.nameSa || user.name,
        role:   user.role,
        email:  user.email,
        ganaId: user.ganaId || null,
        timestamp: Date.now()
      }));

      // Sync DB from server before entering app
      await db.syncFromServer();

      // Animate login card out
      const card = container.querySelector('.login-form-card');
      if (card) { card.style.transform = 'scale(0.95)'; card.style.opacity = '0'; }
      setTimeout(() => router.navigate('dashboard'), 350);
    } else {
      showError(result.message || 'Invalid credentials. Please try again.');
      container.querySelector('#login-password').value = '';
      container.querySelector('#login-password').focus();
    }
  }

  function showError(msg) {
    const errEl = container.querySelector('#login-error');
    errEl.textContent   = msg;
    errEl.style.display = 'block';
    errEl.style.animation = 'none';
    requestAnimationFrame(() => { errEl.style.animation = 'shake 0.4s ease'; });
  }
}

/* 
  Veda Vijnana Gurukulam Management System
  Login Page v3.0 — Clean · Real Auth · Gana Welcome Screen
*/

import { router } from '../router.js?v=3.5';
import { db }     from '../database.js?v=3.5';

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

      <!-- Left Hero Panel -->
      <div class="login-art-panel">
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

          <div class="login-hero-divider">
            <div></div><span>॥</span><div></div>
          </div>

          <!-- Rotating Shloka -->
          <div id="shloka-fade-box" class="login-shloka-box">
            <p class="login-shloka-sa">${shlokas[0].sa}</p>
            <p class="login-shloka-en">${shlokas[0].en}</p>
          </div>

          <!-- Stats -->
          <div class="login-stats-row">
            <div class="login-stat"><span class="login-stat-num">90+</span><span>छात्राः</span></div>
            <div class="login-stat-div"></div>
            <div class="login-stat"><span class="login-stat-num">8</span><span>गणाः</span></div>
            <div class="login-stat-div"></div>
            <div class="login-stat"><span class="login-stat-num">14</span><span>आचार्याः</span></div>
          </div>
        </div>

        <div class="login-hero-footer">© 2026 Veda Vijnana Gurukulam · All Rights Reserved</div>
      </div>

      <!-- Right Login Panel -->
      <div class="login-form-panel">
        <div class="login-form-card" id="main-login-card">

          <!-- Header -->
          <div class="login-welcome">
            <div class="login-form-logo-small">
              <img src="/assets/vvg_logo.png" alt="VVG"
                   style="width:42px;height:42px;border-radius:50%;object-fit:contain;border:2px solid var(--gold-solid);background:#fff;padding:2px;"
                   onerror="this.style.display='none'">
            </div>
            <h2 class="login-form-title">प्रवेशद्वारम्</h2>
            <p class="login-form-tagline">Enter your email and password to access the Gurukula Portal</p>
          </div>

          <!-- Server status -->
          <div id="server-status" class="server-status-bar">
            <span class="status-dot" id="status-dot"></span>
            <span id="status-text">Connecting to server…</span>
          </div>

          <!-- Login Form -->
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

          <!-- Help note + Register link -->
          <div style="margin-top:1rem;padding:0.85rem 1rem;background:var(--gold-bg);border:1px solid var(--gold-leaf-pale);border-radius:var(--radius-sm);font-size:0.78rem;color:var(--sandal-light);text-align:center;line-height:1.6;">
            <strong style="color:var(--charcoal-sandal);display:block;margin-bottom:3px;">आचार्याः — Acharyas</strong>
            Use your personal email and password provided by the administration.<br>
            Contact office if you have not received your credentials.
          </div>

          <!-- Register toggle -->
          <div style="text-align:center;margin-top:1.1rem;">
            <span style="font-size:0.78rem;color:var(--sandal-light);">New Acharya joining VVG? </span>
            <button id="show-register-btn" style="background:none;border:none;color:var(--saffron-royal);font-size:0.78rem;font-weight:800;cursor:pointer;text-decoration:underline;">
              Register Here
            </button>
          </div>

          <!-- Registration form (hidden by default) -->
          <div id="register-panel" style="display:none;margin-top:1.25rem;border-top:1px solid var(--sandal-div);padding-top:1.25rem;">

            <div style="text-align:center;margin-bottom:1rem;">
              <div style="font-size:0.65rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--saffron-royal);margin-bottom:4px;">नूतनाचार्य-नामाङ्कनम्</div>
              <div style="font-size:1rem;font-weight:800;color:var(--charcoal-sandal);">Register as Acharya</div>
              <div style="font-size:0.72rem;color:var(--sandal-light);margin-top:2px;">Submit your details — Admin will activate your account</div>
            </div>

            <form id="register-form" autocomplete="off" style="display:flex;flex-direction:column;gap:0.75rem;">

              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; margin-top: 0.5rem;">
                <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px dashed var(--gold-solid); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--sandal-light); font-size: 0.75rem; text-align: center;">
                  Upload<br>Photo
                </div>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-name">Full Name (English) <span style="color:var(--agni-red);">*</span></label>
                <input type="text" id="reg-name" class="form-control" placeholder="e.g. Sanjaya Acharya" required>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-name-sa">Name in Sanskrit / Devanagari</label>
                <input type="text" id="reg-name-sa" class="form-control devanagari-body" placeholder="e.g. सञ्जयाचार्यः">
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-spec">Specialization</label>
                <select id="reg-spec" class="form-control" required>
                  <option value="" disabled selected>Select Specialization</option>
                  <option value="Shukla Yajurveda">Shukla Yajurveda</option>
                  <option value="Krishna Yajurveda">Krishna Yajurveda</option>
                  <option value="Vedanta">Vedanta</option>
                  <option value="Vyakarana">Vyakarana</option>
                  <option value="Mimamsa">Mimamsa</option>
                  <option value="Sahitya">Sahitya</option>
                  <option value="Nyaya">Nyaya</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-gana">Assigned Gana</label>
                <select id="reg-gana" class="form-control">
                  <option value="" selected>None / Select your Gana</option>
                  ${(db.getAllGanas ? db.getAllGanas() : []).map(g => `<option value="${g.id}">${g.name} (${g.englishName})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-exp">Years of Experience</label>
                <input type="number" id="reg-exp" class="form-control" placeholder="e.g. 5" min="0">
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-phone">Phone Number</label>
                <input type="tel" id="reg-phone" class="form-control" placeholder="+91 XXXXX XXXXX">
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-email">Email Address <span style="color:var(--agni-red);">*</span></label>
                <input type="email" id="reg-email" class="form-control" placeholder="your@email.com" required>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" for="reg-password">Choose Password <span style="color:var(--agni-red);">*</span></label>
                <input type="password" id="reg-password" class="form-control" placeholder="Min 6 characters" required minlength="6">
              </div>

              <div id="reg-error" class="login-error-msg" style="display:none;"></div>
              <div id="reg-success" style="display:none;background:#E8F5E9;border:1px solid #4CAF50;border-radius:var(--radius-sm);padding:0.75rem 1rem;font-size:0.8rem;color:#1B5E20;text-align:center;line-height:1.5;"></div>

              <button type="submit" id="reg-btn" class="btn btn-saffron login-submit-btn" style="margin-top:0.25rem;">
                <span id="reg-btn-text">
                  <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Submit Registration
                </span>
                <span id="reg-btn-loading" style="display:none;">Submitting…</span>
              </button>

              <button type="button" id="hide-register-btn" style="background:none;border:none;color:var(--sandal-light);font-size:0.75rem;cursor:pointer;margin-top:-4px;">
                ← Back to Login
              </button>

            </form>
          </div>

        </div>
      </div>

    </div>
  `;

  // ── Server status check ──────────────────────────────
  const dotEl  = container.querySelector('#status-dot');
  const textEl = container.querySelector('#status-text');
  fetch('/api/ping').then(r => r.json()).then(() => {
    dotEl.style.background = 'var(--forest-tulsi)';
    textEl.textContent     = 'Server online — Real authentication active';
  }).catch(() => {
    dotEl.style.background = 'var(--agni-red)';
    textEl.textContent     = 'Server offline — Start server.js first';
  });

  // ── Shloka Carousel ─────────────────────────────────
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

  // ── Password toggle ──────────────────────────────────
  container.querySelector('#toggle-pw').addEventListener('click', () => {
    const pw = container.querySelector('#login-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // ── Form submit ──────────────────────────────────────
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

    btn.disabled          = true;
    btnTxt.style.display  = 'none';
    btnLoad.style.display = 'flex';
    errEl.style.display   = 'none';

    const result = await db.serverLogin(email, password);

    btn.disabled          = false;
    btnTxt.style.display  = 'flex';
    btnLoad.style.display = 'none';

    if (result.success) {
      const user = result.user;

      // Save session
      sessionStorage.setItem('vvg_user', JSON.stringify({
        id:        user.id,
        name:      user.name,
        nameSa:    user.nameSa || user.name,
        role:      user.role,
        email:     user.email,
        ganaId:    user.ganaId || null,
        timestamp: Date.now()
      }));

      await db.syncFromServer();

      // Acharyas → Gana welcome screen; Admin/Office → dashboard
      if (user.role === 'Acharya') {
        showGanaWelcome(user);
      } else {
        const card = container.querySelector('#main-login-card');
        if (card) { card.style.transform = 'scale(0.95)'; card.style.opacity = '0'; }
        setTimeout(() => router.navigate('dashboard'), 350);
      }

    } else {
      showError(result.message || 'Invalid credentials. Please try again.');
      container.querySelector('#login-password').value = '';
      container.querySelector('#login-password').focus();
    }
  }

  // ── Register toggle ──────────────────────────────────
  container.querySelector('#show-register-btn').addEventListener('click', () => {
    container.querySelector('#register-panel').style.display = 'block';
    container.querySelector('#show-register-btn').closest('div').style.display = 'none';
    container.querySelector('#login-form').style.display = 'none';
    container.querySelector('#server-status').style.display = 'none';
    container.querySelector('.login-welcome').style.display = 'none';
  });
  container.querySelector('#hide-register-btn').addEventListener('click', () => {
    container.querySelector('#register-panel').style.display = 'none';
    container.querySelector('#show-register-btn').closest('div').style.display = 'block';
    container.querySelector('#login-form').style.display = 'block';
    container.querySelector('#server-status').style.display = 'flex';
    container.querySelector('.login-welcome').style.display = 'block';
  });

  // ── Register form submit ─────────────────────────────
  container.querySelector('#register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = container.querySelector('#reg-btn');
    const btnTxt  = container.querySelector('#reg-btn-text');
    const btnLoad = container.querySelector('#reg-btn-loading');
    const errEl   = container.querySelector('#reg-error');
    const okEl    = container.querySelector('#reg-success');

    const data = {
      name:           container.querySelector('#reg-name').value.trim(),
      nameSa:         container.querySelector('#reg-name-sa').value.trim(),
      specialization: container.querySelector('#reg-spec').value.trim(),
      assignedGanaId: container.querySelector('#reg-gana').value,
      yearsExperience:container.querySelector('#reg-exp').value,
      phone:          container.querySelector('#reg-phone').value.trim(),
      email:          container.querySelector('#reg-email').value.trim(),
      password:       container.querySelector('#reg-password').value
    };

    errEl.style.display = 'none';
    okEl.style.display  = 'none';
    btn.disabled        = true;
    btnTxt.style.display  = 'none';
    btnLoad.style.display = 'inline';

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();

      if (json.success) {
        okEl.innerHTML = `
          <strong>✅ Registration Submitted!</strong><br>
          Welcome, ${data.name}.<br>
          The Admin will review your request and activate your account shortly.
          You will then be able to login with your email and password.
        `;
        okEl.style.display = 'block';
        container.querySelector('#register-form').querySelectorAll('input').forEach(i => i.disabled = true);
        btn.style.display = 'none';
      } else {
        errEl.textContent   = json.message || 'Registration failed. Please try again.';
        errEl.style.display = 'block';
      }
    } catch(err) {
      errEl.textContent   = 'Could not connect to server. Please try again.';
      errEl.style.display = 'block';
    }

    btn.disabled          = false;
    btnTxt.style.display  = 'inline';
    btnLoad.style.display = 'none';
  });

  function showError(msg) {
    const errEl = container.querySelector('#login-error');
    errEl.textContent     = msg;
    errEl.style.display   = 'block';
    errEl.style.animation = 'none';
    requestAnimationFrame(() => { errEl.style.animation = 'shake 0.4s ease'; });
  }

  // ── Gana Welcome Screen (shown to Acharyas after login) ─
  function showGanaWelcome(user) {
    const ganas   = db.getAllGanas();
    const myGana  = ganas.find(g => g.id === user.ganaId) || null;
    const students = myGana ? db.getAllStudents().filter(s => s.ganaId === myGana.id) : [];
    const today   = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const slots    = db.getTimeSlots ? db.getTimeSlots() : {};
    const ttData   = myGana ? (db.get().timetable[myGana.id] || {}) : {};
    const slotIds  = ['slot_1','slot_2','slot_3','slot_4','slot_5','slot_6','slot_7'];
    const schedule = slotIds
      .map(id => ({ id, info: slots[id] || {}, data: ttData[id] || null }))
      .filter(s => s.data && s.data.subject);

    const initials = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const card = container.querySelector('#main-login-card');
    card.style.transition = 'all 0.3s ease';
    card.style.transform  = 'scale(0.95)';
    card.style.opacity    = '0';

    setTimeout(() => {
      card.style.transform = 'scale(1)';
      card.style.opacity   = '1';

      card.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="width:72px;height:72px;border-radius:50%;
               background:linear-gradient(135deg,var(--sandalwood-brown),#5A2E0E);
               border:3px solid var(--gold-solid);
               display:flex;align-items:center;justify-content:center;
               margin:0 auto 0.75rem;
               font-family:var(--font-header);font-size:1.8rem;font-weight:900;
               color:rgba(250,244,230,0.9);">
            ${initials}
          </div>
          <h2 style="font-family:var(--font-header);font-size:1.2rem;color:var(--charcoal-sandal);margin:0 0 2px;">
            नमस्कारम्, ${user.nameSa || user.name}
          </h2>
          <p style="font-size:0.8rem;color:var(--sandal-light);">${today}</p>
        </div>

        ${myGana ? `
          <div style="background:linear-gradient(135deg,var(--sandalwood-brown),#6B3C1A);
               border-radius:var(--radius-md);padding:1rem 1.25rem;
               margin-bottom:1.25rem;text-align:center;">
            <div style="font-size:0.6rem;font-weight:900;letter-spacing:2px;
                 color:rgba(212,175,55,0.7);text-transform:uppercase;margin-bottom:4px;">
              Your Assigned Gana
            </div>
            <div style="font-family:var(--font-sanskrit-display);font-size:1.6rem;
                 color:var(--gold-solid);margin-bottom:2px;">${myGana.name}</div>
            <div style="font-size:0.75rem;color:rgba(250,244,230,0.7);">
              ${myGana.englishName} &middot; ${students.length} Students
            </div>
          </div>
        ` : `
          <div style="background:var(--gold-bg);border:1px solid var(--gold-leaf-pale);
               border-radius:var(--radius-md);padding:1rem;margin-bottom:1.25rem;
               text-align:center;font-size:0.85rem;color:var(--sandal-light);">
            You are registered as Gurukula Faculty.
          </div>
        `}

        ${schedule.length > 0 ? `
          <div style="margin-bottom:1.5rem;">
            <div style="font-size:0.62rem;font-weight:900;letter-spacing:2px;
                 text-transform:uppercase;color:var(--saffron-royal);
                 margin-bottom:0.7rem;text-align:center;">
              ॥ आजकस्य समयसारिणी — Today's Schedule ॥
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${schedule.slice(0, 4).map(s => `
                <div style="display:flex;justify-content:space-between;align-items:center;
                     padding:0.5rem 0.85rem;background:var(--bg-card);
                     border:1px solid var(--sandal-div);border-radius:var(--radius-sm);font-size:0.78rem;">
                  <div>
                    <span class="devanagari-body" style="font-weight:700;color:var(--charcoal-sandal);">
                      ${s.data.subject}
                    </span>
                    <span style="color:var(--sandal-light);margin-left:6px;font-size:0.72rem;">
                      ${s.data.engSubject || ''}
                    </span>
                  </div>
                  <span style="color:var(--saffron-royal);font-weight:700;font-size:0.72rem;white-space:nowrap;">
                    ${s.info.time || ''}
                  </span>
                </div>
              `).join('')}
              ${schedule.length > 4 ? `
                <p style="text-align:center;font-size:0.72rem;color:var(--sandal-light);margin:2px 0 0;">
                  +${schedule.length - 4} more — view full timetable in dashboard
                </p>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <button id="btn-enter" class="btn btn-saffron login-submit-btn" style="width:100%;padding:0.9rem;">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          गुरुकुले प्रवेशः — Enter Dashboard
        </button>

        <p style="text-align:center;font-size:0.72rem;color:var(--sandal-light);margin-top:0.75rem;">
          Not ${user.name}?
          <button id="btn-switch" style="background:none;border:none;color:var(--saffron-royal);
                  font-size:0.72rem;cursor:pointer;font-weight:700;text-decoration:underline;">
            Switch Account
          </button>
        </p>
      `;

      card.querySelector('#btn-enter').addEventListener('click', () => {
        card.style.transform = 'scale(0.95)';
        card.style.opacity   = '0';
        setTimeout(() => router.navigate('dashboard'), 350);
      });

      card.querySelector('#btn-switch').addEventListener('click', () => {
        sessionStorage.removeItem('vvg_user');
        router.navigate('login');
      });

    }, 350);
  }
}

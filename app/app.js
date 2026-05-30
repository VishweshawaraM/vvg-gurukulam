/* 
  Veda Vijnana Gurukulam Management System
  Primary App Controller & Layout Generator — v2.1
  Full Production Build: All 8 Ganas | Announcements | Sheets
*/

import { router } from './router.js';
import { db } from './database.js';

import { renderLogin }         from './pages/login.js';
import { renderDashboard }     from './pages/dashboard.js';
import { renderStudents }      from './pages/students.js';
import { renderGanas }         from './pages/ganas.js';
import { renderAttendance }    from './pages/attendance.js';
import { renderTimetable }     from './pages/timetable.js';
import { renderAcharyas }      from './pages/acharyas.js';
import { renderAnnouncements } from './pages/announcements.js';
import { renderDocuments }     from './pages/documents.js';

const pageRenderers = {
  'login':         renderLogin,
  'dashboard':     renderDashboard,
  'students':      renderStudents,
  'ganas':         renderGanas,
  'attendance':    renderAttendance,
  'timetable':     renderTimetable,
  'acharyas':      renderAcharyas,
  'announcements': renderAnnouncements,
  'documents':     renderDocuments
};

// Traditional Vaidika Panchangam Generator
export function getVaidikaPanchangam() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  const masasList = [
    { sa: 'चैत्रः', en: 'Chaitra' }, { sa: 'वैशाखः', en: 'Vaishakha' },
    { sa: 'ज्येष्ठः', en: 'Jyeshtha' }, { sa: 'आषाढः', en: 'Ashadha' },
    { sa: 'श्रावणः', en: 'Shravana' }, { sa: 'भाद्रपदः', en: 'Bhadrapada' },
    { sa: 'आश्विनः', en: 'Ashvina' }, { sa: 'कार्तिकः', en: 'Kartika' },
    { sa: 'मार्गशीर्षः', en: 'Margashirsha' }, { sa: 'पौषः', en: 'Pausha' },
    { sa: 'माघः', en: 'Magha' }, { sa: 'फाल्गुनः', en: 'Phalguna' }
  ];

  const tithisList = [
    { sa: 'प्रथमा', en: 'Prathama' }, { sa: 'द्वितीया', en: 'Dvitiya' },
    { sa: 'तृतीया', en: 'Tritiya' }, { sa: 'चतुर्थी', en: 'Chaturthi' },
    { sa: 'पञ्चमी', en: 'Panchami' }, { sa: 'षष्ठी', en: 'Shashthi' },
    { sa: 'सप्तमी', en: 'Saptami' }, { sa: 'अष्टमी', en: 'Ashtami' },
    { sa: 'नवमी', en: 'Navami' }, { sa: 'दशमी', en: 'Dashami' },
    { sa: 'एकादशी', en: 'Ekadashi' }, { sa: 'द्वादशी', en: 'Dvadashi' },
    { sa: 'त्रयोदशी', en: 'Trayodashi' }, { sa: 'चतुर्दशी', en: 'Chaturdashi' },
    { sa: 'पूर्णिमा', en: 'Purnima' }
  ];

  const nakshatrasList = [
    { sa: 'अश्विनी', en: 'Ashwini' }, { sa: 'भरणी', en: 'Bharani' },
    { sa: 'कृत्तिका', en: 'Krittika' }, { sa: 'रोहिणी', en: 'Rohini' },
    { sa: 'मृगशिरा', en: 'Mrigashira' }, { sa: 'आर्द्रा', en: 'Ardra' },
    { sa: 'पुनर्वसु', en: 'Punarvasu' }, { sa: 'पुष्यः', en: 'Pushya' },
    { sa: 'अश्लेषा', en: 'Ashlesha' }, { sa: 'मघा', en: 'Magha' },
    { sa: 'पूर्वाफाल्गुनी', en: 'Purva Phalguni' }, { sa: 'उत्तराफाल्गुनी', en: 'Uttara Phalguni' },
    { sa: 'हस्तः', en: 'Hasta' }, { sa: 'चित्रा', en: 'Chitra' },
    { sa: 'स्वाती', en: 'Swati' }, { sa: 'विशाखा', en: 'Vishakha' },
    { sa: 'अनुराधा', en: 'Anuradha' }, { sa: 'ज्येष्ठा', en: 'Jyeshtha' },
    { sa: 'मूलम्', en: 'Mula' }, { sa: 'पूर्वाषाढा', en: 'Purva Ashadha' },
    { sa: 'उत्तराषाढा', en: 'Uttara Ashadha' }, { sa: 'श्रवणः', en: 'Shravana' },
    { sa: 'धनिष्ठा', en: 'Dhanishta' }, { sa: 'शतभिषा', en: 'Shatabhisha' },
    { sa: 'पूर्वाभाद्रपद', en: 'Purva Bhadrapada' }, { sa: 'उत्तराभाद्रपद', en: 'Uttara Bhadrapada' },
    { sa: 'रेवती', en: 'Revati' }
  ];

  const masaIndex = Math.floor((dayOfYear % 360) / 30);
  const tithiIndex = dayOfYear % 15;
  const paksha = (dayOfYear % 30) < 15
    ? { sa: 'शुक्लपक्षः', en: 'Shukla Paksha' }
    : { sa: 'कृष्णपक्षः', en: 'Krishna Paksha' };
  const nakshatraIndex = dayOfYear % 27;
  const varaNames = ['रविवासरः', 'सोमवासरः', 'मङ्गलवासरः', 'बुधवासरः', 'गुरुवासरः', 'शुक्रवासरः', 'शनिवासरः'];
  const vara = varaNames[new Date().getDay()];

  return {
    masa: masasList[masaIndex],
    tithi: tithisList[tithiIndex === 0 ? 14 : tithiIndex - 1],
    paksha,
    nakshatra: nakshatrasList[nakshatraIndex],
    vara,
    samvatsara: { sa: 'काल्युगवर्षम् ५१२७ / वैक्रमी २०८३', en: 'Kalyuga 5127 / Vikrami 2083' }
  };
}

function buildSidebarHTML(user, panchangam, isDocAllowed, unreadAnnCount) {
  const userAvatarText = user ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'आ';
  const userRoleSanskrit = getRoleSanskrit(user ? user.role : 'Admin');

  const navItems = [
    {
      group: 'प्रशासनिकम् (General)',
      items: [
        { hash: 'dashboard', icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`, label: 'मुख्यपटलम्', tag: 'पटलम्', roles: 'all' },
        { hash: 'students', icon: `<path d="M2 17V3a1 1 0 0 1 1-1h16a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a1 1 0 0 1-1-1zM2 14h18M18 2v18M6 6h6M6 10h4"/>`, label: 'छात्रसूची', tag: 'छात्राः', roles: 'all' },
        { hash: 'ganas', icon: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><line x1="8" y1="20" x2="16" y2="20"/>`, label: 'गणप्रबन्धनम्', tag: 'गणाः', roles: 'all' }
      ]
    },
    {
      group: 'अकादमिकम् (Academic)',
      items: [
        { hash: 'attendance', icon: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>`, label: 'उपस्थितिः', tag: 'उपस्थिति', roles: 'all' },
        { hash: 'timetable', icon: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/><circle cx="12" cy="12" r="3"/>`, label: 'समयसारिणी', tag: 'सारिणी', roles: 'all' },
        { hash: 'acharyas', icon: `<path d="M12 22v-6M12 16c2.5 0 5-2 5-5s-2-5-5-5-5 2-5 5 2.5 5 5 5zM12 6C8 6 5 9 5 12c0 2 1.5 3 1.5 3S8 11 12 11s5.5 4 5.5 4 1.5-1 1.5-3c0-3-3-6-7-6z"/>`, label: 'आचार्याः', tag: 'गुरवः', roles: 'all' }
      ]
    },
    {
      group: 'संचारः (Communication)',
      items: [
        { hash: 'announcements', icon: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`, label: 'सूचनाकेन्द्रम्', tag: 'सूचना', roles: 'all', badge: unreadAnnCount > 0 ? unreadAnnCount : null }
      ]
    }
  ];

  // Admin-only items
  if (isDocAllowed) {
    navItems.push({
      group: 'लेख्याधारः (Documentation)',
      items: [
        { hash: 'documents', icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`, label: 'लेख्याधारः', tag: 'लेख्याः', roles: 'admin' }
      ]
    });
  }

  const navHTML = navItems.map(group => `
    <div class="nav-group-title">${group.group}</div>
    ${group.items.map(item => `
      <a href="#${item.hash}" class="nav-link" data-hash="${item.hash}">
        <svg viewBox="0 0 24 24">${item.icon}</svg>
        <span>${item.label}</span>
        ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : `<span class="nav-sanskrit-tag">${item.tag}</span>`}
      </a>
    `).join('')}
  `).join('');

  return `
    <div class="app-shell">
      <!-- ─── Sidebar ─── -->
      <aside class="app-sidebar" id="app-sidebar">
        <!-- Brand -->
        <div class="sidebar-brand">
          <img src="/assets/vvg_logo.png" alt="VVG Logo" class="sidebar-vvg-logo">
          <div class="sidebar-brand-text">
            <h1>वेदविज्ञानगुरुकुलम्</h1>
            <span>VVG Edu-Sys 2026–27</span>
          </div>
        </div>

        <!-- User Info -->
        <div class="sidebar-user">
          <div class="user-avatar">${userAvatarText}</div>
          <div class="user-info">
            <span class="user-name">${user ? user.name : 'Scholar'}</span>
            <span class="user-role-badge">
              <span style="font-size: 0.5rem; color: var(--gold-solid);">♦</span>
              ${userRoleSanskrit}
            </span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">${navHTML}</nav>

        <!-- Panchangam Widget -->
        <div class="panchangam-widget">
          <span class="widget-title">॥ वैदिकपञ्चाङ्गम् ॥</span>
          <div class="widget-body">
            <span class="masa">${panchangam.masa.sa} ${panchangam.paksha.sa}</span>
            <span>${panchangam.vara}</span>
            <span>तिथिः — ${panchangam.tithi.sa}</span>
            <span>नक्षत्रम् — ${panchangam.nakshatra.sa}</span>
            <div class="widget-era">${panchangam.samvatsara.sa}</div>
          </div>
        </div>

        <!-- Logout -->
        <div class="sidebar-footer">
          <button class="btn-logout" id="logout-btn">
            <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:2.2;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>प्रस्थानम् (Logout)</span>
          </button>
        </div>
      </aside>

      <!-- ─── Main Container ─── -->
      <div class="app-container">
        <!-- Top Header -->
        <header class="app-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="header-toggle-btn" id="mobile-toggle-btn">
              <svg viewBox="0 0 24 24" style="width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:2.2;">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span class="header-sanskrit-greeting" id="sanskrit-greeting-txt">
              <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:none; stroke:currentColor; stroke-width:2;">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <span>हरिः ओम्</span>
            </span>
          </div>

          <div class="header-meta">
            <div class="header-date">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span id="current-calendar-date">चैत्र-शुक्ल-पक्षः</span>
            </div>
            <button class="header-bell-btn" id="header-bell-btn" title="View Announcements">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              ${unreadAnnCount > 0 ? `<span class="header-bell-dot"></span>` : ''}
            </button>
          </div>
        </header>

        <!-- Viewport -->
        <main class="app-viewport" id="app-viewport"></main>
      </div>
    </div>
  `;
}

function getRoleSanskrit(role) {
  switch (role) {
    case 'Admin':        return 'प्रशासकः (Admin)';
    case 'Office Staff': return 'कार्यालयकर्मा (Staff)';
    case 'Acharya':      return 'आचार्यः (Acharya)';
    default:             return 'अतिथिः (Guest)';
  }
}

export const app = {
  async init() {
    console.log('VVG Edu-Sys v3.0 — Starting up...');
    db.get(); // Ensure local DB is initialized

    // Try to sync latest data from server (shared across all devices)
    await db.syncFromServer();

    router.init(this);

    const splash = document.getElementById('splash-loader');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        setTimeout(() => splash.remove(), 500);
      }, 800);
    }
  },

  renderLoginView() {
    const mountNode = document.getElementById('app-mount');
    mountNode.innerHTML = '<div id="login-root"></div>';
    renderLogin(document.getElementById('login-root'), this);
  },

  renderAppShell(activeHash) {
    const mountNode = document.getElementById('app-mount');
    let shell = document.querySelector('.app-shell');

    if (!shell) {
      const user = router.getUserSession();
      const panchangam = getVaidikaPanchangam();
      const isDocAllowed = user && ['Admin', 'Office Staff'].includes(user.role);

      // Count unread announcements
      const announcements = db.getAllAnnouncements();
      const unreadAnnCount = announcements.filter(a => !a.readBy.includes(user ? user.id : 'guest')).length;

      mountNode.innerHTML = buildSidebarHTML(user, panchangam, isDocAllowed, unreadAnnCount);

      // Bind events
      document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

      const mobileToggle = document.getElementById('mobile-toggle-btn');
      if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
          document.getElementById('app-sidebar').classList.toggle('mobile-open');
        });
      }

      // Bell button → navigate to announcements
      const bellBtn = document.getElementById('header-bell-btn');
      if (bellBtn) {
        bellBtn.addEventListener('click', () => router.navigate('announcements'));
      }

      this.updateHeaderDynamicDetails(user);
    }

    // Loading indicator
    const viewport = document.getElementById('app-viewport');
    viewport.innerHTML = `<div class="loading-ring" style="margin: 60px auto; display: block;"><div></div><div></div><div></div><div></div></div>`;

    // Close sidebar on mobile nav click
    const sidebar = document.querySelector('.app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Set active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-hash') === activeHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Render page
    const renderFn = pageRenderers[activeHash];
    if (renderFn) {
      try {
        viewport.innerHTML = '';
        renderFn(viewport, this);
      } catch (err) {
        console.error(`Render Failure on page "${activeHash}":`, err);
        viewport.innerHTML = `
          <div class="gurukula-card framed" style="border-color: var(--agni-red); text-align: center; padding: 2.5rem;">
            <h3 style="color: var(--agni-red); font-family: var(--font-header);">॥ त्रुटिः सञ्जाता ॥</h3>
            <p style="margin-top: 1rem; color: var(--sandal-light); font-size: 0.9rem;">An error occurred while loading this page: ${err.message}</p>
            <button class="btn btn-saffron" style="margin-top: 1.5rem;" onclick="window.location.reload()">Reload Application</button>
          </div>
        `;
      }
    }
  },

  updateHeaderDynamicDetails(user) {
    const greetingEl = document.getElementById('sanskrit-greeting-txt');
    const dateEl = document.getElementById('current-calendar-date');
    const panchang = getVaidikaPanchangam();

    if (greetingEl && user) {
      const hrs = new Date().getHours();
      let greeting = 'हरिः ओम्';
      if (hrs >= 4 && hrs < 12)       greeting = `शुभप्रभातम्, ${user.name.split(' ')[0]}`;
      else if (hrs >= 12 && hrs < 16)  greeting = `शुभमध्याह्नम्, ${user.name.split(' ')[0]}`;
      else if (hrs >= 16 && hrs < 20)  greeting = `शुभसन्ध्या, ${user.name.split(' ')[0]}`;
      else                              greeting = `शुभरात्रिः, ${user.name.split(' ')[0]}`;

      greetingEl.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2; flex-shrink:0;">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        </svg>
        <span>${greeting}</span>
      `;
    }

    if (dateEl) {
      const today = new Date();
      const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      dateEl.textContent = `${today.toLocaleDateString('en-IN', opts)} | ${panchang.masa.en}`;
    }
  },

  handleLogout() {
    if (confirm('∥ निर्गमनम् ∥\nAre you sure you want to log out from the VVG Portal?')) {
      // Notify server to invalidate session
      const token = sessionStorage.getItem('vvg_token');
      if (token) {
        fetch('/api/auth/logout', { method: 'POST', headers: { 'X-Session-Token': token } }).catch(() => {});
      }
      sessionStorage.removeItem('vvg_user');
      sessionStorage.removeItem('vvg_token');
      sessionStorage.removeItem('vvg_session');
      // Reset app shell for fresh login
      const mountNode = document.getElementById('app-mount');
      if (mountNode) {
        const existingShell = mountNode.querySelector('.app-shell');
        if (existingShell) existingShell.remove();
      }
      window.location.hash = '#login';
    }
  }
};

window.addEventListener('DOMContentLoaded', () => app.init());

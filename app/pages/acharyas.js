/* 
  Veda Vijnana Gurukulam Management System
  Acharyas Directory Page — v3.0 Fixed & Live
*/

import { db } from '../database.js';

export function renderAcharyas(container, appInstance) {
  const acharyas  = db.getAllAcharyas();
  const ganas     = db.getAllGanas();
  const timetable = db.getDailyTimetable ? db.getDailyTimetable() : {};
  const timeSlots = db.get().timeSlots || {};

  // Build a map: acharyaTeacherName → list of classes across all ganas
  function getAcharyaClasses(acharya) {
    const classes = [];
    const data    = db.get();
    const tt      = data.timetable || {};
    const slots   = data.timeSlots || {};

    Object.entries(tt).forEach(([ganaId, ganaSlots]) => {
      const gana = ganas.find(g => g.id === ganaId);
      Object.entries(ganaSlots).forEach(([slotId, slotData]) => {
        if (slotData && slotData.teacher && slotData.subject) {
          // Match on teacherEn name or teacher Sanskrit name
          const teacherMatch = slotData.teacherEn?.toLowerCase().includes(
            acharya.name.split(' ').pop().toLowerCase()
          ) || slotData.teacher?.includes(acharya.sanskritName.split('आचार्य').pop().trim());

          if (teacherMatch) {
            const slotInfo = slots[slotId] || {};
            classes.push({
              time:       slotInfo.time    || slotId,
              label:      slotInfo.labelEn || slotId,
              subject:    slotData.subject,
              engSubject: slotData.engSubject,
              ganaName:   gana ? gana.name : ganaId,
              ganaEn:     gana ? gana.englishName : ''
            });
          }
        }
      });
    });
    return classes;
  }

  function drawGrid() {
    container.innerHTML = `
      <!-- Page Hero -->
      <div class="page-hero">
        <div class="page-hero-text">
          <h2 class="page-hero-title">आचार्यविवरणम्</h2>
          <span class="page-hero-subtitle">॥ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ॥</span>
        </div>
        <div class="page-hero-meta">
          <span class="academic-year-tag">${acharyas.length} Acharyas</span>
        </div>
      </div>

      <!-- Acharyas Cards Grid -->
      <div class="gana-cards-grid">
        ${acharyas.map(a => {
          const mainGana  = ganas.find(g => g.id === a.assignedGanaId || g.id === a.assignedGana);
          const ganaLabel = mainGana ? `${mainGana.name} — ${mainGana.englishName}` : 'Gurukula Faculty';
          const initials  = a.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

          return `
            <div class="gurukula-card framed acharya-card" style="display:flex;flex-direction:column;justify-content:space-between;min-height:220px;">
              <div>
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:0.85rem;border-bottom:1px solid rgba(196,164,104,0.3);padding-bottom:0.75rem;">
                  <div class="user-avatar" style="width:46px;height:46px;font-size:1.1rem;background:var(--sandalwood-brown);color:#FAF7F0;flex-shrink:0;">
                    ${initials}
                  </div>
                  <div>
                    <h3 style="font-family:var(--font-header);font-size:1rem;color:var(--charcoal-sandal);margin-bottom:2px;">${a.name}</h3>
                    <span class="devanagari-body" style="color:var(--saffron-royal);font-size:0.85rem;font-weight:700;">${a.sanskritName}</span>
                  </div>
                </div>

                <div style="font-size:0.8rem;display:flex;flex-direction:column;gap:5px;">
                  <div style="display:flex;justify-content:space-between;gap:8px;">
                    <span style="color:var(--sandal-light);font-weight:700;white-space:nowrap;">शाखा:</span>
                    <span style="color:var(--charcoal-sandal);text-align:right;line-height:1.3;">${a.specialization}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;gap:8px;">
                    <span style="color:var(--sandal-light);font-weight:700;white-space:nowrap;">गणः:</span>
                    <span class="badge badge-saffron" style="font-size:0.7rem;">${ganaLabel}</span>
                  </div>
                  ${a.contact ? `<div style="display:flex;justify-content:space-between;gap:8px;">
                    <span style="color:var(--sandal-light);font-weight:700;">सम्पर्कः:</span>
                    <span style="color:var(--charcoal-sandal);">${a.contact}</span>
                  </div>` : ''}
                </div>
              </div>

              <button class="btn btn-gold btn-sm btn-view-acharya-details" data-id="${a.id}"
                      style="margin-top:1rem;width:100%;">
                सविस्तरं विवरणम् — View Profile &amp; Schedule
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Drawer & Backdrop -->
      <div class="drawer-backdrop" id="ach-drawer-backdrop"></div>
      <div class="gurukula-drawer" id="ach-drawer"></div>
    `;

    // Bind card buttons
    container.querySelectorAll('.btn-view-acharya-details').forEach(btn => {
      btn.addEventListener('click', () => openAcharyaDrawer(btn.getAttribute('data-id')));
    });

    // Wire drawer close/backdrop — done after HTML is in DOM
    const backdrop = container.querySelector('#ach-drawer-backdrop');
    backdrop.addEventListener('click', closeDrawer);
  }

  function openAcharyaDrawer(id) {
    const acharya  = acharyas.find(a => a.id === id);
    if (!acharya) return;

    const drawer   = container.querySelector('#ach-drawer');
    const backdrop = container.querySelector('#ach-drawer-backdrop');
    const mainGana = ganas.find(g => g.id === acharya.assignedGanaId || g.id === acharya.assignedGana);
    const ganaLabel = mainGana ? `${mainGana.name} (${mainGana.englishName})` : 'Gurukula Faculty';
    const classes  = getAcharyaClasses(acharya);
    const initials = acharya.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>आचार्यविवरणपत्रिका</h2>
          <span>Acharya Scholarly Profile</span>
        </div>
        <button class="drawer-close-btn btn-close-ach">
          <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">

        <!-- Profile Header -->
        <div class="student-detail-profile-wrapper">
          <div class="user-avatar" style="width:64px;height:64px;font-size:1.5rem;background:var(--sandalwood-brown);color:#FAF7F0;border:3px solid var(--gold-solid);">
            ${initials}
          </div>
          <div class="student-profile-title">
            <h3 style="font-family:var(--font-header);font-size:1.3rem;color:var(--charcoal-sandal);">${acharya.name}</h3>
            <p class="devanagari-display" style="color:var(--saffron-royal);font-size:1rem;margin-top:2px;">${acharya.sanskritName}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="student-detail-grid" style="margin-bottom:1.5rem;">
          <div class="student-info-item" style="grid-column:span 2;">
            <span class="student-info-label">शास्त्रविशेषता (Specialization)</span>
            <span class="student-info-value" style="color:var(--saffron-royal);font-weight:700;">${acharya.specialization}</span>
          </div>
          <div class="student-info-item">
            <span class="student-info-label">सम्बद्धगणः (Assigned Gana)</span>
            <span class="student-info-value">${ganaLabel}</span>
          </div>
          ${acharya.contact ? `
          <div class="student-info-item">
            <span class="student-info-label">सम्पर्कसङ्ख्या (Contact)</span>
            <span class="student-info-value">${acharya.contact}</span>
          </div>` : ''}
          ${acharya.email ? `
          <div class="student-info-item" style="grid-column:span 2;">
            <span class="student-info-label">विद्युत्पत्रम् (Email)</span>
            <span class="student-info-value" style="font-size:0.85rem;font-weight:normal;">${acharya.email}</span>
          </div>` : ''}
        </div>

        <!-- Teaching Schedule -->
        <div class="gurukula-card" style="padding:1rem;border-color:var(--gold-solid);background:var(--gold-light);">
          <div style="font-size:0.65rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--saffron-royal);margin-bottom:0.85rem;text-align:center;">
            ॥ अध्यापन-समयसारिणी (Daily Teaching Schedule) ॥
          </div>
          ${classes.length === 0
            ? `<p style="font-size:0.82rem;font-style:italic;color:var(--sandal-light);text-align:center;padding:1rem 0;">
                Schedule details will appear here once timetable is configured.
               </p>`
            : `<div style="display:flex;flex-direction:column;gap:8px;">
                ${classes.map(c => `
                  <div style="padding:0.65rem 0.85rem;background:var(--bg-card);border:1px solid rgba(196,164,104,0.25);border-radius:var(--radius-sm);font-size:0.8rem;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                      <span style="font-weight:800;color:var(--charcoal-sandal);">${c.label} (${c.time})</span>
                      <span class="badge badge-saffron" style="font-size:0.65rem;">${c.ganaName}</span>
                    </div>
                    <div style="color:var(--sandal-light);">
                      <span class="devanagari-body" style="font-size:0.85rem;font-weight:700;color:var(--charcoal-sandal);">${c.subject}</span>
                      <span style="margin:0 4px;">·</span>
                      <span>${c.engSubject}</span>
                    </div>
                  </div>
                `).join('')}
               </div>`
          }
        </div>

      </div>
      <div class="drawer-footer">
        <button class="btn btn-outline btn-close-ach">पिधानम् (Close)</button>
      </div>
    `;

    drawer.classList.add('open');
    backdrop.classList.add('active');

    drawer.querySelectorAll('.btn-close-ach').forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });
  }

  function closeDrawer() {
    const drawer   = container.querySelector('#ach-drawer');
    const backdrop = container.querySelector('#ach-drawer-backdrop');
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    setTimeout(() => { drawer.innerHTML = ''; }, 300);
  }

  drawGrid();
}

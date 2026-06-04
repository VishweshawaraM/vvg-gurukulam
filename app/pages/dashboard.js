/*
  Veda Vijnana Gurukulam Management System
  Dashboard Page — Ultra-Premium Cinematic Layout v2.1
*/

import { db } from '../database.js?v=3.5';
import { router } from '../router.js?v=3.5';
import { getVaidikaPanchangam } from '../app.js?v=3.5';

export function renderDashboard(container, appInstance) {
  const students = db.getAllStudents();
  const ganas = db.getAllGanas();
  const acharyas = db.getAllAcharyas();
  const activities = db.getRecentActivities();
  const announcements = db.getAllAnnouncements();
  const panchangam = getVaidikaPanchangam();
  const user = router.getUserSession();
  const isStaffOrAdmin = user && ['Admin', 'Office Staff'].includes(user.role);
  const pendingUsers = (db.get().users || []).filter(u => u && u.role === 'Pending');

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  let totalPresent = 0, totalStudentsForAttendance = 0;
  let isAttendanceMarkedToday = false;

  ganas.forEach(gana => {
    const stats = db.getAttendanceStats(gana.id, 1);
    if (stats && stats.length > 0 && stats[0].total > 0) {
      isAttendanceMarkedToday = true;
      totalPresent += stats[0].present;
      totalStudentsForAttendance += stats[0].total;
    }
  });

  const attendancePct = totalStudentsForAttendance > 0
    ? Math.round((totalPresent / totalStudentsForAttendance) * 100)
    : 94;

  // Get unread announcements count
  const unreadCount = announcements.filter(a => !a.readBy.includes(user ? user.id : 'guest')).length;

  // Today's daily shloka
  const dailyShlokas = [
    { shloka: 'ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥', source: 'बृहदारण्यकोपनिषद्', translation: 'Lead me from the unreal to the real, from darkness to light, from death to immortality.' },
    { shloka: 'सह नाववतु । सह नौ भुनक्तु । सह वीर्यं करवावहै । तेजस्वि नावधीतमस्तु ॥', source: 'कठोपनिषद्', translation: 'May we be protected together; may we be nourished together; may our study be vigorous and effective.' },
    { shloka: 'सत्यं वद । धर्मं चर । स्वाध्यायान्मा प्रमदः ॥', source: 'तैत्तिरीयोपनिषद्', translation: 'Speak the truth. Practice righteousness. Do not neglect daily study.' },
    { shloka: 'विद्या ददाति विनयम् विनयाद् याति पात्रताम् । पात्रत्वात् धनमाप्नोति धनात् धर्मस्ततः सुखम् ॥', source: 'हितोपदेशः', translation: 'Knowledge gives humility, from humility comes worthiness, from worthiness one gets wealth, from wealth righteousness, and thereby happiness.' }
  ];
  const pickedShloka = dailyShlokas[new Date().getDate() % dailyShlokas.length];

  // 7-day attendance stats across all ganas
  const weekStats = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    let present = 0, total = 0;
    ganas.forEach(gana => {
      // use the new getAttendanceStats that supports slot-based records
      const stats = db.getAttendanceStats(gana.id, 7);
      const dayStat = stats.find(s => s.date === dateStr);
      if (dayStat && dayStat.total > 0) {
        present += dayStat.present;
        total += dayStat.total;
      }
    });
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' }).substring(0, 2);
    weekStats.push({ day: dayLabel, pct: total > 0 ? Math.round((present / total) * 100) : 0, present, total });
  }

  // Gana mini stats
  const ganaMiniStats = ganas.map(gana => {
    const ganaStudents = students.filter(s => s.ganaId === gana.id);
    const stats = db.getAttendanceStats(gana.id, 1);
    const attPct = (stats && stats.length > 0 && stats[0].total > 0) ? stats[0].pct : 0;
    return { gana, studentCount: ganaStudents.length, attPct };
  });

  // Today's schedule (first gana's today slot)
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedules = [];
  ganas.slice(0, 4).forEach(gana => {
    const slots = db.getTimetable(gana.id);
    if (slots) {
      const currentHour = today.getHours();
      // Find most relevant slot
      let slotKey = 'slot_2';
      if (currentHour < 8) slotKey = 'slot_1';
      else if (currentHour < 11) slotKey = 'slot_2';
      else if (currentHour < 14) slotKey = 'slot_3';
      else if (currentHour < 17) slotKey = 'slot_4';
      else slotKey = 'slot_5';

      if (slots[slotKey] && slots[slotKey].subject) {
        todaySchedules.push({ gana, slot: slots[slotKey], slotKey });
      }
    }
  });

  container.innerHTML = `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="page-hero-text">
        <h2 class="page-hero-title">मुख्यपटलम्</h2>
        <span class="page-hero-subtitle">॥ ऋते ज्ञानान्न मुक्तिः — Without knowledge there is no liberation ॥</span>
      </div>
      <div class="page-hero-meta">
        <span class="academic-year-tag">Academic Year — २०८३ वैक्रमी</span>
      </div>
    </div>

    <!-- ═══ Stats Grid ═══ -->
    <div class="dashboard-grid">
      <div class="stat-card saffron-accent" id="card-goto-students" style="cursor:pointer;">
        <div class="stat-icon-wrapper stat-icon-saffron">
          <svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:2;">
            <path d="M2 17V3a1 1 0 0 1 1-1h16a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a1 1 0 0 1-1-1zM2 14h18M18 2v18M6 6h6M6 10h4"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" id="counter-students">0</span>
          <span class="stat-label">छात्राः (Total Students)</span>
          <span class="stat-sanskrit-tag">अष्टगणेषु ९०+ छात्राः</span>
        </div>
      </div>

      <div class="stat-card gold-accent" id="card-goto-ganas" style="cursor:pointer;">
        <div class="stat-icon-wrapper stat-icon-sandalwood">
          <svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:2;">
            <circle cx="9" cy="5" r="3"/><circle cx="15" cy="5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M13 13a6 6 0 0 1 8 6"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" id="counter-ganas">0</span>
          <span class="stat-label">गणाः (Traditional Divisions)</span>
          <span class="stat-sanskrit-tag">अष्टगणव्यवस्था</span>
        </div>
      </div>

      <div class="stat-card tulsi-accent" id="card-goto-attendance" style="cursor:pointer;">
        <div class="stat-icon-wrapper stat-icon-tulsi">
          <svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:2;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${attendancePct}%</span>
          <span class="stat-label">${isAttendanceMarkedToday ? 'अद्यतनी उपस्थितिः' : 'सामान्य-उपस्थितिदरः'}</span>
          <span class="stat-sanskrit-tag">${isAttendanceMarkedToday ? 'आजका रेकॉर्ड' : '7-दिन-औसतः'}</span>
        </div>
      </div>

      <div class="stat-card shastra-accent" id="card-goto-acharyas" style="cursor:pointer;">
        <div class="stat-icon-wrapper stat-icon-shastra">
          <svg viewBox="0 0 24 24" style="stroke:currentColor;fill:none;stroke-width:2;">
            <path d="M12 22v-6M12 16c2.5 0 5-2 5-5s-2-5-5-5-5 2-5 5 2.5 5 5 5z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" id="counter-acharyas">0</span>
          <span class="stat-label">आचार्याः (Active Faculty)</span>
          <span class="stat-sanskrit-tag">अष्टआचार्याः</span>
        </div>
      </div>
    </div>

    <!-- ═══ Main Split Layout ═══ -->
    <div class="dashboard-split-layout">

      <!-- Left Column -->
      <div>
        <!-- Daily Shloka -->
        <div class="gurukula-card framed" style="background: linear-gradient(135deg, var(--gold-light) 0%, var(--bg-card) 60%); border-color: rgba(197, 78, 34, 0.3); text-align: center; padding: 1.5rem;">
          <span style="font-size: 0.6rem; font-family: var(--font-header); font-weight: 900; color: var(--saffron-royal); text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 0.75rem;">॥ उपनिषद्-वाक्यम् (Today's Shloka) ॥</span>
          <p class="devanagari-display" style="font-size: 1.15rem; color: var(--charcoal-sandal); line-height: 1.7; font-weight: normal;">
            ${pickedShloka.shloka}
          </p>
          <div class="vedic-divider" style="margin: 0.85rem 0;">
            <div class="vedic-divider-line"></div>
            <span class="vedic-divider-motif">❋</span>
            <div class="vedic-divider-line"></div>
          </div>
          <div style="font-family: var(--font-header); font-size: 0.68rem; color: var(--gold-solid); font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.4rem;">
            — ${pickedShloka.source}
          </div>
          <p style="font-size: 0.78rem; color: var(--sandal-light); font-style: italic; max-width: 500px; margin: 0 auto; line-height: 1.6;">
            "${pickedShloka.translation}"
          </p>
        </div>

        <!-- Attendance Bar Chart — Last 7 Days -->
        <div class="gurukula-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>उपस्थिति-दर्शनम् (7-Day Attendance Overview)</span>
            </h3>
            <span class="card-sanskrit-tag">सप्तदिनम्</span>
          </div>
          <div class="bar-chart" style="height: 90px; align-items: flex-end; gap: 8px;">
            ${weekStats.map(stat => `
              <div class="bar-item" title="${stat.pct}% (${stat.present}/${stat.total})">
                <span class="bar-value" style="font-size: 0.6rem; color: var(--saffron-royal); font-weight: 800;">${stat.pct}%</span>
                <div class="bar-fill" style="height: ${Math.max(stat.pct * 0.82, 4)}px; background: ${stat.pct >= 90 ? 'linear-gradient(180deg, var(--forest-tulsi) 0%, #1E4C31 100%)' : stat.pct >= 75 ? 'linear-gradient(180deg, var(--gold-solid) 0%, #9E7E48 100%)' : 'linear-gradient(180deg, var(--agni-red) 0%, #8B2929 100%)'}; border-radius: 3px 3px 0 0;"></div>
                <span class="bar-label">${stat.day}</span>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; gap: 14px; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px dashed var(--sandal-div);">
            <span style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; color: var(--sandal-light);">
              <span style="width:8px; height:8px; background: var(--forest-tulsi); border-radius:2px; display:inline-block;"></span> 90%+
            </span>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; color: var(--sandal-light);">
              <span style="width:8px; height:8px; background: var(--gold-solid); border-radius:2px; display:inline-block;"></span> 75–90%
            </span>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; color: var(--sandal-light);">
              <span style="width:8px; height:8px; background: var(--agni-red); border-radius:2px; display:inline-block;"></span> Below 75%
            </span>
          </div>
        </div>

        <!-- Quick Administrative Actions -->
        <div class="gurukula-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>त्वरितकार्याणि (Quick Actions)</span>
            </h3>
            <span class="card-sanskrit-tag">शीघ्रप्रवेशद्वारम्</span>
          </div>
          <div class="shortcut-buttons-grid">
            ${isStaffOrAdmin ? `
              <button class="btn btn-saffron" id="dash-btn-add-student">
                <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                <span>छात्रपञ्जीकरणम् (Add Student)</span>
              </button>
            ` : ''}
            <button class="btn btn-gold" id="dash-btn-mark-attendance">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              <span>उपस्थिति-अङ्कनम् (Mark Attendance)</span>
            </button>
            <button class="btn btn-gold" id="dash-btn-view-timetable">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>समयसारिणी (View Timetable)</span>
            </button>
            <button class="btn btn-sandalwood" id="dash-btn-view-announcements">
              <svg viewBox="0 0 24 24" style="stroke:var(--gold-solid);"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>सूचनाकेन्द्रम् (Announcements)${unreadCount > 0 ? ` <span style="background:var(--saffron-royal);color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.65rem;display:inline-flex;align-items:center;justify-content:center;">${unreadCount}</span>` : ''}</span>
            </button>
          </div>
        </div>

        <!-- Pending Approvals Widget -->
        ${user && user.role === 'Admin' && pendingUsers.length > 0 ? `
        <div class="gurukula-card" style="margin-top: 1.5rem; border: 1px solid var(--agni-red);">
          <div class="card-header">
            <h3 class="card-title" style="color: var(--agni-red);">
              <svg viewBox="0 0 24 24" style="stroke:currentColor;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>
              <span>अनुमोदनम् (Pending Approvals) - ${pendingUsers.length}</span>
            </h3>
            <span class="card-sanskrit-tag">नूतनाचार्याः</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${pendingUsers.map(u => `
              <div style="display: flex; flex-direction: column; gap: 8px; padding: 0.8rem; background: var(--gold-light); border-radius: var(--radius-sm); border: 1px solid var(--sandal-div);">
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <span style="font-weight: 700; color: var(--saffron-royal); display: block;">${u.name}</span>
                    <span style="font-size: 0.8rem; color: var(--charcoal-sandal);">${u.email}</span>
                  </div>
                  <div style="text-align: right; font-size: 0.75rem; color: var(--sandal-light);">
                    ${u.specialization || 'N/A'}<br>
                    ${u.phone || 'N/A'}
                  </div>
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                  <button class="btn btn-outline btn-sm btn-reject-user" data-id="${u.id}" style="border-color: rgba(184, 59, 59, 0.3); color: var(--agni-red); padding: 2px 10px;">Reject</button>
                  <button class="btn btn-gold btn-sm btn-approve-user" data-id="${u.id}" style="padding: 2px 10px;">Approve</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Right Column -->
      <div>
        <!-- Today's Classes -->
        <div class="gurukula-card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>अद्यतनकक्षाः (Today's Classes)</span>
            </h3>
            <span class="card-sanskrit-tag">${dayName}</span>
          </div>
          ${todaySchedules.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${todaySchedules.map(({ gana, slot }) => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 0.7rem; background: var(--gold-light); border-radius: var(--radius-sm); border: 1px solid var(--sandal-div);">
                  <div style="width: 6px; height: 40px; border-radius: 3px; background: ${gana.color || 'var(--saffron-royal)'}; flex-shrink: 0;"></div>
                  <div style="flex: 1; min-width: 0;">
                    <span style="font-family: var(--font-sanskrit-body); font-size: 0.8rem; font-weight: 700; color: var(--saffron-royal); display: block;">${gana.name}</span>
                    <span style="font-size: 0.82rem; font-weight: 700; color: var(--charcoal-sandal); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slot.engSubject}</span>
                    <span style="font-family: var(--font-sanskrit-body); font-size: 0.7rem; color: var(--sandal-light);">${slot.subject}</span>
                  </div>
                  <span style="font-size: 0.7rem; font-weight: 700; color: var(--gold-solid); flex-shrink: 0;">${slot.room || ''}</span>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--sandal-light); font-size: 0.85rem; text-align: center; padding: 1rem 0;">
              No classes configured for today. Mark timetable in समयसारिणी module.
            </p>
          `}
        </div>

        <!-- Latest Announcements Preview -->
        <div class="gurukula-card" style="margin-bottom: 1.5rem;">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>नूतनसूचनाः (Latest Announcements)</span>
            </h3>
            <button class="btn btn-ghost btn-sm" id="dash-view-all-ann" style="font-size: 0.72rem;">View All</button>
          </div>
          ${announcements.slice(0, 3).map(ann => {
            const categoryColors = { academic: '#235689', administrative: '#C4A468', urgent: '#B83B3B', festival: '#2C6646' };
            const color = categoryColors[ann.category] || '#C4A468';
            return `
              <div style="display: flex; gap: 10px; padding: 0.7rem 0; border-bottom: 1px dashed var(--sandal-div);" class="ann-preview-item" data-hash="announcements" style="cursor:pointer;">
                <div style="width: 4px; border-radius: 2px; background: ${color}; flex-shrink: 0; min-height: 30px;"></div>
                <div style="flex:1; min-width:0;">
                  ${ann.isPinned ? `<span style="font-size:0.6rem; font-weight:900; color:var(--gold-solid); font-family:var(--font-header);">PINNED · </span>` : ''}
                  <span style="font-size: 0.82rem; font-weight: 700; color: var(--charcoal-sandal); display: block; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ann.title}</span>
                  <span style="font-family: var(--font-sanskrit-body); font-size: 0.7rem; color: var(--saffron-royal); font-weight: 700;">${ann.titleSa}</span>
                </div>
              </div>
            `;
          }).join('')}
          <button class="btn btn-outline btn-sm" id="dash-view-all-ann-2" style="width: 100%; margin-top: 0.85rem; font-size: 0.78rem;">
            सर्वाः सूचनाः पश्यतु (View All Announcements)
          </button>
        </div>

        <!-- Recent Activities -->
        <div class="gurukula-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>नूतन-गतिविधयः (Recent Activities)</span>
            </h3>
            <span class="card-sanskrit-tag">अनुक्रमः</span>
          </div>
          <div class="activity-list">
            ${activities.slice(0, 6).map(act => {
              const timeDiff = Date.now() - new Date(act.timestamp).getTime();
              const mins = Math.floor(timeDiff / 60000);
              const hours = Math.floor(timeDiff / 3600000);
              const timeStr = mins < 60 ? `${mins}m ago` : hours < 24 ? `${hours}h ago` : `${Math.floor(hours/24)}d ago`;
              return `
                <div class="activity-item">
                  <div class="activity-marker ${act.type}"></div>
                  <div class="activity-detail">
                    <span class="activity-text">${act.text}</span>
                    <span class="activity-time">${timeStr}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Gana Overview ═══ -->
    <div class="gurukula-card" style="margin-top: 0.5rem;">
      <div class="card-header">
        <h3 class="card-title">
          <svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="3"/><circle cx="15" cy="5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M13 13a6 6 0 0 1 8 6"/></svg>
          <span>गणसंक्षेपः (All Gana Overview)</span>
        </h3>
        <button class="btn btn-ghost btn-sm" id="dash-goto-ganas" style="font-size: 0.72rem;">Manage Ganas</button>
      </div>
      <div class="gana-overview-grid">
        ${ganaMiniStats.map(({ gana, studentCount, attPct }) => `
          <div class="gana-mini-card" data-gana-id="${gana.id}" style="border-top: 3px solid ${gana.color || 'var(--gold-solid)'};">
            <span class="gana-mini-name">${gana.name}</span>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span class="gana-mini-count">${studentCount}</span>
              <span style="font-size: 0.7rem; font-weight: 800; color: ${attPct >= 90 ? 'var(--forest-tulsi)' : attPct >= 70 ? 'var(--gold-solid)' : 'var(--agni-red)'};">${attPct > 0 ? attPct + '%' : '—'}</span>
            </div>
            <span class="gana-mini-label">${studentCount} Students · ${attPct > 0 ? 'Attendance Today' : 'No Attendance'}</span>
            <div class="gana-mini-bar">
              <div class="gana-mini-bar-fill" style="width: ${attPct}%; background: ${gana.color || 'var(--saffron-royal)'};"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // ── Animated Counters ──
  function animateCounter(id, target) {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 40);
  }

  setTimeout(() => {
    animateCounter('counter-students', students.length);
    animateCounter('counter-ganas', ganas.length);
    animateCounter('counter-acharyas', acharyas.length);
  }, 100);

  // ── Event Bindings ──
  container.querySelector('#card-goto-students').addEventListener('click', () => router.navigate('students'));
  container.querySelector('#card-goto-ganas').addEventListener('click', () => router.navigate('ganas'));
  container.querySelector('#card-goto-attendance').addEventListener('click', () => router.navigate('attendance'));
  container.querySelector('#card-goto-acharyas').addEventListener('click', () => router.navigate('acharyas'));

  if (isStaffOrAdmin) {
    container.querySelector('#dash-btn-add-student')?.addEventListener('click', () => {
      router.navigate('students');
      setTimeout(() => document.getElementById('btn-add-student-trigger')?.click(), 100);
    });
  }

  container.querySelector('#dash-btn-mark-attendance').addEventListener('click', () => router.navigate('attendance'));
  container.querySelector('#dash-btn-view-timetable').addEventListener('click', () => router.navigate('timetable'));
  container.querySelector('#dash-btn-view-announcements').addEventListener('click', () => router.navigate('announcements'));
  container.querySelector('#dash-view-all-ann')?.addEventListener('click', () => router.navigate('announcements'));
  container.querySelector('#dash-view-all-ann-2')?.addEventListener('click', () => router.navigate('announcements'));
  container.querySelector('#dash-goto-ganas')?.addEventListener('click', () => router.navigate('ganas'));

  container.querySelectorAll('.ann-preview-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => router.navigate('announcements'));
  });
  
  // Pending user approvals
  container.querySelectorAll('.btn-approve-user').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('button').dataset.id;
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await db.syncFromServer();
        renderDashboard(container, appInstance);
      }
    });
  });

  container.querySelectorAll('.btn-reject-user').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('button').dataset.id;
      if (confirm('Are you sure you want to reject this registration?')) {
        const res = await fetch('/api/users/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          await db.syncFromServer();
          renderDashboard(container, appInstance);
        }
      }
    });
  });

  container.querySelectorAll('.gana-mini-card').forEach(card => {
    card.addEventListener('click', () => router.navigate('ganas'));
  });
}

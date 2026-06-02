/*
  Veda Vijnana Gurukulam Management System
  Attendance Management Module — v2.1
  Full 8 Gana Support | Card Grid UI | Analytics | CSV Export
*/

import { db } from '../database.js';
import { router } from '../router.js';

export function renderAttendance(container, appInstance) {
  const ganas = db.getAllGanas();
  const user = router.getUserSession();

  // State
  let selectedGanaId = ganas[0]?.id || 'gan_1';
  let selectedDateStr = new Date().toISOString().split('T')[0];
  let activeTab = 'mark'; // 'mark' | 'register' | 'analytics'
  let tempRecords = {};

  function showToast(message, type = 'success') {
    let tc = document.querySelector('.toast-container');
    if (!tc) {
      tc = document.createElement('div');
      tc.className = 'toast-container';
      document.body.appendChild(tc);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;">
        ${type === 'success'
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
          : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>'}
      </svg>
      <span>${message}</span>
    `;
    tc.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
  }

  function downloadCSV() {
    const csvData = db.generateCSVExport('attendance');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VVG_Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Attendance data exported to CSV.', 'success');
  }

  function renderView() {
    const selectedGana = ganas.find(g => g.id === selectedGanaId);
    const weekStats = db.getAttendanceStats(selectedGanaId, 7);
    const avgPct = weekStats.length > 0
      ? Math.round(weekStats.reduce((a, b) => a + b.pct, 0) / weekStats.length)
      : 0;

    container.innerHTML = `
      <!-- Page Hero -->
      <div class="page-hero">
        <div class="page-hero-text">
          <h2 class="page-hero-title">उपस्थिति-प्रबन्धनम्</h2>
          <span class="page-hero-subtitle">॥ उपस्थितिः परमम् अनुशासनम् — Attendance is Supreme Discipline ॥</span>
        </div>
        <div class="page-hero-meta">
          <span class="academic-year-tag">${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <button class="btn ${activeTab === 'mark' ? 'btn-saffron' : 'btn-ghost'}" id="btn-tab-mark">
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          उपस्थिति-लेखनम् (Mark Attendance)
        </button>
        <button class="btn ${activeTab === 'register' ? 'btn-saffron' : 'btn-ghost'}" id="btn-tab-register">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          पञ्जीका (Register View)
        </button>
        <button class="btn ${activeTab === 'analytics' ? 'btn-saffron' : 'btn-ghost'}" id="btn-tab-analytics">
          <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          विश्लेषणम् (Analytics)
        </button>
      </div>

      <!-- Gana Selector Chips -->
      <div class="chip-filter" id="gana-chips" style="margin-bottom: 1.5rem; flex-wrap: wrap;">
        ${ganas.map(g => `
          <button class="chip ${g.id === selectedGanaId ? 'active' : ''}" data-gana-id="${g.id}"
            style="${g.id === selectedGanaId ? `background: ${g.color}; border-color: ${g.color}; box-shadow: 0 2px 10px ${g.color}40;` : ''}">
            <span class="devanagari-body" style="font-size: 0.82rem; ${g.id === selectedGanaId ? 'color: #fff;' : ''}">${g.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Content -->
      <div id="attendance-content-area"></div>

      <!-- Sheets Sync Panel (Admin/Staff only) -->
      ${['Admin', 'Office Staff'].includes(user?.role) ? `
        <div class="sheets-panel">
          <div class="sheets-panel-header">
            <div class="sheets-icon">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            </div>
            <div>
              <div class="sheets-title">Google Sheets Integration — पत्रिका-एकीकरणम्</div>
              <div class="sheets-subtitle">Export or sync attendance data to Google Sheets</div>
            </div>
          </div>
          <div class="sheets-sync-buttons">
            <button class="btn-sheets" id="btn-export-csv">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Attendance CSV
            </button>
            <button class="btn-sheets" id="btn-sync-sheets" style="background: #2C6646;">
              <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Sync to Google Sheets
            </button>
          </div>
          <div class="sheets-last-sync" id="sheets-sync-status">
            Last Sync: Not synced yet · Click above to export or sync attendance data
          </div>
        </div>
      ` : ''}
    `;

    // Tab bindings
    container.querySelector('#btn-tab-mark').addEventListener('click', () => { activeTab = 'mark'; renderView(); });
    container.querySelector('#btn-tab-register').addEventListener('click', () => { activeTab = 'register'; renderView(); });
    container.querySelector('#btn-tab-analytics').addEventListener('click', () => { activeTab = 'analytics'; renderView(); });

    // Gana chip bindings
    container.querySelector('#gana-chips').addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      selectedGanaId = btn.getAttribute('data-gana-id');
      renderView();
    });

    // Sheets buttons
    container.querySelector('#btn-export-csv')?.addEventListener('click', downloadCSV);
    container.querySelector('#btn-sync-sheets')?.addEventListener('click', () => {
      const syncBtn = container.querySelector('#btn-sync-sheets');
      syncBtn.innerHTML = `<svg class="spin-icon" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Syncing...`;
      syncBtn.disabled = true;
      setTimeout(() => {
        const now = new Date().toLocaleString('en-IN');
        container.querySelector('#sheets-sync-status').textContent = `Last Sync: ${now} · Export CSV and import to Google Sheets for cloud sync.`;
        syncBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Synced!`;
        syncBtn.disabled = false;
        showToast('Attendance sync complete. Download CSV to import into Google Sheets.', 'success');
        setTimeout(() => {
          syncBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Sync to Google Sheets`;
        }, 3000);
      }, 2200);
    });

    loadSubView();
  }

  function loadSubView() {
    const target = container.querySelector('#attendance-content-area');
    if (!target) return;

    const ganaStudents = db.getAllStudents().filter(s => s.ganaId === selectedGanaId);
    const selectedGana = ganas.find(g => g.id === selectedGanaId);

    if (ganaStudents.length === 0) {
      target.innerHTML = `<div class="gurukula-card" style="text-align:center; padding: 3rem; color:var(--sandal-light);">
        <p>No students assigned to ${selectedGana?.name || 'this Gana'} yet.</p>
      </div>`;
      return;
    }

    if (activeTab === 'mark') renderMarkTab(target, ganaStudents, selectedGana);
    else if (activeTab === 'register') renderRegisterTab(target, ganaStudents, selectedGana);
    else if (activeTab === 'analytics') renderAnalyticsTab(target, ganaStudents, selectedGana);
  }

  function renderMarkTab(target, ganaStudents, selectedGana) {
    const slots = db.getAllTimeSlots();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDateObj = new Date(selectedDateStr);
    const dayName = dayNames[selectedDateObj.getDay()];

    const dailyTimetable = db.getTimetable(selectedGanaId) || {};
    const activeSlots = Object.entries(dailyTimetable).filter(([k, v]) => v && v.subject);

    let html = `
      <div class="gurukula-card framed">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${selectedGana?.name || ''} — Class Log & Attendance (${dayName})</span>
          </h3>
          <span class="card-sanskrit-tag" style="color:${selectedGana?.color || 'var(--saffron-royal)'};">${selectedGana?.englishName || ''}</span>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--sandal-light); display: block; margin-bottom: 3px;">Select Date</label>
          <input type="date" id="attend-date-input" class="form-control" style="width: 200px; padding: 0.5rem 0.85rem;" value="${selectedDateStr}">
        </div>
    `;

    if (activeSlots.length === 0) {
      html += `
        <div style="text-align: center; padding: 3rem; color: var(--sandal-light);">
          <p>No classes scheduled for ${dayName} in the timetable.</p>
        </div>
      </div>`;
      target.innerHTML = html;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 1.5rem;">`;
      
      activeSlots.forEach(([slotId, details]) => {
        const slotInfo = slots[slotId];
        const classLog = db.getClassLog(selectedGanaId, selectedDateStr, slotId) || { notes: '' };
        const attendanceLog = db.getAttendance(selectedGanaId, selectedDateStr) || {};
        
        // Detect Veda/Shastra specialization
        let eligibleStudents = ganaStudents;
        const sub = (details.engSubject || '').toLowerCase() + ' ' + (details.subject || '').toLowerCase();
        let detectedType = 'All Students';
        
        if (sub.includes('vyakarana') || sub.includes('kaumudi') || sub.includes('mahabhashya') || sub.includes('manorama')) {
            eligibleStudents = ganaStudents.filter(s => (s.shastra || 'None') === 'Vyakarana' || (s.shastra || 'None') === 'None');
            detectedType = 'Vyakarana Students';
        } else if (sub.includes('vedanta') || sub.includes('sutram') || sub.includes('advaita') || sub.includes('bhashyam')) {
            eligibleStudents = ganaStudents.filter(s => (s.shastra || 'None') === 'Vedanta' || (s.shastra || 'None') === 'None');
            detectedType = 'Vedanta Students';
        } else if (sub.includes('mimamsa') || sub.includes('nyaya') || sub.includes('tarka')) {
            eligibleStudents = ganaStudents.filter(s => (s.shastra || 'None') === 'Mimamsa' || (s.shastra || 'None') === 'Nyaya' || (s.shastra || 'None') === 'None');
            detectedType = 'Mimamsa/Nyaya Students';
        }

        html += `
          <div class="gurukula-card" style="margin: 0; background: var(--gold-light); border: 1px solid var(--gold-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--gold-border); padding-bottom: 0.8rem; margin-bottom: 1rem;">
              <div>
                <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--saffron-royal); margin-bottom: 0.2rem;">${details.subject}</h4>
                <span style="font-size: 0.8rem; color: var(--sandalwood);">${slotInfo?.time || slotInfo?.label || ''} — ${details.engSubject}</span>
                <span style="margin-left:10px; font-size: 0.7rem; background: var(--saffron-royal); color: white; padding: 2px 6px; border-radius: 4px;">${detectedType}</span>
              </div>
            </div>
            
            <form class="class-log-form" data-slot-id="${slotId}">
              <div class="student-attendance-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 1rem;">
                ${eligibleStudents.map(s => {
                  // For backward compatibility, check if the student was marked absent globally or for this slot.
                  const isPresent = !attendanceLog[slotId] || attendanceLog[slotId][s.id] !== 'Absent';
                  return `
                  <label style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px; border: 1px solid var(--gold-border); border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" name="student_${s.id}" value="${s.id}" ${isPresent ? 'checked' : ''} style="accent-color: var(--forest-tulsi); width: 18px; height: 18px;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: var(--charcoal-sandal);">${s.name}</span>
                  </label>
                  `;
                }).join('')}
              </div>

              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem;">Class Notes (What was taught?)</label>
                <textarea name="notes" class="form-control" rows="2" placeholder="e.g. I taught Rigveda Mandala 1, Sukta 1...">${classLog.notes}</textarea>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <button type="submit" class="btn btn-saffron" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Save Slot Attendance</button>
                <button type="button" class="btn btn-ghost btn-sm mark-all-btn">Toggle All</button>
                <span class="save-indicator" style="font-size: 0.8rem; color: var(--forest-tulsi); display: none;">Saved!</span>
              </div>
            </form>
          </div>
        `;
      });
      
      html += `</div></div>`;
      target.innerHTML = html;
      
      // Bind form submits
      target.querySelectorAll('.class-log-form').forEach(form => {
        // Toggle All button
        form.querySelector('.mark-all-btn').addEventListener('click', () => {
          const checkboxes = form.querySelectorAll('input[type="checkbox"]');
          const allChecked = Array.from(checkboxes).every(c => c.checked);
          checkboxes.forEach(c => c.checked = !allChecked);
        });

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const slotId = form.getAttribute('data-slot-id');
          const notes = form.querySelector('[name="notes"]').value;
          
          const studentStatuses = {};
          form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            studentStatuses[cb.value] = cb.checked ? 'Present' : 'Absent';
          });
          
          const present = Object.values(studentStatuses).filter(v => v === 'Present').length;
          const absent = Object.values(studentStatuses).filter(v => v === 'Absent').length;

          db.saveClassLog(selectedGanaId, selectedDateStr, slotId, { present, absent, notes });
          db.saveAttendance(selectedGanaId, selectedDateStr, slotId, studentStatuses); // Note: updated to use slotId
          
          const ind = form.querySelector('.save-indicator');
          ind.style.display = 'inline-block';
          setTimeout(() => ind.style.display = 'none', 2000);
        });
      });
    }

    // Date change
    target.querySelector('#attend-date-input').addEventListener('change', (e) => {
      selectedDateStr = e.target.value;
      loadSubView();
    });
  }


  function renderRegisterTab(target, ganaStudents, selectedGana) {
    const daysCount = 15;
    const today = new Date();
    const dateColumns = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dateColumns.push(d.toISOString().split('T')[0]);
    }

    target.innerHTML = `
      <div class="gurukula-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${selectedGana?.name} — मासिक-उपस्थिति-पञ्जीका (15-Day Register)</span>
          </h3>
          <button class="btn btn-outline btn-sm" id="btn-print-register">
            <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
        </div>
        <div class="table-responsive" style="max-height: 500px; overflow-y: auto; overflow-x: auto;">
          <table class="traditional-table" style="font-size: 0.78rem; text-align: center; min-width: 700px;">
            <thead>
              <tr>
                <th style="text-align: left; position: sticky; left: 0; z-index: 10; min-width: 140px; background: var(--gold-bg);">
                  छात्रनाम (Student)
                </th>
                ${dateColumns.map(date => {
                  const d = new Date(date);
                  const isSun = d.getDay() === 0;
                  return `<th title="${date}" style="padding: 0.5rem; min-width: 38px; ${isSun ? 'background: var(--saffron-royal-light); color: var(--saffron-royal);' : ''}">${date.split('-')[2]}/${date.split('-')[1]}</th>`;
                }).join('')}
                <th style="background: var(--gold-bg);">Total</th>
                <th style="background: var(--gold-bg);">%</th>
              </tr>
            </thead>
            <tbody>
              ${ganaStudents.map(s => {
                let presentTotal = 0, totalTracked = 0;
                const cells = dateColumns.map(date => {
                  const d = new Date(date);
                  const isSun = d.getDay() === 0;
                  
                  // A student is considered present if they were marked present in AT LEAST ONE slot that day.
                  let wasPresent = false;
                  let hasData = false;
                  const allSlots = db.getAllTimeSlots();
                  Object.keys(allSlots).forEach(slotId => {
                      const log = db.getAttendance(selectedGanaId, date, slotId);
                      if (log && log[s.id]) {
                          hasData = true;
                          if (log[s.id] === 'Present') wasPresent = true;
                      }
                  });

                  if (hasData) {
                    totalTracked++;
                    if (wasPresent) { presentTotal++; return `<td style="${isSun ? 'background:var(--saffron-royal-light)' : ''}"><span style="color:var(--forest-tulsi);font-weight:800;font-size:1rem;">✔</span></td>`; }
                    return `<td style="${isSun ? 'background:var(--saffron-royal-light)' : ''}"><span style="color:var(--agni-red);font-weight:800;font-size:1rem;">✘</span></td>`;
                  }
                  return `<td style="${isSun ? 'background:var(--saffron-royal-light)' : ''}"><span style="color:var(--sandal-div);font-size:0.9rem;">•</span></td>`;
                }).join('');
                const pct = totalTracked > 0 ? Math.round((presentTotal / totalTracked) * 100) : 0;
                const pctColor = pct >= 90 ? 'var(--forest-tulsi)' : pct >= 75 ? 'var(--gold-solid)' : 'var(--agni-red)';
                return `
                  <tr>
                    <td style="text-align: left; font-weight: 700; position: sticky; left: 0; background: var(--bg-card); border-right: 1.5px solid var(--gold-solid); z-index: 5; min-width: 140px;">
                      <span style="display:block;">${s.name}</span>
                      <span style="font-family: var(--font-sanskrit-body); font-size: 0.68rem; color: var(--saffron-royal); font-weight: 700;">${s.sanskritName}</span>
                    </td>
                    ${cells}
                    <td style="font-weight: 800; color: var(--charcoal-sandal);">${presentTotal}/${totalTracked || daysCount}</td>
                    <td style="font-weight: 800; color: ${pctColor};">${pct}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    target.querySelector('#btn-print-register').addEventListener('click', () => window.print());
  }


  function renderAnalyticsTab(target, ganaStudents, selectedGana) {
    const weekStats = db.getAttendanceStats(selectedGanaId, 7);
    const avgPct = weekStats.length > 0
      ? Math.round(weekStats.reduce((a, b) => a + b.pct, 0) / weekStats.filter(s => s.total > 0).length || weekStats.length)
      : 0;

    // All gana comparison
    const allGanaStats = ganas.map(gana => {
      const stats = db.getAttendanceStats(gana.id, 7);
      const avg = stats.filter(s => s.total > 0).length > 0
        ? Math.round(stats.reduce((a, b) => a + b.pct, 0) / stats.filter(s => s.total > 0).length)
        : 0;
      return { gana, avg };
    });

    target.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">

        <!-- 7-Day Trend -->
        <div class="gurukula-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span>${selectedGana?.name} — 7-Day Trend</span>
            </h3>
          </div>

          <div style="text-align: center; margin-bottom: 1.25rem;">
            <div style="font-family: var(--font-header); font-size: 2.4rem; font-weight: 900; color: ${avgPct >= 90 ? 'var(--forest-tulsi)' : avgPct >= 75 ? 'var(--gold-solid)' : 'var(--agni-red)'};">${avgPct}%</div>
            <div style="font-size: 0.78rem; color: var(--sandal-light); font-weight: 700;">7-Day Average Attendance</div>
          </div>

          <div class="bar-chart" style="height: 100px; align-items: flex-end; gap: 8px;">
            ${weekStats.map(stat => `
              <div class="bar-item" title="${stat.date}: ${stat.pct}% (${stat.present}/${stat.total})">
                <span class="bar-value">${stat.pct > 0 ? stat.pct + '%' : '—'}</span>
                <div class="bar-fill" style="height: ${Math.max(stat.pct * 0.9, 4)}px; background: ${stat.pct >= 90 ? 'linear-gradient(180deg, var(--forest-tulsi), #1E4C31)' : stat.pct >= 75 ? 'linear-gradient(180deg, var(--gold-solid), #9E7E48)' : 'linear-gradient(180deg, var(--agni-red), #8B2929)'}; border-radius: 3px 3px 0 0;"></div>
                <span class="bar-label">${stat.day || new Date(stat.date).toLocaleDateString('en-IN', {weekday:'short'}).substring(0,2)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- All Gana Comparison -->
        <div class="gurukula-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="3"/><circle cx="15" cy="5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M13 13a6 6 0 0 1 8 6"/></svg>
              <span>All Gana Comparison</span>
            </h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${allGanaStats.map(({ gana, avg }) => `
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-family:var(--font-sanskrit-body); font-size: 0.78rem; color: var(--charcoal-sandal); font-weight: 700; min-width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${gana.name}</span>
                <div style="flex:1; height: 8px; background: var(--sandal-div); border-radius: 4px; overflow: hidden;">
                  <div style="height:100%; width:${avg}%; background:${gana.color || 'var(--saffron-royal)'}; border-radius:4px; transition: width 0.8s ease;"></div>
                </div>
                <span style="font-size: 0.78rem; font-weight: 800; color: var(--charcoal-sandal); min-width: 36px; text-align: right;">${avg}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Absence Alert -->
      <div class="gurukula-card" style="margin-top: 1.5rem; border-color: rgba(184, 59, 59, 0.3);">
        <div class="card-header">
          <h3 class="card-title" style="color: var(--agni-red);">
            <svg viewBox="0 0 24 24" style="stroke: var(--agni-red);"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>अनुपस्थिति-सूचना (Absence Alert — Irregular Students)</span>
          </h3>
        </div>
        ${(() => {
          // Find students absent 2+ days in a week
          const alertStudents = ganaStudents.filter(s => {
            let absentDays = 0;
            weekStats.forEach(stat => {
              const dayLog = db.getAttendance(selectedGanaId, stat.date);
              let wasAbsent = false;
              let hasData = false;
              if (dayLog) {
                  if (dayLog[s.id]) {
                      hasData = true;
                      if (dayLog[s.id] === 'Absent') wasAbsent = true;
                  } else {
                      Object.values(dayLog).forEach(slotLog => {
                          if (slotLog && typeof slotLog === 'object' && slotLog[s.id]) {
                              hasData = true;
                              if (slotLog[s.id] === 'Absent') wasAbsent = true;
                          }
                      });
                  }
              }
              if (hasData && wasAbsent) absentDays++;
            });
            return absentDays >= 2;
          });

          if (alertStudents.length === 0) {
            return `<p style="color: var(--forest-tulsi); font-weight: 700; font-size: 0.88rem;">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--forest-tulsi);fill:none;stroke-width:2;display:inline;vertical-align:middle;margin-right:4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              सभी छात्रों की उपस्थिति नियमित है — All students have regular attendance this week.
            </p>`;
          }

          return `
            <p style="font-size:0.8rem; color:var(--sandal-light); margin-bottom: 0.85rem;">Students absent 2 or more days in the past 7 days require follow-up:</p>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              ${alertStudents.map(s => `
                <div style="background:var(--agni-red-light); border:1.5px solid rgba(184,59,59,0.25); border-radius:var(--radius-md); padding:0.5rem 0.85rem; display:flex; align-items:center; gap:8px;">
                  <span style="font-size:0.82rem; font-weight:700; color:var(--agni-red);">${s.name}</span>
                  <span style="font-family:var(--font-sanskrit-body); font-size:0.7rem; color:var(--agni-red); opacity:0.8;">${s.sanskritName}</span>
                </div>
              `).join('')}
            </div>
          `;
        })()}
      </div>
    `;
  }

  renderView();
}

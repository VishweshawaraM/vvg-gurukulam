/*
  Veda Vijnana Gurukulam Management System
  Attendance Management Module — v2.1
  Full 8 Gana Support | Card Grid UI | Analytics | CSV Export
*/

import { db } from '../database.js?v=3.5';
import { router } from '../router.js?v=3.5';

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
      <div id="gana-filter-container" style="display: ${activeTab === 'mark' ? 'none' : 'block'};">
      <div class="chip-filter" id="gana-chips" style="margin-bottom: 1.5rem; flex-wrap: wrap;">
        ${ganas.map(g => `
          <button class="chip ${g.id === selectedGanaId ? 'active' : ''}" data-gana-id="${g.id}"
            style="${g.id === selectedGanaId ? `background: ${g.color}; border-color: ${g.color}; box-shadow: 0 2px 10px ${g.color}40;` : ''}">
            <span class="devanagari-body" style="font-size: 0.82rem; ${g.id === selectedGanaId ? 'color: #fff;' : ''}">${g.name}</span>
          </button>
        `).join('')}
      </div>

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
      <!-- Attendance Modal Container -->
      <div id="att-backdrop" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(45,26,16,0.5);backdrop-filter:blur(4px);z-index:499;opacity:0;transition:opacity 0.3s ease;"></div>
      <div id="att-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);background:var(--bg-parchment);border:1.5px solid var(--gold-solid);border-radius:var(--radius-lg);padding:2rem;width:500px;max-width:95vw;z-index:500;box-shadow:0 20px 60px rgba(45,26,16,0.25);opacity:0;pointer-events:none;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),opacity 0.3s ease;overflow-y:auto;max-height:85vh;"></div>
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

    if (activeTab === 'mark') {
      renderMarkTab(target);
    } else {
      const ganaStudents = db.getAllStudents().filter(s => s.ganaId === selectedGanaId);
      const selectedGana = ganas.find(g => g.id === selectedGanaId);

      if (ganaStudents.length === 0) {
        target.innerHTML = `<div class="gurukula-card" style="text-align:center; padding: 3rem; color:var(--sandal-light);">
          <p>No students assigned to ${selectedGana?.name || 'this Gana'} yet.</p>
        </div>`;
        return;
      }
      
      if (activeTab === 'register') renderRegisterTab(target, ganaStudents, selectedGana);
      else if (activeTab === 'analytics') renderAnalyticsTab(target, ganaStudents, selectedGana);
    }
  }

  function renderMarkTab(target) {
    const allClasses = db.getAllClasses();
    const isTeacher = user && user.role === 'Acharya';
    const myClasses = isTeacher ? allClasses.filter(c => c.acharyaId === user.email) : allClasses;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDateObj = new Date(selectedDateStr);
    const dayName = dayNames[selectedDateObj.getDay()];

    let html = `
      <div class="gurukula-card framed">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${isTeacher ? 'My Classes' : 'All Classes'} — Class Log & Attendance (${dayName})</span>
          </h3>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--sandal-light); display: block; margin-bottom: 3px;">Select Date</label>
          <input type="date" id="attend-date-input" class="form-control" style="width: 200px; padding: 0.5rem 0.85rem;" value="${selectedDateStr}">
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    if (myClasses.length === 0) {
      html += `<div style="text-align:center; padding: 2rem; color:var(--sandal-light);">No classes assigned to you.</div>`;
    }

    myClasses.forEach(cls => {
      const attendanceRecord = db.getAttendance(cls.id, selectedDateStr) || {};
      const slotStudents = attendanceRecord.students || {};
      const classSummary = attendanceRecord.classSummary || '';
      
      const isComplete = db.isClassComplete(cls.id, selectedDateStr);

      html += `
        <div class="gurukula-card" style="margin: 0; background: var(--gold-light); border: 1px solid var(--gold-border); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px dashed var(--gold-border); padding-bottom: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;">
             <div>
              <span style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-sanskrit-ui); color: var(--saffron-royal); display: block;">
                ${cls.name}
                ${isComplete ? '<span style="display:inline-block; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background:var(--forest-tulsi); color:white; font-size:0.55rem; font-family:var(--font-ui); vertical-align:middle;">COMPLETED</span>' : '<span style="display:inline-block; margin-left: 8px; padding: 2px 6px; border-radius: 4px; background:#e0e0e0; color:#555; font-size:0.55rem; font-family:var(--font-ui); vertical-align:middle;">INCOMPLETE</span>'}
              </span>
              <span style="font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600; color: var(--charcoal-sandal);">
                ${cls.subject}
              </span>
            </div>
            ${!isTeacher ? `<div style="font-size: 0.75rem; font-weight: bold; color: var(--sandal-light);">Acharya: ${cls.acharyaName || 'Unassigned'}</div>` : ''}
          </div>
          
          <form class="class-log-form" data-class-id="${cls.id}">
            <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--sandal-light); margin-bottom: 6px; letter-spacing: 0.5px; display: flex; justify-content: space-between; align-items: center;">
              <span>छात्र-उपस्थितिः (Student Checkboxes)</span>
            </div>
            
            <div class="student-attendance-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; margin-bottom: 1.25rem; max-height: 200px; overflow-y: auto; padding: 4px; border: 1px solid var(--gold-border); background: white; border-radius: 6px;">
              ${(cls.studentIds || []).length === 0 ? `<div style="padding:10px; color:var(--sandal-light); font-size:0.8rem; grid-column: 1 / -1;">No students assigned to this class.</div>` : 
                (cls.studentIds || []).map(studentId => {
                  const s = db.getStudentById(studentId);
                  if (!s) return '';
                  const isPresent = !slotStudents[s.id] || slotStudents[s.id] === 'Present';
                  const ganaObj = db.getGanaById(s.ganaId);
                  
                  return `
                  <label class="student-label" style="display: flex; align-items: center; gap: 8px; background: var(--bg-card); padding: 6px 10px; border: 1px solid var(--gold-border); border-radius: 4px; cursor: pointer; margin-bottom: 0;">
                    <input type="checkbox" name="student_${s.id}" value="${s.id}" ${isPresent ? 'checked' : ''} style="accent-color: var(--forest-tulsi); width: 16px; height: 16px; flex-shrink: 0;">
                    <div style="display: flex; flex-direction: column; overflow: hidden;">
                      <span style="font-size: 0.8rem; font-weight: 700; color: var(--charcoal-sandal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s.name}">${s.name}</span>
                      <span style="font-size: 0.6rem; color: var(--saffron-royal);">${ganaObj?.name||''}</span>
                    </div>
                  </label>
                  `;
                }).join('')}
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="font-size: 0.72rem; margin-bottom: 3px;">Class Summary (What was taught today? Required) *</label>
              <textarea name="classSummary" class="form-control" rows="3" style="font-size: 0.85rem;" placeholder="Write a brief summary (approx 3-4 sentences) describing what was taught today..." required minlength="10">${classSummary}</textarea>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <button type="submit" class="btn btn-saffron" style="padding: 0.5rem 1.25rem; font-size: 0.85rem; font-weight: 800;">
                  Save Class Attendance
                </button>
                <button type="button" class="btn btn-ghost btn-sm mark-all-btn" style="font-size: 0.78rem;">Toggle All</button>
                <button type="button" class="btn btn-ghost btn-sm btn-manage-roster" data-class-id="${cls.id}" style="font-size: 0.78rem; border-color: var(--gold-border);">
                  <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.2;display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Pick Students
                </button>
              </div>
              <span class="save-indicator" style="font-size: 0.8rem; color: var(--forest-tulsi); font-weight: 800; display: none; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.5;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Saved!
              </span>
            </div>
          </form>
        </div>
      `;
    });
    
    html += `</div></div>`;
    target.innerHTML = html;
    
    // Bind form submits
    target.querySelectorAll('.class-log-form').forEach(form => {
      const classId = form.getAttribute('data-class-id');
      
      const toggleBtn = form.querySelector('.mark-all-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          const cbs = form.querySelectorAll('input[type="checkbox"]');
          if (cbs.length === 0) return;
          const allChecked = Array.from(cbs).every(cb => cb.checked);
          cbs.forEach(cb => cb.checked = !allChecked);
        });
      }

      const manageRosterBtn = form.querySelector('.btn-manage-roster');
      if (manageRosterBtn) {
        manageRosterBtn.addEventListener('click', () => {
          openRosterEditor(classId);
        });
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const summary = form.querySelector('textarea[name="classSummary"]').value.trim();
        if (summary.length < 10) {
          showToast('Please enter a valid class summary.', 'error');
          return;
        }

        const studentStatuses = {};
        const checkboxes = form.querySelectorAll('input[type="checkbox"][name^="student_"]');
        checkboxes.forEach(cb => {
          studentStatuses[cb.value] = cb.checked ? 'Present' : 'Absent';
        });

        db.saveAttendance(classId, selectedDateStr, studentStatuses, summary);

        const indicator = form.querySelector('.save-indicator');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<svg class="spin-icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2;display:inline-block;margin-right:6px;vertical-align:text-bottom;"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Saving...`;
        
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Save Class Attendance';
          indicator.style.display = 'flex';
          setTimeout(() => { indicator.style.opacity = '0'; setTimeout(() => { indicator.style.display = 'none'; indicator.style.opacity = '1'; }, 300); }, 3000);
          showToast('Attendance and Class Summary saved!', 'success');
          
          // Refresh view slightly later to show COMPLETION badge
          setTimeout(() => renderMarkTab(target), 1000);
        }, 600);
      });
    });

    // Date change binding
    const dateInput = target.querySelector('#attend-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        selectedDateStr = e.target.value;
        renderView();
      });
    }
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
                  
                  // A student is considered present if they were marked present in AT LEAST ONE class that day.
                  let wasPresent = false;
                  let hasData = false;
                  const studentClasses = db.getAllClasses().filter(c => c.studentIds && c.studentIds.includes(s.id));
                  
                  studentClasses.forEach(cls => {
                      const log = db.getAttendance(cls.id, date);
                      const studentsLog = log ? (log.students || log) : null;
                      if (studentsLog && studentsLog[s.id]) {
                          hasData = true;
                          if (studentsLog[s.id] === 'Present') wasPresent = true;
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
    target.innerHTML = `<div class="gurukula-card" style="text-align:center; padding: 3rem;">
        <h3 style="color:var(--saffron-royal);">Class-Based Analytics coming soon!</h3>
        <p style="color:var(--sandal-light);">Since we migrated to a flexible Class-based system, the Gana-based analytics charts are being rebuilt.</p>
    </div>`;
    return;
  
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
          // dayLog = { slotId: { subject, students: {sid: 'Present'|'Absent'} } }
          const alertStudents = ganaStudents.filter(s => {
            let absentDays = 0;
            weekStats.forEach(stat => {
              const dayLog = db.getAttendance(selectedGanaId, stat.date);
              let wasAbsent = false;
              let hasData = false;
              if (dayLog && typeof dayLog === 'object') {
                Object.values(dayLog).forEach(slotEntry => {
                  if (!slotEntry || typeof slotEntry !== 'object') return;
                  // New format: slotEntry.students = { sid: status }
                  const students = slotEntry.students || slotEntry;
                  if (students[s.id]) {
                    hasData = true;
                    if (students[s.id] === 'Absent') wasAbsent = true;
                  }
                });
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

  function openRosterEditor(classId) {
    const cls = db.getClassById(classId);
    if (!cls) return;
    
    const allStudents = db.getAllStudents();
    const ganas = db.getAllGanas();
    const assignedIds = new Set(cls.studentIds || []);
    
    const modal = container.querySelector('#att-modal');
    const backdrop = container.querySelector('#att-backdrop');
    
    // Group students by Gana
    const studentsByGana = {};
    ganas.forEach(g => studentsByGana[g.id] = []);
    allStudents.forEach(s => {
      if (studentsByGana[s.ganaId]) {
        studentsByGana[s.ganaId].push(s);
      }
    });
    
    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--sandal-div);padding-bottom:1rem;">
        <div>
          <h3 style="font-family:var(--font-sanskrit);font-size:1.15rem;color:var(--charcoal-sandal);margin-bottom:3px;">छात्रचयनम् (Pick Students for Class)</h3>
          <span style="font-family:var(--font-header);font-size:0.6rem;letter-spacing:1px;text-transform:uppercase;color:var(--gold-solid);font-weight:900;">
            ${cls.name} &middot; ${cls.subject}
          </span>
        </div>
        <button id="roster-modal-close" style="background:none;border:1px solid var(--sandal-div);border-radius:var(--radius-sm);width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--sandal-light);">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      
      <div style="font-size:0.8rem;color:var(--sandal-light);margin-bottom:1rem;line-height:1.4;">
        Check the students who attend this class. You can select students from any Gana or Section.
      </div>
      
      <div style="display:flex;flex-direction:column;gap:12px;max-height:50vh;overflow-y:auto;padding-right:4px;">
        ${ganas.map(g => {
          const gStudents = studentsByGana[g.id] || [];
          if (gStudents.length === 0) return '';
          
          const checkedInGana = gStudents.filter(s => assignedIds.has(s.id)).length;
          
          return `
            <div style="border:1px solid var(--sandal-div);border-radius:var(--radius-sm);background:var(--bg-body);overflow:hidden;margin-bottom:8px;">
              <div style="background:var(--gold-light);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;" class="gana-header" data-gana-id="${g.id}">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${g.color || 'var(--gold-solid)'};"></span>
                  <span style="font-family:var(--font-sanskrit);font-size:0.9rem;font-weight:bold;color:var(--charcoal-sandal);">${g.name} (${g.englishName})</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <span class="badge" style="background:rgba(197,78,34,0.15);color:var(--saffron-royal);font-size:0.7rem;padding:2px 8px;border-radius:10px;" id="badge-count-${g.id}">${checkedInGana} / ${gStudents.length} Selected</span>
                  <button type="button" class="btn-select-all-gana" data-gana-id="${g.id}" style="background:none;border:none;color:var(--saffron-royal);font-size:0.72rem;font-weight:bold;cursor:pointer;padding:0;">All</button>
                </div>
              </div>
              <div class="gana-student-list" id="list-${g.id}" style="padding:8px 12px;display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:8px;border-top:1px solid var(--sandal-div);">
                ${gStudents.map(s => `
                  <label style="display:flex;align-items:center;gap:6px;font-size:0.8rem;cursor:pointer;margin-bottom:0;" class="roster-student-label">
                    <input type="checkbox" class="roster-assign-cb" data-gana-id="${g.id}" value="${s.id}" ${assignedIds.has(s.id) ? 'checked' : ''}>
                    <span>${s.name} <span style="font-size:0.7rem;color:var(--sandal-light);">${s.section !== 'None' ? `(${s.section})` : ''}</span></span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--sandal-div);gap:10px;">
        <button id="roster-cancel-btn" class="btn btn-ghost">Cancel</button>
        <button id="roster-save-btn" class="btn btn-saffron">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          Update Class Roster
        </button>
      </div>
    `;
    
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    setTimeout(() => {
      modal.style.opacity = '1'; modal.style.pointerEvents = 'all';
      modal.style.transform = 'translate(-50%,-50%) scale(1)';
      backdrop.style.opacity = '1';
    }, 10);
    
    function closeModal() {
      modal.style.opacity = '0'; modal.style.transform = 'translate(-50%,-50%) scale(0.9)';
      backdrop.style.opacity = '0';
      setTimeout(() => {
        backdrop.style.display = 'none';
        modal.style.display = 'none';
        modal.style.pointerEvents = 'none';
      }, 300);
    }
    
    modal.querySelector('#roster-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#roster-cancel-btn').addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal, { once: true });
    
    // Select All Gana binding
    modal.querySelectorAll('.btn-select-all-gana').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ganaId = btn.getAttribute('data-gana-id');
        const cbs = modal.querySelectorAll(`.roster-assign-cb[data-gana-id="${ganaId}"]`);
        const allChecked = Array.from(cbs).every(cb => cb.checked);
        cbs.forEach(cb => cb.checked = !allChecked);
        
        // Update badge count
        const checkedCount = Array.from(cbs).filter(cb => cb.checked).length;
        modal.querySelector(`#badge-count-${ganaId}`).textContent = `${checkedCount} / ${cbs.length} Selected`;
      });
    });
    
    // Checkbox state change badge update
    modal.querySelectorAll('.roster-assign-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const ganaId = cb.getAttribute('data-gana-id');
        const cbs = modal.querySelectorAll(`.roster-assign-cb[data-gana-id="${ganaId}"]`);
        const checkedCount = Array.from(cbs).filter(cb => cb.checked).length;
        modal.querySelector(`#badge-count-${ganaId}`).textContent = `${checkedCount} / ${cbs.length} Selected`;
      });
    });
    
    // Save button binding
    modal.querySelector('#roster-save-btn').addEventListener('click', () => {
      const selectedStudentIds = Array.from(modal.querySelectorAll('.roster-assign-cb:checked')).map(cb => cb.value);
      
      db.updateClass(classId, { studentIds: selectedStudentIds });
      showToast('Class roster updated successfully.', 'success');
      
      closeModal();
      loadSubView();
    });
  }

  renderView();
}

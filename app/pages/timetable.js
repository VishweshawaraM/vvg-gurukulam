/*
  Veda Vijnana Gurukulam Management System
  Daily Timetable — समयसारिणी २०२६-२७
  Real Schedule | All 8 Ganas | Live Slot Indicator | Print-Ready
*/

import { db } from '../database.js';
import { router } from '../router.js';

export function renderTimetable(container, appInstance) {
  const user = router.getUserSession();
  const canEdit = user && ['Admin', 'Office Staff'].includes(user.role);

  let activeView = 'daily';     // 'daily' | 'gana'
  let selectedGanaId = null;    // for single-gana view
  let editingSlot = null;

  const SLOT_IDS = ['slot_1','slot_2','slot_3','slot_4','slot_5','slot_6','slot_7'];

  function showToast(msg, type = 'success') {
    let tc = document.querySelector('.toast-container');
    if (!tc) { tc = document.createElement('div'); tc.className = 'toast-container'; document.body.appendChild(tc); }
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${msg}</span>`;
    tc.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 3500);
  }

  function getCurrentSlotId() {
    const s = db.getCurrentSlot();
    return s ? s.id : null;
  }

  function downloadCSV() {
    const daily = db.getDailyTimetable();
    const ganas = db.getAllGanas();
    const rows = [['Time Slot', 'Sanskrit Name', 'Time', ...ganas.map(g => g.name + ' / ' + g.englishName)]];
    daily.forEach(({ slotInfo, ganaSlots }) => {
      const cols = [slotInfo.labelEn, slotInfo.label, slotInfo.time];
      ganaSlots.forEach(({ slot }) => {
        cols.push(slot && slot.engSubject ? `${slot.engSubject} – ${slot.teacherEn || ''}` : '—');
      });
      rows.push(cols);
    });
    const csv = rows.map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VVG_Timetable_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Timetable exported successfully.', 'success');
  }

  function renderView() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const ganas = db.getAllGanas();
    const currentSlotId = getCurrentSlotId();

    container.innerHTML = `
      <div class="page-hero">
        <div class="page-hero-text">
          <h2 class="page-hero-title">समयसारिणी</h2>
          <span class="page-hero-subtitle">॥ वेदविज्ञानगुरुकुलम् — दैनिकसमयसारिणी २०२६-२७ ॥</span>
        </div>
        <div class="page-hero-meta">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="academic-year-tag">${dateStr}</span>
            <button class="btn btn-ghost btn-sm" id="btn-export-tt-csv">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            <button class="btn btn-ghost btn-sm no-print" id="btn-print-tt">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="no-print" style="display:flex;gap:8px;margin-bottom:1.5rem;flex-wrap:wrap;align-items:center;">
        <button class="btn ${activeView === 'daily' ? 'btn-saffron' : 'btn-ghost'}" id="btn-view-daily">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          सम्पूर्णसारिणी (All Ganas — Daily View)
        </button>
        <button class="btn ${activeView === 'gana' ? 'btn-saffron' : 'btn-ghost'}" id="btn-view-gana">
          <svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="3"/><circle cx="15" cy="5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M13 13a6 6 0 0 1 8 6"/></svg>
          गणसारिणी (Single Gana View)
        </button>

        ${currentSlotId ? `
          <div style="margin-left:auto;background:linear-gradient(135deg,var(--saffron-royal),#E07820);color:#fff;padding:0.4rem 1rem;border-radius:var(--radius-md);font-size:0.78rem;font-weight:800;display:flex;align-items:center;gap:6px;font-family:var(--font-header);letter-spacing:0.5px;">
            <span style="width:8px;height:8px;background:#fff;border-radius:50%;animation:pulse-dot 1.5s ease-in-out infinite;"></span>
            LIVE — ${db.getTimeSlots()[currentSlotId]?.time || ''}
          </div>
        ` : ''}
      </div>

      <!-- Content -->
      <div id="tt-content-area"></div>

      <!-- Slot Edit Modal -->
      <div id="tt-backdrop" style="display:none;position:fixed;inset:0;background:rgba(45,26,16,0.5);backdrop-filter:blur(4px);z-index:400;transition:opacity 0.3s;opacity:0;"></div>
      <div id="tt-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);background:var(--bg-parchment);border:1.5px solid var(--gold-solid);border-radius:var(--radius-lg);padding:2rem;width:500px;max-width:95vw;z-index:500;box-shadow:0 20px 60px rgba(45,26,16,0.25);opacity:0;pointer-events:none;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1),opacity 0.3s ease;"></div>
    `;

    // Bindings
    container.querySelector('#btn-view-daily').addEventListener('click', () => { activeView = 'daily'; renderView(); });
    container.querySelector('#btn-view-gana').addEventListener('click', () => { activeView = 'gana'; renderView(); });
    container.querySelector('#btn-export-tt-csv').addEventListener('click', downloadCSV);
    container.querySelector('#btn-print-tt').addEventListener('click', () => window.print());

    if (activeView === 'daily') renderDailyView();
    else renderGanaView();
  }

  // ═══ ALL-GANA DAILY TABLE VIEW ═══
  function renderDailyView() {
    const daily = db.getDailyTimetable();
    const ganas = db.getAllGanas();
    const currentSlotId = getCurrentSlotId();

    const target = container.querySelector('#tt-content-area');
    target.innerHTML = `
      <div class="gurukula-card" style="padding:0;overflow:hidden;" id="tt-main-card">

        <!-- Legend -->
        <div class="no-print" style="padding:0.85rem 1.5rem;background:var(--gold-bg);border-bottom:1px solid var(--gold-solid);display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <span style="font-family:var(--font-header);font-size:0.62rem;letter-spacing:2px;text-transform:uppercase;color:var(--sandal-light);font-weight:900;">Legend:</span>
            <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;color:var(--charcoal-sandal);">
              <span style="width:10px;height:10px;background:var(--saffron-royal);border-radius:2px;opacity:0.2;display:inline-block;outline:2px solid var(--saffron-royal);"></span>
              Current Period
            </span>
            <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;color:var(--charcoal-sandal);">
              <span style="width:10px;height:10px;background:var(--forest-tulsi);border-radius:2px;display:inline-block;"></span>
              Active Class
            </span>
            <span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;color:var(--charcoal-sandal);">
              <span style="width:10px;height:10px;background:var(--sandal-div);border-radius:2px;display:inline-block;"></span>
              Free / Self Study
            </span>
          </div>
          ${canEdit ? `<span style="font-size:0.7rem;color:var(--sandal-light);font-weight:600;">✏ Click any cell to edit</span>` : ''}
        </div>

        <!-- Scrollable Table Wrapper -->
        <div style="overflow-x:auto;">
          <table class="tt-full-table" id="tt-full-table">
            <thead>
              <tr>
                <th class="tt-time-head">
                  <div>वेलाः</div>
                  <div style="font-size:0.55rem;font-weight:400;opacity:0.7;">TIME SLOT</div>
                </th>
                ${ganas.map(g => `
                  <th class="tt-gana-head" style="border-top:3px solid ${g.color};">
                    <span class="tt-gana-name">${g.name}</span>
                    <span class="tt-gana-sub">${g.englishName}</span>
                    <span class="tt-gana-branch">${g.specialization || ''}</span>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${daily.map(({ slotId, slotInfo, ganaSlots }) => {
                const isCurrentSlot = slotId === currentSlotId;
                return `
                  <tr class="tt-row ${isCurrentSlot ? 'tt-row-current' : ''}">
                    <td class="tt-time-cell ${isCurrentSlot ? 'tt-time-active' : ''}">
                      ${isCurrentSlot ? `<span class="tt-live-pill">LIVE</span>` : ''}
                      <div class="tt-slot-label">${slotInfo.label}</div>
                      <div class="tt-slot-sub">${slotInfo.labelEn}</div>
                      <div class="tt-slot-time">${slotInfo.time}</div>
                    </td>
                    ${ganaSlots.map(({ gana, slot }) => {
                      const isEmpty = !slot || !slot.subject;
                      return `
                        <td class="tt-subject-cell ${isEmpty ? 'tt-empty-cell' : ''} ${isCurrentSlot && !isEmpty ? 'tt-active-cell' : ''}"
                          data-gana-id="${gana.id}" data-slot-id="${slotId}"
                          ${canEdit ? 'style="cursor:pointer;"' : ''}>
                          ${!isEmpty ? `
                            <div class="tt-subject-body">
                              <div class="tt-subject-sa">${slot.subject}</div>
                              <div class="tt-subject-en">${slot.engSubject}</div>
                              ${slot.teacher ? `
                                <div class="tt-teacher">
                                  <svg viewBox="0 0 24 24" style="width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0;"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a6 6 0 0 1 12 0v2"/></svg>
                                  ${slot.teacher}
                                </div>
                              ` : ''}
                            </div>
                            ${canEdit ? `<button class="tt-edit-btn no-print" data-gana-id="${gana.id}" data-slot-id="${slotId}" title="Edit">✏</button>` : ''}
                          ` : `
                            <span class="tt-free-label">—</span>
                            ${canEdit ? `<button class="tt-edit-btn no-print tt-add-btn" data-gana-id="${gana.id}" data-slot-id="${slotId}" title="Add class">+</button>` : ''}
                          `}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Edit bindings
    if (canEdit) {
      target.querySelectorAll('.tt-subject-cell, .tt-edit-btn, .tt-add-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-gana-id]');
          if (!btn) return;
          openSlotEditor(btn.getAttribute('data-gana-id'), btn.getAttribute('data-slot-id'));
        });
      });
    }
  }

  // ═══ SINGLE GANA VIEW ═══
  function renderGanaView() {
    const ganas = db.getAllGanas();
    const timeSlots = db.getTimeSlots();
    const currentSlotId = getCurrentSlotId();

    if (!selectedGanaId) selectedGanaId = ganas[0].id;
    const selectedGana = ganas.find(g => g.id === selectedGanaId);
    const ganaTimetable = db.getTimetable(selectedGanaId) || {};

    const target = container.querySelector('#tt-content-area');
    target.innerHTML = `
      <!-- Gana Chips -->
      <div class="chip-filter no-print" id="gana-chips" style="flex-wrap:wrap;margin-bottom:1.5rem;">
        ${ganas.map(g => `
          <button class="chip ${g.id === selectedGanaId ? 'active' : ''}" data-gana-id="${g.id}"
            style="${g.id === selectedGanaId ? `background:${g.color};border-color:${g.color};color:#fff;box-shadow:0 2px 12px ${g.color}50;` : ''}">
            <span style="font-family:var(--font-sanskrit-body);font-size:0.85rem;">${g.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Gana Info Banner -->
      <div class="gurukula-card" style="padding:1rem 1.5rem;margin-bottom:1.25rem;background:linear-gradient(135deg,var(--gold-light),var(--bg-card));border-left:5px solid ${selectedGana.color};">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <span style="font-family:var(--font-sanskrit-body);font-size:1.4rem;color:var(--charcoal-sandal);font-weight:700;display:block;">${selectedGana.name}</span>
            <span style="font-family:var(--font-header);font-size:0.62rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold-solid);font-weight:900;">${selectedGana.englishName} · ${selectedGana.vedaBranch}</span>
          </div>
          <div style="display:flex;gap:14px;font-size:0.8rem;font-weight:700;color:var(--sandal-light);">
            <span>Room: ${selectedGana.room}</span>
            <span>Students: ${db.getAllStudents().filter(s => s.ganaId === selectedGanaId).length}</span>
          </div>
        </div>
      </div>

      <!-- Single-Gana Schedule Cards -->
      <div style="display:flex;flex-direction:column;gap:10px;" id="gana-slot-list">
        ${SLOT_IDS.map(slotId => {
          const slotInfo = timeSlots[slotId] || { label: slotId, labelEn: slotId, time: '' };
          const slot = ganaTimetable[slotId];
          const isActive = slotId === currentSlotId;
          const isEmpty = !slot || !slot.subject;

          return `
            <div class="gana-schedule-row ${isActive ? 'active-schedule-row' : ''}" data-slot-id="${slotId}">
              <!-- Time Block -->
              <div class="gana-sched-time ${isActive ? 'active-time-block' : ''}">
                ${isActive ? `<div class="live-dot-wrapper"><span class="live-dot"></span></div>` : ''}
                <div class="gana-sched-slot-label">${slotInfo.label}</div>
                <div class="gana-sched-slot-en">${slotInfo.labelEn}</div>
                <div class="gana-sched-slot-time">${slotInfo.time}</div>
              </div>

              <!-- Subject Block -->
              <div class="gana-sched-subject ${isEmpty ? 'gana-sched-empty' : ''}">
                ${!isEmpty ? `
                  <div class="gana-sched-subject-sa">${slot.subject}</div>
                  <div class="gana-sched-subject-en">${slot.engSubject}</div>
                  ${slot.teacher ? `
                    <div class="gana-sched-teacher">
                      <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a6 6 0 0 1 12 0v2"/></svg>
                      ${slot.teacher}
                      ${slot.teacherEn && slot.teacherEn !== slot.teacher ? `<span style="opacity:0.6;font-size:0.65rem;"> (${slot.teacherEn})</span>` : ''}
                    </div>
                  ` : ''}
                ` : `<span class="gana-sched-free">— स्वाध्यायः / Free Period —</span>`}
              </div>

              ${canEdit ? `
                <button class="gana-sched-edit-btn no-print" data-gana-id="${selectedGanaId}" data-slot-id="${slotId}">
                  <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Gana chip clicks
    target.querySelector('#gana-chips').addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      selectedGanaId = btn.getAttribute('data-gana-id');
      renderGanaView();
    });

    // Edit buttons
    if (canEdit) {
      target.querySelectorAll('.gana-sched-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openSlotEditor(btn.getAttribute('data-gana-id'), btn.getAttribute('data-slot-id')));
      });
    }
  }

  // ═══ SLOT EDITOR MODAL ═══
  function openSlotEditor(ganaId, slotId) {
    const ganas = db.getAllGanas();
    const gana = ganas.find(g => g.id === ganaId);
    const timeSlots = db.getTimeSlots();
    const slotInfo = timeSlots[slotId] || { label: slotId, labelEn: slotId, time: '' };
    const current = (db.getTimetable(ganaId) || {})[slotId] || {};
    const modal = container.querySelector('#tt-modal');
    const backdrop = container.querySelector('#tt-backdrop');

    modal.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;border-bottom:1px solid var(--sandal-div);padding-bottom:1rem;">
        <div>
          <h3 style="font-family:var(--font-sanskrit);font-size:1.1rem;color:var(--charcoal-sandal);font-weight:normal;margin-bottom:3px;">समयखण्ड-सम्पादनम्</h3>
          <span style="font-family:var(--font-header);font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold-solid);font-weight:900;">
            ${gana?.name} · ${slotInfo.label} (${slotInfo.time})
          </span>
        </div>
        <button id="modal-close-btn" style="background:none;border:1px solid var(--sandal-div);border-radius:var(--radius-sm);width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--sandal-light);">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style="display:grid;gap:1rem;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label"><span>Subject (Sanskrit) *</span><span class="form-label-sanskrit">विषयः संस्कृते</span></label>
          <input type="text" id="slot-subj-sa" class="form-control" value="${current.subject || ''}" placeholder="यथा — सिद्धान्तकौमुदी">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label"><span>Subject (English) *</span></label>
          <input type="text" id="slot-subj-en" class="form-control" value="${current.engSubject || ''}" placeholder="e.g. Siddhanta Kaumudi">
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label"><span>Teacher (Sanskrit)</span><span class="form-label-sanskrit">आचार्यः</span></label>
            <input type="text" id="slot-teacher-sa" class="form-control" value="${current.teacher || ''}" placeholder="यथा — अरुणाचार्यः">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label"><span>Teacher (English)</span></label>
            <input type="text" id="slot-teacher-en" class="form-control" value="${current.teacherEn || ''}" placeholder="e.g. Arunacharya">
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--sandal-div);">
        <button id="slot-clear-btn" class="btn btn-ghost" style="color:var(--agni-red);border-color:rgba(184,59,59,0.3);">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--agni-red);fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          Clear Slot
        </button>
        <div style="display:flex;gap:10px;">
          <button id="slot-cancel-btn" class="btn btn-ghost">Cancel</button>
          <button id="slot-save-btn" class="btn btn-saffron">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            संरक्षणम् (Save)
          </button>
        </div>
      </div>
    `;

    // Show modal
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    setTimeout(() => {
      modal.style.opacity = '1'; modal.style.pointerEvents = 'all';
      modal.style.transform = 'translate(-50%,-50%) scale(1)';
      backdrop.style.opacity = '1';
      backdrop.style.transition = 'opacity 0.3s ease';
    }, 10);

    function closeModal() {
      modal.style.opacity = '0'; modal.style.transform = 'translate(-50%,-50%) scale(0.9)';
      backdrop.style.opacity = '0';
      setTimeout(() => { backdrop.style.display = 'none'; modal.style.display = 'none'; modal.style.pointerEvents = 'none'; }, 300);
    }

    modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('#slot-cancel-btn').addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal, { once: true });

    modal.querySelector('#slot-clear-btn').addEventListener('click', () => {
      if (!confirm('Clear this time slot?')) return;
      db.saveTimetableSlot(ganaId, slotId, { subject: '', engSubject: '', teacher: '', teacherEn: '' });
      closeModal();
      showToast('Slot cleared.', 'success');
      setTimeout(() => { if (activeView === 'daily') renderDailyView(); else renderGanaView(); }, 300);
    });

    modal.querySelector('#slot-save-btn').addEventListener('click', () => {
      const sa = modal.querySelector('#slot-subj-sa').value.trim();
      const en = modal.querySelector('#slot-subj-en').value.trim();
      const tSa = modal.querySelector('#slot-teacher-sa').value.trim();
      const tEn = modal.querySelector('#slot-teacher-en').value.trim();
      if (!sa || !en) { showToast('Please fill both Sanskrit and English subject names.', 'error'); return; }
      db.saveTimetableSlot(ganaId, slotId, { subject: sa, engSubject: en, teacher: tSa, teacherEn: tEn });
      closeModal();
      showToast('Timetable slot updated successfully.', 'success');
      setTimeout(() => { if (activeView === 'daily') renderDailyView(); else renderGanaView(); }, 300);
    });
  }

  renderView();
}

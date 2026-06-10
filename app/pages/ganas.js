/* 
  Veda Vijnana Gurukulam Management System
  Gana (Divisions) Management Page Module
*/

import { db } from '../database.js?v=3.5';

export function renderGanas(container, appInstance) {
  const ganas = db.getAllGanas();
  const acharyas = db.getAllAcharyas();
  const students = db.getAllStudents();
  
  // Local state for active selected Gana details
  let activeGanaId = 'gan_1'; // Default show प्रथमगणः details

  function drawGanasView() {
    const activeGana = ganas.find(g => g.id === activeGanaId) || ganas[0];
    const assignedAcharya = acharyas.find(a => a.id === activeGana.assignedAcharyaId);
    
    // Roster of students in this Gana
    const ganaStudents = students.filter(s => s.ganaId === activeGana.id);
    
    // Attendance statistics
    const todayStr = new Date().toISOString().split('T')[0];
    const historicalAttendance = db.getAttendance(activeGana.id, todayStr);
    let todayAttendanceText = 'Not marked yet';
    let presentCount = 0;
    
    if (historicalAttendance) {
      let trackedStudentIds = new Set();
      let presentStudentIds = new Set();
      const hasSlotKeys = Object.keys(historicalAttendance).some(k => k.startsWith('slot_'));
      if (hasSlotKeys) {
        Object.values(historicalAttendance).forEach(slotLog => {
           if (slotLog && typeof slotLog === 'object') {
             Object.keys(slotLog).forEach(studentId => {
                trackedStudentIds.add(studentId);
                if (slotLog[studentId] === 'Present') presentStudentIds.add(studentId);
             });
           }
        });
      } else {
        // Direct format (old or seeded)
        Object.entries(historicalAttendance).forEach(([studentId, status]) => {
           trackedStudentIds.add(studentId);
           if (status === 'Present') presentStudentIds.add(studentId);
        });
      }
      const total = trackedStudentIds.size;
      presentCount = presentStudentIds.size;
      todayAttendanceText = total > 0 ? `${Math.round((presentCount/total)*100)}% Present (${presentCount}/${total} Students)` : '0%';
    }

    // Load weekly timetable for this Gana
    const weeklyTimetable = db.getTimetable(activeGana.id) || {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slots = [
      { id: 'slot_1', label: '06:00 - 07:30', name: 'प्रातः सन्ध्यावन्दनम्' },
      { id: 'slot_2', label: '09:30 - 11:00', name: 'वेदसंहितापाठः' },
      { id: 'slot_3', label: '11:30 - 01:00', name: 'वेदभाष्यम् / व्याकरणम्' },
      { id: 'slot_4', label: '03:00 - 04:30', name: 'स्वाध्यायः' },
      { id: 'slot_5', label: '06:00 - 07:30', name: 'सायं सन्ध्यावन्दनम्' }
    ];

    container.innerHTML = `
      <!-- Module Header -->
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.8rem; color: var(--sandalwood); margin-bottom: 0.2rem;">गणप्रबन्धनम् (Gana Management)</h2>
        <span style="font-family: var(--font-sanskrit); color: var(--saffron-primary); font-size: 0.95rem;">॥ अष्टगणाः (The Eight traditional divisions of our Gurukula) ॥</span>
      </div>

      <!-- 8 Ganas Horizontal Grid -->
      <div class="gana-cards-grid" style="margin-bottom: 2rem;">
        ${ganas.map(g => {
          const count = students.filter(s => s.ganaId === g.id).length;
          const acharya = acharyas.find(a => a.id === g.assignedAcharyaId);
          const achName = acharya ? acharya.name.split(' ').slice(1).join(' ') : 'No Teacher';
          const isActive = g.id === activeGanaId;
          
          return `
            <div class="gurukula-card ${isActive ? 'framed' : ''}" data-gana-id="${g.id}" style="cursor: pointer; padding: 1.25rem; margin-bottom: 0; ${isActive ? 'border-color: var(--saffron-primary); background-color: var(--gold-light);' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 class="devanagari" style="font-size: 1.2rem; color: ${isActive ? 'var(--saffron-primary)' : 'var(--sandalwood)'};">${g.name}</h3>
                <span class="badge ${isActive ? 'badge-saffron' : 'badge-shastra'}">${g.englishName}</span>
              </div>
              <div class="gana-card-details" style="font-size: 0.8rem; margin: 0.5rem 0;">
                <div class="gana-detail-row">
                  <span class="gana-detail-label">आचार्यः (Acharya):</span>
                  <span class="gana-detail-value">${achName}</span>
                </div>
                <div class="gana-detail-row">
                  <span class="gana-detail-label">छात्राः (Students):</span>
                  <span class="gana-detail-value">${count} Scholars</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Split Layout showing details of active Gana -->
      <div class="dashboard-split-layout">
        
        <!-- Left details panel: Acharya details & Students Roster -->
        <div>
          <!-- Gana Overview Card -->
          <div class="gurukula-card framed">
            <div class="card-header">
              <h3 class="card-title">
                <svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>${activeGana.name} विवरणम् (Overview)</span>
              </h3>
              <span class="card-sanskrit-tag">${activeGana.englishName}</span>
            </div>

            <div class="student-detail-grid" style="margin-bottom: 0;">
              <div class="student-info-item">
                <span class="student-info-label">कोशकुटीशाला (Assigned Hall)</span>
                <span class="student-info-value">${activeGana.room}</span>
              </div>
              
              <div class="student-info-item">
                <span class="student-info-label">अद्यतन-उपस्थितिः (Today's Attendance)</span>
                <span class="student-info-value" style="color: var(--saffron-primary);">${todayAttendanceText}</span>
              </div>
            </div>

            <div style="margin-top: 1.5rem; display: flex; gap: 15px; align-items: center; padding: 0.85rem; background-color: var(--gold-light); border-radius: var(--radius-md); border: 1px solid var(--gold-border);">
              <div class="user-avatar" style="width: 44px; height: 44px; background-color: var(--sandalwood); color: #FAF7F0;">आ</div>
              <div>
                <span class="student-info-label" style="margin-bottom: 0;">नियुक्तः गुरुः (Assigned Acharya Scholar)</span>
                <h4 style="font-family: var(--font-header); font-size: 1rem; color: var(--sandalwood);">${assignedAcharya ? assignedAcharya.name : 'Unassigned'}</h4>
                <p style="font-size: 0.75rem; color: var(--saffron-primary); font-style: italic;">
                  ${assignedAcharya ? assignedAcharya.specialization : ''}
                </p>
              </div>
            </div>
          </div>

          <!-- Students Roster Card -->
          <div class="gurukula-card">
            <div class="card-header">
              <h3 class="card-title">
                <svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <span>गणच्छात्रसूची (Enrolled Students Roster)</span>
              </h3>
              <span class="card-sanskrit-tag">${ganaStudents.length} Students</span>
            </div>

            <table class="traditional-table" style="font-size: 0.85rem;">
              <thead>
                <tr>
                  <th>नाम (Name)</th>
                  <th>विशेषविषयः (Specialized Subject)</th>
                </tr>
              </thead>
              <tbody>
                ${ganaStudents.length === 0 
                  ? `<tr><td colspan="4" style="text-align: center; color: var(--sandalwood-light);">No students enrolled in this Gana.</td></tr>`
                  : ganaStudents.map(s => `
                    <tr>
                      <td><b>${s.name}</b><br><span class="devanagari" style="color: var(--saffron-primary); font-size: 0.8rem;">${s.sanskritName || ''}</span></td>
                      <td>${s.veda || ''}${s.shastra && s.shastra !== 'None' ? ' / ' + s.shastra : ''}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right details panel: Weekly Timetable snapshot -->
        <div>
          <div class="gurukula-card framed" style="min-height: 400px;">
            <div class="card-header">
              <h3 class="card-title">
                <svg><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>समयसारिणी (Weekly Timetable Preview)</span>
              </h3>
              <span class="card-sanskrit-tag">साप्ताहिकम्</span>
            </div>

            ${Object.keys(weeklyTimetable).length === 0 
              ? `
                <div style="text-align: center; color: var(--sandalwood-light); padding: 3rem 1rem;">
                  <svg style="width: 48px; height: 48px; stroke: var(--gold-border); fill: none; stroke-width: 1.5; margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p>No timetable initialized for this Gaṇa yet.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 12px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
                  ${(() => {
                    const dbSlots = db.getTimeSlots();
                    const slotIds = ['slot_1','slot_2','slot_3','slot_4','slot_5','slot_6','slot_7'];
                    let renderedAny = false;
                    const html = slotIds.map(slotId => {
                      const slotInfo = dbSlots[slotId] || { label: slotId, labelEn: slotId, time: '' };
                      const classIds = weeklyTimetable[slotId] || [];
                      const slotClasses = classIds.map(id => db.getClassById(id)).filter(Boolean);
                      if (slotClasses.length === 0) return '';
                      
                      renderedAny = true;
                      return `
                        <div style="padding: 0.75rem; background-color: var(--gold-light); border: 1px solid rgba(196,164,104,0.3); border-radius: var(--radius-md);">
                          <h4 style="font-family: var(--font-header); font-size: 0.82rem; color: var(--sandalwood); border-bottom: 1px dashed var(--gold-border); padding-bottom: 3px; margin-bottom: 6px;">
                            ${slotInfo.label} (${slotInfo.time || ''})
                          </h4>
                          ${slotClasses.map(c => `
                            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px; padding-bottom: 2px;">
                              <div>
                                <span style="font-weight: 600; color: var(--saffron-primary);">${c.name}</span> — 
                                <span class="devanagari" style="font-weight: 500;">${c.subject}</span>
                              </div>
                              <div style="font-weight: 600; color: var(--sandalwood);">${c.acharyaName || 'Unassigned'}</div>
                            </div>
                          `).join('')}
                        </div>
                      `;
                    }).join('');
                    
                    return renderedAny ? html : `<p style="font-size:0.8rem; color:var(--sandal-light); text-align:center; padding:3rem;">No classes scheduled for this Gana.</p>`;
                  })()}
                </div>
              `}
          </div>
        </div>

      </div>
    `;

    // Add select listeners on Gana cards
    container.querySelectorAll('.gana-cards-grid .gurukula-card').forEach(card => {
      card.addEventListener('click', () => {
        activeGanaId = card.getAttribute('data-gana-id');
        drawGanasView();
      });
    });
  }

  drawGanasView();
}

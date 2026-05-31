const fs = require('fs');
let code = fs.readFileSync('app/pages/attendance.js', 'utf-8');

const start = 'function renderMarkTab(target, ganaStudents, selectedGana) {';
const end = '  function renderMarkTabGrid(';
const startIndex = code.indexOf(start);
const endIndex = code.indexOf(end);

if (startIndex > -1 && endIndex > -1) {
  const newFunc = `function renderMarkTab(target, ganaStudents, selectedGana) {
    const slots = [
      { id: 'slot_1', label: '06:00 - 07:30', name: 'प्रातः सन्ध्यावन्दनम्' },
      { id: 'slot_2', label: '09:30 - 11:00', name: 'वेदसंहितापाठः' },
      { id: 'slot_3', label: '11:30 - 01:00', name: 'वेदभाष्यम् / व्याकरणम्' },
      { id: 'slot_4', label: '03:00 - 04:30', name: 'स्वाध्यायः' },
      { id: 'slot_5', label: '06:00 - 07:30', name: 'सायं सन्ध्यावन्दनम्' }
    ];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDateObj = new Date(selectedDateStr);
    const dayName = dayNames[selectedDateObj.getDay()];

    const weeklyTimetable = db.getTimetable(selectedGanaId) || {};
    const dayClasses = weeklyTimetable[dayName] || {};

    const activeSlots = Object.entries(dayClasses).filter(([k, v]) => v && v.subject);

    let html = \`
      <div class="gurukula-card framed">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>\${selectedGana?.name || ''} — Class Log & Attendance (\${dayName})</span>
          </h3>
          <span class="card-sanskrit-tag" style="color:\${selectedGana?.color || 'var(--saffron-royal)'};">\${selectedGana?.englishName || ''}</span>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--sandal-light); display: block; margin-bottom: 3px;">Select Date</label>
          <input type="date" id="attend-date-input" class="form-control" style="width: 200px; padding: 0.5rem 0.85rem;" value="\${selectedDateStr}">
        </div>
    \`;

    if (activeSlots.length === 0) {
      html += \`
        <div style="text-align: center; padding: 3rem; color: var(--sandal-light);">
          <p>No classes scheduled for \${dayName} in the timetable.</p>
        </div>
      </div>\`;
      target.innerHTML = html;
    } else {
      html += \`<div style="display: flex; flex-direction: column; gap: 1.5rem;">\`;
      
      activeSlots.forEach(([slotId, details]) => {
        const slotInfo = slots.find(s => s.id === slotId);
        const logData = db.getClassLog(selectedGanaId, selectedDateStr, slotId) || { present: ganaStudents.length, absent: 0, notes: '' };
        
        html += \`
          <div class="gurukula-card" style="margin: 0; background: var(--gold-light); border: 1px solid var(--gold-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--gold-border); padding-bottom: 0.8rem; margin-bottom: 1rem;">
              <div>
                <h4 style="font-family: var(--font-header); font-size: 1.1rem; color: var(--saffron-royal); margin-bottom: 0.2rem;">\${details.subject}</h4>
                <span style="font-size: 0.8rem; color: var(--sandalwood);">\${slotInfo?.label || ''} — \${details.engSubject}</span>
              </div>
            </div>
            
            <form class="class-log-form" data-slot-id="\${slotId}">
              <div class="form-row" style="margin-bottom: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 0.8rem;">Students Present</label>
                  <input type="number" name="present" class="form-control" value="\${logData.present}" min="0" required>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label" style="font-size: 0.8rem;">Students Absent</label>
                  <input type="number" name="absent" class="form-control" value="\${logData.absent}" min="0" required>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size: 0.8rem;">Class Notes (What was taught?)</label>
                <textarea name="notes" class="form-control" rows="3" placeholder="e.g. I taught Rigveda Mandala 1, Sukta 1. Everyone chanted well.">\${logData.notes}</textarea>
              </div>
              <button type="submit" class="btn btn-saffron" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Save Class Log</button>
              <span class="save-indicator" style="margin-left: 10px; font-size: 0.8rem; color: var(--forest-tulsi); display: none;">Saved!</span>
            </form>
          </div>
        \`;
      });
      
      html += \`</div></div>\`;
      target.innerHTML = html;
      
      // Bind form submits
      target.querySelectorAll('.class-log-form').forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const slotId = form.getAttribute('data-slot-id');
          const present = parseInt(form.querySelector('[name="present"]').value) || 0;
          const absent = parseInt(form.querySelector('[name="absent"]').value) || 0;
          const notes = form.querySelector('[name="notes"]').value;
          
          db.saveClassLog(selectedGanaId, selectedDateStr, slotId, { present, absent, notes });
          
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

  // Remove the old grid functions by just returning early or ignoring them
`;

  code = code.substring(0, startIndex) + newFunc + code.substring(endIndex);
  
  // also, we need to remove the renderMarkTabGrid function entirely so it doesn't cause errors if called
  code = code.replace(/function renderMarkTabGrid[\s\S]*?function renderRegisterTab/, 'function renderRegisterTab');
  
  fs.writeFileSync('app/pages/attendance.js', code);
  console.log('Successfully patched attendance module');
} else {
  console.log('Could not find renderMarkTab bounds');
}

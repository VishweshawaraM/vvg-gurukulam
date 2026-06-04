/* 
  Veda Vijnana Gurukulam Management System
  Student Management Page Module - Upgraded to Elite Traditional Specifications
*/

import { db } from '../database.js?v=3.5';
import { router } from '../router.js?v=3.5';

export function renderStudents(container, appInstance) {
  const user = router.getUserSession();
  const isReadOnly = user && user.role === 'Acharya';
  
  let searchTerm = '';
  let selectedGana = 'all';

  function renderList() {
    const students = db.getAllStudents();
    const ganas = db.getAllGanas();
    
    const filteredStudents = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.sanskritName.includes(searchTerm) || 
                          (s.veda && s.veda.toLowerCase().includes(searchTerm.toLowerCase())) || (s.section && s.section.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchGana = selectedGana === 'all' || s.ganaId === selectedGana;
      return matchSearch && matchGana;
    });

    const tableRows = filteredStudents.length === 0 
      ? `<tr><td colspan="${isReadOnly ? 5 : 6}" style="text-align: center; padding: 2rem; color: var(--sandal-light);">No student records found matching the search criteria.</td></tr>`
      : filteredStudents.map(s => {
          const gana = ganas.find(g => g.id === s.ganaId);
          const ganaName = gana ? gana.name : 'Unknown';
          
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="user-avatar" style="width: 36px; height: 36px; font-size: 0.95rem; background: var(--gold-leaf); color: var(--bg-card);">
                    ${s.name[0]}
                  </div>
                  <div>
                    <b>${s.name}</b><br>
                    <span class="devanagari-body" style="color: var(--saffron-royal); font-size: 0.8rem; font-weight: 700;">${s.sanskritName}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-saffron">${ganaName}</span></td>
              <td><span style="font-weight: 700; color: var(--gold-leaf);">${s.section && s.section !== 'None' ? s.section : 'None (Junior)'}</span></td>
              <td>${s.veda || 'None'}</td>
              ${!isReadOnly ? `
                <td>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-outline btn-sm btn-view-profile" data-id="${s.id}" title="View Profile" style="padding: 4px 10px;">
                      <svg viewBox="0 0 24 24" style="width:14px; height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn btn-gold btn-sm btn-edit-student" data-id="${s.id}" title="Edit Student" style="padding: 4px 10px;">
                      <svg viewBox="0 0 24 24" style="width:14px; height:14px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="btn btn-outline btn-sm btn-delete-student" data-id="${s.id}" style="border-color: rgba(184, 59, 59, 0.3); color: var(--agni-red); padding: 4px 10px;" title="Delete Student">
                      <svg viewBox="0 0 24 24" style="width:14px; height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </td>
              ` : `
                <td>
                  <button class="btn btn-outline btn-sm btn-view-profile" data-id="${s.id}">
                    <svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke: currentColor;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Profile
                  </button>
                </td>
              `}
            </tr>
          `;
        }).join('');

    const listContainer = container.querySelector('#students-list-body');
    if (listContainer) {
      listContainer.innerHTML = tableRows;

      const countEl = container.querySelector('#students-result-count');
      if (countEl) countEl.textContent = `${filteredStudents.length} of ${students.length} students`;
      
      listContainer.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', () => openProfileDrawer(btn.getAttribute('data-id')));
      });
      
      if (!isReadOnly) {
        listContainer.querySelectorAll('.btn-edit-student').forEach(btn => {
          btn.addEventListener('click', () => openEditDrawer(btn.getAttribute('data-id')));
        });
        listContainer.querySelectorAll('.btn-delete-student').forEach(btn => {
          btn.addEventListener('click', () => handleDeleteStudent(btn.getAttribute('data-id')));
        });
      }
    }
  }

  container.innerHTML = `
    <!-- Page Hero -->
    <div class="page-hero">
      <div class="page-hero-text">
        <h2 class="page-hero-title">छात्रसूची</h2>
        <span class="page-hero-subtitle">॥ छात्रपञ्जीकाविवरणम् — Roster of Traditional Veda Scholars ॥</span>
      </div>
      <div class="page-hero-meta">
        <span class="academic-year-tag" id="students-count-badge">${db.getAllStudents().length} Students Enrolled</span>
      </div>
    </div>

    <div class="gurukula-card framed">
      <div class="action-bar">
        <div class="filter-group">
          <div style="position:relative;">
            <svg viewBox="0 0 24 24" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;height:16px;fill:none;stroke:var(--sandal-light);stroke-width:2;pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="students-search" class="form-control" style="width: 240px; padding-left: 2.2rem;" placeholder="Search student name, Sanskrit...">
          </div>
          
          <select id="students-gana-filter" class="form-control" style="width: 200px;">
            <option value="all">सर्वगणाः (All Ganas)</option>
            ${db.getAllGanas().map(g => `<option value="${g.id}">${g.name} — ${g.englishName}</option>`).join('')}
          </select>

          <span id="students-result-count" style="font-size:0.8rem; font-weight:700; color:var(--sandal-light); white-space:nowrap;"></span>
        </div>
        
        <div class="action-group">
          ${!isReadOnly ? `
            <button class="btn btn-ghost btn-sm" id="btn-export-students-csv">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            <button class="btn btn-saffron" id="btn-add-student-trigger">
              <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
              <span>नूतनच्छात्रः (Add Student)</span>
            </button>
          ` : ''}
        </div>
      </div>

      <div class="table-responsive">
        <table class="traditional-table">
          <thead>
            <tr>
              <th>नाम (Name)</th>
              <th>गणः (Gaṇa)</th>
              <th>विभागः (Vibhāgaḥ)</th>
              <th>वेदः (Veda)</th>
              <th style="width: 140px;">कार्यम् (Actions)</th>
            </tr>
          </thead>
          <tbody id="students-list-body">
            <!-- Loaded dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Slide drawers and Backdrop -->
    <div class="drawer-backdrop" id="students-drawer-backdrop"></div>
    <div class="gurukula-drawer" id="students-drawer"></div>
  `;

  // Filter elements hooks
  const searchInput = container.querySelector('#students-search');
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderList();
  });

  const ganaSelect = container.querySelector('#students-gana-filter');
  ganaSelect.addEventListener('change', (e) => {
    selectedGana = e.target.value;
    renderList();
  });

  if (!isReadOnly) {
    container.querySelector('#btn-add-student-trigger').addEventListener('click', () => openAddDrawer());

    // CSV Export
    const csvBtn = container.querySelector('#btn-export-students-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        const csvData = db.generateCSVExport('students');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `VVG_Students_Export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }
  }

  const drawer = container.querySelector('#students-drawer');
  const backdrop = container.querySelector('#students-drawer-backdrop');

  function openDrawer(htmlContent) {
    drawer.innerHTML = htmlContent;
    drawer.classList.add('open');
    backdrop.classList.add('active');
    
    drawer.querySelectorAll('.btn-close-drawer, .drawer-close-btn').forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    setTimeout(() => {
      drawer.innerHTML = '';
    }, 300);
  }

  backdrop.addEventListener('click', closeDrawer);

  // VIEW STUDENT PROFILE DRAWER - Upgraded with Swara Gauges & Progress Bars
  function openProfileDrawer(id) {
    const student = db.getStudentById(id);
    if (!student) return;
    
    const gana = db.getAllGanas().find(g => g.id === student.ganaId);
    const ganaName = gana ? `${gana.name} (${gana.englishName})` : 'Unassigned';

    // Simulated dynamic metrics based on student ID to make it highly visual
    const swaraAccuracy = student.id === 'std_1' ? 96 : (student.id === 'std_3' ? 98 : 92);
    const regularRating = student.id === 'std_1' ? 98 : (student.id === 'std_6' ? 95 : 90);
    const vedaProgress = student.id === 'std_1' ? 78 : (student.id === 'std_3' ? 94 : 52);

    const content = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>छात्रविवरणपत्रिका</h2>
          <span>Student Dossier Details</span>
        </div>
        <button class="drawer-close-btn"><svg viewBox="0 0 24 24" style="width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="drawer-body">
        
        <!-- Photo and Header -->
        <div class="student-detail-profile-wrapper">
          <div class="student-photo-avatar" style="border: 2px solid var(--gold-solid); box-shadow: var(--shadow-temple);">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="student-profile-title">
            <h3 style="font-family: var(--font-header); font-size: 1.4rem; color: var(--charcoal-sandal);">${student.name}</h3>
            <p class="devanagari-display" style="color: var(--saffron-royal); font-size: 1.15rem; margin-top: 0.15rem;">${student.sanskritName}</p>
          </div>
        </div>

        <!-- UPGRADED: Circular Swara Pronunciation & Chanting Gauges -->
        <div class="gurukula-card" style="padding: 1.1rem; border-color: var(--gold-solid); background-color: var(--gold-light); margin-bottom: 1.5rem;">
          <span class="nav-group-title" style="padding: 0; font-size: 0.65rem; color: var(--saffron-royal); margin-bottom: 0.85rem; display: block; text-align: center;">
            ॥ वेदाध्ययन-मूल्याङ्कनम् (Vedic Scholar intonation Metrics) ॥
          </span>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.25rem;">
            <!-- Gauge 1: Swara -->
            <div class="circle-gauge-container">
              <div class="circle-gauge" style="background: conic-gradient(var(--forest-tulsi) 0% ${swaraAccuracy}%, var(--gold-bg) ${swaraAccuracy}% 100%);">
                <span class="circle-gauge-value">${swaraAccuracy}%</span>
              </div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--charcoal-sandal); text-align: center;">
                स्वरशुद्धता (Swara Accuracy)
              </span>
            </div>
            
            <!-- Gauge 2: Sandhyavandana -->
            <div class="circle-gauge-container">
              <div class="circle-gauge" style="background: conic-gradient(var(--forest-tulsi) 0% ${regularRating}%, var(--gold-bg) ${regularRating}% 100%);">
                <span class="circle-gauge-value">${regularRating}%</span>
              </div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--charcoal-sandal); text-align: center;">
                आह्निकनियमः (Devotion Regularity)
              </span>
            </div>
          </div>

          <!-- Progress Bar: Memorization progress -->
          <div style="border-top: 1px dashed rgba(196,164,104,0.3); padding-top: 0.85rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--charcoal-sandal); margin-bottom: 4px;">
              <span>कण्ठपाठ-प्रगतिः (Mantra Memorization)</span>
              <span style="color: var(--saffron-royal);">${vedaProgress}% Completed</span>
            </div>
            <div style="background-color: var(--bg-card); height: 8px; border-radius: 4px; overflow: hidden; border: 1px solid var(--gold-solid);">
              <div style="background: var(--saffron-glowing); width: ${vedaProgress}%; height: 100%;"></div>
            </div>
          </div>
        </div>

        <!-- Academic and personal profile details -->
        <div class="student-detail-grid">
          <div class="student-info-item">
            <span class="student-info-label">गणः (Gaṇa)</span>
            <span class="student-info-value" style="font-weight: 700; color: var(--saffron-royal);">${ganaName}</span>
          </div>
          
          <div class="student-info-item">
            <span class="student-info-label">विभागः (Vibhāgaḥ)</span>
            <span class="student-info-value" style="font-weight: 700; color: var(--gold-leaf);">${student.section && student.section !== 'None' ? student.section : 'None (Junior)'}</span>
          </div>
          
          <div class="student-info-item">
            <span class="student-info-label">वेदः (Veda)</span>
            <span class="student-info-value">${student.veda || 'None'}</span>
          </div>
          
          <div class="student-info-item">
            <span class="student-info-label">जन्मदिनाङ्कः (D.O.B)</span>
            <span class="student-info-value">${student.dob}</span>
          </div>
          
          <div class="student-info-item">
            <span class="student-info-label">प्रवेशदिनाङ्कः (Enrolled)</span>
            <span class="student-info-value">${student.joiningDate}</span>
          </div>
          

          <div class="student-info-item" style="grid-column: span 2;">
            <span class="student-info-label">पालकनाम (Parent Name)</span>
            <span class="student-info-value">${student.parentName}</span>
          </div>
          
          <div class="student-info-item" style="grid-column: span 2;">
            <span class="student-info-label">पालक-दूरभाषः (Contact)</span>
            <span class="student-info-value">${student.parentContact}</span>
          </div>
          
          <div class="student-info-item" style="grid-column: span 2;">
            <span class="student-info-label">मूलसङ्केतः (Address)</span>
            <span class="student-info-value" style="font-size: 0.85rem; font-weight: normal; color: var(--charcoal-sandal);">${student.address}</span>
          </div>
          
          <div class="student-info-item student-info-notes">
            <span class="student-info-label">टिप्पणी (Acharya Notes)</span>
            <span class="student-info-value" style="font-size: 0.85rem; font-weight: normal; font-style: italic; color: var(--charcoal-sandal);">
              ${student.notes || 'No academic notes configured.'}
            </span>
          </div>
        </div>

      </div>
      <div class="drawer-footer">
        <button class="btn btn-outline btn-close-drawer">पिधानम् (Close)</button>
      </div>
    `;
    
    openDrawer(content);
  }

  // ADD NEW STUDENT DRAWER FORM
  function openAddDrawer() {
    const content = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>नूतनच्छात्रपञ्जीकरणम्</h2>
          <span>Add New Student Profile</span>
        </div>
        <button class="drawer-close-btn"><svg viewBox="0 0 24 24" style="width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="drawer-body">
        <form id="add-student-form">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
            <div style="width: 80px; height: 80px; border-radius: 50%; border: 2px dashed var(--gold-solid); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--sandal-light); font-size: 0.8rem; text-align: center; background: var(--bg-body);">
              Upload<br>Photo
            </div>
          </div>
          <div class="form-group">
            <label class="form-label"><span>छात्रनाम (Student Name) *</span></label>
            <input type="text" id="add-name" class="form-control" placeholder="e.g. Mahadeva Bhatta" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>वेदः (Veda) *</span></label>
              <select id="add-veda" class="form-control" required>
                <option value="" disabled selected>Select Veda</option>
                <option value="Rigveda">Rigveda</option>
                <option value="Shukla Yajurveda">Shukla Yajurveda</option>
                <option value="Krishna Yajurveda">Krishna Yajurveda</option>
                <option value="Samaveda">Samaveda</option>
                <option value="Atharvaveda">Atharvaveda</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label"><span>विभागः (Section) *</span></label>
              <select id="add-section" class="form-control" required>
                <option value="None" selected>None (Junior)</option>
                <option value="Vyakarana">Vyakarana</option>
                <option value="Vedanta">Vedanta</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label"><span>गणनियोजनम् (Gana Assignment) *</span></label>
            <select id="add-gana" class="form-control" required>
              ${db.getAllGanas().map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-saffron" style="width: 100%; margin-top: 1rem;">पञ्जीकरणं क्रियताम् (Save Student)</button>
        </form>
      </div>
    `;

    openDrawer(content);

    drawer.querySelector('#add-student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newStudent = {
        name: drawer.querySelector('#add-name').value,
        ganaId: drawer.querySelector('#add-gana').value,
        veda: drawer.querySelector('#add-veda').value, section: drawer.querySelector('#add-section').value,
        sanskritName: '', dob: '', joiningDate: new Date().toISOString().split('T')[0],
        parentName: '', parentContact: '', address: '', notes: ''
      };
      db.addStudent(newStudent);
      closeDrawer();
      renderList();
    });
  }

  // EDIT STUDENT DRAWER FORM
  function openEditDrawer(id) {
    const student = db.getStudentById(id);
    if (!student) return;

    const content = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>छात्रविवरण-परिष्कारः</h2>
          <span>Modify Student Profile</span>
        </div>
        <button class="drawer-close-btn"><svg viewBox="0 0 24 24" style="width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="drawer-body">
        
        <form id="edit-student-form">
          <div class="form-group">
            <label class="form-label"><span>छात्रनाम (Student English Name) *</span></label>
            <input type="text" id="edit-name" class="form-control" value="${student.name}" required>
          </div>
          
          <div class="form-group">
            <label class="form-label"><span>देवनागरीनाम (Sanskrit Name) *</span></label>
            <input type="text" id="edit-sanskrit-name" class="form-control" value="${student.sanskritName}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>जन्मदिनाङ्कः (D.O.B) *</span></label>
              <input type="date" id="edit-dob" class="form-control" value="${student.dob}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label"><span>प्रवेशदिनाङ्कः (Joining Date) *</span></label>
              <input type="date" id="edit-joining-date" class="form-control" value="${student.joiningDate}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>गणनियोजनम् (Gana Assignment) *</span></label>
              <select id="edit-gana" class="form-control" required>
                ${db.getAllGanas().map(g => `<option value="${g.id}" ${g.id === student.ganaId ? 'selected' : ''}>${g.name}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label"><span>वेदः (Veda) *</span></label>
                <select id="edit-veda" class="form-control" required>
                  <option value="Rigveda" ${student.veda === 'Rigveda' ? 'selected' : ''}>Rigveda</option>
                  <option value="Shukla Yajurveda" ${student.veda === 'Shukla Yajurveda' ? 'selected' : ''}>Shukla Yajurveda</option>
                  <option value="Krishna Yajurveda" ${student.veda === 'Krishna Yajurveda' ? 'selected' : ''}>Krishna Yajurveda</option>
                  <option value="Samaveda" ${student.veda === 'Samaveda' ? 'selected' : ''}>Samaveda</option>
                  <option value="Atharvaveda" ${student.veda === 'Atharvaveda' ? 'selected' : ''}>Atharvaveda</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label"><span>विभागः (Section) *</span></label>
                <select id="edit-section" class="form-control" required>
                  <option value="None" ${student.section === 'None' ? 'selected' : ''}>None (Junior)</option>
                  <option value="Vyakarana" ${student.section === 'Vyakarana' ? 'selected' : ''}>Vyakarana</option>
                  <option value="Vedanta" ${student.section === 'Vedanta' ? 'selected' : ''}>Vedanta</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label"><span>अभिभावकनाम (Parent Name) *</span></label>
            <input type="text" id="edit-parent-name" class="form-control" value="${student.parentName}" required>
          </div>

          <div class="form-group">
            <label class="form-label"><span>अभिभावक-दूरभाषः (Parent Contact) *</span></label>
            <input type="text" id="edit-parent-contact" class="form-control" value="${student.parentContact}" required>
          </div>

          <div class="form-group">
            <label class="form-label"><span>मूलसङ्केतः (Home Address) *</span></label>
            <textarea id="edit-address" class="form-control" rows="2" required>${student.address}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label"><span>आचार्य-टिप्पणी (Notes)</span></label>
            <textarea id="edit-notes" class="form-control" rows="2">${student.notes || ''}</textarea>
          </div>
          
          <button type="submit" class="btn btn-saffron" style="width: 100%; margin-top: 1rem;">
            विवरणं संरक्ष्यताम् (Save Modifications)
          </button>
        </form>

      </div>
    `;

    openDrawer(content);

    drawer.querySelector('#edit-student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const updatedStudent = {
        name: drawer.querySelector('#edit-name').value,
        sanskritName: drawer.querySelector('#edit-sanskrit-name').value,
        dob: drawer.querySelector('#edit-dob').value,
        joiningDate: drawer.querySelector('#edit-joining-date').value,
        ganaId: drawer.querySelector('#edit-gana').value,
        veda: drawer.querySelector('#edit-veda').value, section: drawer.querySelector('#edit-section').value,
        parentName: drawer.querySelector('#edit-parent-name').value,
        parentContact: drawer.querySelector('#edit-parent-contact').value,
        address: drawer.querySelector('#edit-address').value,
        notes: drawer.querySelector('#edit-notes').value
      };

      db.updateStudent(student.id, updatedStudent);
      closeDrawer();
      renderList();
    });
  }

  function handleDeleteStudent(id) {
    const student = db.getStudentById(id);
    if (!student) return;

    if (confirm(`॥ छात्रविवरण-विलोपनम् ॥\nAre you sure you want to permanently delete the profile of "${student.name} (${student.sanskritName})"?`)) {
      db.deleteStudent(id);
      renderList();
    }
  }

  renderList();
}

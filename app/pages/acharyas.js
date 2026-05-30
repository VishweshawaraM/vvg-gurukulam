/* 
  Veda Vijnana Gurukulam Management System
  आचार्यविवरणम् — Acharya Directory v3.0
  Full CRUD · Real Photo Upload · Premium Cards · Culturally Rooted
*/

import { db }     from '../database.js';
import { router } from '../router.js';

export function renderAcharyas(container, appInstance) {
  const user    = router.getUserSession();
  const isAdmin = user && (user.role === 'Admin' || user.role === 'Office Staff');
  const ganas   = db.getAllGanas();

  /* ── Helpers ─────────────────────────────────────── */
  function getStudentCount(acharyaId) {
    return db.getAllStudents().filter(s => s.ganaId === (db.getAllGanas().find(
      g => g.id === acharyaId || g.acharyaId === acharyaId
    ) || {}).id).length;
  }

  function getInitials(name) {
    return (name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  function getGanaLabel(a) {
    const g = ganas.find(g => g.id === (a.assignedGanaId || a.assignedGana));
    return g ? `${g.name} — ${g.englishName}` : 'Gurukula Faculty';
  }

  /* ── Main render ──────────────────────────────────── */
  function draw() {
    const acharyas = db.getAllAcharyas();

    container.innerHTML = `
      <!-- Page Hero -->
      <div class="page-hero">
        <div class="page-hero-text">
          <h2 class="page-hero-title">आचार्यविवरणम्</h2>
          <span class="page-hero-subtitle">॥ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः — The Acharya is the living presence of the Divine ॥</span>
        </div>
        <div class="page-hero-meta" style="display:flex;gap:10px;align-items:center;">
          <span class="academic-year-tag">${acharyas.length} Acharyas</span>
          ${isAdmin ? `
            <button class="btn btn-saffron" id="btn-add-acharya">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.5;">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="16" y1="11" x2="22" y2="11"/>
              </svg>
              नूतनाचार्यः (Add Acharya)
            </button>
          ` : ''}
        </div>
      </div>

      ${acharyas.length === 0 ? `
        <div class="gurukula-card framed" style="text-align:center;padding:4rem 2rem;">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--gold-bg);border:2px dashed var(--gold-solid);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;">
            <svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--gold-solid);fill:none;stroke-width:1.5;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 style="font-family:var(--font-header);color:var(--charcoal-sandal);margin-bottom:0.5rem;">No Acharyas Added Yet</h3>
          <p style="color:var(--sandal-light);font-size:0.88rem;">Click "नूतनाचार्यः (Add Acharya)" to begin building the faculty directory.</p>
        </div>
      ` : `
        <!-- Acharya Cards Grid -->
        <div class="acharya-cards-grid">
          ${acharyas.map(a => renderCard(a)).join('')}
        </div>
      `}

      <!-- Drawer & Backdrop -->
      <div class="drawer-backdrop" id="ach-backdrop"></div>
      <div class="gurukula-drawer" id="ach-drawer" style="max-width:580px;"></div>
    `;

    // Bind all events after render
    if (isAdmin) {
      const addBtn = container.querySelector('#btn-add-acharya');
      if (addBtn) addBtn.addEventListener('click', () => openFormDrawer(null));
    }

    container.querySelectorAll('.btn-view-profile').forEach(b =>
      b.addEventListener('click', () => openProfileDrawer(b.dataset.id)));

    if (isAdmin) {
      container.querySelectorAll('.btn-edit-acharya').forEach(b =>
        b.addEventListener('click', (e) => { e.stopPropagation(); openFormDrawer(b.dataset.id); }));
      container.querySelectorAll('.btn-delete-acharya').forEach(b =>
        b.addEventListener('click', (e) => { e.stopPropagation(); handleDelete(b.dataset.id); }));
    }

    container.querySelector('#ach-backdrop').addEventListener('click', closeDrawer);
  }

  /* ── Acharya Card HTML ────────────────────────────── */
  function renderCard(a) {
    const ganaLabel  = getGanaLabel(a);
    const initials   = getInitials(a.name);
    const photoStyle = a.photo
      ? `background-image:url('${a.photo}');background-size:cover;background-position:center;`
      : `background:var(--sandalwood-brown);`;

    return `
      <div class="acharya-card-premium" data-id="${a.id}">
        <!-- Photo -->
        <div class="acp-photo-wrap">
          <div class="acp-photo" style="${photoStyle}">
            ${!a.photo ? `<span class="acp-initials">${initials}</span>` : ''}
          </div>
          <div class="acp-gana-badge">${ganaLabel.split('—')[0].trim()}</div>
        </div>

        <!-- Info -->
        <div class="acp-body">
          <h3 class="acp-name">${a.name}</h3>
          <p class="acp-name-sa devanagari-body">${a.sanskritName}</p>

          <div class="acp-spec">
            <svg viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;flex-shrink:0;">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>${a.specialization}</span>
          </div>

          ${a.yearsExperience ? `
            <div class="acp-meta-row">
              <svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2;">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>${a.yearsExperience} years in Veda Adhyayana</span>
            </div>
          ` : ''}

          ${a.contact ? `
            <div class="acp-meta-row">
              <svg viewBox="0 0 24 24" style="width:11px;height:11px;stroke:currentColor;fill:none;stroke-width:2;">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.91-1.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 15z"/>
              </svg>
              <span>${a.contact}</span>
            </div>
          ` : ''}
        </div>

        <!-- Actions -->
        <div class="acp-footer">
          <button class="btn btn-gold btn-sm btn-view-profile" data-id="${a.id}" style="flex:1;">
            सविस्तरम् — Full Profile
          </button>
          ${isAdmin ? `
            <button class="btn btn-ghost btn-sm btn-edit-acharya" data-id="${a.id}" title="Edit" style="padding:6px 10px;">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-delete-acharya" data-id="${a.id}" title="Remove"
                    style="padding:6px 10px;color:var(--agni-red);">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ── Profile View Drawer ──────────────────────────── */
  function openProfileDrawer(id) {
    const a = db.getAcharyaById(id);
    if (!a) return;
    const drawer   = container.querySelector('#ach-drawer');
    const backdrop = container.querySelector('#ach-backdrop');
    const ganaLabel = getGanaLabel(a);
    const initials  = getInitials(a.name);

    // Build teaching schedule from timetable
    const data    = db.get();
    const slots   = data.timeSlots || {};
    const tt      = data.timetable || {};
    const classes = [];
    Object.entries(tt).forEach(([ganaId, ganaSlots]) => {
      const gana = ganas.find(g => g.id === ganaId);
      Object.entries(ganaSlots).forEach(([slotId, slotData]) => {
        if (slotData && slotData.teacher) {
          const nameMatch = a.name.toLowerCase().split(' ').some(w =>
            w.length > 3 && (slotData.teacher || '').toLowerCase().includes(w)
          );
          if (nameMatch) {
            const slotInfo = slots[slotId] || {};
            classes.push({
              time:    slotInfo.time || '',
              label:   slotInfo.labelEn || slotId,
              subject: slotData.subject || '',
              eng:     slotData.engSubject || '',
              gana:    gana ? gana.name : ganaId
            });
          }
        }
      });
    });

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

        <!-- Profile Header with Photo -->
        <div style="display:flex;align-items:center;gap:1.5rem;padding:1.25rem;background:linear-gradient(135deg,var(--sandalwood-brown) 0%,#6B3C1A 100%);border-radius:var(--radius-md);margin-bottom:1.5rem;">
          <div style="width:90px;height:90px;border-radius:50%;border:3px solid var(--gold-solid);overflow:hidden;flex-shrink:0;${a.photo ? '' : 'background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;'}">
            ${a.photo
              ? `<img src="${a.photo}" style="width:100%;height:100%;object-fit:cover;" alt="${a.name}">`
              : `<span style="font-family:var(--font-header);font-size:2rem;font-weight:900;color:rgba(250,244,230,0.9);">${initials}</span>`
            }
          </div>
          <div>
            <h3 style="font-family:var(--font-header);font-size:1.3rem;color:#FAF4E6;margin-bottom:4px;">${a.name}</h3>
            <p class="devanagari-display" style="font-size:1.05rem;color:var(--gold-solid);margin-bottom:6px;">${a.sanskritName}</p>
            <span style="font-size:0.72rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(250,244,230,0.6);">${a.specialization}</span>
          </div>
        </div>

        <!-- Details -->
        <div class="student-detail-grid" style="margin-bottom:1.5rem;">
          <div class="student-info-item">
            <span class="student-info-label">सम्बद्धगणः (Assigned Gana)</span>
            <span class="student-info-value" style="color:var(--saffron-royal);font-weight:700;">${ganaLabel}</span>
          </div>
          ${a.yearsExperience ? `
          <div class="student-info-item">
            <span class="student-info-label">अध्यापनकालः (Experience)</span>
            <span class="student-info-value">${a.yearsExperience} Years</span>
          </div>` : ''}
          ${a.contact ? `
          <div class="student-info-item">
            <span class="student-info-label">सम्पर्कसङ्ख्या (Contact)</span>
            <span class="student-info-value">${a.contact}</span>
          </div>` : ''}
          ${a.email ? `
          <div class="student-info-item" style="grid-column:span 2;">
            <span class="student-info-label">विद्युत्पत्रम् (Email)</span>
            <span class="student-info-value" style="font-size:0.85rem;font-weight:normal;">${a.email}</span>
          </div>` : ''}
          ${a.bio ? `
          <div class="student-info-item" style="grid-column:span 2;">
            <span class="student-info-label">परिचयः (About)</span>
            <span class="student-info-value" style="font-size:0.85rem;font-weight:normal;font-style:italic;line-height:1.6;">${a.bio}</span>
          </div>` : ''}
        </div>

        <!-- Teaching Schedule -->
        <div class="gurukula-card" style="padding:1rem;border-color:var(--gold-solid);background:var(--gold-light);">
          <div style="font-size:0.65rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:var(--saffron-royal);margin-bottom:0.85rem;text-align:center;">
            ॥ अध्यापन-समयसारिणी — Teaching Schedule ॥
          </div>
          ${classes.length === 0
            ? `<p style="font-size:0.82rem;font-style:italic;color:var(--sandal-light);text-align:center;padding:0.75rem 0;">
                Schedule entries will appear here once the timetable is configured for this Acharya.
               </p>`
            : `<div style="display:flex;flex-direction:column;gap:8px;">
                ${classes.map(c => `
                  <div style="padding:0.6rem 0.85rem;background:var(--bg-card);border:1px solid rgba(196,164,104,0.3);border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;">
                    <div>
                      <div class="devanagari-body" style="font-weight:800;color:var(--charcoal-sandal);font-size:0.85rem;">${c.subject}</div>
                      <div style="color:var(--sandal-light);font-size:0.75rem;">${c.eng} · ${c.time}</div>
                    </div>
                    <span class="badge badge-saffron" style="font-size:0.65rem;">${c.gana}</span>
                  </div>
                `).join('')}
               </div>`
          }
        </div>

      </div>
      <div class="drawer-footer">
        ${isAdmin ? `
          <button class="btn btn-outline btn-edit-from-profile" data-id="${a.id}">
            <svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
        ` : ''}
        <button class="btn btn-saffron btn-close-ach">पिधानम् (Close)</button>
      </div>
    `;

    drawer.classList.add('open');
    backdrop.classList.add('active');
    drawer.querySelectorAll('.btn-close-ach').forEach(b => b.addEventListener('click', closeDrawer));
    const editFromProfile = drawer.querySelector('.btn-edit-from-profile');
    if (editFromProfile) editFromProfile.addEventListener('click', () => { closeDrawer(); setTimeout(() => openFormDrawer(a.id), 320); });
  }

  /* ── Add / Edit Form Drawer ───────────────────────── */
  function openFormDrawer(editId) {
    const existing = editId ? db.getAcharyaById(editId) : null;
    const drawer   = container.querySelector('#ach-drawer');
    const backdrop = container.querySelector('#ach-backdrop');
    let photoData  = existing?.photo || null; // base64 or null

    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>${existing ? 'आचार्यविवरण-परिष्कारः' : 'नूतनाचार्यपञ्जीकरणम्'}</h2>
          <span>${existing ? 'Edit Acharya Profile' : 'Register New Acharya'}</span>
        </div>
        <button class="drawer-close-btn btn-close-ach">
          <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        <form id="acharya-form">

          <!-- Photo Upload -->
          <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:1.75rem;">
            <div id="photo-preview" style="width:110px;height:110px;border-radius:50%;border:3px solid var(--gold-solid);overflow:hidden;background:${photoData ? 'transparent' : 'var(--sandalwood-brown)'};display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem;cursor:pointer;transition:all 0.2s;" title="Click to upload photo">
              ${photoData
                ? `<img id="photo-img" src="${photoData}" style="width:100%;height:100%;object-fit:cover;">`
                : `<svg id="photo-placeholder" viewBox="0 0 24 24" style="width:40px;height:40px;fill:none;stroke:rgba(250,244,230,0.7);stroke-width:1.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
              }
            </div>
            <label class="btn btn-ghost btn-sm" for="photo-file-input" style="cursor:pointer;font-size:0.75rem;">
              <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              ${existing?.photo ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input type="file" id="photo-file-input" accept="image/*" style="display:none;">
            <span style="font-size:0.68rem;color:var(--sandal-light);margin-top:4px;">JPG, PNG — Max 2MB</span>
          </div>

          <!-- Name Fields -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>English Name *</span></label>
              <input type="text" id="f-name" class="form-control" placeholder="e.g. Keshava Bhatta" value="${existing?.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label"><span>संस्कृतनाम (Sanskrit Name) *</span></label>
              <input type="text" id="f-name-sa" class="form-control" placeholder="यथा — केशवभट्टाचार्यः" value="${existing?.sanskritName || ''}" required>
            </div>
          </div>

          <!-- Specialization -->
          <div class="form-group">
            <label class="form-label"><span>शास्त्रविशेषता (Veda / Subject Specialization) *</span></label>
            <input type="text" id="f-spec" class="form-control"
                   placeholder="e.g. Rigveda (Shakala Shakha), Vyakarana, Nyaya..."
                   value="${existing?.specialization || ''}" required>
          </div>

          <!-- Gana + Experience -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>सम्बद्धगणः (Assigned Gana)</span></label>
              <select id="f-gana" class="form-control">
                <option value="">Gurukula Faculty (No specific Gana)</option>
                ${ganas.map(g => `
                  <option value="${g.id}" ${(existing?.assignedGanaId || existing?.assignedGana) === g.id ? 'selected' : ''}>
                    ${g.name} — ${g.englishName}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label"><span>अध्यापनवर्षाणि (Years of Experience)</span></label>
              <input type="number" id="f-exp" class="form-control" min="0" max="60"
                     placeholder="e.g. 12" value="${existing?.yearsExperience || ''}">
            </div>
          </div>

          <!-- Contact + Email -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label"><span>सम्पर्कसङ्ख्या (Phone)</span></label>
              <input type="tel" id="f-contact" class="form-control" placeholder="+91 94480 XXXXX"
                     value="${existing?.contact || ''}">
            </div>
            <div class="form-group">
              <label class="form-label"><span>विद्युत्पत्रम् (Email)</span></label>
              <input type="email" id="f-email" class="form-control" placeholder="acharya@vvgurukulam.org"
                     value="${existing?.email || ''}">
            </div>
          </div>

          <!-- Bio -->
          <div class="form-group">
            <label class="form-label"><span>परिचयः (Brief Bio / About)</span></label>
            <textarea id="f-bio" class="form-control" rows="3"
                      placeholder="e.g. Studied under Acharya X at Y Gurukula. Specializes in...">${existing?.bio || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-saffron" style="width:100%;padding:0.85rem;font-size:1rem;font-weight:800;margin-top:0.5rem;">
            ${existing ? 'विवरणं संरक्ष्यताम् (Save Changes)' : 'पञ्जीकरणं क्रियताम् (Register Acharya)'}
          </button>
        </form>
      </div>
    `;

    drawer.classList.add('open');
    backdrop.classList.add('active');
    drawer.querySelector('.btn-close-ach').addEventListener('click', closeDrawer);

    /* Photo upload */
    const photoInput   = drawer.querySelector('#photo-file-input');
    const photoPreview = drawer.querySelector('#photo-preview');

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { alert('Photo must be under 2MB.'); return; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        photoData = ev.target.result; // base64
        photoPreview.style.background = 'transparent';
        photoPreview.innerHTML = `<img src="${photoData}" style="width:100%;height:100%;object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    });

    /* Form submit */
    drawer.querySelector('#acharya-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        name:            drawer.querySelector('#f-name').value.trim(),
        sanskritName:    drawer.querySelector('#f-name-sa').value.trim(),
        specialization:  drawer.querySelector('#f-spec').value.trim(),
        assignedGanaId:  drawer.querySelector('#f-gana').value || null,
        assignedGana:    drawer.querySelector('#f-gana').value || null,
        yearsExperience: drawer.querySelector('#f-exp').value || '',
        contact:         drawer.querySelector('#f-contact').value.trim(),
        email:           drawer.querySelector('#f-email').value.trim(),
        bio:             drawer.querySelector('#f-bio').value.trim(),
        photo:           photoData
      };

      if (!payload.name || !payload.sanskritName || !payload.specialization) {
        alert('Please fill in the required fields: English Name, Sanskrit Name, and Specialization.');
        return;
      }

      if (existing) {
        db.updateAcharya(existing.id, payload);
      } else {
        db.addAcharya(payload);
      }

      closeDrawer();
      draw();
    });
  }

  /* ── Delete Handler ───────────────────────────────── */
  function handleDelete(id) {
    const a = db.getAcharyaById(id);
    if (!a) return;
    if (confirm(`Remove "${a.name} (${a.sanskritName})" from the directory?\n\nThis cannot be undone.`)) {
      db.deleteAcharya(id);
      draw();
    }
  }

  /* ── Close Drawer ─────────────────────────────────── */
  function closeDrawer() {
    const drawer   = container.querySelector('#ach-drawer');
    const backdrop = container.querySelector('#ach-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    setTimeout(() => { if (drawer) drawer.innerHTML = ''; }, 320);
  }

  draw();
}

/* 
  Veda Vijnana Gurukulam Management System
  Documents / लेख्याधारः — v3.0 Live
  Real file upload, real download, real certificate print
*/

import { db }     from '../database.js';
import { router } from '../router.js';

export function renderDocuments(container, appInstance) {
  const user     = router.getUserSession();
  const students = db.getAllStudents();

  let activeCategory = 'all';

  // File blobs stored in memory for this session (real download)
  const fileBlobs = {};

  const categories = [
    'Student Records',
    'University Documents',
    'Certificates',
    'Leave Letters',
    'Permission Letters',
    'Exam Documents'
  ];

  /* ── Main render ──────────────────────────────────── */
  function drawVault() {
    const docs        = db.getAllDocuments();
    const filteredDocs = activeCategory === 'all'
      ? docs
      : docs.filter(d => d.category === activeCategory);

    const catCounts = {};
    categories.forEach(c => { catCounts[c] = docs.filter(d => d.category === c).length; });

    container.innerHTML = `
      <!-- Page Hero -->
      <div class="page-hero">
        <div class="page-hero-text">
          <h2 class="page-hero-title">लेख्याधारः</h2>
          <span class="page-hero-subtitle">॥ सुरक्षितलेख्यानां संग्रहः — Document Preservation Vault ॥</span>
        </div>
        <div class="page-hero-meta">
          <span class="academic-year-tag">${docs.length} Documents</span>
        </div>
      </div>

      <!-- Action Bar -->
      <div style="display:flex;gap:10px;margin-bottom:1.75rem;flex-wrap:wrap;align-items:center;">
        <label class="btn btn-saffron" for="file-real-upload" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;margin:0;">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          लेख्य-समारोपणम् (Upload Document)
        </label>
        <input type="file" id="file-real-upload" style="display:none;"
               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls">

        <button class="btn btn-gold" id="btn-cert-trigger">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          प्रमाणपत्र-निर्माणम् (Generate Certificate)
        </button>

        <!-- Upload progress (hidden until active) -->
        <div id="upload-progress-wrap" style="display:none;flex:1;min-width:180px;align-items:center;gap:10px;">
          <div style="flex:1;height:8px;border-radius:4px;background:var(--sandal-div);overflow:hidden;">
            <div id="upload-bar" style="height:100%;width:0%;background:var(--saffron-royal);transition:width 0.1s;border-radius:4px;"></div>
          </div>
          <span id="upload-pct" style="font-size:0.75rem;font-weight:800;color:var(--saffron-royal);white-space:nowrap;">0%</span>
        </div>
      </div>

      <!-- Grid Layout -->
      <div class="dashboard-split-layout">

        <!-- Left: Category sidebar -->
        <div>
          <div class="gurukula-card framed" style="padding:1.25rem;">
            <h3 style="font-family:var(--font-header);font-size:0.9rem;color:var(--charcoal-sandal);border-bottom:1px solid var(--gold-solid);padding-bottom:0.5rem;margin-bottom:1rem;">
              विविधवर्गाः (Categories)
            </h3>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button class="btn ${activeCategory === 'all' ? 'btn-saffron' : 'btn-ghost'} btn-sm select-folder"
                      data-cat="all" style="justify-content:space-between;">
                <span>सर्वलेख्यानि (All)</span>
                <span class="badge" style="background:var(--gold-leaf);color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:99px;">${docs.length}</span>
              </button>
              ${categories.map(cat => `
                <button class="btn ${cat === activeCategory ? 'btn-saffron' : 'btn-ghost'} btn-sm select-folder"
                        data-cat="${cat}" style="justify-content:space-between;">
                  <span style="text-align:left;line-height:1.3;">${cat}</span>
                  <span class="badge" style="background:var(--gold-leaf);color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:99px;flex-shrink:0;">${catCounts[cat] || 0}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: File list -->
        <div>
          <div class="gurukula-card" style="min-height:380px;">
            <div class="card-header">
              <h3 class="card-title">
                <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                <span>लेख्यसूची — ${activeCategory === 'all' ? 'All Documents' : activeCategory}</span>
              </h3>
              <span class="card-sanskrit-tag">${filteredDocs.length} Files</span>
            </div>

            ${filteredDocs.length === 0
              ? `<div style="text-align:center;color:var(--sandal-light);padding:4rem 1rem;">
                   <svg style="width:48px;height:48px;stroke:var(--gold-solid);fill:none;stroke-width:1.5;margin:0 auto 1rem;display:block;">
                     <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                   </svg>
                   <p style="font-size:0.9rem;">No documents in this folder.</p>
                   <p style="font-size:0.8rem;margin-top:4px;">Upload a file to get started.</p>
                 </div>`
              : `<div class="docs-grid" style="padding:1rem;">
                  ${filteredDocs.map(d => {
                    const ext = d.name.split('.').pop().toUpperCase();
                    const extColor = ext === 'PDF' ? '#C94040' : ext === 'DOC' || ext === 'DOCX' ? '#2B579A' : '#217346';
                    return `
                      <div class="doc-file-card" data-id="${d.id}">
                        <div class="doc-icon-box" style="background:${extColor}10;border:1px solid ${extColor}30;">
                          <svg viewBox="0 0 24 24" style="stroke:${extColor};fill:none;stroke-width:2;width:28px;height:28px;">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span style="font-size:0.55rem;font-weight:900;color:${extColor};letter-spacing:1px;margin-top:2px;">${ext}</span>
                        </div>
                        <div class="doc-meta">
                          <span class="doc-name" title="${d.name}" style="font-weight:700;">${d.name}</span>
                          <span class="doc-category">${d.category}</span>
                          <div class="doc-info-row">
                            <span>${d.uploadedAt}</span>
                            <span>${d.size}</span>
                          </div>
                          <span style="font-size:0.7rem;color:var(--sandal-light);">By: ${d.uploadedBy}</span>
                          <div class="doc-actions">
                            <button class="btn btn-gold btn-sm btn-doc-download" data-id="${d.id}" data-name="${d.name}">
                              <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              Download
                            </button>
                            <button class="btn btn-outline btn-sm btn-doc-delete" data-id="${d.id}"
                                    style="color:var(--agni-red);border-color:rgba(184,59,59,0.25);">
                              <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5;">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                 </div>`
            }
          </div>
        </div>
      </div>

      <!-- Drawer & Backdrop -->
      <div class="drawer-backdrop" id="doc-drawer-backdrop"></div>
      <div class="gurukula-drawer" id="doc-drawer" style="max-width:720px;"></div>
    `;

    /* ── Event Bindings ─────────────────── */

    // Category filter
    container.querySelectorAll('.select-folder').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        drawVault();
      });
    });

    // Real file upload
    const fileInput = container.querySelector('#file-real-upload');
    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        handleRealUpload(e.target.files[0]);
      }
    });

    // Download
    container.querySelectorAll('.btn-doc-download').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId   = btn.getAttribute('data-id');
        const docName = btn.getAttribute('data-name');
        const blob    = fileBlobs[docId];

        if (blob) {
          // Real file in memory — trigger real download
          const url = URL.createObjectURL(blob);
          const a   = document.createElement('a');
          a.href = url; a.download = docName; a.click();
          URL.revokeObjectURL(url);
        } else {
          // Simulated document (seeded data) — show info
          const info = container.querySelector(`[data-id="${docId}"] .doc-name`)?.textContent || docName;
          showToast(`"${info}" — This is a seeded demo record. Upload the actual file to enable real download.`, 'info');
        }
      });
    });

    // Delete
    container.querySelectorAll('.btn-doc-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-id');
        const doc   = db.getAllDocuments().find(d => d.id === docId);
        if (!doc) return;
        if (confirm(`Permanently remove "${doc.name}" from the vault?`)) {
          delete fileBlobs[docId];
          db.deleteDocument(docId);
          drawVault();
        }
      });
    });

    // Certificate generator
    container.querySelector('#btn-cert-trigger').addEventListener('click', openCertDrawer);

    // Drawer backdrop
    container.querySelector('#doc-drawer-backdrop').addEventListener('click', closeDrawer);
  }

  /* ── Real Upload Handler ──────────────────────────── */
  function handleRealUpload(file) {
    const progressWrap = container.querySelector('#upload-progress-wrap');
    const bar          = container.querySelector('#upload-bar');
    const pct          = container.querySelector('#upload-pct');

    progressWrap.style.display = 'flex';
    let progress = 0;

    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 15 + 5, 100);
      bar.style.width      = `${progress}%`;
      pct.textContent      = `${Math.round(progress)}%`;

      if (progress >= 100) {
        clearInterval(interval);

        // Store blob in memory for real download
        const reader = new FileReader();
        reader.onload = () => {
          const sizeMb  = (file.size / (1024 * 1024)).toFixed(2);
          const sizeStr = file.size > 1024 * 1024
            ? `${sizeMb} MB`
            : `${(file.size / 1024).toFixed(0)} KB`;

          const newDoc = db.addDocument({
            name:       file.name,
            category:   activeCategory === 'all' ? 'Student Records' : activeCategory,
            uploadedBy: user ? user.name : 'Office Staff',
            size:       sizeStr
          });

          // Keep the blob for real download
          fileBlobs[newDoc.id] = file;

          setTimeout(() => {
            progressWrap.style.display = 'none';
            bar.style.width = '0%';
            pct.textContent = '0%';
            drawVault();
            showToast(`"${file.name}" uploaded successfully.`, 'success');
          }, 500);
        };
        reader.readAsArrayBuffer(file);
      }
    }, 120);
  }

  /* ── Certificate Generator Drawer ────────────────── */
  function openCertDrawer() {
    const drawer   = container.querySelector('#doc-drawer');
    const backdrop = container.querySelector('#doc-drawer-backdrop');

    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>प्रमाणपत्र-सृजनम्</h2>
          <span>Vedic Certificate Generator</span>
        </div>
        <button class="drawer-close-btn btn-close-cert">
          <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2.2;">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">

        <!-- Controls -->
        <div class="gurukula-card" style="padding:1rem;margin-bottom:1.5rem;border-color:var(--gold-solid);">
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">छात्रचयनम् (Select Student):</label>
              <select id="cert-student-select" class="form-control">
                ${students.map(s => `<option value="${s.id}">${s.name} — ${s.sanskritName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">प्रमाणपत्रप्रकारः (Certificate Type):</label>
              <select id="cert-type-select" class="form-control">
                <option value="study">विद्याभ्यासप्रमाणपत्रम् (Study Certificate)</option>
                <option value="char">शीलप्रमाणपत्रम् (Character Certificate)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Certificate Preview -->
        <div id="cert-frame" class="certificate-preview-box"
             style="background:#FFFDF5;border:8px double var(--gold-solid);padding:2.5rem 2rem;
                    box-shadow:0 10px 40px rgba(45,26,16,0.12);border-radius:4px;text-align:center;">

          <!-- Logo -->
          <div style="margin-bottom:0.5rem;">
            <img src="/assets/vvg_logo.png" alt="VVG Seal"
                 style="width:70px;height:70px;border-radius:50%;object-fit:contain;border:2px solid var(--gold-solid);background:#fff;padding:3px;"
                 onerror="this.outerHTML='<div style=\\'width:66px;height:66px;border-radius:50%;background:var(--gold-leaf);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto;\\'>🕉</div>'">
          </div>

          <h3 class="devanagari-display" style="font-size:1.9rem;color:var(--charcoal-sandal);font-weight:normal;margin-bottom:0.1rem;">वेदविज्ञानगुरुकुलम्</h3>
          <p style="font-family:var(--font-header);font-size:0.7rem;letter-spacing:3px;color:var(--sandal-light);margin-bottom:0.1rem;">VEDA VIJNANA GURUKULAM</p>
          <p style="font-size:0.72rem;color:var(--sandal-light);margin-bottom:1rem;">Channenahalli, Magadi Road, Bengaluru — Karnataka</p>

          <div class="vedic-divider" style="margin:0.6rem 0;">
            <div class="vedic-divider-line"></div><span class="vedic-divider-motif">۩</span><div class="vedic-divider-line"></div>
          </div>

          <div id="cert-title-sa" class="devanagari-display" style="font-size:1.5rem;color:var(--saffron-royal);font-weight:normal;margin:0.75rem 0 0.2rem;">विद्याभ्यासप्रमाणपत्रम्</div>
          <div id="cert-title-en" style="font-family:var(--font-header);font-size:0.85rem;letter-spacing:2px;font-weight:900;color:var(--charcoal-sandal);margin-bottom:1.5rem;">CERTIFICATE OF VEDIC STUDY</div>

          <div id="cert-body-sa" class="devanagari-body"
               style="font-size:1rem;line-height:1.9;color:var(--charcoal-sandal);font-weight:600;text-align:justify;margin-bottom:0.75rem;"></div>

          <div id="cert-body-en"
               style="font-size:0.82rem;line-height:1.65;color:var(--sandal-light);text-align:justify;margin-bottom:2.5rem;"></div>

          <!-- Signatures -->
          <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:1.5rem;align-items:flex-end;">
            <div class="cert-sig-box">
              <div class="cert-sig-line"></div>
              <span class="cert-sig-title-sanskrit" style="font-family:var(--font-sanskrit-body);font-weight:700;">प्रधानाचार्यः</span>
              <span class="cert-sig-title">Principal Scholar</span>
            </div>
            <div style="width:56px;height:56px;border-radius:50%;background:#A62B2B;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.45rem;font-weight:900;font-family:var(--font-header);letter-spacing:1px;border:2px dashed rgba(255,255,255,0.4);">
              VVG SEAL
            </div>
            <div class="cert-sig-box">
              <div class="cert-sig-line"></div>
              <span class="cert-sig-title-sanskrit" style="font-family:var(--font-sanskrit-body);font-weight:700;">कार्यालयप्रमुखः</span>
              <span class="cert-sig-title">Registrar Office</span>
            </div>
          </div>
        </div>

      </div>
      <div class="drawer-footer">
        <button class="btn btn-outline btn-close-cert">रद्दकरणम् (Cancel)</button>
        <button class="btn btn-saffron" id="btn-print-cert">
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;">
            <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          मुद्रणम् (Print Certificate)
        </button>
      </div>
    `;

    drawer.classList.add('open');
    backdrop.classList.add('active');

    const studentSel = drawer.querySelector('#cert-student-select');
    const typeSel    = drawer.querySelector('#cert-type-select');

    function updateCert() {
      const student = students.find(s => s.id === studentSel.value);
      if (!student) return;
      const type = typeSel.value;

      if (type === 'study') {
        drawer.querySelector('#cert-title-sa').textContent = 'विद्याभ्यासप्रमाणपत्रम्';
        drawer.querySelector('#cert-title-en').textContent = 'CERTIFICATE OF VEDIC STUDY';
        drawer.querySelector('#cert-body-sa').innerHTML =
          `एतद् द्वारा प्रमाणीक्रियते यत् छात्रः <b>${student.sanskritName}</b>, पितुः नाम <b>${student.parentName}</b>, अस्मदीये वेदविज्ञानगुरुकुले <b>${student.veda || 'सामान्य'}${student.shastra && student.shastra !== 'None' ? ' - ' + student.shastra : ''}</b> शाखायाः अध्ययनं यथाविधि समाप्य उत्तमयोग्यतां प्राप्तवान् इति।`;
        drawer.querySelector('#cert-body-en').innerHTML =
          `This is to certify that the scholar <b>${student.name}</b>, son of <b>${student.parentName}</b>, has successfully completed the formal course of Vedic study in <b>${student.veda || 'General'}${student.shastra && student.shastra !== 'None' ? ' / ' + student.shastra : ''}</b> at Veda Vijnana Gurukulam, Channenahalli, Magadi Road, Bengaluru — Karnataka.`;
      } else {
        drawer.querySelector('#cert-title-sa').textContent = 'शीलप्रमाणपत्रम्';
        drawer.querySelector('#cert-title-en').textContent = 'CHARACTER CERTIFICATE';
        drawer.querySelector('#cert-body-sa').innerHTML =
          `प्रमाणीक्रियते यत् छात्रः <b>${student.sanskritName}</b> अस्मदीये गुरुकुले अध्ययनकाले सर्वदा शिष्टाचरणेन, उत्तमचरित्रेण, सत्यनिष्ठया च युक्तः आसीत्। वयम् अस्य भविष्यं शुभमयं कामयामहे।`;
        drawer.querySelector('#cert-body-en').innerHTML =
          `This is to certify that scholar <b>${student.name}</b> has conducted himself with exemplary discipline, high moral values, and sincere devotion to Vedic study during his tenure at this Gurukula. We wish him an auspicious future.`;
      }
    }

    studentSel.addEventListener('change', updateCert);
    typeSel.addEventListener('change', updateCert);
    updateCert();

    drawer.querySelector('#btn-print-cert').addEventListener('click', () => window.print());

    drawer.querySelectorAll('.btn-close-cert').forEach(b => b.addEventListener('click', closeDrawer));
  }

  function closeDrawer() {
    const drawer   = container.querySelector('#doc-drawer');
    const backdrop = container.querySelector('#doc-drawer-backdrop');
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    setTimeout(() => { drawer.innerHTML = ''; }, 300);
  }

  /* ── Toast helper ─────────────────────────────────── */
  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:2rem;right:2rem;z-index:9999;
      padding:0.85rem 1.25rem;border-radius:8px;
      font-size:0.82rem;font-weight:700;max-width:320px;
      background:${type === 'success' ? 'var(--forest-tulsi)' : 'var(--charcoal-sandal)'};
      color:#fff;box-shadow:0 8px 24px rgba(0,0,0,0.2);
      animation:slideInRight 0.3s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 3500);
  }

  drawVault();
}

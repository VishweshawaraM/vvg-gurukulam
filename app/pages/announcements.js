/*
  Veda Vijnana Gurukulam Management System
  Announcements & Notification Center — सूचनाकेन्द्रम्
*/

import { db } from '../database.js?v=2.5';
import { router } from '../router.js?v=2.5';

export function renderAnnouncements(container, appInstance) {
  const user = router.getUserSession();
  const isAdmin = user && ['Admin', 'Office Staff'].includes(user.role);

  let filterCategory = 'all';

  function getCategoryConfig(category) {
    const configs = {
      academic: { badge: 'badge-shastra', strip: 'ann-accent-academic', label: 'शैक्षणिकम्', labelEn: 'Academic', color: '#235689' },
      administrative: { badge: 'badge-gold', strip: 'ann-accent-administrative', label: 'प्रशासनिकम्', labelEn: 'Administrative', color: '#C4A468' },
      urgent: { badge: 'badge-absent', strip: 'ann-accent-urgent', label: 'आवश्यकम्', labelEn: 'Urgent', color: '#B83B3B' },
      festival: { badge: 'badge-tulsi', strip: 'ann-accent-festival', label: 'उत्सवः', labelEn: 'Festival', color: '#2C6646' }
    };
    return configs[category] || configs.administrative;
  }

  function formatRelativeTime(isoStr) {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderList() {
    const announcements = db.getAllAnnouncements();
    const listContainer = container.querySelector('#announcements-list');
    if (!listContainer) return;

    const filtered = filterCategory === 'all'
      ? announcements
      : announcements.filter(a => a.category === filterCategory);

    const pinned = filtered.filter(a => a.isPinned);
    const regular = filtered.filter(a => !a.isPinned);
    const sorted = [...pinned, ...regular];

    if (sorted.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: var(--sandal-light);">
          <svg viewBox="0 0 24 24" style="width:40px; height:40px; stroke:var(--gold-solid); fill:none; stroke-width:1.5; margin-bottom:1rem; opacity:0.5;">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <p style="font-weight: 600; font-size: 0.9rem;">No announcements found.</p>
          <p style="font-size: 0.8rem; margin-top: 4px;">सूचना उपलब्धा नास्ति</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = sorted.map(ann => {
      const cfg = getCategoryConfig(ann.category);
      const isUnread = !ann.readBy.includes(user ? user.id : 'guest');

      return `
        <div class="announcement-card ${ann.isPinned ? 'pinned' : ''}" data-id="${ann.id}">
          ${ann.isPinned ? `
            <div style="position: absolute; top: 10px; right: 14px; font-size: 0.65rem; font-weight: 900; font-family: var(--font-header); color: var(--gold-solid); letter-spacing: 1px; text-transform: uppercase;">
              ◆ PINNED
            </div>
          ` : ''}
          <div class="ann-accent-strip ${cfg.strip}"></div>
          <div class="ann-body">
            <div class="ann-header">
              <div>
                <span class="ann-title-sa">${ann.titleSa}</span>
                <h3 class="ann-title" style="${isUnread ? 'font-weight: 800;' : ''}">${ann.title}</h3>
              </div>
            </div>
            <div class="ann-meta">
              <span class="badge ${cfg.badge}" style="font-size: 0.68rem;">${cfg.label} (${cfg.labelEn})</span>
              <span class="badge badge-gold" style="font-size: 0.68rem;">${ann.audienceSa}</span>
              ${ann.priority === 'urgent' ? `<span class="badge badge-absent" style="font-size: 0.65rem;">URGENT</span>` : ''}
              ${isUnread ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--saffron-royal); display: inline-block; flex-shrink: 0;" title="Unread"></span>` : ''}
            </div>
            <p class="ann-text">${ann.body.length > 260 ? ann.body.substring(0, 260) + '...' : ann.body}</p>
            <div class="ann-footer">
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" style="width:12px; height:12px; stroke:var(--sandal-light); fill:none; stroke-width:2;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span class="ann-timestamp">${ann.createdBy}</span>
                <span style="color: var(--sandal-div);">·</span>
                <span class="ann-timestamp">${formatRelativeTime(ann.createdAt)}</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-ghost btn-sm btn-read-more" data-id="${ann.id}" style="font-size: 0.72rem; padding: 3px 10px;">
                  Read More
                </button>
                ${isAdmin ? `
                  <button class="btn btn-danger btn-sm btn-delete-ann" data-id="${ann.id}" style="font-size: 0.72rem; padding: 3px 10px;">
                    Delete
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind events
    listContainer.querySelectorAll('.btn-read-more').forEach(btn => {
      btn.addEventListener('click', () => openAnnouncementDrawer(btn.getAttribute('data-id')));
    });

    if (isAdmin) {
      listContainer.querySelectorAll('.btn-delete-ann').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this announcement?')) {
            db.deleteAnnouncement(btn.getAttribute('data-id'));
            renderList();
            showToast('Announcement removed.', 'success');
          }
        });
      });
    }
  }

  // Main HTML
  container.innerHTML = `
    <div class="page-hero">
      <div class="page-hero-text">
        <h2 class="page-hero-title">सूचनाकेन्द्रम्</h2>
        <span class="page-hero-subtitle">॥ Announcement & Notification Centre ॥</span>
      </div>
      <div class="page-hero-meta">
        <span class="academic-year-tag">Academic Year — 2083 Vikrami</span>
      </div>
    </div>

    ${isAdmin ? `
      <!-- Announcement Composer -->
      <div class="gurukula-card framed" id="composer-section">
        <div class="card-header">
          <h3 class="card-title">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>नूतनसूचना (Compose New Announcement)</span>
          </h3>
          <button class="btn btn-ghost btn-sm" id="toggle-composer">
            <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            Expand
          </button>
        </div>
        <div id="composer-body" style="display: none;">
          <form id="ann-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span>Title (English) *</span>
                  <span class="form-label-sanskrit">शीर्षकम्</span>
                </label>
                <input type="text" id="ann-title" class="form-control" placeholder="e.g. Annual Examination 2026" required>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span>Title (Sanskrit) *</span>
                  <span class="form-label-sanskrit">संस्कृतशीर्षकम्</span>
                </label>
                <input type="text" id="ann-title-sa" class="form-control" placeholder="यथा — वार्षिकपरीक्षा २०२६" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>Announcement Body *</span>
                <span class="form-label-sanskrit">विवरणम्</span>
              </label>
              <textarea id="ann-body" class="form-control" rows="4" placeholder="Enter the full announcement text here..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label"><span>Category *</span></label>
                <select id="ann-category" class="form-control" required>
                  <option value="academic">शैक्षणिकम् (Academic)</option>
                  <option value="administrative">प्रशासनिकम् (Administrative)</option>
                  <option value="urgent">आवश्यकम् (Urgent)</option>
                  <option value="festival">उत्सवः (Festival)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label"><span>Audience *</span></label>
                <select id="ann-audience" class="form-control" required>
                  <option value="all">सर्वेभ्यः (All)</option>
                  <option value="acharyas">आचार्येभ्यः (Acharyas Only)</option>
                  <option value="office">कार्यालयाय (Office Only)</option>
                </select>
              </div>
            </div>

            <div class="form-row" style="align-items: center;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label"><span>Priority</span></label>
                <select id="ann-priority" class="form-control">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; padding-top: 4px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                  <input type="checkbox" id="ann-pinned" style="width: 16px; height: 16px; accent-color: var(--saffron-royal);">
                  <span>Pin this announcement</span>
                </label>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.25rem;">
              <button type="button" class="btn btn-ghost" id="cancel-ann">Cancel</button>
              <button type="submit" class="btn btn-saffron">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                प्रकाशयतु (Publish)
              </button>
            </div>
          </form>
        </div>
      </div>
    ` : ''}

    <!-- Filter Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 10px;">
      <div class="chip-filter" id="category-filter-chips">
        <button class="chip active" data-cat="all">All</button>
        <button class="chip" data-cat="academic">शैक्षणिकम्</button>
        <button class="chip" data-cat="administrative">प्रशासनिकम्</button>
        <button class="chip" data-cat="urgent">आवश्यकम्</button>
        <button class="chip" data-cat="festival">उत्सवः</button>
      </div>
      <span id="ann-count" style="font-size: 0.8rem; font-weight: 600; color: var(--sandal-light);"></span>
    </div>

    <!-- Announcements List -->
    <div id="announcements-list" class="announcement-grid"></div>

    <!-- Drawer -->
    <div class="drawer-backdrop" id="ann-backdrop"></div>
    <div class="gurukula-drawer" id="ann-drawer"></div>
  `;

  // Toggle composer
  if (isAdmin) {
    const toggleBtn = container.querySelector('#toggle-composer');
    const composerBody = container.querySelector('#composer-body');
    const cancelBtn = container.querySelector('#cancel-ann');

    toggleBtn.addEventListener('click', () => {
      const isVisible = composerBody.style.display !== 'none';
      composerBody.style.display = isVisible ? 'none' : 'block';
      toggleBtn.innerHTML = isVisible
        ? `<svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;"><polyline points="6 9 12 15 18 9"/></svg> Expand`
        : `<svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;"><polyline points="18 15 12 9 6 15"/></svg> Collapse`;
    });

    cancelBtn.addEventListener('click', () => {
      composerBody.style.display = 'none';
      container.querySelector('#ann-form').reset();
    });

    container.querySelector('#ann-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const catVal = container.querySelector('#ann-category').value;
      const audVal = container.querySelector('#ann-audience').value;
      const catConfigs = {
        academic: 'शैक्षणिकम्', administrative: 'प्रशासनिकम्', urgent: 'आवश्यकम्', festival: 'उत्सवः'
      };
      const audConfigs = {
        all: 'सर्वेभ्यः', acharyas: 'आचार्येभ्यः', office: 'कार्यालयाय'
      };

      db.addAnnouncement({
        title: container.querySelector('#ann-title').value,
        titleSa: container.querySelector('#ann-title-sa').value,
        body: container.querySelector('#ann-body').value,
        category: catVal,
        categorySa: catConfigs[catVal] || catVal,
        audience: audVal,
        audienceSa: audConfigs[audVal] || audVal,
        priority: container.querySelector('#ann-priority').value,
        isPinned: container.querySelector('#ann-pinned').checked,
        createdBy: user ? user.name : 'Admin'
      });

      container.querySelector('#ann-form').reset();
      composerBody.style.display = 'none';
      renderList();
      updateCount();
      showToast('Announcement published successfully.', 'success');
    });
  }

  // Category filter chips
  container.querySelector('#category-filter-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterCategory = chip.getAttribute('data-cat');
    renderList();
    updateCount();
  });

  function updateCount() {
    const all = db.getAllAnnouncements();
    const filtered = filterCategory === 'all' ? all : all.filter(a => a.category === filterCategory);
    const countEl = container.querySelector('#ann-count');
    if (countEl) countEl.textContent = `${filtered.length} announcement${filtered.length !== 1 ? 's' : ''}`;
  }

  // Drawer
  const drawer = container.querySelector('#ann-drawer');
  const backdrop = container.querySelector('#ann-backdrop');

  backdrop.addEventListener('click', closeDrawer);

  function openDrawer(html) {
    drawer.innerHTML = html;
    drawer.classList.add('open');
    backdrop.classList.add('active');
    drawer.querySelectorAll('.drawer-close-btn, .btn-close-drawer').forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
  }

  function openAnnouncementDrawer(id) {
    const ann = db.getAnnouncementById(id);
    if (!ann) return;

    db.markAnnouncementRead(id, user ? user.id : 'guest');

    const cfg = getCategoryConfig(ann.category);
    const createdDate = new Date(ann.createdAt).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const createdTime = new Date(ann.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    openDrawer(`
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>सूचनाविवरणम्</h2>
          <span>Announcement Detail</span>
        </div>
        <button class="drawer-close-btn">
          <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2.2;">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="drawer-body">
        <!-- Category & Priority Header -->
        <div style="background: linear-gradient(135deg, var(--gold-light), var(--bg-card)); border: 1px solid rgba(196,164,104,0.3); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 0.75rem;">
            <span class="badge ${cfg.badge}">${cfg.label} (${cfg.labelEn})</span>
            <span class="badge badge-gold">${ann.audienceSa}</span>
            ${ann.isPinned ? `<span class="badge badge-saffron">PINNED</span>` : ''}
            ${ann.priority === 'urgent' ? `<span class="badge badge-absent">URGENT</span>` : ''}
          </div>
          <div style="height: 3px; background: ${cfg.color}; border-radius: 2px; margin-bottom: 1rem;"></div>
          <span style="font-family: var(--font-sanskrit-body); font-size: 1.1rem; color: var(--saffron-royal); font-weight: 700; display: block; margin-bottom: 4px;">${ann.titleSa}</span>
          <h2 style="font-family: var(--font-header); font-size: 1.05rem; color: var(--charcoal-sandal); font-weight: 700; line-height: 1.4;">${ann.title}</h2>
        </div>

        <!-- Body Text -->
        <div style="margin-bottom: 1.5rem;">
          <p style="font-size: 0.92rem; color: var(--charcoal-sandal); line-height: 1.8; font-weight: 500;">${ann.body}</p>
        </div>

        <!-- Metadata -->
        <div style="background: var(--sandal-pale); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--sandal-div);">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.8rem;">
            <div>
              <span style="color: var(--sandal-light); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Published By</span>
              <span style="font-weight: 700; color: var(--charcoal-sandal);">${ann.createdBy}</span>
            </div>
            <div>
              <span style="color: var(--sandal-light); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Date & Time</span>
              <span style="font-weight: 700; color: var(--charcoal-sandal);">${createdDate}, ${createdTime}</span>
            </div>
            <div>
              <span style="color: var(--sandal-light); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Read By</span>
              <span style="font-weight: 700; color: var(--charcoal-sandal);">${ann.readBy.length} recipient${ann.readBy.length !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span style="color: var(--sandal-light); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">Priority</span>
              <span style="font-weight: 700; color: var(--charcoal-sandal); text-transform: capitalize;">${ann.priority}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-footer">
        <button class="btn btn-outline btn-close-drawer">पिधानम् (Close)</button>
        ${isAdmin ? `
          <button class="btn btn-danger btn-delete-from-drawer" data-id="${ann.id}">Delete</button>
        ` : ''}
      </div>
    `);

    if (isAdmin) {
      drawer.querySelector('.btn-delete-from-drawer').addEventListener('click', () => {
        if (confirm('Delete this announcement permanently?')) {
          db.deleteAnnouncement(ann.id);
          closeDrawer();
          renderList();
          updateCount();
          showToast('Announcement deleted.', 'success');
        }
      });
    }

    renderList(); // Refresh to show read status
  }

  function showToast(message, type = 'success') {
    let container2 = document.querySelector('.toast-container');
    if (!container2) {
      container2 = document.createElement('div');
      container2.className = 'toast-container';
      document.body.appendChild(container2);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;">
        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
      </svg>
      <span>${message}</span>
    `;
    container2.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  renderList();
  updateCount();
}

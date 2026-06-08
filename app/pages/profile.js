import { router } from '../router.js?v=3.5';
import { db } from '../database.js?v=3.5';

export function renderProfile(container, appInstance) {
  const userSession = router.getUserSession();
  if (!userSession) {
    router.navigate('login');
    return;
  }
  
  const token = sessionStorage.getItem('vvg_token');
  
  container.innerHTML = `
    <div class="page-hero">
      <div class="page-hero-text">
        <h2 class="page-hero-title">मम विवरणम् (My Profile)</h2>
        <span class="page-hero-subtitle">Update your personal information and specialization</span>
      </div>
    </div>
    
    <div class="gurukula-card" style="max-width: 600px; margin: 2rem auto; padding: 2rem;">
      <form id="profile-form" style="display:flex; flex-direction:column; gap:1.2rem;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Full Name (English)</label>
          <input type="text" id="prof-name" class="form-control" disabled value="${userSession.name || ''}">
          <small style="color:var(--sandal-light);font-size:0.75rem;">Contact Admin to change your primary registered name.</small>
        </div>
        
        <div class="form-group" style="margin:0;">
          <label class="form-label" for="prof-name-sa">Name in Sanskrit / Devanagari</label>
          <input type="text" id="prof-name-sa" class="form-control devanagari-body" placeholder="e.g. सञ्जयाचार्यः" value="${userSession.nameSa || ''}">
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label" for="prof-spec">Specialization</label>
          <select id="prof-spec" class="form-control">
            <option value="" disabled>Select Specialization</option>
            <option value="Shukla Yajurveda">Shukla Yajurveda</option>
            <option value="Krishna Yajurveda">Krishna Yajurveda</option>
            <option value="Vedanta">Vedanta</option>
            <option value="Vyakarana">Vyakarana</option>
            <option value="Mimamsa">Mimamsa</option>
            <option value="Sahitya">Sahitya</option>
            <option value="Nyaya">Nyaya</option>
          </select>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label" for="prof-gana">Assigned Gana</label>
          <select id="prof-gana" class="form-control">
            <option value="">None / Select your Gana</option>
            ${(db.getAllGanas ? db.getAllGanas() : []).map(g => `<option value="${g.id}">${g.name} (${g.englishName})</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label" for="prof-exp">Years of Experience</label>
          <input type="number" id="prof-exp" class="form-control" min="0">
        </div>
        
        <div id="prof-msg" style="display:none; padding:10px; border-radius:5px; font-size:0.85rem; text-align:center;"></div>

        <button type="submit" id="prof-btn" class="btn btn-saffron" style="align-self:flex-start; margin-top:1rem; padding: 0.8rem 1.5rem;">
          Save Profile
        </button>
      </form>
    </div>
  `;
  
  // Fetch full user profile
  fetch('/api/users/profile', {
    headers: { 'X-Session-Token': token }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.user) {
      const u = data.user;
      if (u.specialization) container.querySelector('#prof-spec').value = u.specialization;
      if (u.ganaId) container.querySelector('#prof-gana').value = u.ganaId;
      if (u.yearsExperience) container.querySelector('#prof-exp').value = u.yearsExperience;
      if (u.nameSa) container.querySelector('#prof-name-sa').value = u.nameSa;
    }
  });

  container.querySelector('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#prof-btn');
    const msg = container.querySelector('#prof-msg');
    
    const payload = {
      nameSa: container.querySelector('#prof-name-sa').value.trim(),
      specialization: container.querySelector('#prof-spec').value,
      assignedGanaId: container.querySelector('#prof-gana').value,
      yearsExperience: container.querySelector('#prof-exp').value
    };
    
    btn.disabled = true;
    btn.textContent = 'Saving...';
    
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        msg.style.display = 'block';
        msg.style.background = '#E8F5E9';
        msg.style.color = '#1B5E20';
        msg.style.border = '1px solid #4CAF50';
        msg.textContent = 'Profile successfully updated!';
        
        // Update session storage lightly
        const s = JSON.parse(sessionStorage.getItem('vvg_user') || '{}');
        s.nameSa = payload.nameSa || s.name;
        s.ganaId = payload.assignedGanaId;
        sessionStorage.setItem('vvg_user', JSON.stringify(s));
        
        db.syncFromServer(); // re-fetch data
      } else {
        throw new Error(data.message || 'Failed to update');
      }
    } catch(err) {
      msg.style.display = 'block';
      msg.style.background = '#FFEBEE';
      msg.style.color = '#C62828';
      msg.style.border = '1px solid #EF5350';
      msg.textContent = err.message;
    }
    
    btn.disabled = false;
    btn.textContent = 'Save Profile';
  });
}

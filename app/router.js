/* 
  Veda Vijnana Gurukulam Management System
  Client-Side Router & Role Authorization Guards — v2.1
*/

const routes = {
  'login':         { title: 'प्रवेशः (Login)',                role: '*' },
  'dashboard':     { title: 'मुख्यपटलम् (Dashboard)',         role: ['Admin', 'Office Staff', 'Acharya'] },
  'students':      { title: 'छात्रसूची (Student Records)',     role: ['Admin', 'Office Staff', 'Acharya'] },
  'ganas':         { title: 'गणप्रबन्धनम् (Gana Management)', role: ['Admin', 'Office Staff', 'Acharya'] },
  'attendance':    { title: 'उपस्थितिः (Attendance)',          role: ['Admin', 'Office Staff', 'Acharya'] },
  'timetable':     { title: 'समयसारिणी (Timetable)',           role: ['Admin', 'Office Staff', 'Acharya'] },
  'acharyas':      { title: 'आचार्याः (Acharya Profiles)',     role: ['Admin', 'Office Staff', 'Acharya'] },
  'announcements': { title: 'सूचनाकेन्द्रम् (Announcements)',  role: ['Admin', 'Office Staff', 'Acharya'] },
  'documents':     { title: 'लेख्याधारः (Documents)',          role: ['Admin', 'Office Staff'] },
  'profile':       { title: 'मम विवरणम् (Profile)',           role: ['Admin', 'Office Staff', 'Acharya'] }
};

export const router = {
  currentRoute: '',

  init(appInstance) {
    this.app = appInstance;
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  getUserSession() {
    const user = sessionStorage.getItem('vvg_user');
    return user ? JSON.parse(user) : null;
  },

  async handleRouting() {
    let hash = window.location.hash.substring(1) || 'dashboard';
    const user = this.getUserSession();

    if (!user) {
      hash = 'login';
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
        return;
      }
    } else if (hash === 'login') {
      hash = 'dashboard';
      window.location.hash = '#dashboard';
      return;
    }

    const routeConfig = routes[hash];
    if (!routeConfig) {
      console.warn(`Route not found: ${hash}, defaulting to dashboard`);
      this.navigate('dashboard');
      return;
    }

    if (routeConfig.role !== '*') {
      const allowedRoles = routeConfig.role;
      if (!allowedRoles.includes(user.role)) {
        console.error(`Unauthorized access: "${hash}" by role "${user.role}"`);
        alert(`॥ प्रवेशः निषिद्धः ॥\nAccess Denied: You do not have permission to access the "${routeConfig.title}" module.`);
        this.navigate('dashboard');
        return;
      }
    }

    this.currentRoute = hash;
    document.title = `${routeConfig.title} — वेदविज्ञानगुरुकुलम्`;

    if (hash === 'login') {
      this.app.renderLoginView();
    } else {
      this.app.renderAppShell(hash);
    }
  }
};

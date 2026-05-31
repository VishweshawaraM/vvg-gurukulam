/* 
  Veda Vijnana Gurukulam Management System
  Database Module v3.0 â€” Server-Backed Persistence
  Real Logins | Shared Data | 90+ Students | 8 Ganas | Full Timetable
*/

const DB_KEY     = 'vvg_database';
const DB_VERSION = '3.2.0'; // hostelRoom removed, 14 Acharyas, real logo

export const db = {
  get() {
    const data    = localStorage.getItem(DB_KEY);
    const version = localStorage.getItem(DB_KEY + '_version');
    if (!data || version !== DB_VERSION) {
      const seeded = this.seed();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      localStorage.setItem(DB_KEY + '_version', DB_VERSION);
      return seeded;
    }
    const parsed = JSON.parse(data);
    return {
      students: [], acharyas: [], ganas: [], timetable: [], timeSlots: [], 
      attendanceLog: [], documents: [], announcements: [], activities: [], 
      sheetsConfig: null, ...parsed
    };
  },

  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    this._pushToServer(data); // fire-and-forget sync to server
  },

  // â”€â”€â”€ Server Sync (fire-and-forget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  _pushToServer(data) {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => { /* offline â€” data is safe in localStorage */ });
  },

  // â”€â”€â”€ Init: load from server on first load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async syncFromServer() {
    try {
      const res = await fetch('/api/db');
      if (res.status === 204) return false; // no server data yet
      if (!res.ok) return false;
      const serverData = await res.json();
      if (serverData && typeof serverData === 'object') {
        localStorage.setItem(DB_KEY, JSON.stringify(serverData));
        localStorage.setItem(DB_KEY + '_version', DB_VERSION);
        console.log('[VVG] Database synced from server.');
        return true;
      }
    } catch (e) {
      console.warn('[VVG] Server offline â€” using local data.');
    }
    return false;
  },

  // â”€â”€â”€ Real Authentication via Server API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async serverLogin(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success && json.token) {
        sessionStorage.setItem('vvg_token', json.token);
        sessionStorage.setItem('vvg_session', JSON.stringify(json.user));
        return { success: true, user: json.user };
      }
      return { success: false, message: json.message || 'Login failed' };
    } catch (e) {
      return { success: false, message: 'Cannot connect to server. Please ensure the server is running.' };
    }
  },

  seed() {
    console.log('Seeding Full Gurukulam Database v2.1.0...');

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 1. ACHARYAS â€” 8 Scholarly Teachers
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const acharyas = [
      {
        id: 'ach_1',
        name: 'Sanjaya Acharya',
        sanskritName: 'à¤¸à¤žà¥à¤œà¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Rigveda Samhita â€” Shakala Shakha',
        assignedGana: 'à¤¤à¤ªà¤ƒ', assignedGanaId: 'gan_1',
        yearsExperience: '', contact: '', email: 'sanjaya@vvgurukulam.org',
        bio: 'Senior Acharya at Veda Vijnana Gurukulam.', photo: null
      },
      {
        id: 'ach_2',
        name: 'Vinayaka Acharya',
        sanskritName: 'à¤µà¤¿à¤¨à¤¾à¤¯à¤•à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Rigveda â€” Svarashastra & Pratishakhya',
        assignedGana: 'à¤¤à¥‡à¤œà¤ƒ', assignedGanaId: 'gan_2',
        yearsExperience: '', contact: '', email: 'vinayaka@vvgurukulam.org',
        bio: 'Expert in Vedic Svaras and intonation at VVG.', photo: null
      },
      {
        id: 'ach_3',
        name: 'Guruprasada Acharya',
        sanskritName: 'à¤—à¥à¤°à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Rigveda â€” Pada Patha & Anukramani',
        assignedGana: 'à¤“à¤œà¤ƒ', assignedGanaId: 'gan_3',
        yearsExperience: '', contact: '', email: 'guruprasada@vvgurukulam.org',
        bio: 'Teaches Pada Patha and Vedic tradition at VVG.', photo: null
      },
      {
        id: 'ach_4',
        name: 'Aruna Acharya',
        sanskritName: 'à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Rigveda â€” Krama Patha & Vedic Prosody',
        assignedGana: 'à¤µà¤°à¥à¤šà¤ƒ', assignedGanaId: 'gan_4',
        yearsExperience: '', contact: '', email: 'aruna@vvgurukulam.org',
        bio: 'Specializes in advanced recitation modes.', photo: null
      },
      {
        id: 'ach_5',
        name: 'Shridhara Acharya',
        sanskritName: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Sanskrit Vyakarana â€” Panini Ashtadhyayi',
        assignedGana: 'à¤¶à¥à¤°à¥‡à¤¯à¤ƒ', assignedGanaId: 'gan_5',
        yearsExperience: '', contact: '', email: 'shridhara@vvgurukulam.org',
        bio: 'Teaches Paninian grammar to all Ganas.', photo: null
      },
      {
        id: 'ach_6',
        name: 'Mahadeva Acharya',
        sanskritName: 'à¤®à¤¹à¤¾à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Vedanta & Upanishad Patha',
        assignedGana: 'à¤­à¥à¤°à¤¾à¤œà¤ƒ', assignedGanaId: 'gan_6',
        yearsExperience: '', contact: '', email: 'mahadeva@vvgurukulam.org',
        bio: 'Guides students in Vedantic philosophy.', photo: null
      },
      {
        id: 'ach_7',
        name: 'Narayana Acharya',
        sanskritName: 'à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Kalpa Sutras â€” Shrauta & Grihya',
        assignedGana: 'à¤ªà¥à¤°à¥‡à¤¯à¤ƒ', assignedGanaId: 'gan_7',
        yearsExperience: '', contact: '', email: 'narayana@vvgurukulam.org',
        bio: 'Expert in ritual texts and Yajna tradition.', photo: null
      },
      {
        id: 'ach_8',
        name: 'Ramachandra Acharya',
        sanskritName: 'à¤°à¤¾à¤®à¤šà¤¨à¥à¤¦à¥à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Rigveda â€” Jata & Ghana Patha',
        assignedGana: 'à¤¯à¤¶à¤ƒ', assignedGanaId: 'gan_8',
        yearsExperience: '', contact: '', email: 'ramachandra@vvgurukulam.org',
        bio: 'Teaches the advanced recitation modes of Rigveda.', photo: null
      },
      {
        id: 'ach_9',
        name: 'Vasudeva Acharya',
        sanskritName: 'à¤µà¤¾à¤¸à¥à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Jyotisha & Vedanga',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'vasudeva@vvgurukulam.org',
        bio: 'Teaches Vedic astrology and the six Vedangas.', photo: null
      },
      {
        id: 'ach_10',
        name: 'Krishnamurthy Acharya',
        sanskritName: 'à¤•à¥ƒà¤·à¥à¤£à¤®à¥‚à¤°à¥à¤¤à¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Mimamsa & Dharmashastra',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'krishnamurthy@vvgurukulam.org',
        bio: 'Expert in ritual philosophy and Dharmic texts.', photo: null
      },
      {
        id: 'ach_11',
        name: 'Subrahmanya Acharya',
        sanskritName: 'à¤¸à¥à¤¬à¥à¤°à¤¹à¥à¤®à¤£à¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Yoga & Sandhyavandana Vidhi',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'subrahmanya@vvgurukulam.org',
        bio: 'Leads daily Sandhyavandana and Yoga sessions.', photo: null
      },
      {
        id: 'ach_12',
        name: 'Lakshminarayana Acharya',
        sanskritName: 'à¤²à¤•à¥à¤·à¥à¤®à¥€à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Stotras & Sanskrit Literature',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'lakshminarayana@vvgurukulam.org',
        bio: 'Teaches Sanskrit compositions and Stotra pathana.', photo: null
      },
      {
        id: 'ach_13',
        name: 'Shankara Acharya',
        sanskritName: 'à¤¶à¤™à¥à¤•à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Brahmacharya Ashrama & Student Conduct',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'shankara@vvgurukulam.org',
        bio: 'Oversees student discipline and Brahmacharya norms.', photo: null
      },
      {
        id: 'ach_14',
        name: 'Pradhana Acharyah',
        sanskritName: 'à¤ªà¥à¤°à¤§à¤¾à¤¨à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ',
        specialization: 'Gurukula Administration & Vedic Education',
        assignedGana: 'à¤¸à¤°à¥à¤µà¤—à¤£à¤¾à¤ƒ', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'admin@vvgurukulam.org',
        bio: 'Principal of Veda Vijnana Gurukulam. Oversees all academic and spiritual activities.', photo: null
      }
    ];


    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 2. GANAS â€” 8 Traditional Student Divisions
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const ganas = [
      { id: 'gan_1', name: 'à¤¤à¤ªà¤ƒ',    englishName: 'Tapa Gana',    assignedAcharyaId: 'ach_1', room: 'Veda Pathasala 1', vedaBranch: 'Rigveda â€“ Kapila (à¤•à¤ªà¤¿à¤²)',            color: '#C54E22' },
      { id: 'gan_2', name: 'à¤¤à¥‡à¤œà¤ƒ',   englishName: 'Teja Gana',   assignedAcharyaId: 'ach_2', room: 'Veda Pathasala 2', vedaBranch: 'Rigveda â€“ Kashyapa (à¤•à¤¶à¥à¤¯à¤ª)',         color: '#235689' },
      { id: 'gan_3', name: 'à¤“à¤œà¤ƒ',    englishName: 'Oja Gana',    assignedAcharyaId: 'ach_3', room: 'Veda Pathasala 3', vedaBranch: 'Rigveda â€“ Atri (à¤…à¤¤à¥à¤°à¤¿)',              color: '#2C6646' },
      { id: 'gan_4', name: 'à¤µà¤°à¥à¤šà¤ƒ',  englishName: 'Varca Gana',  assignedAcharyaId: 'ach_4', room: 'Veda Pathasala 4', vedaBranch: 'Rigveda â€“ Bharadvaja (à¤­à¤°à¤¦à¥à¤µà¤¾à¤œ)',     color: '#7B4F12' },
      { id: 'gan_5', name: 'à¤¶à¥à¤°à¥‡à¤¯à¤ƒ', englishName: 'Shreya Gana', assignedAcharyaId: 'ach_5', room: 'Veda Pathasala 5', vedaBranch: 'Rigveda â€“ Vishvamitra (à¤µà¤¿à¤¶à¥à¤µà¤¾à¤®à¤¿à¤¤à¥à¤°)', color: '#8B2252' },
      { id: 'gan_6', name: 'à¤­à¥à¤°à¤¾à¤œà¤ƒ', englishName: 'Bhraja Gana', assignedAcharyaId: 'ach_6', room: 'Veda Pathasala 6', vedaBranch: 'Rigveda â€“ Jamadagni (à¤œà¤®à¤¦à¤—à¥à¤¨à¤¿)',      color: '#6B3580' },
      { id: 'gan_7', name: 'à¤ªà¥à¤°à¥‡à¤¯à¤ƒ', englishName: 'Preya Gana',  assignedAcharyaId: 'ach_7', room: 'Veda Pathasala 7', vedaBranch: 'Rigveda â€“ Gautama (à¤—à¥Œà¤¤à¤®)',            color: '#1A5C6B' },
      { id: 'gan_8', name: 'à¤¯à¤¶à¤ƒ',    englishName: 'Yasha Gana',  assignedAcharyaId: 'ach_8', room: 'Veda Pathasala 8', vedaBranch: 'Rigveda â€“ Vashishtha (à¤µà¤¸à¤¿à¤·à¥à¤ )',      color: '#5C4B1A' }
    ];

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 3. STUDENTS â€” 94 Students across 8 Ganas
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const students = [
      // â”€â”€â”€ à¤—à¤£ 1: à¤ªà¥à¤°à¤¥à¤®à¤—à¤£à¤ƒ â€” Rigveda (12 students) â”€â”€â”€
      { id: 'std_1', name: 'Rama Bhatta', sanskritName: 'à¤°à¤¾à¤®à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2010-04-12', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Gopalakrishna Bhatta', parentContact: '+91 98450 12345', address: 'Gokarna, Uttara Kannada, Karnataka - 581326', photo: null, notes: 'Excellent memorization. Leads Gana prayers.' },
      { id: 'std_2', name: 'Subrahmanya Joshi', sanskritName: 'à¤¸à¥à¤¬à¥à¤°à¤¹à¥à¤®à¤£à¥à¤¯à¤œà¥‹à¤¶à¥€', dob: '2011-08-20', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayana Joshi', parentContact: '+91 94801 98765', address: 'Sringeri, Chikkamagaluru, Karnataka - 577139', photo: null, notes: 'Good pronunciation. Needs support in swara intonations.' },
      { id: 'std_3', name: 'Krishna Murthy', sanskritName: 'à¤•à¥ƒà¤·à¥à¤£à¤®à¥‚à¤°à¥à¤¤à¤¿à¤ƒ', dob: '2009-11-05', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 4)', joiningDate: '2022-06-10', parentName: 'Venkatesha Murthy', parentContact: '+91 99008 88776', address: 'Channenahalli, Magadi Road, Bangalore - 562130', photo: null, notes: 'Senior student, supports acharya in leading prayers.' },
      { id: 'std_4', name: 'Ganesha Hegde', sanskritName: 'à¤—à¤£à¥‡à¤¶à¤¹à¥‡à¤—à¤¡à¥‡', dob: '2012-01-30', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 1)', joiningDate: '2025-06-01', parentName: 'Ganapati Hegde', parentContact: '+91 94490 22334', address: 'Yellapur, Uttara Kannada - 581359', photo: null, notes: 'Fast learner, adjusting well to daily routine.' },
      { id: 'std_5', name: 'Vishnu Prasad', sanskritName: 'à¤µà¤¿à¤·à¥à¤£à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤ƒ', dob: '2010-09-15', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Anantha Padmanabha', parentContact: '+91 98805 44332', address: 'Udupi, Karnataka - 576101', photo: null, notes: 'Keen interest in Sanskrit grammar.' },
      { id: 'std_6', name: 'Ananta Sharma', sanskritName: 'à¤…à¤¨à¤¨à¥à¤¤à¤¶à¤°à¥à¤®à¤¾', dob: '2011-03-22', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Damodara Sharma', parentContact: '+91 97312 44561', address: 'Kumta, Uttara Kannada - 581343', photo: null, notes: 'Disciplined. Assists in library maintenance.' },
      { id: 'std_7', name: 'Shankara Bhat', sanskritName: 'à¤¶à¤™à¥à¤•à¤°à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2010-07-18', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-01', parentName: 'Sitarama Bhat', parentContact: '+91 94488 77654', address: 'Honnavar, Uttara Kannada - 581334', photo: null, notes: 'Strong in Padapatha recitation style.' },
      { id: 'std_8', name: 'Purushottama Rao', sanskritName: 'à¤ªà¥à¤°à¥à¤·à¥‹à¤¤à¥à¤¤à¤®à¤°à¤¾à¤µà¤ƒ', dob: '2012-05-10', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 1)', joiningDate: '2025-06-01', parentName: 'Venkatarao', parentContact: '+91 98450 23456', address: 'Hospet, Ballari - 583201', photo: null, notes: 'New student. Shows great interest.' },
      { id: 'std_9', name: 'Trivikrama Jois', sanskritName: 'à¤¤à¥à¤°à¤¿à¤µà¤¿à¤•à¥à¤°à¤®à¤œà¥‹à¤ˆà¤¸à¥', dob: '2011-12-01', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Suresh Jois', parentContact: '+91 94490 34567', address: 'Mandya, Karnataka - 571401', photo: null, notes: 'Participates actively in Samhita recitation.' },
      { id: 'std_10', name: 'Nagendra Bhatta', sanskritName: 'à¤¨à¤¾à¤—à¥‡à¤¨à¥à¤¦à¥à¤°à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2010-02-28', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Ishwara Bhatta', parentContact: '+91 97401 56789', address: 'Sirsi, Uttara Kannada - 581401', photo: null, notes: 'Excellent swara control. Memorizing Mandala 2.' },
      { id: 'std_11', name: 'Balakrishna Upadhyaya', sanskritName: 'à¤¬à¤¾à¤²à¤•à¥ƒà¤·à¥à¤£à¤‰à¤ªà¤¾à¤§à¥à¤¯à¤¾à¤¯à¤ƒ', dob: '2009-08-14', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 4)', joiningDate: '2022-06-10', parentName: 'Ramakrishna Upadhyaya', parentContact: '+91 98865 12340', address: 'Mysuru, Karnataka - 570001', photo: null, notes: 'Top scholar. Completed Mandala 1-5.' },
      { id: 'std_12', name: 'Durgaprasad Hegde', sanskritName: 'à¤¦à¥à¤°à¥à¤—à¤¾à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¹à¥‡à¤—à¤¡à¥‡', dob: '2011-06-25', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Chandrakant Hegde', parentContact: '+91 94801 67890', address: 'Karwar, Uttara Kannada - 581301', photo: null, notes: 'Diligent. Memorizing Kramapatha patterns.' },

      // â”€â”€â”€ à¤—à¤£ 2: à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯à¤—à¤£à¤ƒ â€” Krishna Yajurveda (12 students) â”€â”€â”€
      { id: 'std_13', name: 'Harihara Sastry', sanskritName: 'à¤¹à¤°à¤¿à¤¹à¤°à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€', dob: '2010-02-14', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-05-20', parentName: 'Sundareshwara Sastry', parentContact: '+91 94488 11122', address: 'Melukote, Mandya - 571431', photo: null, notes: 'Excellent recitation. Selected for university exams.' },
      { id: 'std_14', name: 'Yagnesha Sharma', sanskritName: 'à¤¯à¤œà¥à¤žà¥‡à¤¶à¤¶à¤°à¥à¤®à¤¾', dob: '2011-06-18', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Somasekhara Sharma', parentContact: '+91 98765 43210', address: 'Shimoga, Karnataka - 577201', photo: null, notes: 'Highly disciplined. Maintains hostel neatness.' },
      { id: 'std_15', name: 'Vasudeva Somayaji', sanskritName: 'à¤µà¤¾à¤¸à¥à¤¦à¥‡à¤µà¤¸à¥‹à¤®à¤¯à¤¾à¤œà¥€', dob: '2009-07-25', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 4)', joiningDate: '2022-06-01', parentName: 'Subramanya Somayaji', parentContact: '+91 99800 55667', address: 'Kota, Kundapura - 576221', photo: null, notes: 'Helps clean the Yajnasala. Performs well in tests.' },
      { id: 'std_16', name: 'Shridhara Avadhani', sanskritName: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤µà¤§à¤¾à¤¨à¥€', dob: '2011-12-03', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Ramakrishna Avadhani', parentContact: '+91 94812 33445', address: 'Sagar, Shivamogga - 577401', photo: null, notes: 'Extremely diligent in memorizing Krama Patha.' },
      { id: 'std_17', name: 'Vigneshwara Bhatta', sanskritName: 'à¤µà¤¿à¤˜à¥à¤¨à¥‡à¤¶à¥à¤µà¤°à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2012-05-18', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 1)', joiningDate: '2025-06-01', parentName: 'Mahabaleshwara Bhatta', parentContact: '+91 94480 99001', address: 'Sirsi, Uttara Kannada - 581401', photo: null, notes: 'Excels in yoga sessions. Polite.' },
      { id: 'std_18', name: 'Ishana Kulkarni', sanskritName: 'à¤ˆà¤¶à¤¾à¤¨à¤•à¥à¤²à¤•à¤°à¥à¤£à¥€', dob: '2010-10-08', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-06-05', parentName: 'Vithal Kulkarni', parentContact: '+91 98450 88123', address: 'Belgavi, Karnataka - 590001', photo: null, notes: 'Strong in Sandhyavandana procedure.' },
      { id: 'std_19', name: 'Madhusudana Pant', sanskritName: 'à¤®à¤§à¥à¤¸à¥‚à¤¦à¤¨à¤ªà¤¨à¥à¤¤à¤ƒ', dob: '2011-04-20', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Shivaprasad Pant', parentContact: '+91 94481 54321', address: 'Dharwad, Karnataka - 580001', photo: null, notes: 'Consistent in attendance. Quiet student.' },
      { id: 'std_20', name: 'Chandrashekhara Iyer', sanskritName: 'à¤šà¤¨à¥à¤¦à¥à¤°à¤¶à¥‡à¤–à¤°à¤…à¤¯à¥à¤¯à¤°à¥', dob: '2009-09-30', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 4)', joiningDate: '2022-06-10', parentName: 'Krishnaswamy Iyer', parentContact: '+91 99004 76543', address: 'Tumakuru, Karnataka - 572101', photo: null, notes: 'Advanced student. Assists in teaching Pratishakhya.' },
      { id: 'std_21', name: 'Brahmananda Rao', sanskritName: 'à¤¬à¥à¤°à¤¹à¥à¤®à¤¾à¤¨à¤¨à¥à¤¦à¤°à¤¾à¤µà¤ƒ', dob: '2012-02-14', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 1)', joiningDate: '2025-06-01', parentName: 'Venkatarama Rao', parentContact: '+91 97401 43210', address: 'Chikkaballapur - 562101', photo: null, notes: 'New student. Very enthusiastic.' },
      { id: 'std_22', name: 'Venkataramana Deekshit', sanskritName: 'à¤µà¥‡à¤™à¥à¤•à¤Ÿà¤°à¤¾à¤®à¤£à¤¦à¥€à¤•à¥à¤·à¤¿à¤¤à¤ƒ', dob: '2010-11-11', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-06-05', parentName: 'Ramarao Deekshit', parentContact: '+91 94482 21098', address: 'Kolar, Karnataka - 563101', photo: null, notes: 'Excellent in Taittiriya Aranyaka recitation.' },
      { id: 'std_23', name: 'Surendra Bhatt', sanskritName: 'à¤¸à¥à¤°à¥‡à¤¨à¥à¤¦à¥à¤°à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2011-07-04', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Nagesh Bhatt', parentContact: '+91 98863 32109', address: 'Puttur, Dakshina Kannada - 574201', photo: null, notes: 'Focused student. Preparing for university enrollment.' },
      { id: 'std_24', name: 'Lakshmikanta Dikshit', sanskritName: 'à¤²à¤•à¥à¤·à¥à¤®à¥€à¤•à¤¾à¤¨à¥à¤¤à¤¦à¥€à¤•à¥à¤·à¤¿à¤¤à¤ƒ', dob: '2010-03-28', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-05-20', parentName: 'Ramachandra Dikshit', parentContact: '+91 94481 10987', address: 'Davangere, Karnataka - 577001', photo: null, notes: 'Leader in hostel prayers. Academic rank 2nd in Gana.' },

      // â”€â”€â”€ à¤—à¤£ 3: à¤¤à¥ƒà¤¤à¥€à¤¯à¤—à¤£à¤ƒ â€” Samaveda (11 students) â”€â”€â”€
      { id: 'std_25', name: 'Samavedananda Pillai', sanskritName: 'à¤¸à¤¾à¤®à¤µà¥‡à¤¦à¤¾à¤¨à¤¨à¥à¤¦à¤ªà¤¿à¤²à¥à¤²à¥ˆ', dob: '2010-01-15', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Subrahmanya Pillai', parentContact: '+91 98458 67890', address: 'Palakkad, Kerala - 678001', photo: null, notes: 'Exceptional in Samaveda singing. Golden voice.' },
      { id: 'std_26', name: 'Ganapatikrishna Menon', sanskritName: 'à¤—à¤£à¤ªà¤¤à¤¿à¤•à¥ƒà¤·à¥à¤£à¤®à¥‡à¤¨à¥‹à¤¨à¥', dob: '2011-09-22', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Krishnan Menon', parentContact: '+91 94478 56789', address: 'Thrissur, Kerala - 680001', photo: null, notes: 'Strong in melodic Gana singing.' },
      { id: 'std_27', name: 'Achyuta Varma', sanskritName: 'à¤…à¤šà¥à¤¯à¥à¤¤à¤µà¤°à¥à¤®à¤¾', dob: '2010-06-08', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Ananta Varma', parentContact: '+91 97432 45678', address: 'Kasaragod, Kerala - 671121', photo: null, notes: 'Precise in Grama-geya Gana.' },
      { id: 'std_28', name: 'Vamadeva Namboothiri', sanskritName: 'à¤µà¤¾à¤®à¤¦à¥‡à¤µà¤¨à¤®à¥à¤¬à¥‚à¤¦à¤¿à¤°à¥€', dob: '2009-12-18', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 4)', joiningDate: '2022-06-01', parentName: 'Narayanan Namboothiri', parentContact: '+91 98450 34567', address: 'Malappuram, Kerala - 676501', photo: null, notes: 'Senior student. Assists in Aranyaka recitation.' },
      { id: 'std_29', name: 'Mriganka Chatterjee', sanskritName: 'à¤®à¥ƒà¤—à¤¾à¤™à¥à¤•à¤šà¤Ÿà¥à¤Ÿà¤°à¥à¤œà¥€', dob: '2012-03-10', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 1)', joiningDate: '2025-06-01', parentName: 'Debashish Chatterjee', parentContact: '+91 94801 23450', address: 'Kolkata, West Bengal - 700001', photo: null, notes: 'New student from Bengal. Keen learner.' },
      { id: 'std_30', name: 'Karunakara Panicker', sanskritName: 'à¤•à¤°à¥à¤£à¤¾à¤•à¤°à¤ªà¤£à¤¿à¤•à¥à¤•à¤°à¥', dob: '2011-05-14', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Sankaran Panicker', parentContact: '+91 99450 12345', address: 'Kozhikode, Kerala - 673001', photo: null, notes: 'Melodious voice. Good pitch control.' },
      { id: 'std_31', name: 'Vidyadhara Varrier', sanskritName: 'à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤§à¤°à¤µà¤¾à¤°à¤¿à¤¯à¤°à¥', dob: '2010-08-30', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnan Varrier', parentContact: '+91 94480 89012', address: 'Ernakulam, Kerala - 682001', photo: null, notes: 'Excels in Samavedic Udatta-Anudatta analysis.' },
      { id: 'std_32', name: 'Suryanarayan Shukla', sanskritName: 'à¤¸à¥‚à¤°à¥à¤¯à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤¶à¥à¤•à¥à¤²à¤ƒ', dob: '2012-01-05', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 1)', joiningDate: '2025-06-01', parentName: 'Ramchandra Shukla', parentContact: '+91 97612 56789', address: 'Varanasi, UP - 221001', photo: null, notes: 'Student from Kashi tradition. Very reverent.' },
      { id: 'std_33', name: 'Thrivikrama Devan', sanskritName: 'à¤¤à¥à¤°à¤¿à¤µà¤¿à¤•à¥à¤°à¤®à¤¦à¥‡à¤µà¤¨à¥', dob: '2010-04-22', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Govindan Devan', parentContact: '+91 94485 67890', address: 'Kannur, Kerala - 670001', photo: null, notes: 'Perfect swara control in Gana singing.' },
      { id: 'std_34', name: 'Annamalai Dikshitar', sanskritName: 'à¤…à¤£à¥à¤£à¤¾à¤®à¤²à¥ˆà¤¦à¥€à¤•à¥à¤·à¤¿à¤¤à¤ƒ', dob: '2011-10-18', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Subramaniam Dikshitar', parentContact: '+91 98433 23456', address: 'Chidambaram, Tamil Nadu - 608001', photo: null, notes: 'Comes from Nataraja temple tradition. Deep knowledge.' },
      { id: 'std_35', name: 'Sankaranarayan Bhat', sanskritName: 'à¤¶à¤™à¥à¤•à¤°à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2009-07-02', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 4)', joiningDate: '2022-06-10', parentName: 'Laxminarayana Bhat', parentContact: '+91 94801 34567', address: 'Udupi, Karnataka - 576101', photo: null, notes: 'Top student. Recites entire Samhita from memory.' },

      // â”€â”€â”€ à¤—à¤£ 4: à¤šà¤¤à¥à¤°à¥à¤¥à¤—à¤£à¤ƒ â€” Yajurveda Maitrayani (12 students) â”€â”€â”€
      { id: 'std_36', name: 'Parameshwara Deekshit', sanskritName: 'à¤ªà¤°à¤®à¥‡à¤¶à¥à¤µà¤°à¤¦à¥€à¤•à¥à¤·à¤¿à¤¤à¤ƒ', dob: '2010-03-16', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Srinivasa Deekshit', parentContact: '+91 94490 11223', address: 'Dharmapuri, Tamil Nadu - 636701', photo: null, notes: 'Very dedicated. Memorizing Maitrayani Samhita.' },
      { id: 'std_37', name: 'Ramanuja Iyengar', sanskritName: 'à¤°à¤¾à¤®à¤¾à¤¨à¥à¤œà¤†à¤¯à¤‚à¤—à¤¾à¤°à¥', dob: '2011-07-28', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Srinivasan Iyengar', parentContact: '+91 98450 78901', address: 'Srirangam, Tamil Nadu - 620006', photo: null, notes: 'Well-versed in Vishishta Advaita texts.' },
      { id: 'std_38', name: 'Nataraja Dikshit', sanskritName: 'à¤¨à¤Ÿà¤°à¤¾à¤œà¤¦à¥€à¤•à¥à¤·à¤¿à¤¤à¤ƒ', dob: '2010-11-04', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnamurti Dikshit', parentContact: '+91 94488 89012', address: 'Kumbakonam, Tamil Nadu - 612001', photo: null, notes: 'Precise pronunciation. Good in Anvaya learning.' },
      { id: 'std_39', name: 'Srivatsa Bhattacharyya', sanskritName: 'à¤¶à¥à¤°à¥€à¤µà¤¤à¥à¤¸à¤­à¤Ÿà¥à¤Ÿà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', dob: '2009-06-20', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 4)', joiningDate: '2022-06-10', parentName: 'Jagannath Bhattacharyya', parentContact: '+91 99004 56789', address: 'Puri, Odisha - 752001', photo: null, notes: 'Senior. Teaching assistant for Year 1.' },
      { id: 'std_40', name: 'Shankaranarayana Iyer', sanskritName: 'à¤¶à¤™à¥à¤•à¤°à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤…à¤¯à¥à¤¯à¤°à¥', dob: '2012-04-15', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 1)', joiningDate: '2025-06-01', parentName: 'Balakrishnan Iyer', parentContact: '+91 94801 45678', address: 'Madurai, Tamil Nadu - 625001', photo: null, notes: 'New student. Enthusiastic about Karma Kanda.' },
      { id: 'std_41', name: 'Satyanarayana Sharma', sanskritName: 'à¤¸à¤¤à¥à¤¯à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤¶à¤°à¥à¤®à¤¾', dob: '2010-08-12', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Venkateshwara Sharma', parentContact: '+91 97432 23456', address: 'Tirupati, Andhra Pradesh - 517501', photo: null, notes: 'From Tirumala tradition. Strong in Vedic rituals.' },
      { id: 'std_42', name: 'Chidambara Bhatta', sanskritName: 'à¤šà¤¿à¤¦à¤®à¥à¤¬à¤°à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2011-02-28', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayanaswamy Bhatta', parentContact: '+91 94480 56789', address: 'Bellary, Karnataka - 583101', photo: null, notes: 'Consistent and methodical in study.' },
      { id: 'std_43', name: 'Ganapathy Raman', sanskritName: 'à¤—à¤£à¤ªà¤¤à¤¿à¤°à¤¾à¤®à¤¨à¥', dob: '2010-05-05', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Subramonian Raman', parentContact: '+91 98865 67890', address: 'Coimbatore, Tamil Nadu - 641001', photo: null, notes: 'Good at connecting Yajurveda to actual Yajna procedures.' },
      { id: 'std_44', name: 'Vishvanath Oka', sanskritName: 'à¤µà¤¿à¤¶à¥à¤µà¤¨à¤¾à¤¥à¤“à¤•à¤¾', dob: '2011-09-18', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Shripad Oka', parentContact: '+91 94481 78901', address: 'Pune, Maharashtra - 411001', photo: null, notes: 'Student from Maharashtra. Adapting well.' },
      { id: 'std_45', name: 'Narasimha Avadhani', sanskritName: 'à¤¨à¤°à¤¸à¤¿à¤‚à¤¹à¤¾à¤µà¤§à¤¾à¤¨à¥€', dob: '2009-11-22', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 4)', joiningDate: '2022-06-10', parentName: 'Venkatarama Avadhani', parentContact: '+91 98450 89012', address: 'Vijayawada, Andhra Pradesh - 520001', photo: null, notes: 'Top student. Memorized entire Maitrayani Samhita.' },
      { id: 'std_46', name: 'Somanatha Bhatta', sanskritName: 'à¤¸à¥‹à¤®à¤¨à¤¾à¤¥à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2012-06-30', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 1)', joiningDate: '2025-06-01', parentName: 'Shivarama Bhatta', parentContact: '+91 94490 90123', address: 'Hassan, Karnataka - 573201', photo: null, notes: 'New student. Shows good discipline.' },
      { id: 'std_47', name: 'Srinivasa Murthy', sanskritName: 'à¤¶à¥à¤°à¥€à¤¨à¤¿à¤µà¤¾à¤¸à¤®à¥‚à¤°à¥à¤¤à¤¿à¤ƒ', dob: '2011-01-08', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Venkataraman Murthy', parentContact: '+91 94482 01234', address: 'Chamrajnagar, Karnataka - 571313', photo: null, notes: 'Respectful and attentive during classes.' },

      // â”€â”€â”€ à¤—à¤£ 5: à¤ªà¤žà¥à¤šà¤®à¤—à¤£à¤ƒ â€” Atharvaveda (12 students) â”€â”€â”€
      { id: 'std_48', name: 'Atharva Krishnamurthy', sanskritName: 'à¤…à¤¥à¤°à¥à¤µà¤•à¥ƒà¤·à¥à¤£à¤®à¥‚à¤°à¥à¤¤à¤¿à¤ƒ', dob: '2010-02-08', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnamurthy Rao', parentContact: '+91 97432 34567', address: 'Rajahmundry, AP - 533101', photo: null, notes: 'Specialized in Atharvaveda medical sutras.' },
      { id: 'std_49', name: 'Bhrigu Sharma', sanskritName: 'à¤­à¥ƒà¤—à¥à¤¶à¤°à¥à¤®à¤¾', dob: '2011-07-17', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Bhargava Sharma', parentContact: '+91 94480 45678', address: 'Nashik, Maharashtra - 422001', photo: null, notes: 'Deeply interested in Ayurvedic connections.' },
      { id: 'std_50', name: 'Chandra Gupta', sanskritName: 'à¤šà¤¨à¥à¤¦à¥à¤°à¤—à¥à¤ªà¥à¤¤à¤ƒ', dob: '2010-10-25', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Mahendra Gupta', parentContact: '+91 99004 34567', address: 'Patna, Bihar - 800001', photo: null, notes: 'Excellent knowledge of Paippalada Shakha.' },
      { id: 'std_51', name: 'Divyendu Panda', sanskritName: 'à¤¦à¤¿à¤µà¥à¤¯à¥‡à¤¨à¥à¤¦à¥à¤ªà¤£à¥à¤¡à¤¾', dob: '2009-08-14', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 4)', joiningDate: '2022-06-10', parentName: 'Gopal Panda', parentContact: '+91 94801 56789', address: 'Bhubaneswar, Odisha - 751001', photo: null, notes: 'Senior student. Helps in library management.' },
      { id: 'std_52', name: 'Ekadashi Mishra', sanskritName: 'à¤à¤•à¤¾à¤¦à¤¶à¥€à¤®à¤¿à¤¶à¥à¤°à¤ƒ', dob: '2012-03-22', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 1)', joiningDate: '2025-06-01', parentName: 'Madhusudan Mishra', parentContact: '+91 94490 67890', address: 'Allahabad, UP - 211001', photo: null, notes: 'New student from UP. Good Sanskrit base.' },
      { id: 'std_53', name: 'Fanindra Das', sanskritName: 'à¤«à¤£à¥€à¤¨à¥à¤¦à¥à¤°à¤¦à¤¾à¤¸à¤ƒ', dob: '2011-04-30', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Jagadish Das', parentContact: '+91 97402 78901', address: 'Puri, Odisha - 752001', photo: null, notes: 'Respectful. Focused on Shakha recitation.' },
      { id: 'std_54', name: 'Govinda Tiwari', sanskritName: 'à¤—à¥‹à¤µà¤¿à¤¨à¥à¤¦à¤¤à¤¿à¤µà¤¾à¤°à¥€', dob: '2010-07-12', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramakant Tiwari', parentContact: '+91 98865 89012', address: 'Prayagraj, UP - 211001', photo: null, notes: 'Strong in Prashna Upanishad recitation.' },
      { id: 'std_55', name: 'Harikrishna Nair', sanskritName: 'à¤¹à¤°à¤¿à¤•à¥ƒà¤·à¥à¤£à¤¨à¤¾à¤¯à¤°à¥', dob: '2011-11-08', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Gopalakrishnan Nair', parentContact: '+91 94481 90123', address: 'Thiruvananthapuram - 695001', photo: null, notes: 'Disciplined. Good conduct in hostel.' },
      { id: 'std_56', name: 'Indra Deva Mishra', sanskritName: 'à¤‡à¤¨à¥à¤¦à¥à¤°à¤¦à¥‡à¤µà¤®à¤¿à¤¶à¥à¤°à¤ƒ', dob: '2010-01-18', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramadeva Mishra', parentContact: '+91 94482 12345', address: 'Mathura, UP - 281001', photo: null, notes: 'Deep understanding of Kanda Shakha divisions.' },
      { id: 'std_57', name: 'Jagadish Pujari', sanskritName: 'à¤œà¤—à¤¦à¥€à¤¶à¤ªà¥‚à¤œà¤¾à¤°à¥€', dob: '2009-10-05', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 4)', joiningDate: '2022-06-10', parentName: 'Subramanya Pujari', parentContact: '+91 97433 23456', address: 'Mangaluru, Karnataka - 575001', photo: null, notes: 'Senior. Performs Atharvanic Homa procedures.' },
      { id: 'std_58', name: 'Kamalakanta Tripathi', sanskritName: 'à¤•à¤®à¤²à¤•à¤¾à¤¨à¥à¤¤à¤¤à¤¿à¤µà¤¾à¤°à¥€', dob: '2012-07-20', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 1)', joiningDate: '2025-06-01', parentName: 'Ramdas Tripathi', parentContact: '+91 94483 34567', address: 'Gorakhpur, UP - 273001', photo: null, notes: 'New student. Eager and obedient.' },
      { id: 'std_59', name: 'Lakshmana Shastri', sanskritName: 'à¤²à¤•à¥à¤·à¥à¤®à¤£à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€', dob: '2011-05-25', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Janakiballabha Shastri', parentContact: '+91 98866 45678', address: 'Varanasi, UP - 221001', photo: null, notes: 'Kashi tradition student. Classical approach.' },

      // â”€â”€â”€ à¤—à¤£ 6: à¤·à¤·à¥à¤ à¤—à¤£à¤ƒ â€” Vedanta (11 students) â”€â”€â”€
      { id: 'std_60', name: 'Mukunda Bhattacharya', sanskritName: 'à¤®à¥à¤•à¥à¤¨à¥à¤¦à¤­à¤Ÿà¥à¤Ÿà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', dob: '2010-04-06', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Gopinath Bhattacharya', parentContact: '+91 94484 56789', address: 'Kolkata, WB - 700019', photo: null, notes: 'Advanced understanding of Advaita Vedanta.' },
      { id: 'std_61', name: 'Nagabhushana Acharya', sanskritName: 'à¤¨à¤¾à¤—à¤­à¥‚à¤·à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', dob: '2011-08-15', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Sheshagiri Acharya', parentContact: '+91 94485 67890', address: 'Sringeri, Karnataka - 577139', photo: null, notes: 'Studies Brahma Sutra Bhashya carefully.' },
      { id: 'std_62', name: 'Omkar Deshpande', sanskritName: 'à¤“à¤‚à¤•à¤¾à¤°à¤¦à¥‡à¤¶à¤ªà¤¾à¤£à¥à¤¡à¥‡', dob: '2010-09-28', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Vinayak Deshpande', parentContact: '+91 98860 78901', address: 'Pune, Maharashtra - 411030', photo: null, notes: 'Good in Panchadashi analysis.' },
      { id: 'std_63', name: 'Purnananda Swami', sanskritName: 'à¤ªà¥‚à¤°à¥à¤£à¤¾à¤¨à¤¨à¥à¤¦à¤¸à¥à¤µà¤¾à¤®à¥€', dob: '2009-05-10', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 4)', joiningDate: '2022-06-10', parentName: 'Brahmananda Swami', parentContact: '+91 97434 89012', address: 'Rishikesh, Uttarakhand - 249201', photo: null, notes: 'Senior. Deep meditative practice. Leads morning chanting.' },
      { id: 'std_64', name: 'Raghavendra Rao', sanskritName: 'à¤°à¤¾à¤˜à¤µà¥‡à¤¨à¥à¤¦à¥à¤°à¤°à¤¾à¤µà¤ƒ', dob: '2012-01-22', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 1)', joiningDate: '2025-06-01', parentName: 'Vitthalrao', parentContact: '+91 94486 90123', address: 'Udupi, Karnataka - 576101', photo: null, notes: 'New student from Pejawara Matha.' },
      { id: 'std_65', name: 'Satchidananda Ghosh', sanskritName: 'à¤¸à¤šà¥à¤šà¤¿à¤¦à¤¾à¤¨à¤¨à¥à¤¦à¤˜à¥‹à¤·à¤ƒ', dob: '2011-06-08', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Amitabha Ghosh', parentContact: '+91 98861 01234', address: 'Howrah, WB - 711101', photo: null, notes: 'Philosophical inclination. Studies Shankaracharya texts.' },
      { id: 'std_66', name: 'Tapobrata Mukherjee', sanskritName: 'à¤¤à¤ªà¥‹à¤¬à¥à¤°à¤¤à¤®à¥à¤–à¤°à¥à¤œà¥€', dob: '2010-12-15', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Srikanta Mukherjee', parentContact: '+91 94487 12345', address: 'Nabadwip, WB - 741302', photo: null, notes: 'Strong in Mahavakya interpretation.' },
      { id: 'std_67', name: 'Upendra Pati', sanskritName: 'à¤‰à¤ªà¥‡à¤¨à¥à¤¦à¥à¤°à¤ªà¤¤à¤¿à¤ƒ', dob: '2011-03-05', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Girish Pati', parentContact: '+91 97435 23456', address: 'Bhubaneswar, Odisha - 751001', photo: null, notes: 'Consistent in evening Upanishad recitations.' },
      { id: 'std_68', name: 'Vasishtha Jha', sanskritName: 'à¤µà¤¸à¤¿à¤·à¥à¤ à¤à¤¾', dob: '2010-07-22', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Harihar Jha', parentContact: '+91 98862 34567', address: 'Darbhanga, Bihar - 846004', photo: null, notes: 'Mithila tradition. Excellent in Navya Nyaya.' },
      { id: 'std_69', name: 'Yashaskara Singh', sanskritName: 'à¤¯à¤¶à¤¸à¥à¤•à¤°à¤¸à¤¿à¤‚à¤¹à¤ƒ', dob: '2009-09-18', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 4)', joiningDate: '2022-06-10', parentName: 'Dharmendra Singh', parentContact: '+91 94488 45678', address: 'Jaipur, Rajasthan - 302001', photo: null, notes: 'Senior. Memorized all principal Upanishads.' },
      { id: 'std_70', name: 'Zenith Krishnan', sanskritName: 'à¤à¥‡à¤¨à¤¿à¤¥à¤•à¥ƒà¤·à¥à¤£à¤¨à¥', dob: '2011-11-30', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Balakrishnan Krishnan', parentContact: '+91 97436 56789', address: 'Chennai, Tamil Nadu - 600001', photo: null, notes: 'Interested in Tarka Shastra alongside Vedanta.' },

      // â”€â”€â”€ à¤—à¤£ 7: à¤¸à¤ªà¥à¤¤à¤®à¤—à¤£à¤ƒ â€” Samaveda Jaiminiya (11 students) â”€â”€â”€
      { id: 'std_71', name: 'Abhilasha Nambiar', sanskritName: 'à¤…à¤­à¤¿à¤²à¤¾à¤·à¤¨à¤®à¥à¤¬à¤¿à¤¯à¤¾à¤°à¥', dob: '2010-05-18', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Sundaran Nambiar', parentContact: '+91 94489 67890', address: 'Palghat, Kerala - 678001', photo: null, notes: 'Excellent voice. Authentic Jaiminiya renditions.' },
      { id: 'std_72', name: 'Bhaskara Menon', sanskritName: 'à¤­à¤¾à¤¸à¥à¤•à¤°à¤®à¥‡à¤¨à¥‹à¤¨à¥', dob: '2011-02-12', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Suresh Menon', parentContact: '+91 98863 78901', address: 'Thrissur, Kerala - 680001', photo: null, notes: 'Good rhythm control in Samavedic chanting.' },
      { id: 'std_73', name: 'Chitragupta Iyer', sanskritName: 'à¤šà¤¿à¤¤à¥à¤°à¤—à¥à¤ªà¥à¤¤à¤…à¤¯à¥à¤¯à¤°à¥', dob: '2010-08-04', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramachandran Iyer', parentContact: '+91 94481 89012', address: 'Kanchipuram, Tamil Nadu - 631501', photo: null, notes: 'Studies Jaiminiya Brahmana thoroughly.' },
      { id: 'std_74', name: 'Damodar Shastri', sanskritName: 'à¤¦à¤¾à¤®à¥‹à¤¦à¤°à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€', dob: '2009-11-25', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 4)', joiningDate: '2022-06-10', parentName: 'Sundar Shastri', parentContact: '+91 97437 90123', address: 'Tirunelveli, Tamil Nadu - 627001', photo: null, notes: 'Senior. Performing Agni Soma Yajna.' },
      { id: 'std_75', name: 'Eswar Namboothiri', sanskritName: 'à¤ˆà¤¶à¥à¤µà¤°à¤¨à¤®à¥à¤¬à¥‚à¤¦à¤¿à¤°à¥€', dob: '2012-04-08', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 1)', joiningDate: '2025-06-01', parentName: 'Mahadeva Namboothiri', parentContact: '+91 98864 01234', address: 'Kozhikode, Kerala - 673001', photo: null, notes: 'New student from Kerala. Excellent foundation.' },
      { id: 'std_76', name: 'Gajanan Rao', sanskritName: 'à¤—à¤œà¤¾à¤¨à¤¨à¤°à¤¾à¤µà¤ƒ', dob: '2011-06-22', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Vaman Rao', parentContact: '+91 94482 12340', address: 'Kolhapur, Maharashtra - 416001', photo: null, notes: 'Adapts well. Enthusiastic in group chanting.' },
      { id: 'std_77', name: 'Hiranya Kashyap Pathak', sanskritName: 'à¤¹à¤¿à¤°à¤£à¥à¤¯à¤•à¤¶à¥à¤¯à¤ªà¤¤à¤¿à¤ªà¤¾à¤ à¤•à¤ƒ', dob: '2010-10-18', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Kailash Pathak', parentContact: '+91 97438 23456', address: 'Ujjain, MP - 456001', photo: null, notes: 'Excellent in ancient Vedic music scales.' },
      { id: 'std_78', name: 'Ishwarchandra Vidyasagar', sanskritName: 'à¤ˆà¤¶à¥à¤µà¤°à¤šà¤¨à¥à¤¦à¥à¤°à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤¸à¤¾à¤—à¤°à¤ƒ', dob: '2011-01-30', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Subash Vidyasagar', parentContact: '+91 98865 34567', address: 'Murshidabad, WB - 742149', photo: null, notes: 'Dedicated student. Loves comparative Vedic studies.' },
      { id: 'std_79', name: 'Janardhan Misra', sanskritName: 'à¤œà¤¨à¤¾à¤°à¥à¤¦à¤¨à¤®à¤¿à¤¶à¥à¤°à¤ƒ', dob: '2010-03-14', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Shivadatta Misra', parentContact: '+91 94483 45678', address: 'Varanasi, UP - 221001', photo: null, notes: 'Kashi tradition. Good in Jaiminiya Upanishad Brahmana.' },
      { id: 'std_80', name: 'Kalidasa Rajagopalan', sanskritName: 'à¤•à¤¾à¤²à¤¿à¤¦à¤¾à¤¸à¤°à¤¾à¤œà¤—à¥‹à¤ªà¤¾à¤²à¤¨à¥', dob: '2009-07-06', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 4)', joiningDate: '2022-06-10', parentName: 'Suresh Rajagopalan', parentContact: '+91 97439 56789', address: 'Chennai, Tamil Nadu - 600004', photo: null, notes: 'Senior. Assists in teaching junior students.' },
      { id: 'std_81', name: 'Lakshmana Pandit', sanskritName: 'à¤²à¤•à¥à¤·à¥à¤®à¤£à¤ªà¤£à¥à¤¡à¤¿à¤¤à¤ƒ', dob: '2011-09-20', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Raghunath Pandit', parentContact: '+91 98866 67890', address: 'Thanjavur, Tamil Nadu - 613001', photo: null, notes: 'From Thanjavur tradition. Strong in Aranyaka texts.' },

      // â”€â”€â”€ à¤—à¤£ 8: à¤…à¤·à¥à¤Ÿà¤®à¤—à¤£à¤ƒ â€” Dharmashastra (11 students) â”€â”€â”€
      { id: 'std_82', name: 'Manusmriti Pandey', sanskritName: 'à¤®à¤¨à¥à¤¸à¥à¤®à¥ƒà¤¤à¤¿à¤ªà¤¾à¤£à¥à¤¡à¥‡à¤¯à¤ƒ', dob: '2010-06-12', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Raghunandan Pandey', parentContact: '+91 94484 78901', address: 'Ayodhya, UP - 224001', photo: null, notes: 'Specializing in Manusmriti commentary.' },
      { id: 'std_83', name: 'Narayana Swamy', sanskritName: 'à¤¨à¤¾à¤°à¤¾à¤¯à¤£à¤¸à¥à¤µà¤¾à¤®à¥€', dob: '2011-10-28', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Ramachandra Swamy', parentContact: '+91 97440 89012', address: 'Tirupati, AP - 517501', photo: null, notes: 'Strong understanding of Yajnavalkya Smriti.' },
      { id: 'std_84', name: 'Omkarananda Brahmachari', sanskritName: 'à¤“à¤‚à¤•à¤¾à¤°à¤¾à¤¨à¤¨à¥à¤¦à¤¬à¥à¤°à¤¹à¥à¤®à¤šà¤¾à¤°à¥€', dob: '2010-02-20', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Satchidananda Swami', parentContact: '+91 98867 90123', address: 'Rishikesh, Uttarakhand - 249201', photo: null, notes: 'Focused on Dharmashastra jurisprudence.' },
      { id: 'std_85', name: 'Parashurama Bhat', sanskritName: 'à¤ªà¤°à¤¶à¥à¤°à¤¾à¤®à¤­à¤Ÿà¥à¤Ÿà¤ƒ', dob: '2009-12-08', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 4)', joiningDate: '2022-06-10', parentName: 'Narayana Bhat', parentContact: '+91 94485 01234', address: 'Udupi, Karnataka - 576101', photo: null, notes: 'Senior student. Leads dharmic discussions.' },
      { id: 'std_86', name: 'Ramachandra Shastri', sanskritName: 'à¤°à¤¾à¤®à¤šà¤¨à¥à¤¦à¥à¤°à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€', dob: '2012-05-14', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 1)', joiningDate: '2025-06-01', parentName: 'Srinivasa Shastri', parentContact: '+91 97441 12345', address: 'Tirunelveli, Tamil Nadu - 627001', photo: null, notes: 'New student from South tradition.' },
      { id: 'std_87', name: 'Shivaprasad Joshi', sanskritName: 'à¤¶à¤¿à¤µà¤ªà¥à¤°à¤¸à¤¾à¤¦à¤œà¥‹à¤¶à¥€', dob: '2011-08-22', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayan Joshi', parentContact: '+91 98868 23456', address: 'Nashik, Maharashtra - 422001', photo: null, notes: 'Good in understanding Apastamba Grhyasutra.' },
      { id: 'std_88', name: 'Trivikrama Prabhu', sanskritName: 'à¤¤à¥à¤°à¤¿à¤µà¤¿à¤•à¥à¤°à¤®à¤ªà¥à¤°à¤­à¥à¤ƒ', dob: '2010-04-30', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Kesava Prabhu', parentContact: '+91 94486 34567', address: 'Udupi, Karnataka - 576101', photo: null, notes: 'Good in Samskaras procedure study.' },
      { id: 'std_89', name: 'Uddhava Goswami', sanskritName: 'à¤‰à¤¦à¥à¤§à¤µà¤—à¥‹à¤¸à¥à¤µà¤¾à¤®à¥€', dob: '2011-12-16', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Madhava Goswami', parentContact: '+91 97442 45678', address: 'Vrindavan, UP - 281121', photo: null, notes: 'From Vrindavan. Interested in Bhakti-Dharma interface.' },
      { id: 'std_90', name: 'Vyasananda Sharma', sanskritName: 'à¤µà¥à¤¯à¤¾à¤¸à¤¾à¤¨à¤¨à¥à¤¦à¤¶à¤°à¥à¤®à¤¾', dob: '2010-09-08', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Badarinarayan Sharma', parentContact: '+91 98869 56789', address: 'Varanasi, UP - 221001', photo: null, notes: 'Deep in Vishnu Smriti. Studious and disciplined.' },
      { id: 'std_91', name: 'Yogananda Pant', sanskritName: 'à¤¯à¥‹à¤—à¤¾à¤¨à¤¨à¥à¤¦à¤ªà¤¨à¥à¤¤à¤ƒ', dob: '2009-06-24', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 4)', joiningDate: '2022-06-10', parentName: 'Chandrapant', parentContact: '+91 94487 67890', address: 'Almora, Uttarakhand - 263601', photo: null, notes: 'Senior. Helps Acharya in Dharmashastra teaching.' },
      { id: 'std_92', name: 'Zanjana Misra', sanskritName: 'à¤à¤žà¥à¤à¤¨à¤®à¤¿à¤¶à¥à¤°à¤ƒ', dob: '2011-04-10', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Shivaprasad Misra', parentContact: '+91 97443 78901', address: 'Gaya, Bihar - 823001', photo: null, notes: 'Interested in Baudhayana Dharmasutra.' }
    ];

    // â”€â”€ VVG Samayasarini 2026-27 â€” Real Daily Time Slots â”€â”€
    const timeSlots = {
      slot_1: { label: 'à¤ªà¥à¤°à¤¾à¤¤à¤ƒà¤µà¥‡à¤¦à¤¾à¤­à¥à¤¯à¤¾à¤¸à¤ƒ',  labelEn: 'Morning Veda',   time: '06:30 â€“ 07:55' },
      slot_2: { label: 'à¤ªà¥à¤°à¤¥à¤®à¤¸à¤¤à¥à¤°à¤®à¥',        labelEn: 'First Period',   time: '08:30 â€“ 09:25' },
      slot_3: { label: 'à¤¦à¥à¤µà¤¿à¤¤à¥€à¤¯à¤¸à¤¤à¥à¤°à¤®à¥',      labelEn: 'Second Period',  time: '11:00 â€“ 11:55' },
      slot_4: { label: 'à¤¤à¥ƒà¤¤à¥€à¤¯à¤¸à¤¤à¥à¤°à¤®à¥',        labelEn: 'Third Period',   time: '01:30 â€“ 02:25' },
      slot_5: { label: 'à¤šà¤¤à¥à¤°à¥à¤¥à¤¸à¤¤à¥à¤°à¤®à¥',       labelEn: 'Fourth Period',  time: '02:30 â€“ 03:25' },
      slot_6: { label: 'à¤ªà¤žà¥à¤šà¤®à¤¸à¤¤à¥à¤°à¤®à¥',        labelEn: 'Fifth Period',   time: '03:30 â€“ 04:25' },
      slot_7: { label: 'à¤¸à¤¾à¤¯à¤‚à¤¸à¤¤à¥à¤°à¤®à¥',          labelEn: 'Evening Period', time: '06:30 â€“ 07:25' }
    };

    // â”€â”€ Real VVG Daily Timetable (same schedule every day â€” Gurukula model) â”€â”€
    const timetable = {
      // à¤¤à¤ªà¤ƒ â€” Tapa Gana
      gan_1: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤•à¤ªà¤¿à¤²:', engSubject: 'Veda â€“ Kapila Shakha', teacher: 'à¤¸à¤šà¤¿à¤¨:', teacherEn: 'Sachin' },
        slot_2: { subject: 'à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤µà¤¾à¤™à¥à¤®à¤¯à¤®à¥', engSubject: 'Sanskrit Literature', teacher: 'à¤¸à¤žà¥à¤œà¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Sanjayacharya' },
        slot_3: { subject: 'à¤•à¤£à¥à¤ à¤ªà¤¾à¤ à¤ƒ', engSubject: 'Kanthapatha â€“ Memorization', teacher: 'à¤§à¥à¤°à¥à¤µà¤¿à¤¨à¥', teacherEn: 'Dhruvin' },
        slot_4: { subject: 'à¤†à¤™à¥à¤—à¥à¤²à¤®à¥', engSubject: 'English Language', teacher: 'à¤¸à¤šà¤¿à¤¨:', teacherEn: 'Sachin' },
        slot_5: { subject: 'à¤¹à¤¿à¤¤à¥‹à¤ªà¤¦à¥‡à¤¶à¤ƒ / à¤ªà¤žà¥à¤šà¤¤à¤¨à¥à¤¤à¥à¤°à¤®à¥', engSubject: 'Hitopadesha / Panchatantra', teacher: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Shridharacharya' },
        slot_6: { subject: 'à¤¸à¤‚à¤­à¤¾à¤·à¤£à¤®à¥', engSubject: 'Sanskrit Conversation', teacher: 'à¤†à¤¤à¥à¤°à¥‡à¤¯à¤ƒ', teacherEn: 'Atreyah' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // à¤¤à¥‡à¤œà¤ƒ â€” Teja Gana
      gan_2: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤•à¤¶à¥à¤¯à¤ª:', engSubject: 'Veda â€“ Kashyapa Shakha', teacher: 'à¤šà¤¿à¤®à¥à¤¬à¤¯:', teacherEn: 'Chimbaya' },
        slot_2: { subject: 'à¤•à¤£à¥à¤ à¤ªà¤¾à¤ à¤ƒ', engSubject: 'Kanthapatha â€“ Memorization', teacher: 'à¤†à¤¤à¥à¤°à¥‡à¤¯à¤ƒ', teacherEn: 'Atreyah' },
        slot_3: { subject: 'à¤•à¤¾à¤µà¥à¤¯à¤®à¥', engSubject: 'Sanskrit Poetry / Kavya', teacher: 'à¤ªà¥à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Pracharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'à¤µà¥à¤¯à¤¾à¤•à¤°à¤£à¤®à¥', engSubject: 'Sanskrit Grammar', teacher: 'à¤¶à¤¿à¤µà¤¸à¥à¤¬à¥à¤°à¤¹à¥à¤®à¤£à¥à¤¯à¤ƒ', teacherEn: 'Shivasubrahmanya' },
        slot_6: { subject: 'à¤¤à¤°à¥à¤•à¤¸à¤‚à¤—à¥à¤°à¤¹à¤ƒ', engSubject: 'Tarka Sangraha (Logic)', teacher: 'à¤µà¤¿à¤¨à¤¾à¤¯à¤•à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Vinayakacharya' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // à¤“à¤œà¤ƒ â€” Oja Gana
      gan_3: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤…à¤¤à¥à¤°à¤¿:', engSubject: 'Veda â€“ Atri Shakha', teacher: 'à¤µà¤¿à¤¨à¤¾à¤¯à¤•à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Vinayakacharya' },
        slot_2: { subject: 'à¤µà¥à¤¯à¤¾à¤•à¤°à¤£à¤®à¥', engSubject: 'Sanskrit Grammar', teacher: 'à¤—à¥à¤°à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Guruprasadacharya' },
        slot_3: { subject: 'à¤¨à¥à¤¯à¤¾à¤¯à¤¬à¥‹à¤§à¤¿à¤¨à¥€', engSubject: 'Nyaya Bodhini (Logic)', teacher: 'à¤ªà¥à¤¤à¥à¤¥à¤¿à¤°à¤¾à¤œà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Putthirajacharya' },
        slot_4: { subject: 'à¤†à¤™à¥à¤—à¥à¤²à¤®à¥', engSubject: 'English Language', teacher: 'à¤…à¤¨à¥à¤¨à¤ªà¥‚à¤°à¥à¤£à¤®à¤¾', teacherEn: 'Annapurna' },
        slot_5: { subject: 'à¤¸à¤¾à¤¹à¤¿à¤¤à¥à¤¯à¤¸à¥€à¤°à¤­à¤®à¥-à¥§', engSubject: 'Sahitya Serabham Part 1', teacher: 'à¤µà¤¿à¤¨à¤¾à¤¯à¤•à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Vinayakacharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: 'à¤¸à¤¾à¤¹à¤¿à¤¤à¥à¤¯à¤¸à¥€à¤°à¤­à¤®à¥-à¥¨', engSubject: 'Sahitya Serabham Part 2', teacher: 'à¤šà¤¿à¤®à¥à¤¬à¤¯:', teacherEn: 'Chimbaya' }
      },
      // à¤µà¤°à¥à¤šà¤ƒ â€” Varca Gana
      gan_4: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤­à¤°à¤¦à¥à¤µà¤¾à¤œ:', engSubject: 'Veda â€“ Bharadvaja Shakha', teacher: 'à¤—à¥à¤°à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Guruprasadacharya' },
        slot_2: { subject: 'à¤¸à¤¿à¤¦à¥à¤§à¤¾à¤¨à¥à¤¤à¤•à¥Œà¤®à¥à¤¦à¥€-à¥§', engSubject: 'Siddhanta Kaumudi Part 1', teacher: 'à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Arunacharya' },
        slot_3: { subject: 'à¤µà¥‡à¤¦à¤¾à¤¨à¥à¤¤à¤¸à¤¾à¤°à¤ƒ', engSubject: 'Vedanta Sara', teacher: 'à¤…à¤¨à¥‚à¤ª: / à¤¹à¤°à¥à¤·à¤ƒ', teacherEn: 'Anup / Harsh SK' },
        slot_4: { subject: 'à¤†à¤™à¥à¤—à¥à¤²à¤®à¥', engSubject: 'English Language', teacher: 'à¤†à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Acharya' },
        slot_5: { subject: 'à¤•à¥Œà¤®à¥à¤¦à¥€-à¥© / à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾', engSubject: 'Kaumudi 3 / Prakriya', teacher: 'à¤—à¥à¤°à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Guruprasadacharya' },
        slot_6: { subject: 'à¤—à¥€à¤¤à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥', engSubject: 'Gita Bhashyam', teacher: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Shridharacharya' },
        slot_7: { subject: 'à¤¦à¥€à¤ªà¤¿à¤•à¤¾ / à¤®à¥à¤•à¥à¤¤à¤¾à¤µà¤²à¥€', engSubject: 'Deepika / Muktavali', teacher: 'à¤…à¤­à¤¿à¤°à¤¾à¤®à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Abhiramacharya' }
      },
      // à¤¶à¥à¤°à¥‡à¤¯à¤ƒ â€” Shreya Gana
      gan_5: {
        slot_1: { subject: '', engSubject: 'Veda Recitation', teacher: '', teacherEn: '' },
        slot_2: { subject: 'à¤µà¥à¤¯à¤¾à¤¯à¤ªà¥à¤°à¤•à¤¾à¤¶:', engSubject: 'Vyaya Prakasha', teacher: 'à¤…à¤­à¤¿à¤°à¤¾à¤®à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Abhiramacharya' },
        slot_3: { subject: 'à¤—à¥€à¤¤à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤®à¤¹à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤ªà¤°à¤¿à¤­à¤¾à¤·à¥‡à¤¨à¥à¤¦à¥à¤¶à¥‡à¤–à¤°:', engSubject: 'Gita Bhashyam / Mahabhashya / Paribhashendu Shekhara', teacher: 'à¤¸à¤žà¥à¤œà¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤°à¤µà¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Sanjayacharya / Ravyacharya / Arunacharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'à¤¸à¤¿.à¤²à¥‡.à¤¸à¤‚à¤—à¥à¤°à¤¹: / à¤ªà¥à¤°à¥€à¤¢à¤®à¤¨à¥‹à¤°à¤®à¤¾', engSubject: 'Siddhanta Lakshmisangraha / Praudhmanorma', teacher: 'à¤®à¤¹à¤¾à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤°à¤µà¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Mahadevacharya / Ravyacharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // à¤­à¥à¤°à¤¾à¤œà¤ƒ â€” Bhraja Gana
      gan_6: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤œà¤®à¤¦à¤—à¥à¤¨à¤¿: / à¤µà¤¸à¤¿à¤·à¥à¤ à¤ƒ', engSubject: 'Veda â€“ Jamadagni / Vasishtha Shakha', teacher: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤ªà¥ƒà¤¥à¥à¤µà¤¿à¤°à¤¾à¤œ:', teacherEn: 'Shridharacharya / Prithviraj' },
        slot_2: { subject: 'à¤…à¤¦à¥à¤µà¥ˆà¤¤à¤¸à¤¿à¤¦à¥à¤§à¤¿: / à¤¬à¥à¤°à¤¹à¥à¤®à¤¸à¥‚à¤¤à¥à¤°à¤®à¥', engSubject: 'Advaita Siddhi / Brahma Sutram', teacher: 'à¤®à¤¹à¤¾à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤†à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Mahadevacharya / Acharya' },
        slot_3: { subject: 'à¤®à¤¹à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤ªà¤°à¤¿à¤­à¤¾à¤·à¥‡à¤¨à¥à¤¦à¥à¤¶à¥‡à¤–à¤°:', engSubject: 'Mahabhashya / Paribhashendu Shekhara', teacher: 'à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Arunacharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'à¤¬à¥à¤°à¤¹à¥à¤®à¤¸à¥‚à¤¤à¥à¤°à¤®à¥ / à¤‰à¤ªà¤¨à¤¿à¤·à¤¦à¥à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤®à¤¹à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥', engSubject: 'Brahma Sutram / Upanishad Bhashyam / Mahabhashya', teacher: 'à¤®à¤¹à¤¾à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤¸à¤šà¤¿à¤¨: / à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Mahadevacharya / Sachin / Arunacharya' },
        slot_6: { subject: 'à¤ªà¥à¤°à¥€à¤¢à¤®à¤¨à¥‹à¤°à¤®à¤¾', engSubject: 'Praudhmanorma', teacher: 'à¤°à¤µà¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Ravyacharya' },
        slot_7: { subject: 'à¤¸à¤¿.à¤²à¥‡.à¤¸à¤‚à¤—à¥à¤°à¤¹:', engSubject: 'Siddhanta Lakshmisangraha', teacher: 'à¤¶à¥à¤°à¥€à¤§à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Shridharacharya' }
      },
      // à¤ªà¥à¤°à¥‡à¤¯à¤ƒ â€” Preya Gana
      gan_7: {
        slot_1: { subject: 'à¤µà¥‡à¤¦à¤ƒ â€“ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤®à¤¿à¤¤à¥à¤°: & à¤—à¥Œà¤¤à¤®à¤ƒ', engSubject: 'Veda â€“ Vishvamitra & Gautama Shakha', teacher: 'à¤¸à¤žà¥à¤œà¤¯:', teacherEn: 'Sanjay' },
        slot_2: { subject: 'à¤µà¥‡à¤¦à¤¾à¤¨à¥à¤¤à¤ªà¤°à¤¿à¤­à¤¾à¤·à¤¾', engSubject: 'Vedanta Paribhasha', teacher: 'à¤¸à¤šà¤¿à¤¨:', teacherEn: 'Sachin' },
        slot_3: { subject: 'à¤‰à¤ªà¤¨à¤¿à¤·à¤¦à¥à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤•à¥Œà¤®à¥à¤¦à¥€', engSubject: 'Upanishad Bhashyam / Kaumudi', teacher: 'à¤¸à¤žà¥à¤œà¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Sanjayacharya / Arunacharya' },
        slot_4: { subject: 'à¤¨à¥à¤¯à¤¾à¤¯à¤ªà¥à¤°à¤•à¤¾à¤¶à¤ƒ', engSubject: 'Nyaya Prakasha', teacher: 'à¤ªà¥à¤¤à¥à¤¥à¤¿à¤°à¤¾à¤œà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Putthirajacharya' },
        slot_5: { subject: 'à¤¸à¤¿à¤¦à¥à¤§à¤¾à¤¨à¥à¤¤à¤•à¥Œà¤®à¥à¤¦à¥€ (à¤•à¤¾à¤°à¤•à¤®à¥)', engSubject: 'Siddhanta Kaumudi â€“ Karaka', teacher: 'à¤°à¤µà¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Ravyacharya' },
        slot_6: { subject: 'à¤ªà¥à¤°à¥€à¤¢à¤®à¤¨à¥‹à¤°à¤®à¤¾', engSubject: 'Praudhmanorma', teacher: 'à¤…à¤°à¥à¤£à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Arunacharya' },
        slot_7: { subject: 'à¤—à¥€à¤¤à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥ / à¤ªà¤°à¤¿à¤­à¤¾à¤·à¥‡à¤¨à¥à¤¦à¥à¤¶à¥‡à¤–à¤°:', engSubject: 'Gita Bhashyam / Paribhashendu Shekhara', teacher: 'à¤®à¤¹à¤¾à¤¦à¥‡à¤µà¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤—à¥à¤°à¥à¤ªà¥à¤°à¤¸à¤¾à¤¦à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Mahadevacharya / Guruprasadacharya' }
      },
      // à¤¯à¤¶à¤ƒ â€” Yasha Gana
      gan_8: {
        slot_1: { subject: 'à¤¯à¤¾à¤œà¥à¤žà¤µà¤²à¥à¤•à¥à¤¯:', engSubject: 'Yajnavalkya Study', teacher: 'à¤µà¤¿à¤·à¥à¤£à¥:', teacherEn: 'Vishnu' },
        slot_2: { subject: 'à¤ª.à¤².à¤®. / à¤­à¥‚à¤·à¤£à¤¸à¤¾à¤°:', engSubject: 'Parama Laghu Manorama / Bhushana Sara', teacher: 'à¤¶à¤®à¥à¤­à¥-à¤†à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Shambhu Acharya' },
        slot_3: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'à¤¬à¥à¤°à¤¹à¥à¤®à¤¸à¥‚à¤¤à¥à¤°à¤®à¥', engSubject: 'Brahma Sutram', teacher: 'à¤ªà¥à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Pracharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: 'à¤…à¤¦à¥à¤µà¥ˆà¤¤à¤¸à¤¿à¤¦à¥à¤§à¤¿: / à¤®à¤¹à¤¾à¤­à¤¾à¤·à¥à¤¯à¤®à¥', engSubject: 'Advaita Siddhi / Mahabhashya', teacher: 'à¤ªà¥à¤·à¥à¤•à¤°à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ / à¤°à¤µà¥à¤¯à¤¾à¤šà¤¾à¤°à¥à¤¯à¤ƒ', teacherEn: 'Pushkaracharya / Ravyacharya' }
      }
    };

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 5. ATTENDANCE â€” Past 7 days for all 8 Ganas
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const attendanceLog = {};
    const today = new Date();
    for (let i = 7; i > 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      attendanceLog[dateStr] = {};
      
      ganas.forEach(gana => {
        const ganaStudents = students.filter(s => s.ganaId === gana.id);
        attendanceLog[dateStr][gana.id] = {};
        ganaStudents.forEach(s => {
          const rand = Math.random();
          attendanceLog[dateStr][gana.id][s.id] = rand > 0.08 ? 'Present' : 'Absent';
        });
      });
    }

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 6. DOCUMENTS INVENTORY
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const documents = [
      { id: 'doc_1', name: 'Rama_Bhatta_Admission_Record.pdf', category: 'Student Records', uploadedBy: 'Office Staff', uploadedAt: '2023-06-05', size: '1.2 MB', isSimulated: true },
      { id: 'doc_2', name: 'Sanskrit_University_Enrollment_Circular_2026.pdf', category: 'University Documents', uploadedBy: 'Admin', uploadedAt: '2026-04-10', size: '3.4 MB', isSimulated: true },
      { id: 'doc_3', name: 'Harihara_Shastri_Medical_Leave_Letter.pdf', category: 'Leave Letters', uploadedBy: 'Acharya Madhava Joshi', uploadedAt: '2026-05-24', size: '420 KB', isSimulated: true },
      { id: 'doc_4', name: 'Rigveda_Annual_Exam_Syllabus_2026.pdf', category: 'Exam Documents', uploadedBy: 'Acharya Keshav Bhatta', uploadedAt: '2026-03-01', size: '2.1 MB', isSimulated: true },
      { id: 'doc_5', name: 'VVG_2026_Annual_Report.pdf', category: 'University Documents', uploadedBy: 'Admin', uploadedAt: '2026-05-01', size: '5.8 MB', isSimulated: true },
      { id: 'doc_6', name: 'Samaveda_Gana_Exam_Schedule.pdf', category: 'Exam Documents', uploadedBy: 'Acharya Vasudevan', uploadedAt: '2026-04-20', size: '1.4 MB', isSimulated: true },
      { id: 'doc_7', name: 'Krishna_Murthy_Progress_Certificate.pdf', category: 'Certificates', uploadedBy: 'Admin', uploadedAt: '2026-05-15', size: '890 KB', isSimulated: true },
      { id: 'doc_8', name: 'University_Affiliation_Letter_2026.pdf', category: 'University Documents', uploadedBy: 'Admin', uploadedAt: '2026-02-28', size: '2.9 MB', isSimulated: true }
    ];

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 7. ANNOUNCEMENTS MODULE
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const announcements = [
      {
        id: 'ann_1',
        title: 'Annual Vedic Recitation Examination â€” 2026',
        titleSa: 'à¤µà¤¾à¤°à¥à¤·à¤¿à¤•-à¤µà¥‡à¤¦à¤ªà¤¾à¤ à¤ªà¤°à¥€à¤•à¥à¤·à¤¾ â€” à¥¨à¥¦à¥¨à¥¬',
        body: 'The Annual Vedic Recitation Examination for all Ganas (à¤ªà¥à¤°à¤¥à¤®à¤—à¤£à¤ƒ to à¤…à¤·à¥à¤Ÿà¤®à¤—à¤£à¤ƒ) will be conducted from 15th Jyeshtha to 20th Jyeshtha (June 1â€“6, 2026). All Acharyas are requested to prepare their respective Gana students accordingly. The examination will cover Samhita Patha, Padapatha, and Kramapatha recitation for all enrolled levels.',
        category: 'academic',
        categorySa: 'à¤¶à¥ˆà¤•à¥à¤·à¤£à¤¿à¤•à¤®à¥',
        audience: 'all',
        audienceSa: 'à¤¸à¤°à¥à¤µà¥‡à¤­à¥à¤¯à¤ƒ',
        priority: 'high',
        isPinned: true,
        createdBy: 'Admin',
        createdAt: '2026-05-28T09:00:00Z',
        readBy: []
      },
      {
        id: 'ann_2',
        title: 'Guru Purnima Celebration â€” Preparations Required',
        titleSa: 'à¤—à¥à¤°à¥à¤ªà¥‚à¤°à¥à¤£à¤¿à¤®à¤¾-à¤‰à¤¤à¥à¤¸à¤µ â€” à¤ªà¥‚à¤°à¥à¤µà¤¸à¤¿à¤¦à¥à¤§à¤¤à¤¾',
        body: 'Guru Purnima (Ashadha Shukla Chaturdashi) falls on July 10, 2026. All Gana students are required to participate in the grand Guru Vandana ceremony. Preparations for the Guru Pada Puja, Veda Parayana, and special Homa are to begin from July 5th. Students from all Ganas will perform group chanting of the Vedic hymns dedicated to the Guru Parampara.',
        category: 'festival',
        categorySa: 'à¤‰à¤¤à¥à¤¸à¤µà¤ƒ',
        audience: 'all',
        audienceSa: 'à¤¸à¤°à¥à¤µà¥‡à¤­à¥à¤¯à¤ƒ',
        priority: 'high',
        isPinned: true,
        createdBy: 'Admin',
        createdAt: '2026-05-26T10:30:00Z',
        readBy: []
      },
      {
        id: 'ann_3',
        title: 'New Sanskrit University Registration Circular',
        titleSa: 'à¤¨à¤µ-à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤µà¤¿à¤¶à¥à¤µà¤µà¤¿à¤¦à¥à¤¯à¤¾à¤²à¤¯-à¤ªà¤žà¥à¤œà¥€à¤•à¤°à¤£-à¤¸à¥‚à¤šà¤¨à¤¾',
        body: 'The registration portal for the Rashtriya Sanskrit Vidyapeetha Examination 2026â€“27 is now open. All eligible students from Year 3 and Year 4 of each Gana must complete their registration by June 30, 2026. Required documents: Birth Certificate, Admission Record, Previous Year Marksheet. Please submit documents to the office by June 15th.',
        category: 'administrative',
        categorySa: 'à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤¨à¤¿à¤•à¤®à¥',
        audience: 'office',
        audienceSa: 'à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯à¤¾à¤¯',
        priority: 'medium',
        isPinned: false,
        createdBy: 'Office Staff',
        createdAt: '2026-05-25T11:00:00Z',
        readBy: []
      },
      {
        id: 'ann_4',
        title: 'Timetable Update â€” June Schedule',
        titleSa: 'à¤¸à¤®à¤¯à¤¸à¤¾à¤°à¤¿à¤£à¥€-à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨à¤®à¥ â€” à¤œà¥‚à¤¨-à¤®à¤¾à¤¸',
        body: 'Effective from June 1, 2026, the afternoon session (Slot 4: 3:00â€“4:30 PM) for à¤ªà¥à¤°à¤¥à¤®à¤—à¤£à¤ƒ and à¤¤à¥ƒà¤¤à¥€à¤¯à¤—à¤£à¤ƒ will be shifted to 3:30â€“5:00 PM to accommodate additional Vedic Mathematics practice. All concerned Acharyas have been notified. The morning sessions remain unchanged.',
        category: 'academic',
        categorySa: 'à¤¶à¥ˆà¤•à¥à¤·à¤£à¤¿à¤•à¤®à¥',
        audience: 'acharyas',
        audienceSa: 'à¤†à¤šà¤¾à¤°à¥à¤¯à¥‡à¤­à¥à¤¯à¤ƒ',
        priority: 'medium',
        isPinned: false,
        createdBy: 'Admin',
        createdAt: '2026-05-22T08:00:00Z',
        readBy: []
      },
      {
        id: 'ann_5',
        title: 'Urgent: Water Supply Interruption â€” May 31',
        titleSa: 'à¤†à¤µà¤¶à¥à¤¯à¤•à¤®à¥: à¤œà¤²-à¤ªà¥‚à¤°à¥à¤¤à¤¿-à¤µà¤¿à¤šà¥à¤›à¥‡à¤¦ â€” à¤®à¤ˆ à¥©à¥§',
        body: 'Due to maintenance work at the Channenahalli municipal connection, water supply to the Gurukula campus will be interrupted on May 31, 2026 from 9:00 AM to 5:00 PM. All hostels have been instructed to fill water storage tanks in advance. Drinking water arrangements will be made from 6 AM itself. Students are requested to cooperate.',
        category: 'urgent',
        categorySa: 'à¤†à¤µà¤¶à¥à¤¯à¤•à¤®à¥',
        audience: 'all',
        audienceSa: 'à¤¸à¤°à¥à¤µà¥‡à¤­à¥à¤¯à¤ƒ',
        priority: 'urgent',
        isPinned: true,
        createdBy: 'Office Staff',
        createdAt: '2026-05-29T16:00:00Z',
        readBy: []
      },
      {
        id: 'ann_6',
        title: 'Monthly Parent-Acharya Meeting â€” June 7',
        titleSa: 'à¤®à¤¾à¤¸à¤¿à¤•-à¤ªà¤¾à¤²à¤•-à¤†à¤šà¤¾à¤°à¥à¤¯-à¤¸à¤­à¤¾ â€” à¤œà¥‚à¤¨ à¥­',
        body: 'The monthly Parent-Acharya interaction meeting is scheduled for Sunday, June 7, 2026 at 10:00 AM in the Mandala Hall. Parents of all students are cordially invited. Acharyas will share individual student progress reports. Refreshments will be provided. Please confirm attendance with the office by June 3.',
        category: 'administrative',
        categorySa: 'à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤¨à¤¿à¤•à¤®à¥',
        audience: 'all',
        audienceSa: 'à¤¸à¤°à¥à¤µà¥‡à¤­à¥à¤¯à¤ƒ',
        priority: 'low',
        isPinned: false,
        createdBy: 'Office Staff',
        createdAt: '2026-05-20T09:00:00Z',
        readBy: []
      }
    ];

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 8. RECENT ACTIVITY FEED
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const activities = [
      { id: 'act_1', text: 'Acharya Keshav Bhatta marked à¤ªà¥à¤°à¤¥à¤®à¤—à¤£à¤ƒ attendance â€” 11/12 Present', type: 'tulsi', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'act_2', text: 'New student Ganesha Hegde registered in à¤ªà¥à¤°à¤¥à¤®à¤—à¤£à¤ƒ', type: 'saffron', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { id: 'act_3', text: 'Announcement posted: Guru Purnima Celebrations', type: 'blue', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { id: 'act_4', text: 'University Enrollment Circular 2026 uploaded', type: 'blue', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'act_5', text: 'Acharya Vasudevan updated à¤¤à¥ƒà¤¤à¥€à¤¯à¤—à¤£à¤ƒ Saturday timetable', type: 'saffron', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
      { id: 'act_6', text: 'à¤·à¤·à¥à¤ à¤—à¤£à¤ƒ attendance submitted â€” All students Present', type: 'tulsi', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { id: 'act_7', text: 'Student Vasudeva Somayaji progress report generated', type: 'saffron', timestamp: new Date(Date.now() - 60 * 60 * 1000 * 3).toISOString() }
    ];

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // 9. GOOGLE SHEETS SYNC CONFIG
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const sheetsConfig = {
      enabled: false,
      spreadsheetId: '',
      lastSynced: null,
      syncedModules: []
    };

    return {
      students,
      ganas,
      acharyas,
      timetable,
      timeSlots,
      attendanceLog,
      documents,
      announcements,
      activities,
      sheetsConfig
    };
  },

  // â”€â”€â”€ CRUD: Students â”€â”€â”€
  getAllStudents() { return this.get().students; },
  getStudentById(id) { return this.get().students.find(s => s.id === id); },
  addStudent(student) {
    const data = this.get();
    const newStudent = { id: 'std_' + Date.now(), photo: null, notes: '', ...student };
    data.students.push(newStudent);
    this.save(data);
    this.addActivity(`Registered new student: ${student.name} (${student.sanskritName})`, 'saffron');
    return newStudent;
  },
  updateStudent(id, updatedFields) {
    const data = this.get();
    const idx = data.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.students[idx] = { ...data.students[idx], ...updatedFields };
      this.save(data);
      this.addActivity(`Updated student record: ${data.students[idx].name}`, 'saffron');
      return data.students[idx];
    }
    return null;
  },
  deleteStudent(id) {
    const data = this.get();
    const student = data.students.find(s => s.id === id);
    if (student) {
      data.students = data.students.filter(s => s.id !== id);
      this.save(data);
      this.addActivity(`Removed student: ${student.name}`, 'saffron');
      return true;
    }
    return false;
  },

  // â”€â”€â”€ CRUD: Ganas â”€â”€â”€
  getAllGanas() { return this.get().ganas; },
  getGanaById(id) { return this.get().ganas.find(g => g.id === id); },
  updateGana(id, updatedFields) {
    const data = this.get();
    const idx = data.ganas.findIndex(g => g.id === id);
    if (idx !== -1) {
      data.ganas[idx] = { ...data.ganas[idx], ...updatedFields };
      this.save(data);
      return data.ganas[idx];
    }
    return null;
  },

  // â”€â”€â”€ CRUD: Acharyas â”€â”€â”€
  getAllAcharyas() { return this.get().acharyas; },
  getAcharyaById(id) { return this.get().acharyas.find(a => a.id === id); },
  addAcharya(acharya) {
    const data = this.get();
    if (!data.acharyas) data.acharyas = [];
    const newA = {
      id: 'ach_' + Date.now(),
      photo: null,
      contact: '',
      email: '',
      bio: '',
      yearsExperience: '',
      ...acharya
    };
    data.acharyas.push(newA);
    this.save(data);
    this.addActivity(`New Acharya registered: ${acharya.name}`, 'saffron');
    return newA;
  },
  updateAcharya(id, updatedFields) {
    const data = this.get();
    const idx = data.acharyas.findIndex(a => a.id === id);
    if (idx !== -1) {
      data.acharyas[idx] = { ...data.acharyas[idx], ...updatedFields };
      this.save(data);
      this.addActivity(`Updated Acharya profile: ${data.acharyas[idx].name}`, 'saffron');
      return data.acharyas[idx];
    }
    return null;
  },
  deleteAcharya(id) {
    const data = this.get();
    const a = data.acharyas.find(a => a.id === id);
    if (a) {
      data.acharyas = data.acharyas.filter(a => a.id !== id);
      this.save(data);
      this.addActivity(`Removed Acharya: ${a.name}`, 'saffron');
      return true;
    }
    return false;
  },

  // â”€â”€â”€ Attendance â”€â”€â”€
  getClassLog(ganaId, dateStr, slotId) {\n    return this.data.attendanceLog?.[ganaId]?.[dateStr]?.[slotId] || null;\n  },\n\n  saveClassLog(ganaId, dateStr, slotId, logData) {\n    if (!this.data.attendanceLog[ganaId]) this.data.attendanceLog[ganaId] = {};\n    if (!this.data.attendanceLog[ganaId][dateStr]) this.data.attendanceLog[ganaId][dateStr] = {};\n    this.data.attendanceLog[ganaId][dateStr][slotId] = logData;\n    this.save(this.data);\n  },\n\n
  getClassLog(ganaId, dateStr, slotId) {
    const data = this.get();
    return data.attendanceLog?.[ganaId]?.[dateStr]?.[slotId] || null;
  },

  saveClassLog(ganaId, dateStr, slotId, logData) {
    const data = this.get();
    if (!data.attendanceLog) data.attendanceLog = {};
    if (!data.attendanceLog[ganaId]) data.attendanceLog[ganaId] = {};
    if (!data.attendanceLog[ganaId][dateStr]) data.attendanceLog[ganaId][dateStr] = {};
    data.attendanceLog[ganaId][dateStr][slotId] = logData;
    this.save(data);
  },

  getAttendance(ganaId, dateStr) {
    const data = this.get();
    return (data.attendanceLog[dateStr] && data.attendanceLog[dateStr][ganaId]) || null;
  },
  saveAttendance(ganaId, dateStr, studentStatuses) {
    const data = this.get();
    if (!data.attendanceLog[dateStr]) data.attendanceLog[dateStr] = {};
    data.attendanceLog[dateStr][ganaId] = studentStatuses;
    data.students.forEach(student => {
      if (student.ganaId === ganaId && studentStatuses[student.id]) {
        if (!student.attendanceHistory) student.attendanceHistory = {};
        student.attendanceHistory[dateStr] = studentStatuses[student.id];
      }
    });
    this.save(data);
    const gana = data.ganas.find(g => g.id === ganaId);
    this.addActivity(`Attendance updated for ${gana ? gana.name : ganaId} on ${dateStr}`, 'tulsi');
    return true;
  },
  getAttendanceStats(ganaId, days = 7) {
    const data = this.get();
    const ganaStudents = data.students.filter(s => s.ganaId === ganaId);
    const stats = [];
    for (let i = days; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = (data.attendanceLog[dateStr] || {})[ganaId] || {};
      let present = 0, total = ganaStudents.length;
      ganaStudents.forEach(s => { if (log[s.id] === 'Present') present++; });
      stats.push({ date: dateStr, present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 });
    }
    return stats;
  },

  // â”€â”€â”€ Timetable â”€â”€â”€
  getTimetable(ganaId) { return this.get().timetable[ganaId] || null; },
  getTimeSlots() { return this.get().timeSlots || {}; },

  // Returns full daily schedule: [{slotId, slotInfo, ganaSlots: [{gana, slot}]}]
  getDailyTimetable() {
    const data = this.get();
    const SLOTS = ['slot_1','slot_2','slot_3','slot_4','slot_5','slot_6','slot_7'];
    return SLOTS.map(slotId => ({
      slotId,
      slotInfo: data.timeSlots[slotId] || { label: slotId, labelEn: slotId, time: '' },
      ganaSlots: data.ganas.map(gana => ({
        gana,
        slot: (data.timetable[gana.id] || {})[slotId] || null
      }))
    }));
  },

  // Returns which slot is currently active based on current time
  getCurrentSlot() {
    const data = this.get();
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const mins = h * 60 + m;
    const ranges = [
      { id: 'slot_1', start: 6*60+30,  end: 7*60+55  },
      { id: 'slot_2', start: 8*60+30,  end: 9*60+25  },
      { id: 'slot_3', start: 11*60,    end: 11*60+55 },
      { id: 'slot_4', start: 13*60+30, end: 14*60+25 },
      { id: 'slot_5', start: 14*60+30, end: 15*60+25 },
      { id: 'slot_6', start: 15*60+30, end: 16*60+25 },
      { id: 'slot_7', start: 18*60+30, end: 19*60+25 }
    ];
    return ranges.find(r => mins >= r.start && mins <= r.end) || null;
  },

  saveTimetableSlot(ganaId, slotId, details) {
    const data = this.get();
    if (!data.timetable[ganaId]) data.timetable[ganaId] = {};
    data.timetable[ganaId][slotId] = { ...data.timetable[ganaId][slotId], ...details };
    this.save(data);
    const gana = data.ganas.find(g => g.id === ganaId);
    this.addActivity(`Updated ${slotId} timetable for ${gana ? gana.name : ganaId}`, 'blue');
    return true;
  },

  // â”€â”€â”€ Documents â”€â”€â”€
  getAllDocuments() { return this.get().documents; },
  addDocument(doc) {
    const data = this.get();
    const newDoc = { id: 'doc_' + Date.now(), uploadedAt: new Date().toISOString().split('T')[0], isSimulated: false, ...doc };
    data.documents.push(newDoc);
    this.save(data);
    this.addActivity(`Document uploaded: ${doc.name}`, 'blue');
    return newDoc;
  },
  deleteDocument(id) {
    const data = this.get();
    const doc = data.documents.find(d => d.id === id);
    if (doc) {
      data.documents = data.documents.filter(d => d.id !== id);
      this.save(data);
      this.addActivity(`Document deleted: ${doc.name}`, 'blue');
      return true;
    }
    return false;
  },

  // â”€â”€â”€ Announcements â”€â”€â”€
  getAllAnnouncements() { return this.get().announcements || []; },
  getAnnouncementById(id) { return this.getAllAnnouncements().find(a => a.id === id); },
  addAnnouncement(ann) {
    const data = this.get();
    if (!data.announcements) data.announcements = [];
    const newAnn = { id: 'ann_' + Date.now(), createdAt: new Date().toISOString(), readBy: [], ...ann };
    data.announcements.unshift(newAnn);
    this.save(data);
    this.addActivity(`New announcement: ${ann.title}`, 'blue');
    return newAnn;
  },
  deleteAnnouncement(id) {
    const data = this.get();
    const ann = data.announcements.find(a => a.id === id);
    if (ann) {
      data.announcements = data.announcements.filter(a => a.id !== id);
      this.save(data);
      return true;
    }
    return false;
  },
  markAnnouncementRead(id, userId) {
    const data = this.get();
    const idx = data.announcements.findIndex(a => a.id === id);
    if (idx !== -1 && !data.announcements[idx].readBy.includes(userId)) {
      data.announcements[idx].readBy.push(userId);
      this.save(data);
    }
  },

  // â”€â”€â”€ Activities Feed â”€â”€â”€
  getRecentActivities() { return (this.get().activities || []).slice(0, 10); },
  addActivity(text, type = 'sandalwood') {
    const data = this.get();
    if (!data.activities) data.activities = [];
    data.activities.unshift({ id: 'act_' + Date.now(), text, type, timestamp: new Date().toISOString() });
    if (data.activities.length > 25) data.activities.pop();
    this.save(data);
  },

  // â”€â”€â”€ Sheets Sync â”€â”€â”€
  getSheetsConfig() { return this.get().sheetsConfig || {}; },
  updateSheetsConfig(config) {
    const data = this.get();
    data.sheetsConfig = { ...data.sheetsConfig, ...config };
    this.save(data);
  },
  generateCSVExport(type) {
    const data = this.get();
    let rows = [], headers = [];
    if (type === 'students') {
      headers = ['ID', 'Name', 'Sanskrit Name', 'Gana', 'Veda Branch', 'Class Year', 'DOB', 'Joining Date', 'Parent Name', 'Contact', 'Hostel Room', 'Address'];
      rows = data.students.map(s => {
        const gana = data.ganas.find(g => g.id === s.ganaId);
        return [s.id, s.name, s.sanskritName, gana ? gana.englishName : '', s.vedaBranch, s.classYear, s.dob, s.joiningDate, s.parentName, s.parentContact, s.hostelRoom, `"${s.address}"`];
      });
    } else if (type === 'attendance') {
      const today = new Date().toISOString().split('T')[0];
      headers = ['Student ID', 'Name', 'Gana', 'Date', 'Status'];
      Object.entries(data.attendanceLog).forEach(([date, ganaLogs]) => {
        Object.entries(ganaLogs).forEach(([ganaId, studentLogs]) => {
          const gana = data.ganas.find(g => g.id === ganaId);
          Object.entries(studentLogs).forEach(([stdId, status]) => {
            const std = data.students.find(s => s.id === stdId);
            if (std) rows.push([std.id, std.name, gana ? gana.englishName : '', date, status]);
          });
        });
      });
    }
    const csvLines = [headers.join(','), ...rows.map(r => r.join(','))];
    return csvLines.join('\n');
  }
};


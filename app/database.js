/* 
  Veda Vijnana Gurukulam Management System
  Database Module v3.0 â€” Server-Backed Persistence
  Real Logins | Shared Data | 90+ Students | 8 Ganas | Full Timetable
*/

const DB_KEY     = 'vvg_database';
const DB_VERSION = '3.4.0'; // Slot-based attendance and Veda/Shastra split

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
    const result = {
      students: [], acharyas: [], ganas: [], timetable: {}, timeSlots: {}, 
      attendanceLog: {}, documents: [], announcements: [], activities: [], 
      sheetsConfig: null, ...parsed
    };
    if (Array.isArray(result.attendanceLog) || !result.attendanceLog) result.attendanceLog = {};
    if (Array.isArray(result.timetable) || !result.timetable) result.timetable = {};
    if (Array.isArray(result.timeSlots) || !result.timeSlots) result.timeSlots = {};
    return result;
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

  async syncFromServer() {
    try {
      const res = await fetch('/api/db');
      let serverData = null;
      if (res.status !== 204 && res.ok) {
        serverData = await res.json();
      }
      
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const users = await usersRes.json();
        if (!serverData) serverData = this.get();
        serverData.users = users;
      }
      
      if (serverData && typeof serverData === 'object') {
        const localRaw = localStorage.getItem(DB_KEY);
        const serverRaw = JSON.stringify(serverData);
        if (localRaw !== serverRaw) {
          localStorage.setItem(DB_KEY, serverRaw);
          localStorage.setItem(DB_KEY + '_version', DB_VERSION);
          console.log('[VVG] Database and Users synced from server (Data updated).');
          return true;
        }
      }
    } catch (e) {
      console.warn('[VVG] Server offline — using local data.');
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
    const students = [];

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

  getAttendance(ganaId, dateStr, slotId = null) {
    const data = this.get();
    const dayLog = (data.attendanceLog[dateStr] && data.attendanceLog[dateStr][ganaId]) || null;
    if (!dayLog) return null;
    if (slotId) {
      if (dayLog[slotId]) return dayLog[slotId];
      // Backward compatibility: if it doesn't contain slotId but has student IDs directly
      // (meaning it's the old/seeded format), we return the dayLog itself so log[s.id] works.
      const hasSlotKeys = Object.keys(dayLog).some(k => k.startsWith('slot_'));
      if (!hasSlotKeys) return dayLog;
      return null;
    }
    return dayLog;
  },
  
  saveAttendance(ganaId, dateStr, slotId, studentStatuses) {
    const data = this.get();
    if (!data.attendanceLog[dateStr]) data.attendanceLog[dateStr] = {};
    if (!data.attendanceLog[dateStr][ganaId]) data.attendanceLog[dateStr][ganaId] = {};
    data.attendanceLog[dateStr][ganaId][slotId] = studentStatuses;
    
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
      const dayLog = (data.attendanceLog[dateStr] || {})[ganaId] || {};
      let present = 0, total = ganaStudents.length;
      ganaStudents.forEach(s => { 
        let wasPresent = false;
        if (dayLog[s.id] === 'Present') {
          wasPresent = true;
        } else {
          Object.values(dayLog).forEach(slotLog => {
            if (slotLog && typeof slotLog === 'object' && slotLog[s.id] === 'Present') {
              wasPresent = true;
            }
          });
        }
        if (wasPresent) present++;
      });
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
      headers = ['Student ID', 'Name', 'Gana', 'Date', 'Slot ID', 'Slot Name', 'Status'];
      Object.entries(data.attendanceLog).forEach(([date, ganaLogs]) => {
        // Skip keys that are not date strings (e.g. gana IDs if stored at top-level)
        if (date.startsWith('gan_')) return;
        Object.entries(ganaLogs).forEach(([ganaId, slotLogs]) => {
          const gana = data.ganas.find(g => g.id === ganaId);
          // Check if slotLogs is in slot format (nested keys like 'slot_1')
          const hasSlotKeys = Object.keys(slotLogs).some(k => k.startsWith('slot_'));
          if (hasSlotKeys) {
            Object.entries(slotLogs).forEach(([slotId, studentStatuses]) => {
              if (studentStatuses && typeof studentStatuses === 'object') {
                const slotInfo = data.timeSlots?.[slotId] || {};
                const slotName = slotInfo.labelEn || slotInfo.label || slotId;
                Object.entries(studentStatuses).forEach(([stdId, status]) => {
                  const std = data.students.find(s => s.id === stdId);
                  if (std) rows.push([std.id, std.name, gana ? gana.englishName : '', date, slotId, slotName, status]);
                });
              }
            });
          } else {
            // Backward compatibility for old/seeded format
            Object.entries(slotLogs).forEach(([stdId, status]) => {
              const std = data.students.find(s => s.id === stdId);
              if (std) rows.push([std.id, std.name, gana ? gana.englishName : '', date, 'daily', 'Daily Attendance', status]);
            });
          }
        });
      });
    }
    const csvLines = [headers.join(','), ...rows.map(r => r.join(','))];
    return csvLines.join('\n');
  }
};


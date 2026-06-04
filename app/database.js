/* 
  Veda Vijnana Gurukulam Management System
  Database Module v3.0 — Server-Backed Persistence
  Real Logins | Shared Data | 90+ Students | 8 Ganas | Full Timetable
*/

const DB_KEY     = 'vvg_database';
const DB_VERSION = '3.5.0'; // Unified attendanceLog[date][gana][slot] canonical structure

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

  // ─── Server Sync (fire-and-forget) ───────────────────────────────────
  _pushToServer(data) {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => { /* offline — data is safe in localStorage */ });
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

  // ─── Real Authentication via Server API ──────────────────────────────
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

    // ═══════════════════════════════════════════
    // 1. ACHARYAS — 8 Scholarly Teachers
    // ═══════════════════════════════════════════
    const acharyas = [
      {
        id: 'ach_1',
        name: 'Sanjaya Acharya',
        sanskritName: 'सञ्जयाचार्यः',
        specialization: 'Rigveda Samhita — Shakala Shakha',
        assignedGana: 'तपः', assignedGanaId: 'gan_1',
        yearsExperience: '', contact: '', email: 'sanjaya@vvgurukulam.org',
        bio: 'Senior Acharya at Veda Vijnana Gurukulam.', photo: null
      },
      {
        id: 'ach_2',
        name: 'Vinayaka Acharya',
        sanskritName: 'विनायकाचार्यः',
        specialization: 'Rigveda — Svarashastra & Pratishakhya',
        assignedGana: 'तेजः', assignedGanaId: 'gan_2',
        yearsExperience: '', contact: '', email: 'vinayaka@vvgurukulam.org',
        bio: 'Expert in Vedic Svaras and intonation at VVG.', photo: null
      },
      {
        id: 'ach_3',
        name: 'Guruprasada Acharya',
        sanskritName: 'गुरुप्रसादाचार्यः',
        specialization: 'Rigveda — Pada Patha & Anukramani',
        assignedGana: 'ओजः', assignedGanaId: 'gan_3',
        yearsExperience: '', contact: '', email: 'guruprasada@vvgurukulam.org',
        bio: 'Teaches Pada Patha and Vedic tradition at VVG.', photo: null
      },
      {
        id: 'ach_4',
        name: 'Aruna Acharya',
        sanskritName: 'अरुणाचार्यः',
        specialization: 'Rigveda — Krama Patha & Vedic Prosody',
        assignedGana: 'वर्चः', assignedGanaId: 'gan_4',
        yearsExperience: '', contact: '', email: 'aruna@vvgurukulam.org',
        bio: 'Specializes in advanced recitation modes.', photo: null
      },
      {
        id: 'ach_5',
        name: 'Shridhara Acharya',
        sanskritName: 'श्रीधराचार्यः',
        specialization: 'Sanskrit Vyakarana — Panini Ashtadhyayi',
        assignedGana: 'श्रेयः', assignedGanaId: 'gan_5',
        yearsExperience: '', contact: '', email: 'shridhara@vvgurukulam.org',
        bio: 'Teaches Paninian grammar to all Ganas.', photo: null
      },
      {
        id: 'ach_6',
        name: 'Mahadeva Acharya',
        sanskritName: 'महादेवाचार्यः',
        specialization: 'Vedanta & Upanishad Patha',
        assignedGana: 'भ्राजः', assignedGanaId: 'gan_6',
        yearsExperience: '', contact: '', email: 'mahadeva@vvgurukulam.org',
        bio: 'Guides students in Vedantic philosophy.', photo: null
      },
      {
        id: 'ach_7',
        name: 'Narayana Acharya',
        sanskritName: 'नारायणाचार्यः',
        specialization: 'Kalpa Sutras — Shrauta & Grihya',
        assignedGana: 'प्रेयः', assignedGanaId: 'gan_7',
        yearsExperience: '', contact: '', email: 'narayana@vvgurukulam.org',
        bio: 'Expert in ritual texts and Yajna tradition.', photo: null
      },
      {
        id: 'ach_8',
        name: 'Ramachandra Acharya',
        sanskritName: 'रामचन्द्राचार्यः',
        specialization: 'Rigveda — Jata & Ghana Patha',
        assignedGana: 'यशः', assignedGanaId: 'gan_8',
        yearsExperience: '', contact: '', email: 'ramachandra@vvgurukulam.org',
        bio: 'Teaches the advanced recitation modes of Rigveda.', photo: null
      },
      {
        id: 'ach_9',
        name: 'Vasudeva Acharya',
        sanskritName: 'वासुदेवाचार्यः',
        specialization: 'Jyotisha & Vedanga',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'vasudeva@vvgurukulam.org',
        bio: 'Teaches Vedic astrology and the six Vedangas.', photo: null
      },
      {
        id: 'ach_10',
        name: 'Krishnamurthy Acharya',
        sanskritName: 'कृष्णमूर्त्याचार्यः',
        specialization: 'Mimamsa & Dharmashastra',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'krishnamurthy@vvgurukulam.org',
        bio: 'Expert in ritual philosophy and Dharmic texts.', photo: null
      },
      {
        id: 'ach_11',
        name: 'Subrahmanya Acharya',
        sanskritName: 'सुब्रह्मण्याचार्यः',
        specialization: 'Yoga & Sandhyavandana Vidhi',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'subrahmanya@vvgurukulam.org',
        bio: 'Leads daily Sandhyavandana and Yoga sessions.', photo: null
      },
      {
        id: 'ach_12',
        name: 'Lakshminarayana Acharya',
        sanskritName: 'लक्ष्मीनारायणाचार्यः',
        specialization: 'Stotras & Sanskrit Literature',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'lakshminarayana@vvgurukulam.org',
        bio: 'Teaches Sanskrit compositions and Stotra pathana.', photo: null
      },
      {
        id: 'ach_13',
        name: 'Shankara Acharya',
        sanskritName: 'शङ्कराचार्यः',
        specialization: 'Brahmacharya Ashrama & Student Conduct',
        assignedGana: '', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'shankara@vvgurukulam.org',
        bio: 'Oversees student discipline and Brahmacharya norms.', photo: null
      },
      {
        id: 'ach_14',
        name: 'Pradhana Acharyah',
        sanskritName: 'प्रधानाचार्यः',
        specialization: 'Gurukula Administration & Vedic Education',
        assignedGana: 'सर्वगणाः', assignedGanaId: null,
        yearsExperience: '', contact: '', email: 'admin@vvgurukulam.org',
        bio: 'Principal of Veda Vijnana Gurukulam. Oversees all academic and spiritual activities.', photo: null
      }
    ];


    // ═══════════════════════════════════════════
    // 2. GANAS — 8 Traditional Student Divisions
    // ═══════════════════════════════════════════
    const ganas = [
      { id: 'gan_1', name: 'तपः',    englishName: 'Tapa Gana',    assignedAcharyaId: 'ach_1', room: 'Veda Pathasala 1', vedaBranch: 'Rigveda – Kapila (कपिल)',            color: '#C54E22', sections: [] },
      { id: 'gan_2', name: 'तेजः',   englishName: 'Teja Gana',   assignedAcharyaId: 'ach_2', room: 'Veda Pathasala 2', vedaBranch: 'Rigveda – Kashyapa (कश्यप)',         color: '#235689', sections: [] },
      { id: 'gan_3', name: 'ओजः',    englishName: 'Oja Gana',    assignedAcharyaId: 'ach_3', room: 'Veda Pathasala 3', vedaBranch: 'Rigveda – Atri (अत्रि)',              color: '#2C6646', sections: [] },
      { id: 'gan_4', name: 'वर्चः',  englishName: 'Varca Gana',  assignedAcharyaId: 'ach_4', room: 'Veda Pathasala 4', vedaBranch: 'Rigveda – Bharadvaja (भरद्वाज)',     color: '#7B4F12', sections: ['Vyakarana', 'Vedanta'] },
      { id: 'gan_5', name: 'श्रेयः', englishName: 'Shreya Gana', assignedAcharyaId: 'ach_5', room: 'Veda Pathasala 5', vedaBranch: 'Rigveda – Vishvamitra (विश्वामित्र)', color: '#8B2252', sections: ['Vyakarana', 'Vedanta'] },
      { id: 'gan_6', name: 'भ्राजः', englishName: 'Bhraja Gana', assignedAcharyaId: 'ach_6', room: 'Veda Pathasala 6', vedaBranch: 'Rigveda – Jamadagni (जमदग्नि)',      color: '#6B3580', sections: ['Vyakarana', 'Vedanta'] },
      { id: 'gan_7', name: 'प्रेयः', englishName: 'Preya Gana',  assignedAcharyaId: 'ach_7', room: 'Veda Pathasala 7', vedaBranch: 'Rigveda – Gautama (गौतम)',            color: '#1A5C6B', sections: ['Vyakarana', 'Vedanta'] },
      { id: 'gan_8', name: 'यशः',    englishName: 'Yasha Gana',  assignedAcharyaId: 'ach_8', room: 'Veda Pathasala 8', vedaBranch: 'Rigveda – Vashishtha (वसिष्ठ)',      color: '#5C4B1A', sections: ['Vyakarana', 'Vedanta'] }
    ];

    // ═══════════════════════════════════════════
    // 3. STUDENTS — 94 Students across 8 Ganas
    // ═══════════════════════════════════════════
    const students = [];

    // ── VVG Samayasarini 2026-27 — Real Daily Time Slots ──
    const timeSlots = {
      slot_1: { label: 'प्रातःवेदाभ्यासः',  labelEn: 'Morning Veda',   time: '06:30 – 07:55' },
      slot_2: { label: 'प्रथमसत्रम्',        labelEn: 'First Period',   time: '08:30 – 09:25' },
      slot_3: { label: 'द्वितीयसत्रम्',      labelEn: 'Second Period',  time: '11:00 – 11:55' },
      slot_4: { label: 'तृतीयसत्रम्',        labelEn: 'Third Period',   time: '01:30 – 02:25' },
      slot_5: { label: 'चतुर्थसत्रम्',       labelEn: 'Fourth Period',  time: '02:30 – 03:25' },
      slot_6: { label: 'पञ्चमसत्रम्',        labelEn: 'Fifth Period',   time: '03:30 – 04:25' },
      slot_7: { label: 'सायंसत्रम्',          labelEn: 'Evening Period', time: '06:30 – 07:25' }
    };

    // ── Real VVG Daily Timetable (same schedule every day — Gurukula model) ──
    const timetable = {
      // तपः — Tapa Gana
      gan_1: {
        slot_1: { subject: 'वेदः – कपिल:', engSubject: 'Veda – Kapila Shakha', teacher: 'सचिन:', teacherEn: 'Sachin' },
        slot_2: { subject: 'संस्कृतवाङ्मयम्', engSubject: 'Sanskrit Literature', teacher: 'सञ्जयाचार्यः', teacherEn: 'Sanjayacharya' },
        slot_3: { subject: 'कण्ठपाठः', engSubject: 'Kanthapatha – Memorization', teacher: 'ध्रुविन्', teacherEn: 'Dhruvin' },
        slot_4: { subject: 'आङ्ग्लम्', engSubject: 'English Language', teacher: 'सचिन:', teacherEn: 'Sachin' },
        slot_5: { subject: 'हितोपदेशः / पञ्चतन्त्रम्', engSubject: 'Hitopadesha / Panchatantra', teacher: 'श्रीधराचार्यः', teacherEn: 'Shridharacharya' },
        slot_6: { subject: 'संभाषणम्', engSubject: 'Sanskrit Conversation', teacher: 'आत्रेयः', teacherEn: 'Atreyah' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // तेजः — Teja Gana
      gan_2: {
        slot_1: { subject: 'वेदः – कश्यप:', engSubject: 'Veda – Kashyapa Shakha', teacher: 'चिम्बय:', teacherEn: 'Chimbaya' },
        slot_2: { subject: 'कण्ठपाठः', engSubject: 'Kanthapatha – Memorization', teacher: 'आत्रेयः', teacherEn: 'Atreyah' },
        slot_3: { subject: 'काव्यम्', engSubject: 'Sanskrit Poetry / Kavya', teacher: 'प्राचार्यः', teacherEn: 'Pracharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'व्याकरणम्', engSubject: 'Sanskrit Grammar', teacher: 'शिवसुब्रह्मण्यः', teacherEn: 'Shivasubrahmanya' },
        slot_6: { subject: 'तर्कसंग्रहः', engSubject: 'Tarka Sangraha (Logic)', teacher: 'विनायकाचार्यः', teacherEn: 'Vinayakacharya' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // ओजः — Oja Gana
      gan_3: {
        slot_1: { subject: 'वेदः – अत्रि:', engSubject: 'Veda – Atri Shakha', teacher: 'विनायकाचार्यः', teacherEn: 'Vinayakacharya' },
        slot_2: { subject: 'व्याकरणम्', engSubject: 'Sanskrit Grammar', teacher: 'गुरुप्रसादाचार्यः', teacherEn: 'Guruprasadacharya' },
        slot_3: { subject: 'न्यायबोधिनी', engSubject: 'Nyaya Bodhini (Logic)', teacher: 'पुत्थिराजाचार्यः', teacherEn: 'Putthirajacharya' },
        slot_4: { subject: 'आङ्ग्लम्', engSubject: 'English Language', teacher: 'अन्नपूर्णमा', teacherEn: 'Annapurna' },
        slot_5: { subject: 'साहित्यसीरभम्-१', engSubject: 'Sahitya Serabham Part 1', teacher: 'विनायकाचार्यः', teacherEn: 'Vinayakacharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: 'साहित्यसीरभम्-२', engSubject: 'Sahitya Serabham Part 2', teacher: 'चिम्बय:', teacherEn: 'Chimbaya' }
      },
      // वर्चः — Varca Gana
      gan_4: {
        slot_1: { subject: 'वेदः – भरद्वाज:', engSubject: 'Veda – Bharadvaja Shakha', teacher: 'गुरुप्रसादाचार्यः', teacherEn: 'Guruprasadacharya' },
        slot_2: { subject: 'सिद्धान्तकौमुदी-१', engSubject: 'Siddhanta Kaumudi Part 1', teacher: 'अरुणाचार्यः', teacherEn: 'Arunacharya' },
        slot_3: { subject: 'वेदान्तसारः', engSubject: 'Vedanta Sara', teacher: 'अनूप: / हर्षः', teacherEn: 'Anup / Harsh SK' },
        slot_4: { subject: 'आङ्ग्लम्', engSubject: 'English Language', teacher: 'आचार्यः', teacherEn: 'Acharya' },
        slot_5: { subject: 'कौमुदी-३ / प्रक्रिया', engSubject: 'Kaumudi 3 / Prakriya', teacher: 'गुरुप्रसादाचार्यः', teacherEn: 'Guruprasadacharya' },
        slot_6: { subject: 'गीताभाष्यम्', engSubject: 'Gita Bhashyam', teacher: 'श्रीधराचार्यः', teacherEn: 'Shridharacharya' },
        slot_7: { subject: 'दीपिका / मुक्तावली', engSubject: 'Deepika / Muktavali', teacher: 'अभिरामाचार्यः', teacherEn: 'Abhiramacharya' }
      },
      // श्रेयः — Shreya Gana
      gan_5: {
        slot_1: { subject: '', engSubject: 'Veda Recitation', teacher: '', teacherEn: '' },
        slot_2: { subject: 'व्यायप्रकाश:', engSubject: 'Vyaya Prakasha', teacher: 'अभिरामाचार्यः', teacherEn: 'Abhiramacharya' },
        slot_3: { subject: 'गीताभाष्यम् / महाभाष्यम् / परिभाषेन्दुशेखर:', engSubject: 'Gita Bhashyam / Mahabhashya / Paribhashendu Shekhara', teacher: 'सञ्जयाचार्यः / रव्याचार्यः / अरुणाचार्यः', teacherEn: 'Sanjayacharya / Ravyacharya / Arunacharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'सि.ले.संग्रह: / प्रीढमनोरमा', engSubject: 'Siddhanta Lakshmisangraha / Praudhmanorma', teacher: 'महादेवाचार्यः / रव्याचार्यः', teacherEn: 'Mahadevacharya / Ravyacharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: '', engSubject: 'Self Study', teacher: '', teacherEn: '' }
      },
      // भ्राजः — Bhraja Gana
      gan_6: {
        slot_1: { subject: 'वेदः – जमदग्नि: / वसिष्ठः', engSubject: 'Veda – Jamadagni / Vasishtha Shakha', teacher: 'श्रीधराचार्यः / पृथ्विराज:', teacherEn: 'Shridharacharya / Prithviraj' },
        slot_2: { subject: 'अद्वैतसिद्धि: / ब्रह्मसूत्रम्', engSubject: 'Advaita Siddhi / Brahma Sutram', teacher: 'महादेवाचार्यः / आचार्यः', teacherEn: 'Mahadevacharya / Acharya' },
        slot_3: { subject: 'महाभाष्यम् / परिभाषेन्दुशेखर:', engSubject: 'Mahabhashya / Paribhashendu Shekhara', teacher: 'अरुणाचार्यः', teacherEn: 'Arunacharya' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'ब्रह्मसूत्रम् / उपनिषद्भाष्यम् / महाभाष्यम्', engSubject: 'Brahma Sutram / Upanishad Bhashyam / Mahabhashya', teacher: 'महादेवाचार्यः / सचिन: / अरुणाचार्यः', teacherEn: 'Mahadevacharya / Sachin / Arunacharya' },
        slot_6: { subject: 'प्रीढमनोरमा', engSubject: 'Praudhmanorma', teacher: 'रव्याचार्यः', teacherEn: 'Ravyacharya' },
        slot_7: { subject: 'सि.ले.संग्रह:', engSubject: 'Siddhanta Lakshmisangraha', teacher: 'श्रीधराचार्यः', teacherEn: 'Shridharacharya' }
      },
      // प्रेयः — Preya Gana
      gan_7: {
        slot_1: { subject: 'वेदः – विश्वामित्र: & गौतमः', engSubject: 'Veda – Vishvamitra & Gautama Shakha', teacher: 'सञ्जय:', teacherEn: 'Sanjay' },
        slot_2: { subject: 'वेदान्तपरिभाषा', engSubject: 'Vedanta Paribhasha', teacher: 'सचिन:', teacherEn: 'Sachin' },
        slot_3: { subject: 'उपनिषद्भाष्यम् / कौमुदी', engSubject: 'Upanishad Bhashyam / Kaumudi', teacher: 'सञ्जयाचार्यः / अरुणाचार्यः', teacherEn: 'Sanjayacharya / Arunacharya' },
        slot_4: { subject: 'न्यायप्रकाशः', engSubject: 'Nyaya Prakasha', teacher: 'पुत्थिराजाचार्यः', teacherEn: 'Putthirajacharya' },
        slot_5: { subject: 'सिद्धान्तकौमुदी (कारकम्)', engSubject: 'Siddhanta Kaumudi – Karaka', teacher: 'रव्याचार्यः', teacherEn: 'Ravyacharya' },
        slot_6: { subject: 'प्रीढमनोरमा', engSubject: 'Praudhmanorma', teacher: 'अरुणाचार्यः', teacherEn: 'Arunacharya' },
        slot_7: { subject: 'गीताभाष्यम् / परिभाषेन्दुशेखर:', engSubject: 'Gita Bhashyam / Paribhashendu Shekhara', teacher: 'महादेवाचार्यः / गुरुप्रसादाचार्यः', teacherEn: 'Mahadevacharya / Guruprasadacharya' }
      },
      // यशः — Yasha Gana
      gan_8: {
        slot_1: { subject: 'याज्ञवल्क्य:', engSubject: 'Yajnavalkya Study', teacher: 'विष्णु:', teacherEn: 'Vishnu' },
        slot_2: { subject: 'प.ल.म. / भूषणसार:', engSubject: 'Parama Laghu Manorama / Bhushana Sara', teacher: 'शम्भु-आचार्यः', teacherEn: 'Shambhu Acharya' },
        slot_3: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_4: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_5: { subject: 'ब्रह्मसूत्रम्', engSubject: 'Brahma Sutram', teacher: 'प्राचार्यः', teacherEn: 'Pracharya' },
        slot_6: { subject: '', engSubject: 'Free Period', teacher: '', teacherEn: '' },
        slot_7: { subject: 'अद्वैतसिद्धि: / महाभाष्यम्', engSubject: 'Advaita Siddhi / Mahabhashya', teacher: 'पुष्कराचार्यः / रव्याचार्यः', teacherEn: 'Pushkaracharya / Ravyacharya' }
      }
    };

    // ═══════════════════════════════════════════
    // 5. ATTENDANCE — Past 7 days for all 8 Ganas
    // ═══════════════════════════════════════════
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

    // ═══════════════════════════════════════════
    // 6. DOCUMENTS INVENTORY
    // ═══════════════════════════════════════════
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

    // ═══════════════════════════════════════════
    // 7. ANNOUNCEMENTS MODULE
    // ═══════════════════════════════════════════
    const announcements = [
      {
        id: 'ann_1',
        title: 'Annual Vedic Recitation Examination — 2026',
        titleSa: 'वार्षिक-वेदपाठपरीक्षा — २०२६',
        body: 'The Annual Vedic Recitation Examination for all Ganas (प्रथमगणः to अष्टमगणः) will be conducted from 15th Jyeshtha to 20th Jyeshtha (June 1–6, 2026). All Acharyas are requested to prepare their respective Gana students accordingly. The examination will cover Samhita Patha, Padapatha, and Kramapatha recitation for all enrolled levels.',
        category: 'academic',
        categorySa: 'शैक्षणिकम्',
        audience: 'all',
        audienceSa: 'सर्वेभ्यः',
        priority: 'high',
        isPinned: true,
        createdBy: 'Admin',
        createdAt: '2026-05-28T09:00:00Z',
        readBy: []
      },
      {
        id: 'ann_2',
        title: 'Guru Purnima Celebration — Preparations Required',
        titleSa: 'गुरुपूर्णिमा-उत्सव — पूर्वसिद्धता',
        body: 'Guru Purnima (Ashadha Shukla Chaturdashi) falls on July 10, 2026. All Gana students are required to participate in the grand Guru Vandana ceremony. Preparations for the Guru Pada Puja, Veda Parayana, and special Homa are to begin from July 5th. Students from all Ganas will perform group chanting of the Vedic hymns dedicated to the Guru Parampara.',
        category: 'festival',
        categorySa: 'उत्सवः',
        audience: 'all',
        audienceSa: 'सर्वेभ्यः',
        priority: 'high',
        isPinned: true,
        createdBy: 'Admin',
        createdAt: '2026-05-26T10:30:00Z',
        readBy: []
      },
      {
        id: 'ann_3',
        title: 'New Sanskrit University Registration Circular',
        titleSa: 'नव-संस्कृतविश्वविद्यालय-पञ्जीकरण-सूचना',
        body: 'The registration portal for the Rashtriya Sanskrit Vidyapeetha Examination 2026–27 is now open. All eligible students from Year 3 and Year 4 of each Gana must complete their registration by June 30, 2026. Required documents: Birth Certificate, Admission Record, Previous Year Marksheet. Please submit documents to the office by June 15th.',
        category: 'administrative',
        categorySa: 'प्रशासनिकम्',
        audience: 'office',
        audienceSa: 'कार्यालयाय',
        priority: 'medium',
        isPinned: false,
        createdBy: 'Office Staff',
        createdAt: '2026-05-25T11:00:00Z',
        readBy: []
      },
      {
        id: 'ann_4',
        title: 'Timetable Update — June Schedule',
        titleSa: 'समयसारिणी-परिवर्तनम् — जून-मास',
        body: 'Effective from June 1, 2026, the afternoon session (Slot 4: 3:00–4:30 PM) for प्रथमगणः and तृतीयगणः will be shifted to 3:30–5:00 PM to accommodate additional Vedic Mathematics practice. All concerned Acharyas have been notified. The morning sessions remain unchanged.',
        category: 'academic',
        categorySa: 'शैक्षणिकम्',
        audience: 'acharyas',
        audienceSa: 'आचार्येभ्यः',
        priority: 'medium',
        isPinned: false,
        createdBy: 'Admin',
        createdAt: '2026-05-22T08:00:00Z',
        readBy: []
      },
      {
        id: 'ann_5',
        title: 'Urgent: Water Supply Interruption — May 31',
        titleSa: 'आवश्यकम्: जल-पूर्ति-विच्छेद — मई ३१',
        body: 'Due to maintenance work at the Channenahalli municipal connection, water supply to the Gurukula campus will be interrupted on May 31, 2026 from 9:00 AM to 5:00 PM. All hostels have been instructed to fill water storage tanks in advance. Drinking water arrangements will be made from 6 AM itself. Students are requested to cooperate.',
        category: 'urgent',
        categorySa: 'आवश्यकम्',
        audience: 'all',
        audienceSa: 'सर्वेभ्यः',
        priority: 'urgent',
        isPinned: true,
        createdBy: 'Office Staff',
        createdAt: '2026-05-29T16:00:00Z',
        readBy: []
      },
      {
        id: 'ann_6',
        title: 'Monthly Parent-Acharya Meeting — June 7',
        titleSa: 'मासिक-पालक-आचार्य-सभा — जून ७',
        body: 'The monthly Parent-Acharya interaction meeting is scheduled for Sunday, June 7, 2026 at 10:00 AM in the Mandala Hall. Parents of all students are cordially invited. Acharyas will share individual student progress reports. Refreshments will be provided. Please confirm attendance with the office by June 3.',
        category: 'administrative',
        categorySa: 'प्रशासनिकम्',
        audience: 'all',
        audienceSa: 'सर्वेभ्यः',
        priority: 'low',
        isPinned: false,
        createdBy: 'Office Staff',
        createdAt: '2026-05-20T09:00:00Z',
        readBy: []
      }
    ];

    // ═══════════════════════════════════════════
    // 8. RECENT ACTIVITY FEED
    // ═══════════════════════════════════════════
    const activities = [
      { id: 'act_1', text: 'Acharya Keshav Bhatta marked प्रथमगणः attendance — 11/12 Present', type: 'tulsi', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'act_2', text: 'New student Ganesha Hegde registered in प्रथमगणः', type: 'saffron', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
      { id: 'act_3', text: 'Announcement posted: Guru Purnima Celebrations', type: 'blue', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { id: 'act_4', text: 'University Enrollment Circular 2026 uploaded', type: 'blue', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: 'act_5', text: 'Acharya Vasudevan updated तृतीयगणः Saturday timetable', type: 'saffron', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
      { id: 'act_6', text: 'षष्ठगणः attendance submitted — All students Present', type: 'tulsi', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { id: 'act_7', text: 'Student Vasudeva Somayaji progress report generated', type: 'saffron', timestamp: new Date(Date.now() - 60 * 60 * 1000 * 3).toISOString() }
    ];

    // ═══════════════════════════════════════════
    // 9. GOOGLE SHEETS SYNC CONFIG
    // ═══════════════════════════════════════════
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

  // ─── CRUD: Students ───
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

  // ─── CRUD: Ganas ───
  getAllGanas() { return this.get().ganas; },
  getGanaById(id) { return this.get().ganas.find(g => g.id === id); },
  getGanaSections(id) {
    const gana = this.getGanaById(id);
    return gana ? (gana.sections || []) : [];
  },
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
  
  getStudentsBySection(ganaId, section) {
    const students = this.getAllStudents().filter(s => s.ganaId === ganaId);
    if (!section || section === 'All') return students;
    return students.filter(s => s.section === section);
  },

  // ─── CRUD: Acharyas ───
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

  // ─── Attendance ───
  // Returns class log metadata (subject, teacher, notes, etc.) for a slot
  // Canonical structure: attendanceLog[dateStr][ganaId][slotId] = { subject, teacher, students:{} }
  getClassLog(ganaId, dateStr, slotId) {
    const data = this.get();
    const slotEntry = data.attendanceLog?.[dateStr]?.[ganaId]?.[slotId];
    if (!slotEntry) return null;
    // Return only the metadata fields (not students)
    const { students, ...meta } = slotEntry;
    return Object.keys(meta).length > 0 ? meta : null;
  },

  saveClassLog(ganaId, dateStr, slotId, logData) {
    const data = this.get();
    if (!data.attendanceLog) data.attendanceLog = {};
    if (!data.attendanceLog[dateStr]) data.attendanceLog[dateStr] = {};
    if (!data.attendanceLog[dateStr][ganaId]) data.attendanceLog[dateStr][ganaId] = {};
    if (!data.attendanceLog[dateStr][ganaId][slotId]) data.attendanceLog[dateStr][ganaId][slotId] = {};
    // Merge metadata, preserve existing students
    const existing = data.attendanceLog[dateStr][ganaId][slotId];
    data.attendanceLog[dateStr][ganaId][slotId] = { ...existing, ...logData };
    this.save(data);
  },

  // getAttendance: returns student statuses for a slot (or full gana day log)
  // Structure: attendanceLog[dateStr][ganaId][slotId].students = {studentId: 'Present'|'Absent'}
  getAttendance(ganaId, dateStr, slotId = null) {
    const data = this.get();
    const dayLog = data.attendanceLog?.[dateStr]?.[ganaId] || null;
    if (!dayLog) return null;
    if (slotId) {
      const slotEntry = dayLog[slotId];
      if (!slotEntry) return null;
      // Return students object if it exists, else return slotEntry itself (backward compat)
      if (slotEntry.students && typeof slotEntry.students === 'object') {
        return slotEntry.students;
      }
      // Backward compat: slotEntry itself might be a direct {studentId: status} map
      const hasStudentKeys = Object.keys(slotEntry).some(k => k.startsWith('std_'));
      if (hasStudentKeys) return slotEntry;
      return null;
    }
    // No slotId: return full gana day log
    return dayLog;
  },
  
  saveAttendance(ganaId, dateStr, slotId, studentStatuses, classSummary = null, classGroups = null) {
    const data = this.get();
    if (!data.attendanceLog) data.attendanceLog = {};
    if (!data.attendanceLog[dateStr]) data.attendanceLog[dateStr] = {};
    if (!data.attendanceLog[dateStr][ganaId]) data.attendanceLog[dateStr][ganaId] = {};
    if (!data.attendanceLog[dateStr][ganaId][slotId]) data.attendanceLog[dateStr][ganaId][slotId] = {};
    
    // Store students under a 'students' key so metadata and statuses coexist
    data.attendanceLog[dateStr][ganaId][slotId].students = studentStatuses;
    
    if (classSummary !== null) {
      data.attendanceLog[dateStr][ganaId][slotId].classSummary = classSummary;
    }
    if (classGroups !== null) {
      data.attendanceLog[dateStr][ganaId][slotId].classGroups = classGroups;
    }
    
    data.students.forEach(student => {
      if (studentStatuses[student.id]) {
        if (!student.attendanceHistory) student.attendanceHistory = {};
        student.attendanceHistory[dateStr] = studentStatuses[student.id];
      }
    });
    this.save(data);
    const gana = data.ganas.find(g => g.id === ganaId);
    this.addActivity(`Attendance saved for ${gana ? gana.name : ganaId} on ${dateStr}`, 'tulsi');
    return true;
  },

  isClassComplete(ganaId, dateStr, slotId) {
    const data = this.get();
    const slotEntry = data.attendanceLog?.[dateStr]?.[ganaId]?.[slotId];
    if (!slotEntry) return false;
    
    const hasAttendance = slotEntry.students && Object.keys(slotEntry.students).length > 0;
    const hasSummary = slotEntry.classSummary && slotEntry.classSummary.trim().length > 0;
    
    return hasAttendance && hasSummary;
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
        // New canonical format: slot.students[sid]
        Object.values(dayLog).forEach(slotEntry => {
          if (slotEntry && typeof slotEntry === 'object') {
            const students = slotEntry.students || slotEntry;
            if (students[s.id] === 'Present') wasPresent = true;
          }
        });
        if (wasPresent) present++;
      });
      stats.push({ date: dateStr, present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 });
    }
    return stats;
  },

  // ─── Timetable ───
  getTimetable(ganaId) { return this.get().timetable[ganaId] || null; },
  getTimeSlots() { return this.get().timeSlots || {}; },
  getAllTimeSlots() { return this.getTimeSlots(); },

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

  // ─── Documents ───
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

  // ─── Announcements ───
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

  // ─── Activities Feed ───
  getRecentActivities() { return (this.get().activities || []).slice(0, 10); },
  addActivity(text, type = 'sandalwood') {
    const data = this.get();
    if (!data.activities) data.activities = [];
    data.activities.unshift({ id: 'act_' + Date.now(), text, type, timestamp: new Date().toISOString() });
    if (data.activities.length > 25) data.activities.pop();
    this.save(data);
  },

  // ─── Sheets Sync ───
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


/* 
  Veda Vijnana Gurukulam Management System
  Database Module v3.0 — Server-Backed Persistence
  Real Logins | Shared Data | 90+ Students | 8 Ganas | Full Timetable
*/

const DB_KEY     = 'vvg_database';
const DB_VERSION = '3.0.0'; // Server-backed persistence

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
    return JSON.parse(data);
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

  // ─── Init: load from server on first load ────────────────────────────
  async syncFromServer() {
    try {
      const res = await fetch('/api/db');
      if (res.status === 204) return false; // no server data yet
      if (!res.ok) return false;
      const serverData = await res.json();
      if (serverData && serverData.students && serverData.students.length > 0) {
        localStorage.setItem(DB_KEY, JSON.stringify(serverData));
        localStorage.setItem(DB_KEY + '_version', DB_VERSION);
        console.log('[VVG] Database synced from server.');
        return true;
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
        name: 'Acharya Keshav Bhatta',
        sanskritName: 'आचार्यकेशवभट्टः',
        specialization: 'Rigveda Samhita & Shatapatha Brahmana',
        assignedGana: 'प्रथमगणः',
        assignedGanaId: 'gan_1',
        qualification: 'Veda Vidwan, Rashtriya Sanskrit Vidyapeetha',
        contact: '+91 94481 23456',
        email: 'keshav.bhatta@vvgurukulam.org',
        joiningDate: '2012-06-01',
        room: 'Acharya Kutira 1',
        yearsExp: 14,
        photo: null
      },
      {
        id: 'ach_2',
        name: 'Acharya Madhava Joshi',
        sanskritName: 'आचार्यमाधवजोशी',
        specialization: 'Sanskrit Vyakarana & Nyaya Shastra',
        assignedGana: 'द्वितीयगणः',
        assignedGanaId: 'gan_2',
        qualification: 'Mahamahopadhyaya, Sampurnanand Sanskrit Vishwavidyalaya',
        contact: '+91 94482 78901',
        email: 'madhava.joshi@vvgurukulam.org',
        joiningDate: '2015-05-15',
        room: 'Acharya Kutira 2',
        yearsExp: 11,
        photo: null
      },
      {
        id: 'ach_3',
        name: 'Acharya Vasudevan Namboodiri',
        sanskritName: 'आचार्यवासुदेवन्नम्बूदिरी',
        specialization: 'Samaveda Gana & Chandas Shastra',
        assignedGana: 'तृतीयगणः',
        assignedGanaId: 'gan_3',
        qualification: 'Veda Ratna, Calicut University',
        contact: '+91 98860 11223',
        email: 'vasudevan.n@vvgurukulam.org',
        joiningDate: '2016-08-01',
        room: 'Acharya Kutira 3',
        yearsExp: 10,
        photo: null
      },
      {
        id: 'ach_4',
        name: 'Acharya Ramachandra Shastri',
        sanskritName: 'आचार्यरामचन्द्रशास्त्री',
        specialization: 'Krishna Yajurveda & Jyotisha Shastra',
        assignedGana: 'चतुर्थगणः',
        assignedGanaId: 'gan_4',
        qualification: 'Veda Vidwan, Rashtrotthan Vedic Gurukula',
        contact: '+91 94485 55667',
        email: 'ramachandra.s@vvgurukulam.org',
        joiningDate: '2010-04-10',
        room: 'Acharya Kutira 4',
        yearsExp: 16,
        photo: null
      },
      {
        id: 'ach_5',
        name: 'Acharya Subrahmanya Dikshit',
        sanskritName: 'आचार्यसुब्रह्मण्यदीक्षितः',
        specialization: 'Atharvaveda & Kalpa Sutras',
        assignedGana: 'पञ्चमगणः',
        assignedGanaId: 'gan_5',
        qualification: 'Veda Shiromani, Andhra Vedic Gurukula',
        contact: '+91 95355 44120',
        email: 'subrahmanya.d@vvgurukulam.org',
        joiningDate: '2018-06-15',
        room: 'Acharya Kutira 5',
        yearsExp: 8,
        photo: null
      },
      {
        id: 'ach_6',
        name: 'Acharya Narayana Bhattacharyya',
        sanskritName: 'आचार्यनारायणभट्टाचार्यः',
        specialization: 'Vedanta Bhashya & Upanishad Patha',
        assignedGana: 'षष्ठगणः',
        assignedGanaId: 'gan_6',
        qualification: 'Mahamahopadhyaya, Sringeri Sharada Peetham',
        contact: '+91 98445 67890',
        email: 'narayana.b@vvgurukulam.org',
        joiningDate: '2013-07-20',
        room: 'Acharya Kutira 6',
        yearsExp: 13,
        photo: null
      },
      {
        id: 'ach_7',
        name: 'Acharya Gopala Krishnan',
        sanskritName: 'आचार्यगोपालकृष्णन्',
        specialization: 'Mimamsa Shastra & Karma Kanda',
        assignedGana: 'सप्तमगणः',
        assignedGanaId: 'gan_7',
        qualification: 'Veda Ratna, Thiruvananthapuram Sanskrit College',
        contact: '+91 91234 56789',
        email: 'gopala.k@vvgurukulam.org',
        joiningDate: '2017-04-01',
        room: 'Acharya Kutira 7',
        yearsExp: 9,
        photo: null
      },
      {
        id: 'ach_8',
        name: 'Acharya Vishwanatha Ganapati',
        sanskritName: 'आचार्यविश्वनाथगणपतिः',
        specialization: 'Dharmashastra & Smriti Patha',
        assignedGana: 'अष्टमगणः',
        assignedGanaId: 'gan_8',
        qualification: 'Veda Vidwan, Kashi Sanskrit Gurukula',
        contact: '+91 94490 01234',
        email: 'vishwanatha.g@vvgurukulam.org',
        joiningDate: '2019-06-10',
        room: 'Acharya Kutira 8',
        yearsExp: 7,
        photo: null
      }
    ];

    // ═══════════════════════════════════════════
    // 2. GANAS — 8 Traditional Student Divisions
    // ═══════════════════════════════════════════
    const ganas = [
      { id: 'gan_1', name: 'तपः',    englishName: 'Tapa Gana',    assignedAcharyaId: 'ach_1', room: 'Veda Pathasala 1', vedaBranch: 'Rigveda – Kapila (कपिल)',            color: '#C54E22' },
      { id: 'gan_2', name: 'तेजः',   englishName: 'Teja Gana',   assignedAcharyaId: 'ach_2', room: 'Veda Pathasala 2', vedaBranch: 'Rigveda – Kashyapa (कश्यप)',         color: '#235689' },
      { id: 'gan_3', name: 'ओजः',    englishName: 'Oja Gana',    assignedAcharyaId: 'ach_3', room: 'Veda Pathasala 3', vedaBranch: 'Rigveda – Atri (अत्रि)',              color: '#2C6646' },
      { id: 'gan_4', name: 'वर्चः',  englishName: 'Varca Gana',  assignedAcharyaId: 'ach_4', room: 'Veda Pathasala 4', vedaBranch: 'Rigveda – Bharadvaja (भरद्वाज)',     color: '#7B4F12' },
      { id: 'gan_5', name: 'श्रेयः', englishName: 'Shreya Gana', assignedAcharyaId: 'ach_5', room: 'Veda Pathasala 5', vedaBranch: 'Rigveda – Vishvamitra (विश्वामित्र)', color: '#8B2252' },
      { id: 'gan_6', name: 'भ्राजः', englishName: 'Bhraja Gana', assignedAcharyaId: 'ach_6', room: 'Veda Pathasala 6', vedaBranch: 'Rigveda – Jamadagni (जमदग्नि)',      color: '#6B3580' },
      { id: 'gan_7', name: 'प्रेयः', englishName: 'Preya Gana',  assignedAcharyaId: 'ach_7', room: 'Veda Pathasala 7', vedaBranch: 'Rigveda – Gautama (गौतम)',            color: '#1A5C6B' },
      { id: 'gan_8', name: 'यशः',    englishName: 'Yasha Gana',  assignedAcharyaId: 'ach_8', room: 'Veda Pathasala 8', vedaBranch: 'Rigveda – Vashishtha (वसिष्ठ)',      color: '#5C4B1A' }
    ];

    // ═══════════════════════════════════════════
    // 3. STUDENTS — 94 Students across 8 Ganas
    // ═══════════════════════════════════════════
    const students = [
      // ─── गण 1: प्रथमगणः — Rigveda (12 students) ───
      { id: 'std_1', name: 'Rama Bhatta', sanskritName: 'रामभट्टः', dob: '2010-04-12', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Gopalakrishna Bhatta', parentContact: '+91 98450 12345', address: 'Gokarna, Uttara Kannada, Karnataka - 581326', hostelRoom: 'Shiva Dhama - Room 101', photo: null, notes: 'Excellent memorization. Leads Gana prayers.' },
      { id: 'std_2', name: 'Subrahmanya Joshi', sanskritName: 'सुब्रह्मण्यजोशी', dob: '2011-08-20', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayana Joshi', parentContact: '+91 94801 98765', address: 'Sringeri, Chikkamagaluru, Karnataka - 577139', hostelRoom: 'Shiva Dhama - Room 102', photo: null, notes: 'Good pronunciation. Needs support in swara intonations.' },
      { id: 'std_3', name: 'Krishna Murthy', sanskritName: 'कृष्णमूर्तिः', dob: '2009-11-05', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 4)', joiningDate: '2022-06-10', parentName: 'Venkatesha Murthy', parentContact: '+91 99008 88776', address: 'Channenahalli, Magadi Road, Bangalore - 562130', hostelRoom: 'Shiva Dhama - Room 103', photo: null, notes: 'Senior student, supports acharya in leading prayers.' },
      { id: 'std_4', name: 'Ganesha Hegde', sanskritName: 'गणेशहेगडे', dob: '2012-01-30', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 1)', joiningDate: '2025-06-01', parentName: 'Ganapati Hegde', parentContact: '+91 94490 22334', address: 'Yellapur, Uttara Kannada - 581359', hostelRoom: 'Shiva Dhama - Room 104', photo: null, notes: 'Fast learner, adjusting well to daily routine.' },
      { id: 'std_5', name: 'Vishnu Prasad', sanskritName: 'विष्णुप्रसादः', dob: '2010-09-15', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Anantha Padmanabha', parentContact: '+91 98805 44332', address: 'Udupi, Karnataka - 576101', hostelRoom: 'Shiva Dhama - Room 105', photo: null, notes: 'Keen interest in Sanskrit grammar.' },
      { id: 'std_6', name: 'Ananta Sharma', sanskritName: 'अनन्तशर्मा', dob: '2011-03-22', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Damodara Sharma', parentContact: '+91 97312 44561', address: 'Kumta, Uttara Kannada - 581343', hostelRoom: 'Shiva Dhama - Room 106', photo: null, notes: 'Disciplined. Assists in library maintenance.' },
      { id: 'std_7', name: 'Shankara Bhat', sanskritName: 'शङ्करभट्टः', dob: '2010-07-18', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-01', parentName: 'Sitarama Bhat', parentContact: '+91 94488 77654', address: 'Honnavar, Uttara Kannada - 581334', hostelRoom: 'Shiva Dhama - Room 107', photo: null, notes: 'Strong in Padapatha recitation style.' },
      { id: 'std_8', name: 'Purushottama Rao', sanskritName: 'पुरुषोत्तमरावः', dob: '2012-05-10', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 1)', joiningDate: '2025-06-01', parentName: 'Venkatarao', parentContact: '+91 98450 23456', address: 'Hospet, Ballari - 583201', hostelRoom: 'Shiva Dhama - Room 108', photo: null, notes: 'New student. Shows great interest.' },
      { id: 'std_9', name: 'Trivikrama Jois', sanskritName: 'त्रिविक्रमजोईस्', dob: '2011-12-01', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Suresh Jois', parentContact: '+91 94490 34567', address: 'Mandya, Karnataka - 571401', hostelRoom: 'Shiva Dhama - Room 109', photo: null, notes: 'Participates actively in Samhita recitation.' },
      { id: 'std_10', name: 'Nagendra Bhatta', sanskritName: 'नागेन्द्रभट्टः', dob: '2010-02-28', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 3)', joiningDate: '2023-06-05', parentName: 'Ishwara Bhatta', parentContact: '+91 97401 56789', address: 'Sirsi, Uttara Kannada - 581401', hostelRoom: 'Shiva Dhama - Room 110', photo: null, notes: 'Excellent swara control. Memorizing Mandala 2.' },
      { id: 'std_11', name: 'Balakrishna Upadhyaya', sanskritName: 'बालकृष्णउपाध्यायः', dob: '2009-08-14', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 4)', joiningDate: '2022-06-10', parentName: 'Ramakrishna Upadhyaya', parentContact: '+91 98865 12340', address: 'Mysuru, Karnataka - 570001', hostelRoom: 'Shiva Dhama - Room 111', photo: null, notes: 'Top scholar. Completed Mandala 1-5.' },
      { id: 'std_12', name: 'Durgaprasad Hegde', sanskritName: 'दुर्गाप्रसादहेगडे', dob: '2011-06-25', ganaId: 'gan_1', vedaBranch: 'Rigveda (Shakala Shakha)', classYear: 'Vidyaranya (Year 2)', joiningDate: '2024-06-01', parentName: 'Chandrakant Hegde', parentContact: '+91 94801 67890', address: 'Karwar, Uttara Kannada - 581301', hostelRoom: 'Shiva Dhama - Room 112', photo: null, notes: 'Diligent. Memorizing Kramapatha patterns.' },

      // ─── गण 2: द्वितीयगणः — Krishna Yajurveda (12 students) ───
      { id: 'std_13', name: 'Harihara Sastry', sanskritName: 'हरिहरशास्त्री', dob: '2010-02-14', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-05-20', parentName: 'Sundareshwara Sastry', parentContact: '+91 94488 11122', address: 'Melukote, Mandya - 571431', hostelRoom: 'Hari Dhama - Room 201', photo: null, notes: 'Excellent recitation. Selected for university exams.' },
      { id: 'std_14', name: 'Yagnesha Sharma', sanskritName: 'यज्ञेशशर्मा', dob: '2011-06-18', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Somasekhara Sharma', parentContact: '+91 98765 43210', address: 'Shimoga, Karnataka - 577201', hostelRoom: 'Hari Dhama - Room 202', photo: null, notes: 'Highly disciplined. Maintains hostel neatness.' },
      { id: 'std_15', name: 'Vasudeva Somayaji', sanskritName: 'वासुदेवसोमयाजी', dob: '2009-07-25', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 4)', joiningDate: '2022-06-01', parentName: 'Subramanya Somayaji', parentContact: '+91 99800 55667', address: 'Kota, Kundapura - 576221', hostelRoom: 'Hari Dhama - Room 203', photo: null, notes: 'Helps clean the Yajnasala. Performs well in tests.' },
      { id: 'std_16', name: 'Shridhara Avadhani', sanskritName: 'श्रीधरावधानी', dob: '2011-12-03', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Ramakrishna Avadhani', parentContact: '+91 94812 33445', address: 'Sagar, Shivamogga - 577401', hostelRoom: 'Hari Dhama - Room 204', photo: null, notes: 'Extremely diligent in memorizing Krama Patha.' },
      { id: 'std_17', name: 'Vigneshwara Bhatta', sanskritName: 'विघ्नेश्वरभट्टः', dob: '2012-05-18', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 1)', joiningDate: '2025-06-01', parentName: 'Mahabaleshwara Bhatta', parentContact: '+91 94480 99001', address: 'Sirsi, Uttara Kannada - 581401', hostelRoom: 'Hari Dhama - Room 205', photo: null, notes: 'Excels in yoga sessions. Polite.' },
      { id: 'std_18', name: 'Ishana Kulkarni', sanskritName: 'ईशानकुलकर्णी', dob: '2010-10-08', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-06-05', parentName: 'Vithal Kulkarni', parentContact: '+91 98450 88123', address: 'Belgavi, Karnataka - 590001', hostelRoom: 'Hari Dhama - Room 206', photo: null, notes: 'Strong in Sandhyavandana procedure.' },
      { id: 'std_19', name: 'Madhusudana Pant', sanskritName: 'मधुसूदनपन्तः', dob: '2011-04-20', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Shivaprasad Pant', parentContact: '+91 94481 54321', address: 'Dharwad, Karnataka - 580001', hostelRoom: 'Hari Dhama - Room 207', photo: null, notes: 'Consistent in attendance. Quiet student.' },
      { id: 'std_20', name: 'Chandrashekhara Iyer', sanskritName: 'चन्द्रशेखरअय्यर्', dob: '2009-09-30', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 4)', joiningDate: '2022-06-10', parentName: 'Krishnaswamy Iyer', parentContact: '+91 99004 76543', address: 'Tumakuru, Karnataka - 572101', hostelRoom: 'Hari Dhama - Room 208', photo: null, notes: 'Advanced student. Assists in teaching Pratishakhya.' },
      { id: 'std_21', name: 'Brahmananda Rao', sanskritName: 'ब्रह्मानन्दरावः', dob: '2012-02-14', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 1)', joiningDate: '2025-06-01', parentName: 'Venkatarama Rao', parentContact: '+91 97401 43210', address: 'Chikkaballapur - 562101', hostelRoom: 'Hari Dhama - Room 209', photo: null, notes: 'New student. Very enthusiastic.' },
      { id: 'std_22', name: 'Venkataramana Deekshit', sanskritName: 'वेङ्कटरामणदीक्षितः', dob: '2010-11-11', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-06-05', parentName: 'Ramarao Deekshit', parentContact: '+91 94482 21098', address: 'Kolar, Karnataka - 563101', hostelRoom: 'Hari Dhama - Room 210', photo: null, notes: 'Excellent in Taittiriya Aranyaka recitation.' },
      { id: 'std_23', name: 'Surendra Bhatt', sanskritName: 'सुरेन्द्रभट्टः', dob: '2011-07-04', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 2)', joiningDate: '2024-06-01', parentName: 'Nagesh Bhatt', parentContact: '+91 98863 32109', address: 'Puttur, Dakshina Kannada - 574201', hostelRoom: 'Hari Dhama - Room 211', photo: null, notes: 'Focused student. Preparing for university enrollment.' },
      { id: 'std_24', name: 'Lakshmikanta Dikshit', sanskritName: 'लक्ष्मीकान्तदीक्षितः', dob: '2010-03-28', ganaId: 'gan_2', vedaBranch: 'Krishna Yajurveda (Taittiriya)', classYear: 'Sayana (Year 3)', joiningDate: '2023-05-20', parentName: 'Ramachandra Dikshit', parentContact: '+91 94481 10987', address: 'Davangere, Karnataka - 577001', hostelRoom: 'Hari Dhama - Room 212', photo: null, notes: 'Leader in hostel prayers. Academic rank 2nd in Gana.' },

      // ─── गण 3: तृतीयगणः — Samaveda (11 students) ───
      { id: 'std_25', name: 'Samavedananda Pillai', sanskritName: 'सामवेदानन्दपिल्लै', dob: '2010-01-15', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Subrahmanya Pillai', parentContact: '+91 98458 67890', address: 'Palakkad, Kerala - 678001', hostelRoom: 'Brahma Dhama - Room 301', photo: null, notes: 'Exceptional in Samaveda singing. Golden voice.' },
      { id: 'std_26', name: 'Ganapatikrishna Menon', sanskritName: 'गणपतिकृष्णमेनोन्', dob: '2011-09-22', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Krishnan Menon', parentContact: '+91 94478 56789', address: 'Thrissur, Kerala - 680001', hostelRoom: 'Brahma Dhama - Room 302', photo: null, notes: 'Strong in melodic Gana singing.' },
      { id: 'std_27', name: 'Achyuta Varma', sanskritName: 'अच्युतवर्मा', dob: '2010-06-08', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Ananta Varma', parentContact: '+91 97432 45678', address: 'Kasaragod, Kerala - 671121', hostelRoom: 'Brahma Dhama - Room 303', photo: null, notes: 'Precise in Grama-geya Gana.' },
      { id: 'std_28', name: 'Vamadeva Namboothiri', sanskritName: 'वामदेवनम्बूदिरी', dob: '2009-12-18', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 4)', joiningDate: '2022-06-01', parentName: 'Narayanan Namboothiri', parentContact: '+91 98450 34567', address: 'Malappuram, Kerala - 676501', hostelRoom: 'Brahma Dhama - Room 304', photo: null, notes: 'Senior student. Assists in Aranyaka recitation.' },
      { id: 'std_29', name: 'Mriganka Chatterjee', sanskritName: 'मृगाङ्कचट्टर्जी', dob: '2012-03-10', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 1)', joiningDate: '2025-06-01', parentName: 'Debashish Chatterjee', parentContact: '+91 94801 23450', address: 'Kolkata, West Bengal - 700001', hostelRoom: 'Brahma Dhama - Room 305', photo: null, notes: 'New student from Bengal. Keen learner.' },
      { id: 'std_30', name: 'Karunakara Panicker', sanskritName: 'करुणाकरपणिक्कर्', dob: '2011-05-14', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Sankaran Panicker', parentContact: '+91 99450 12345', address: 'Kozhikode, Kerala - 673001', hostelRoom: 'Brahma Dhama - Room 306', photo: null, notes: 'Melodious voice. Good pitch control.' },
      { id: 'std_31', name: 'Vidyadhara Varrier', sanskritName: 'विद्याधरवारियर्', dob: '2010-08-30', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnan Varrier', parentContact: '+91 94480 89012', address: 'Ernakulam, Kerala - 682001', hostelRoom: 'Brahma Dhama - Room 307', photo: null, notes: 'Excels in Samavedic Udatta-Anudatta analysis.' },
      { id: 'std_32', name: 'Suryanarayan Shukla', sanskritName: 'सूर्यनारायणशुक्लः', dob: '2012-01-05', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 1)', joiningDate: '2025-06-01', parentName: 'Ramchandra Shukla', parentContact: '+91 97612 56789', address: 'Varanasi, UP - 221001', hostelRoom: 'Brahma Dhama - Room 308', photo: null, notes: 'Student from Kashi tradition. Very reverent.' },
      { id: 'std_33', name: 'Thrivikrama Devan', sanskritName: 'त्रिविक्रमदेवन्', dob: '2010-04-22', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 3)', joiningDate: '2023-06-01', parentName: 'Govindan Devan', parentContact: '+91 94485 67890', address: 'Kannur, Kerala - 670001', hostelRoom: 'Brahma Dhama - Room 309', photo: null, notes: 'Perfect swara control in Gana singing.' },
      { id: 'std_34', name: 'Annamalai Dikshitar', sanskritName: 'अण्णामलैदीक्षितः', dob: '2011-10-18', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 2)', joiningDate: '2024-06-01', parentName: 'Subramaniam Dikshitar', parentContact: '+91 98433 23456', address: 'Chidambaram, Tamil Nadu - 608001', hostelRoom: 'Brahma Dhama - Room 310', photo: null, notes: 'Comes from Nataraja temple tradition. Deep knowledge.' },
      { id: 'std_35', name: 'Sankaranarayan Bhat', sanskritName: 'शङ्करनारायणभट्टः', dob: '2009-07-02', ganaId: 'gan_3', vedaBranch: 'Samaveda (Kauthuma Shakha)', classYear: 'Chandas (Year 4)', joiningDate: '2022-06-10', parentName: 'Laxminarayana Bhat', parentContact: '+91 94801 34567', address: 'Udupi, Karnataka - 576101', hostelRoom: 'Brahma Dhama - Room 311', photo: null, notes: 'Top student. Recites entire Samhita from memory.' },

      // ─── गण 4: चतुर्थगणः — Yajurveda Maitrayani (12 students) ───
      { id: 'std_36', name: 'Parameshwara Deekshit', sanskritName: 'परमेश्वरदीक्षितः', dob: '2010-03-16', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Srinivasa Deekshit', parentContact: '+91 94490 11223', address: 'Dharmapuri, Tamil Nadu - 636701', hostelRoom: 'Vishnu Dhama - Room 401', photo: null, notes: 'Very dedicated. Memorizing Maitrayani Samhita.' },
      { id: 'std_37', name: 'Ramanuja Iyengar', sanskritName: 'रामानुजआयंगार्', dob: '2011-07-28', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Srinivasan Iyengar', parentContact: '+91 98450 78901', address: 'Srirangam, Tamil Nadu - 620006', hostelRoom: 'Vishnu Dhama - Room 402', photo: null, notes: 'Well-versed in Vishishta Advaita texts.' },
      { id: 'std_38', name: 'Nataraja Dikshit', sanskritName: 'नटराजदीक्षितः', dob: '2010-11-04', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnamurti Dikshit', parentContact: '+91 94488 89012', address: 'Kumbakonam, Tamil Nadu - 612001', hostelRoom: 'Vishnu Dhama - Room 403', photo: null, notes: 'Precise pronunciation. Good in Anvaya learning.' },
      { id: 'std_39', name: 'Srivatsa Bhattacharyya', sanskritName: 'श्रीवत्सभट्टाचार्यः', dob: '2009-06-20', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 4)', joiningDate: '2022-06-10', parentName: 'Jagannath Bhattacharyya', parentContact: '+91 99004 56789', address: 'Puri, Odisha - 752001', hostelRoom: 'Vishnu Dhama - Room 404', photo: null, notes: 'Senior. Teaching assistant for Year 1.' },
      { id: 'std_40', name: 'Shankaranarayana Iyer', sanskritName: 'शङ्करनारायणअय्यर्', dob: '2012-04-15', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 1)', joiningDate: '2025-06-01', parentName: 'Balakrishnan Iyer', parentContact: '+91 94801 45678', address: 'Madurai, Tamil Nadu - 625001', hostelRoom: 'Vishnu Dhama - Room 405', photo: null, notes: 'New student. Enthusiastic about Karma Kanda.' },
      { id: 'std_41', name: 'Satyanarayana Sharma', sanskritName: 'सत्यनारायणशर्मा', dob: '2010-08-12', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Venkateshwara Sharma', parentContact: '+91 97432 23456', address: 'Tirupati, Andhra Pradesh - 517501', hostelRoom: 'Vishnu Dhama - Room 406', photo: null, notes: 'From Tirumala tradition. Strong in Vedic rituals.' },
      { id: 'std_42', name: 'Chidambara Bhatta', sanskritName: 'चिदम्बरभट्टः', dob: '2011-02-28', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayanaswamy Bhatta', parentContact: '+91 94480 56789', address: 'Bellary, Karnataka - 583101', hostelRoom: 'Vishnu Dhama - Room 407', photo: null, notes: 'Consistent and methodical in study.' },
      { id: 'std_43', name: 'Ganapathy Raman', sanskritName: 'गणपतिरामन्', dob: '2010-05-05', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 3)', joiningDate: '2023-06-01', parentName: 'Subramonian Raman', parentContact: '+91 98865 67890', address: 'Coimbatore, Tamil Nadu - 641001', hostelRoom: 'Vishnu Dhama - Room 408', photo: null, notes: 'Good at connecting Yajurveda to actual Yajna procedures.' },
      { id: 'std_44', name: 'Vishvanath Oka', sanskritName: 'विश्वनाथओका', dob: '2011-09-18', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Shripad Oka', parentContact: '+91 94481 78901', address: 'Pune, Maharashtra - 411001', hostelRoom: 'Vishnu Dhama - Room 409', photo: null, notes: 'Student from Maharashtra. Adapting well.' },
      { id: 'std_45', name: 'Narasimha Avadhani', sanskritName: 'नरसिंहावधानी', dob: '2009-11-22', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 4)', joiningDate: '2022-06-10', parentName: 'Venkatarama Avadhani', parentContact: '+91 98450 89012', address: 'Vijayawada, Andhra Pradesh - 520001', hostelRoom: 'Vishnu Dhama - Room 410', photo: null, notes: 'Top student. Memorized entire Maitrayani Samhita.' },
      { id: 'std_46', name: 'Somanatha Bhatta', sanskritName: 'सोमनाथभट्टः', dob: '2012-06-30', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 1)', joiningDate: '2025-06-01', parentName: 'Shivarama Bhatta', parentContact: '+91 94490 90123', address: 'Hassan, Karnataka - 573201', hostelRoom: 'Vishnu Dhama - Room 411', photo: null, notes: 'New student. Shows good discipline.' },
      { id: 'std_47', name: 'Srinivasa Murthy', sanskritName: 'श्रीनिवासमूर्तिः', dob: '2011-01-08', ganaId: 'gan_4', vedaBranch: 'Krishna Yajurveda (Maitrayani)', classYear: 'Taittiriya (Year 2)', joiningDate: '2024-06-01', parentName: 'Venkataraman Murthy', parentContact: '+91 94482 01234', address: 'Chamrajnagar, Karnataka - 571313', hostelRoom: 'Vishnu Dhama - Room 412', photo: null, notes: 'Respectful and attentive during classes.' },

      // ─── गण 5: पञ्चमगणः — Atharvaveda (12 students) ───
      { id: 'std_48', name: 'Atharva Krishnamurthy', sanskritName: 'अथर्वकृष्णमूर्तिः', dob: '2010-02-08', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Krishnamurthy Rao', parentContact: '+91 97432 34567', address: 'Rajahmundry, AP - 533101', hostelRoom: 'Rudra Dhama - Room 501', photo: null, notes: 'Specialized in Atharvaveda medical sutras.' },
      { id: 'std_49', name: 'Bhrigu Sharma', sanskritName: 'भृगुशर्मा', dob: '2011-07-17', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Bhargava Sharma', parentContact: '+91 94480 45678', address: 'Nashik, Maharashtra - 422001', hostelRoom: 'Rudra Dhama - Room 502', photo: null, notes: 'Deeply interested in Ayurvedic connections.' },
      { id: 'std_50', name: 'Chandra Gupta', sanskritName: 'चन्द्रगुप्तः', dob: '2010-10-25', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Mahendra Gupta', parentContact: '+91 99004 34567', address: 'Patna, Bihar - 800001', hostelRoom: 'Rudra Dhama - Room 503', photo: null, notes: 'Excellent knowledge of Paippalada Shakha.' },
      { id: 'std_51', name: 'Divyendu Panda', sanskritName: 'दिव्येन्दुपण्डा', dob: '2009-08-14', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 4)', joiningDate: '2022-06-10', parentName: 'Gopal Panda', parentContact: '+91 94801 56789', address: 'Bhubaneswar, Odisha - 751001', hostelRoom: 'Rudra Dhama - Room 504', photo: null, notes: 'Senior student. Helps in library management.' },
      { id: 'std_52', name: 'Ekadashi Mishra', sanskritName: 'एकादशीमिश्रः', dob: '2012-03-22', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 1)', joiningDate: '2025-06-01', parentName: 'Madhusudan Mishra', parentContact: '+91 94490 67890', address: 'Allahabad, UP - 211001', hostelRoom: 'Rudra Dhama - Room 505', photo: null, notes: 'New student from UP. Good Sanskrit base.' },
      { id: 'std_53', name: 'Fanindra Das', sanskritName: 'फणीन्द्रदासः', dob: '2011-04-30', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Jagadish Das', parentContact: '+91 97402 78901', address: 'Puri, Odisha - 752001', hostelRoom: 'Rudra Dhama - Room 506', photo: null, notes: 'Respectful. Focused on Shakha recitation.' },
      { id: 'std_54', name: 'Govinda Tiwari', sanskritName: 'गोविन्दतिवारी', dob: '2010-07-12', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramakant Tiwari', parentContact: '+91 98865 89012', address: 'Prayagraj, UP - 211001', hostelRoom: 'Rudra Dhama - Room 507', photo: null, notes: 'Strong in Prashna Upanishad recitation.' },
      { id: 'std_55', name: 'Harikrishna Nair', sanskritName: 'हरिकृष्णनायर्', dob: '2011-11-08', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Gopalakrishnan Nair', parentContact: '+91 94481 90123', address: 'Thiruvananthapuram - 695001', hostelRoom: 'Rudra Dhama - Room 508', photo: null, notes: 'Disciplined. Good conduct in hostel.' },
      { id: 'std_56', name: 'Indra Deva Mishra', sanskritName: 'इन्द्रदेवमिश्रः', dob: '2010-01-18', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramadeva Mishra', parentContact: '+91 94482 12345', address: 'Mathura, UP - 281001', hostelRoom: 'Rudra Dhama - Room 509', photo: null, notes: 'Deep understanding of Kanda Shakha divisions.' },
      { id: 'std_57', name: 'Jagadish Pujari', sanskritName: 'जगदीशपूजारी', dob: '2009-10-05', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 4)', joiningDate: '2022-06-10', parentName: 'Subramanya Pujari', parentContact: '+91 97433 23456', address: 'Mangaluru, Karnataka - 575001', hostelRoom: 'Rudra Dhama - Room 510', photo: null, notes: 'Senior. Performs Atharvanic Homa procedures.' },
      { id: 'std_58', name: 'Kamalakanta Tripathi', sanskritName: 'कमलकान्ततिवारी', dob: '2012-07-20', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 1)', joiningDate: '2025-06-01', parentName: 'Ramdas Tripathi', parentContact: '+91 94483 34567', address: 'Gorakhpur, UP - 273001', hostelRoom: 'Rudra Dhama - Room 511', photo: null, notes: 'New student. Eager and obedient.' },
      { id: 'std_59', name: 'Lakshmana Shastri', sanskritName: 'लक्ष्मणशास्त्री', dob: '2011-05-25', ganaId: 'gan_5', vedaBranch: 'Atharvaveda (Shaunaka Shakha)', classYear: 'Brahma (Year 2)', joiningDate: '2024-06-01', parentName: 'Janakiballabha Shastri', parentContact: '+91 98866 45678', address: 'Varanasi, UP - 221001', hostelRoom: 'Rudra Dhama - Room 512', photo: null, notes: 'Kashi tradition student. Classical approach.' },

      // ─── गण 6: षष्ठगणः — Vedanta (11 students) ───
      { id: 'std_60', name: 'Mukunda Bhattacharya', sanskritName: 'मुकुन्दभट्टाचार्यः', dob: '2010-04-06', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Gopinath Bhattacharya', parentContact: '+91 94484 56789', address: 'Kolkata, WB - 700019', hostelRoom: 'Indra Dhama - Room 601', photo: null, notes: 'Advanced understanding of Advaita Vedanta.' },
      { id: 'std_61', name: 'Nagabhushana Acharya', sanskritName: 'नागभूषणाचार्यः', dob: '2011-08-15', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Sheshagiri Acharya', parentContact: '+91 94485 67890', address: 'Sringeri, Karnataka - 577139', hostelRoom: 'Indra Dhama - Room 602', photo: null, notes: 'Studies Brahma Sutra Bhashya carefully.' },
      { id: 'std_62', name: 'Omkar Deshpande', sanskritName: 'ओंकारदेशपाण्डे', dob: '2010-09-28', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Vinayak Deshpande', parentContact: '+91 98860 78901', address: 'Pune, Maharashtra - 411030', hostelRoom: 'Indra Dhama - Room 603', photo: null, notes: 'Good in Panchadashi analysis.' },
      { id: 'std_63', name: 'Purnananda Swami', sanskritName: 'पूर्णानन्दस्वामी', dob: '2009-05-10', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 4)', joiningDate: '2022-06-10', parentName: 'Brahmananda Swami', parentContact: '+91 97434 89012', address: 'Rishikesh, Uttarakhand - 249201', hostelRoom: 'Indra Dhama - Room 604', photo: null, notes: 'Senior. Deep meditative practice. Leads morning chanting.' },
      { id: 'std_64', name: 'Raghavendra Rao', sanskritName: 'राघवेन्द्ररावः', dob: '2012-01-22', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 1)', joiningDate: '2025-06-01', parentName: 'Vitthalrao', parentContact: '+91 94486 90123', address: 'Udupi, Karnataka - 576101', hostelRoom: 'Indra Dhama - Room 605', photo: null, notes: 'New student from Pejawara Matha.' },
      { id: 'std_65', name: 'Satchidananda Ghosh', sanskritName: 'सच्चिदानन्दघोषः', dob: '2011-06-08', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Amitabha Ghosh', parentContact: '+91 98861 01234', address: 'Howrah, WB - 711101', hostelRoom: 'Indra Dhama - Room 606', photo: null, notes: 'Philosophical inclination. Studies Shankaracharya texts.' },
      { id: 'std_66', name: 'Tapobrata Mukherjee', sanskritName: 'तपोब्रतमुखर्जी', dob: '2010-12-15', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Srikanta Mukherjee', parentContact: '+91 94487 12345', address: 'Nabadwip, WB - 741302', hostelRoom: 'Indra Dhama - Room 607', photo: null, notes: 'Strong in Mahavakya interpretation.' },
      { id: 'std_67', name: 'Upendra Pati', sanskritName: 'उपेन्द्रपतिः', dob: '2011-03-05', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Girish Pati', parentContact: '+91 97435 23456', address: 'Bhubaneswar, Odisha - 751001', hostelRoom: 'Indra Dhama - Room 608', photo: null, notes: 'Consistent in evening Upanishad recitations.' },
      { id: 'std_68', name: 'Vasishtha Jha', sanskritName: 'वसिष्ठझा', dob: '2010-07-22', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 3)', joiningDate: '2023-06-01', parentName: 'Harihar Jha', parentContact: '+91 98862 34567', address: 'Darbhanga, Bihar - 846004', hostelRoom: 'Indra Dhama - Room 609', photo: null, notes: 'Mithila tradition. Excellent in Navya Nyaya.' },
      { id: 'std_69', name: 'Yashaskara Singh', sanskritName: 'यशस्करसिंहः', dob: '2009-09-18', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 4)', joiningDate: '2022-06-10', parentName: 'Dharmendra Singh', parentContact: '+91 94488 45678', address: 'Jaipur, Rajasthan - 302001', hostelRoom: 'Indra Dhama - Room 610', photo: null, notes: 'Senior. Memorized all principal Upanishads.' },
      { id: 'std_70', name: 'Zenith Krishnan', sanskritName: 'झेनिथकृष्णन्', dob: '2011-11-30', ganaId: 'gan_6', vedaBranch: 'Vedanta & Upanishad', classYear: 'Vedanta (Year 2)', joiningDate: '2024-06-01', parentName: 'Balakrishnan Krishnan', parentContact: '+91 97436 56789', address: 'Chennai, Tamil Nadu - 600001', hostelRoom: 'Indra Dhama - Room 611', photo: null, notes: 'Interested in Tarka Shastra alongside Vedanta.' },

      // ─── गण 7: सप्तमगणः — Samaveda Jaiminiya (11 students) ───
      { id: 'std_71', name: 'Abhilasha Nambiar', sanskritName: 'अभिलाषनम्बियार्', dob: '2010-05-18', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Sundaran Nambiar', parentContact: '+91 94489 67890', address: 'Palghat, Kerala - 678001', hostelRoom: 'Soma Dhama - Room 701', photo: null, notes: 'Excellent voice. Authentic Jaiminiya renditions.' },
      { id: 'std_72', name: 'Bhaskara Menon', sanskritName: 'भास्करमेनोन्', dob: '2011-02-12', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Suresh Menon', parentContact: '+91 98863 78901', address: 'Thrissur, Kerala - 680001', hostelRoom: 'Soma Dhama - Room 702', photo: null, notes: 'Good rhythm control in Samavedic chanting.' },
      { id: 'std_73', name: 'Chitragupta Iyer', sanskritName: 'चित्रगुप्तअय्यर्', dob: '2010-08-04', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Ramachandran Iyer', parentContact: '+91 94481 89012', address: 'Kanchipuram, Tamil Nadu - 631501', hostelRoom: 'Soma Dhama - Room 703', photo: null, notes: 'Studies Jaiminiya Brahmana thoroughly.' },
      { id: 'std_74', name: 'Damodar Shastri', sanskritName: 'दामोदरशास्त्री', dob: '2009-11-25', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 4)', joiningDate: '2022-06-10', parentName: 'Sundar Shastri', parentContact: '+91 97437 90123', address: 'Tirunelveli, Tamil Nadu - 627001', hostelRoom: 'Soma Dhama - Room 704', photo: null, notes: 'Senior. Performing Agni Soma Yajna.' },
      { id: 'std_75', name: 'Eswar Namboothiri', sanskritName: 'ईश्वरनम्बूदिरी', dob: '2012-04-08', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 1)', joiningDate: '2025-06-01', parentName: 'Mahadeva Namboothiri', parentContact: '+91 98864 01234', address: 'Kozhikode, Kerala - 673001', hostelRoom: 'Soma Dhama - Room 705', photo: null, notes: 'New student from Kerala. Excellent foundation.' },
      { id: 'std_76', name: 'Gajanan Rao', sanskritName: 'गजाननरावः', dob: '2011-06-22', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Vaman Rao', parentContact: '+91 94482 12340', address: 'Kolhapur, Maharashtra - 416001', hostelRoom: 'Soma Dhama - Room 706', photo: null, notes: 'Adapts well. Enthusiastic in group chanting.' },
      { id: 'std_77', name: 'Hiranya Kashyap Pathak', sanskritName: 'हिरण्यकश्यपतिपाठकः', dob: '2010-10-18', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Kailash Pathak', parentContact: '+91 97438 23456', address: 'Ujjain, MP - 456001', hostelRoom: 'Soma Dhama - Room 707', photo: null, notes: 'Excellent in ancient Vedic music scales.' },
      { id: 'std_78', name: 'Ishwarchandra Vidyasagar', sanskritName: 'ईश्वरचन्द्रविद्यासागरः', dob: '2011-01-30', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Subash Vidyasagar', parentContact: '+91 98865 34567', address: 'Murshidabad, WB - 742149', hostelRoom: 'Soma Dhama - Room 708', photo: null, notes: 'Dedicated student. Loves comparative Vedic studies.' },
      { id: 'std_79', name: 'Janardhan Misra', sanskritName: 'जनार्दनमिश्रः', dob: '2010-03-14', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 3)', joiningDate: '2023-06-01', parentName: 'Shivadatta Misra', parentContact: '+91 94483 45678', address: 'Varanasi, UP - 221001', hostelRoom: 'Soma Dhama - Room 709', photo: null, notes: 'Kashi tradition. Good in Jaiminiya Upanishad Brahmana.' },
      { id: 'std_80', name: 'Kalidasa Rajagopalan', sanskritName: 'कालिदासराजगोपालन्', dob: '2009-07-06', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 4)', joiningDate: '2022-06-10', parentName: 'Suresh Rajagopalan', parentContact: '+91 97439 56789', address: 'Chennai, Tamil Nadu - 600004', hostelRoom: 'Soma Dhama - Room 710', photo: null, notes: 'Senior. Assists in teaching junior students.' },
      { id: 'std_81', name: 'Lakshmana Pandit', sanskritName: 'लक्ष्मणपण्डितः', dob: '2011-09-20', ganaId: 'gan_7', vedaBranch: 'Samaveda (Jaiminiya)', classYear: 'Jaiminiya (Year 2)', joiningDate: '2024-06-01', parentName: 'Raghunath Pandit', parentContact: '+91 98866 67890', address: 'Thanjavur, Tamil Nadu - 613001', hostelRoom: 'Soma Dhama - Room 711', photo: null, notes: 'From Thanjavur tradition. Strong in Aranyaka texts.' },

      // ─── गण 8: अष्टमगणः — Dharmashastra (11 students) ───
      { id: 'std_82', name: 'Manusmriti Pandey', sanskritName: 'मनुस्मृतिपाण्डेयः', dob: '2010-06-12', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Raghunandan Pandey', parentContact: '+91 94484 78901', address: 'Ayodhya, UP - 224001', hostelRoom: 'Dharma Dhama - Room 801', photo: null, notes: 'Specializing in Manusmriti commentary.' },
      { id: 'std_83', name: 'Narayana Swamy', sanskritName: 'नारायणस्वामी', dob: '2011-10-28', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Ramachandra Swamy', parentContact: '+91 97440 89012', address: 'Tirupati, AP - 517501', hostelRoom: 'Dharma Dhama - Room 802', photo: null, notes: 'Strong understanding of Yajnavalkya Smriti.' },
      { id: 'std_84', name: 'Omkarananda Brahmachari', sanskritName: 'ओंकारानन्दब्रह्मचारी', dob: '2010-02-20', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Satchidananda Swami', parentContact: '+91 98867 90123', address: 'Rishikesh, Uttarakhand - 249201', hostelRoom: 'Dharma Dhama - Room 803', photo: null, notes: 'Focused on Dharmashastra jurisprudence.' },
      { id: 'std_85', name: 'Parashurama Bhat', sanskritName: 'परशुरामभट्टः', dob: '2009-12-08', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 4)', joiningDate: '2022-06-10', parentName: 'Narayana Bhat', parentContact: '+91 94485 01234', address: 'Udupi, Karnataka - 576101', hostelRoom: 'Dharma Dhama - Room 804', photo: null, notes: 'Senior student. Leads dharmic discussions.' },
      { id: 'std_86', name: 'Ramachandra Shastri', sanskritName: 'रामचन्द्रशास्त्री', dob: '2012-05-14', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 1)', joiningDate: '2025-06-01', parentName: 'Srinivasa Shastri', parentContact: '+91 97441 12345', address: 'Tirunelveli, Tamil Nadu - 627001', hostelRoom: 'Dharma Dhama - Room 805', photo: null, notes: 'New student from South tradition.' },
      { id: 'std_87', name: 'Shivaprasad Joshi', sanskritName: 'शिवप्रसादजोशी', dob: '2011-08-22', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Narayan Joshi', parentContact: '+91 98868 23456', address: 'Nashik, Maharashtra - 422001', hostelRoom: 'Dharma Dhama - Room 806', photo: null, notes: 'Good in understanding Apastamba Grhyasutra.' },
      { id: 'std_88', name: 'Trivikrama Prabhu', sanskritName: 'त्रिविक्रमप्रभुः', dob: '2010-04-30', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Kesava Prabhu', parentContact: '+91 94486 34567', address: 'Udupi, Karnataka - 576101', hostelRoom: 'Dharma Dhama - Room 807', photo: null, notes: 'Good in Samskaras procedure study.' },
      { id: 'std_89', name: 'Uddhava Goswami', sanskritName: 'उद्धवगोस्वामी', dob: '2011-12-16', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Madhava Goswami', parentContact: '+91 97442 45678', address: 'Vrindavan, UP - 281121', hostelRoom: 'Dharma Dhama - Room 808', photo: null, notes: 'From Vrindavan. Interested in Bhakti-Dharma interface.' },
      { id: 'std_90', name: 'Vyasananda Sharma', sanskritName: 'व्यासानन्दशर्मा', dob: '2010-09-08', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 3)', joiningDate: '2023-06-01', parentName: 'Badarinarayan Sharma', parentContact: '+91 98869 56789', address: 'Varanasi, UP - 221001', hostelRoom: 'Dharma Dhama - Room 809', photo: null, notes: 'Deep in Vishnu Smriti. Studious and disciplined.' },
      { id: 'std_91', name: 'Yogananda Pant', sanskritName: 'योगानन्दपन्तः', dob: '2009-06-24', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 4)', joiningDate: '2022-06-10', parentName: 'Chandrapant', parentContact: '+91 94487 67890', address: 'Almora, Uttarakhand - 263601', hostelRoom: 'Dharma Dhama - Room 810', photo: null, notes: 'Senior. Helps Acharya in Dharmashastra teaching.' },
      { id: 'std_92', name: 'Zanjana Misra', sanskritName: 'झञ्झनमिश्रः', dob: '2011-04-10', ganaId: 'gan_8', vedaBranch: 'Dharmashastra & Smriti', classYear: 'Smriti (Year 2)', joiningDate: '2024-06-01', parentName: 'Shivaprasad Misra', parentContact: '+91 97443 78901', address: 'Gaya, Bihar - 823001', hostelRoom: 'Dharma Dhama - Room 811', photo: null, notes: 'Interested in Baudhayana Dharmasutra.' }
    ];

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

  // ─── Timetable ───
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

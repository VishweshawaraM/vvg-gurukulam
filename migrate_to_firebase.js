const fs = require('fs');
const https = require('https');
const path = require('path');

const FIREBASE_URL = 'https://vvg-edu-sys-default-rtdb.firebaseio.com';

function uploadToFirebase(endpoint, data) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data);
    const req = https.request(`${FIREBASE_URL}/${endpoint}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(body);
        else reject(new Error(`Failed with ${res.statusCode}: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function migrate() {
  try {
    const dataDir = path.join(__dirname, 'data');
    
    // 1. Upload Users
    console.log('Reading users.json...');
    const users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf-8'));
    console.log(`Uploading ${users.length} users...`);
    await uploadToFirebase('users', users);
    console.log('✅ Users uploaded!');

    // 2. Upload DB
    console.log('Reading vvg_database.json...');
    const db = JSON.parse(fs.readFileSync(path.join(dataDir, 'vvg_database.json'), 'utf-8'));
    console.log('Uploading database...');
    await uploadToFirebase('vvg_database', db);
    console.log('✅ Database uploaded!');

    console.log('🎉 Migration Complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();

const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const FIREBASE = 'https://vvg-edu-sys-default-rtdb.firebaseio.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function blast() {
  console.log("Fetching users from Firebase...");
  const res = await fetch(`${FIREBASE}/users.json`);
  const users = await res.json() || [];
  let count = 0;
  for (const user of users) {
    if (!user || !user.email) continue;
    
    const emailHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
        <div style="background:#5A2E0E;color:#F0E6D2;padding:20px;text-align:center;">
          <h2 style="margin:0;letter-spacing:1px;">वेदविज्ञानगुरुकुलम्</h2>
          <p style="margin:5px 0 0;font-size:14px;">Veda Vijnana Gurukulam</p>
        </div>
        <div style="padding:30px;background:#FAFAFA;color:#333;">
          <h3 style="margin-top:0;">नमस्कारम् (Namaskaram) ${user.nameSa || user.name},</h3>
          <p>Welcome to the newly updated Veda Vijnana Gurukulam portal.</p>
          <p>We are delighted to inform you that your account has been successfully migrated to our new system.</p>
          <p>You can now log in using your registered email address and manage your personal <strong>Profile</strong> (मम विवरणम्) directly from the portal dashboard!</p>
          <a href="http://localhost:3000/#login" style="display:inline-block;padding:10px 20px;background:#D4AF37;color:#fff;text-decoration:none;border-radius:4px;margin-top:15px;font-weight:bold;">Access Portal</a>
          <p style="margin-top:30px;font-size:12px;color:#888;text-align:center;">Pranam,<br>VVG Admin Team</p>
        </div>
      </div>
    `;
    
    try {
      await transporter.sendMail({
        from: '"VVG Admin" <' + process.env.EMAIL_USER + '>',
        to: user.email,
        subject: 'Welcome to the New VVGurukulam Portal!',
        html: emailHtml
      });
      console.log('Sent welcome to: ' + user.email);
      count++;
    } catch(e) {
      console.error('Failed for ' + user.email + ': ' + e.message);
    }
    // Small delay to prevent rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('Finished. Total sent: ' + count);
}

blast();

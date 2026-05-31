const fs = require('fs');
let code = fs.readFileSync('app/database.js', 'utf-8');

const newMethods = `
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

  getAttendance(ganaId, dateStr) {`;

code = code.replace('  getAttendance(ganaId, dateStr) {', newMethods);
fs.writeFileSync('app/database.js', code);
console.log('Fixed database.js methods');

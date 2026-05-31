const fs = require('fs');

let code = fs.readFileSync('app/pages/students.js', 'utf-8');
const start = 'function openAddDrawer() {';
const end = '// EDIT STUDENT DRAWER FORM';
const startIndex = code.indexOf(start);
const endIndex = code.indexOf(end);

if (startIndex > -1 && endIndex > -1) {
  const newFunc = `function openAddDrawer() {
    const content = \`
      <div class="drawer-header">
        <div class="drawer-title-area">
          <h2>नूतनच्छात्रपञ्जीकरणम्</h2>
          <span>Add New Student Profile</span>
        </div>
        <button class="drawer-close-btn"><svg viewBox="0 0 24 24" style="width:24px; height:24px; fill:none; stroke:currentColor; stroke-width:2.2;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="drawer-body">
        <form id="add-student-form">
          <div class="form-group">
            <label class="form-label"><span>छात्रनाम (Student Name) *</span></label>
            <input type="text" id="add-name" class="form-control" placeholder="e.g. Mahadeva Bhatta" required>
          </div>
          <div class="form-group">
            <label class="form-label"><span>गणनियोजनम् (Gana Assignment) *</span></label>
            <select id="add-gana" class="form-control" required>
              \${db.getAllGanas().map(g => \`<option value="\${g.id}">\${g.name}</option>\`).join('')}
            </select>
          </div>
          <button type="submit" class="btn btn-saffron" style="width: 100%; margin-top: 1rem;">पञ्जीकरणं क्रियताम् (Save Student)</button>
        </form>
      </div>
    \`;

    openDrawer(content);

    drawer.querySelector('#add-student-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newStudent = {
        name: drawer.querySelector('#add-name').value,
        ganaId: drawer.querySelector('#add-gana').value,
        sanskritName: '', dob: '', joiningDate: new Date().toISOString().split('T')[0],
        vedaBranch: 'Rigveda', classYear: 'Year 1', parentName: '',
        parentContact: '', address: '', notes: ''
      };
      db.addStudent(newStudent);
      closeDrawer();
      renderList();
    });
  }

  `;
  code = code.substring(0, startIndex) + newFunc + code.substring(endIndex);
  fs.writeFileSync('app/pages/students.js', code);
  console.log('Successfully updated Add Student form');
} else {
  console.log('Failed to find boundaries');
}

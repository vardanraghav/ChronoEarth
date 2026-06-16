const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../src');

const replacements = [
  // replace exact rgb arrays for old panels/cards
  { from: /rgba\(\s*4\s*,\s*11\s*,\s*18\s*,\s*0\.75\s*\)/g, to: 'rgba(10, 20, 35, 0.55)' },
  { from: /rgba\(\s*4\s*,\s*11\s*,\s*18\s*,\s*0\.8\s*\)/g, to: 'rgba(10, 20, 35, 0.55)' },
  { from: /rgba\(\s*4\s*,\s*11\s*,\s*18\s*,\s*0\.96\s*\)/g, to: 'rgba(10, 20, 35, 0.75)' },
  { from: /rgba\(\s*2\s*,\s*8\s*,\s*15\s*,\s*0\.75\s*\)/g, to: 'rgba(10, 20, 35, 0.55)' },
  { from: /rgba\(\s*2\s*,\s*8\s*,\s*15\s*,\s*0\.85\s*\)/g, to: 'rgba(10, 20, 35, 0.65)' },
  { from: /rgba\(\s*2\s*,\s*8\s*,\s*15\s*,\s*0\.95\s*\)/g, to: 'rgba(10, 20, 35, 0.75)' },
  { from: /rgba\(\s*5\s*,\s*12\s*,\s*18\s*,\s*0\.55\s*\)/g, to: 'rgba(10, 20, 35, 0.55)' },

  // general cases with quotes
  { from: /'rgba\(2, 8, 15, 0.75\)'/g, to: "'rgba(10, 20, 35, 0.55)'" },
  { from: /'rgba\(4, 11, 18, 0.75\)'/g, to: "'rgba(10, 20, 35, 0.55)'" }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      replacements.forEach(r => {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated glassmorphism in: ${fullPath}`);
      }
    }
  });
}

console.log(`Starting glassmorphism refinements in: ${baseDir}`);
processDir(baseDir);
console.log('Glassmorphism refinements completed successfully!');

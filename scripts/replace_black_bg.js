const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../src');

const replacements = [
  { from: /bg-\[\#02060A\]/g, to: 'bg-[#06121B]' },
  { from: /bg-\[\#02060a\]/g, to: 'bg-[#06121b]' },
  { from: /background:\s*'\#02060A'/g, to: "background: '#06121B'" },
  { from: /background:\s*'\#02060a'/g, to: "background: '#06121b'" },
  { from: /fromCssColorString\('\#02060A'\)/g, to: "fromCssColorString('#06121B')" },
  { from: /fromCssColorString\('\#02060a'\)/g, to: "fromCssColorString('#06121b')" },
  { from: /bg:\s*'\#02060A'/g, to: "bg: '#06121B'" },
  { from: /bg:\s*'\#02060a'/g, to: "bg: '#06121b'" }
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
        console.log(`Updated backgrounds in: ${fullPath}`);
      }
    }
  });
}

console.log(`Starting black background replacements in: ${baseDir}`);
processDir(baseDir);
console.log('Background replacements completed successfully!');

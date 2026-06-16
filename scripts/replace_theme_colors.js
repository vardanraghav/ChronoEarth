const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../src');

// Replacements configuration
const replacements = [
  { from: /#00F5B0/g, to: '#00E5FF' },
  { from: /#00D98F/g, to: '#6FEAFF' },
  { from: /#00f5b0/g, to: '#00e5ff' },
  { from: /#00d98f/g, to: '#6feaff' },
  
  // rgba mappings
  { from: /rgba\(\s*0\s*,\s*245\s*,\s*176/g, to: 'rgba(0, 229, 255' },
  { from: /rgba\(\s*0\s*,\s*217\s*,\s*143/g, to: 'rgba(111, 234, 255' },
  { from: /rgb\(\s*0\s*,\s*245\s*,\s*176/g, to: 'rgb(0, 229, 255' },
  { from: /rgb\(\s*0\s*,\s*217\s*,\s*143/g, to: 'rgb(111, 234, 255' },

  // general cases of neon green hex strings
  { from: /#00FF88/g, to: '#00E5FF' },
  { from: /#00ff88/g, to: '#00e5ff' },
  { from: /#00FFD5/g, to: '#6FEAFF' },
  { from: /#00ffd5/g, to: '#6feaff' },
  { from: /#00F5D4/g, to: '#00E5FF' },
  { from: /#00f5d4/g, to: '#00e5ff' }
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
        console.log(`Updated colors in: ${fullPath}`);
      }
    }
  });
}

console.log(`Starting global color replacement in: ${baseDir}`);
processDir(baseDir);
console.log('Color replacement completed successfully!');

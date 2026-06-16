const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

const regex = /<([A-Za-z0-9_.]+)/g;
let match;
console.log('All JSX tags in page.tsx:');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  let m;
  const tagRegex = /<([A-Za-z0-9_.]+)/g;
  while ((m = tagRegex.exec(line)) !== null) {
    console.log(`  L${idx + 1}: <${m[1]}`);
  }
});

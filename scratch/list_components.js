const fs = require('fs');
const content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const regex = /<([A-Z][A-Za-z0-9_.]*)/g;
let match;
const components = new Set();
while ((match = regex.exec(content)) !== null) {
  components.add(match[1]);
}

console.log('Components rendered in dashboard/page.tsx:');
console.log(Array.from(components));

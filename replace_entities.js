const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  // Replace escaped unicode sequences (both double and single backslashes)
  const patterns = [
    { regex: /\</g, repl: '<' },   // <
    { regex: /</g, repl: '<' },       // < (single backslash)
    { regex: /\>/g, repl: '>' },   // >
    { regex: />/g, repl: '>' },       // >
    { regex: /\"/g, repl: '"' },  // "
    { regex: /"/g, repl: '"' },      // "
    { regex: /\&/g, repl: '&' },   // &
    { regex: /&/g, repl: '&' }
  ];
  for (const { regex, repl } of patterns) {
    content = content.replace(regex, repl);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile()) {
      if (fullPath.match(/\.(tsx?|jsx?)$/)) {
        replaceInFile(fullPath);
      }
    }
  }
}

const projectRoot = path.resolve(__dirname, '.');
walk(projectRoot);

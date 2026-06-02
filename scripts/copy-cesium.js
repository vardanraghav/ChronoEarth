const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../node_modules/cesium/Build/Cesium');
const destination = path.join(__dirname, '../public/cesium');

function copyFolderRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(1);
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying Cesium assets from node_modules...');
try {
  copyFolderRecursiveSync(source, destination);
  console.log('Cesium assets successfully copied to public/cesium!');
} catch (err) {
  console.error('Error copying Cesium assets:', err);
  process.exit(1);
}

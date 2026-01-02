/**
 * Simple Build Script
 * Creates a distributable version of the extension
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const filesToCopy = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'sidecar.css',
  'accessibility-tree.js',
  'agentic-executor.js',
  'hybrid-inference.js'
];

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy files
console.log('Building Comet extension...');
filesToCopy.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  } else {
    console.warn(`⚠ File not found: ${file}`);
  }
});

// Copy icons directory
const iconsDir = path.join(__dirname, 'icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir);
  }
  
  const iconFiles = fs.readdirSync(iconsDir);
  iconFiles.forEach(file => {
    fs.copyFileSync(
      path.join(iconsDir, file),
      path.join(distIconsDir, file)
    );
  });
  console.log(`✓ Copied icons directory`);
}

console.log('\n✨ Build complete! Extension is in ./dist directory');
console.log('\nTo load the extension:');
console.log('1. Open Chrome/Edge and go to chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the ./dist directory');

#!/usr/bin/env node

/**
 * Calculate SHA256 hashes for distribution files
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const packageJson = require('../package.json');
const version = packageJson.version;

async function calculateHashes() {
  console.log('Calculating SHA256 hashes...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  const hashesFile = path.join(distDir, 'SHA256SUMS.txt');
  
  const files = [
    `taiz-${version}-win32.zip`,
    `taiz-${version}-macos.zip`,
    `taiz-${version}-linux.zip`,
    'taiz-win.exe',
    'taiz-macos',
    'taiz-linux'
  ];
  
  const hashes = [];
  
  for (const file of files) {
    const filePath = path.join(distDir, file);
    
    if (await fs.pathExists(filePath)) {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      console.log(`${file}: ${hash}`);
      hashes.push(`${hash}  ${file}`);
    }
  }
  
  // Write hashes to file
  await fs.writeFile(hashesFile, hashes.join('\n') + '\n');
  console.log(`\n✓ Hashes written to ${hashesFile}`);
  
  // Also create individual hash files for Winget
  for (const file of files) {
    const filePath = path.join(distDir, file);
    
    if (await fs.pathExists(filePath)) {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      await fs.writeFile(path.join(distDir, `${file}.sha256`), hash);
    }
  }
  
  console.log('✓ Individual hash files created');
}

if (require.main === module) {
  calculateHashes().catch(console.error);
}

module.exports = { calculateHashes };
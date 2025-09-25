#!/usr/bin/env node

/**
 * Create ZIP distribution for different platforms
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('../package.json');
const version = packageJson.version;

async function createZipDistribution() {
  console.log('Creating ZIP distributions...');
  
  const distDir = path.join(__dirname, '..', 'dist');
  const tempDir = path.join(distDir, 'temp');
  
  // Ensure directories exist
  await fs.ensureDir(distDir);
  await fs.ensureDir(tempDir);
  
  // Create Windows ZIP
  if (await fs.pathExists(path.join(distDir, 'taiz-win.exe'))) {
    const winDir = path.join(tempDir, `taiz-${version}-win32`);
    await fs.ensureDir(winDir);
    
    // Copy executable
    await fs.copy(path.join(distDir, 'taiz-win.exe'), path.join(winDir, 'taiz.exe'));
    
    // Create batch file for easier PATH integration
    const batContent = `@echo off
"%~dp0taiz.exe" %*`;
    await fs.writeFile(path.join(winDir, 'taiz.bat'), batContent);
    
    // Copy documentation
    await fs.copy(path.join(__dirname, '..', 'README.md'), path.join(winDir, 'README.md'));
    await fs.copy(path.join(__dirname, '..', 'LICENSE'), path.join(winDir, 'LICENSE'));
    
    // Create ZIP
    try {
      if (process.platform === 'win32') {
        execSync(`powershell Compress-Archive -Path "${winDir}" -DestinationPath "${path.join(distDir, `taiz-${version}-win32.zip`)}"`, { stdio: 'inherit' });
      } else {
        execSync(`cd "${tempDir}" && zip -r "../taiz-${version}-win32.zip" "taiz-${version}-win32/"`, { stdio: 'inherit' });
      }
      console.log(`✓ Created taiz-${version}-win32.zip`);
    } catch (error) {
      console.error('Failed to create Windows ZIP:', error.message);
    }
  }
  
  // Create macOS ZIP
  if (await fs.pathExists(path.join(distDir, 'taiz-macos'))) {
    const macDir = path.join(tempDir, `taiz-${version}-macos`);
    await fs.ensureDir(macDir);
    
    // Copy executable
    await fs.copy(path.join(distDir, 'taiz-macos'), path.join(macDir, 'taiz'));
    
    // Make executable
    try {
      execSync(`chmod +x "${path.join(macDir, 'taiz')}"`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('Could not set executable permissions (not on Unix system)');
    }
    
    // Copy documentation
    await fs.copy(path.join(__dirname, '..', 'README.md'), path.join(macDir, 'README.md'));
    await fs.copy(path.join(__dirname, '..', 'LICENSE'), path.join(macDir, 'LICENSE'));
    
    // Create ZIP
    try {
      execSync(`cd "${tempDir}" && zip -r "../taiz-${version}-macos.zip" "taiz-${version}-macos/"`, { stdio: 'inherit' });
      console.log(`✓ Created taiz-${version}-macos.zip`);
    } catch (error) {
      console.error('Failed to create macOS ZIP:', error.message);
    }
  }
  
  // Create Linux ZIP
  if (await fs.pathExists(path.join(distDir, 'taiz-linux'))) {
    const linuxDir = path.join(tempDir, `taiz-${version}-linux`);
    await fs.ensureDir(linuxDir);
    
    // Copy executable
    await fs.copy(path.join(distDir, 'taiz-linux'), path.join(linuxDir, 'taiz'));
    
    // Make executable
    try {
      execSync(`chmod +x "${path.join(linuxDir, 'taiz')}"`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('Could not set executable permissions (not on Unix system)');
    }
    
    // Copy documentation
    await fs.copy(path.join(__dirname, '..', 'README.md'), path.join(linuxDir, 'README.md'));
    await fs.copy(path.join(__dirname, '..', 'LICENSE'), path.join(linuxDir, 'LICENSE'));
    
    // Create ZIP
    try {
      execSync(`cd "${tempDir}" && zip -r "../taiz-${version}-linux.zip" "taiz-${version}-linux/"`, { stdio: 'inherit' });
      console.log(`✓ Created taiz-${version}-linux.zip`);
    } catch (error) {
      console.error('Failed to create Linux ZIP:', error.message);
    }
  }
  
  // Clean up temp directory
  await fs.remove(tempDir);
  
  console.log('ZIP distributions created successfully!');
}

if (require.main === module) {
  createZipDistribution().catch(console.error);
}

module.exports = { createZipDistribution };
#!/usr/bin/env node

/**
 * Prepare Winget distribution
 * Calculates SHA256 hash for Windows executable and provides manifest info
 */

const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const YAML = require('yaml');

async function prepareWinget() {
  const packageJson = require('../package.json');
  const version = packageJson.version;
  const exePath = path.join(__dirname, '..', 'dist', 'taiz.exe');
  
  console.log('🔧 Preparing Winget distribution...\n');
  
  if (!await fs.pathExists(exePath)) {
    console.error('❌ Windows executable not found at:', exePath);
    console.log('💡 Run "npm run build" first to create the executable.');
    process.exit(1);
  }
  
  // Calculate SHA256
  const fileBuffer = await fs.readFile(exePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
  const fileSize = fileBuffer.length;
  
  console.log('📊 Windows Executable Info:');
  console.log(`   File: ${exePath}`);
  console.log(`   Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   SHA256: ${hash}\n`);
  
  // Generate download URL (assuming GitHub releases)
  const githubUser = 't4zn'; // TODO: Extract from package.json repository URL
  const downloadUrl = `https://github.com/${githubUser}/taiz-cli/releases/download/v${version}/taiz.exe`;
  
  console.log('🔗 Release Information:');
  console.log(`   Version: ${version}`);
  console.log(`   Download URL: ${downloadUrl}\n`);
  
  // Create Winget manifest
  const manifestDir = path.join(__dirname, '..', 'winget-manifest');
  await fs.ensureDir(manifestDir);
  
  const manifest = {
    PackageIdentifier: 'YourName.Taiz',
    PackageVersion: version,
    PackageLocale: 'en-US',
    Publisher: packageJson.author || 'Your Name',
    PublisherUrl: packageJson.homepage || `https://github.com/${githubUser}/taiz-cli`,
    PublisherSupportUrl: packageJson.bugs?.url || `https://github.com/${githubUser}/taiz-cli/issues`,
    Author: packageJson.author || 'Your Name',
    PackageName: 'Taiz CLI',
    PackageUrl: packageJson.homepage || `https://github.com/${githubUser}/taiz-cli`,
    License: packageJson.license || 'MIT',
    LicenseUrl: `https://github.com/${githubUser}/taiz-cli/blob/main/LICENSE`,
    ShortDescription: packageJson.description,
    Description: `Taiz is a developer-friendly CLI tool that works as a polyglot package manager,
supporting multiple programming languages (Node.js, Python, Rust, Go) in a single project.
It provides unified dependency management, development workflows, and cross-platform support.`,
    Tags: [
      'cli',
      'package-manager',
      'polyglot',
      'nodejs',
      'python',
      'rust',
      'golang',
      'developer-tools',
      'dependency-management'
    ],
    ManifestType: 'singleton',
    ManifestVersion: '1.4.0',
    Installers: [{
      Architecture: 'x64',
      InstallerType: 'portable',
      InstallerUrl: downloadUrl,
      InstallerSha256: hash,
      Commands: ['taiz']
    }]
  };
  
  // Write manifest file
  const manifestPath = path.join(manifestDir, 'taiz.yaml');
  await fs.writeFile(manifestPath, YAML.stringify(manifest, { indent: 2 }));
  
  console.log('📝 Winget Manifest:');
  console.log(`   Created: ${manifestPath}\n`);
  
  console.log('📋 Next Steps for Winget:');
  console.log('1. Create GitHub release with tag v' + version);
  console.log('2. Upload taiz.exe to the release');
  console.log('3. Fork https://github.com/microsoft/winget-pkgs');
  console.log('4. Copy manifest to manifests/y/YourName/Taiz/' + version + '/');
  console.log('5. Create pull request');
  console.log('6. Update publisher name and GitHub username in manifest\n');
  
  // Save hash for other scripts
  await fs.writeFile(path.join(__dirname, '..', 'dist', 'taiz.exe.sha256'), hash);
  
  console.log('✅ Winget preparation complete!');
}

if (require.main === module) {
  prepareWinget().catch(console.error);
}

module.exports = { prepareWinget };
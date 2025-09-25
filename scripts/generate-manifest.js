#!/usr/bin/env node

/**
 * Generate Winget manifest files
 */

const fs = require('fs-extra');
const path = require('path');
const YAML = require('yaml');

const packageJson = require('../package.json');

async function generateManifest() {
  const version = packageJson.version;
  const packageId = 'YourName.Taiz'; // Change this to your actual package ID
  const publisher = 'Your Name'; // Change this to your name
  const githubUser = 'yourusername'; // Change this to your GitHub username
  
  console.log(`Generating Winget manifest for ${packageId} v${version}...`);
  
  // Read SHA256 hash for Windows executable
  const distDir = path.join(__dirname, '..', 'dist');
  const winExeHashFile = path.join(distDir, `taiz-${version}-win32.zip.sha256`);
  
  let sha256Hash = 'YOUR_SHA256_HASH_HERE';
  if (await fs.pathExists(winExeHashFile)) {
    sha256Hash = (await fs.readFile(winExeHashFile, 'utf8')).trim();
  }
  
  // Create manifest directory structure
  const manifestDir = path.join(__dirname, '..', 'manifests', 'y', publisher.replace(' ', ''), 'Taiz', version);
  await fs.ensureDir(manifestDir);
  
  // Main manifest
  const mainManifest = {
    PackageIdentifier: packageId,
    PackageVersion: version,
    DefaultLocale: 'en-US',
    ManifestType: 'version',
    ManifestVersion: '1.4.0'
  };
  
  // Installer manifest
  const installerManifest = {
    PackageIdentifier: packageId,
    PackageVersion: version,
    MinimumOSVersion: '10.0.0.0',
    InstallerType: 'zip',
    Scope: 'user',
    InstallModes: ['interactive', 'silent'],
    UpgradeBehavior: 'install',
    Commands: ['taiz'],
    FileExtensions: ['yaml', 'yml'],
    Installers: [{
      Architecture: 'x64',
      InstallerUrl: `https://github.com/${githubUser}/taiz/releases/download/v${version}/taiz-${version}-win32.zip`,
      InstallerSha256: sha256Hash.toUpperCase(),
      InstallerType: 'zip',
      NestedInstallerType: 'portable',
      NestedInstallerFiles: [{
        RelativeFilePath: `taiz-${version}-win32\\taiz.exe`,
        PortableCommandAlias: 'taiz'
      }]
    }],
    ManifestType: 'installer',
    ManifestVersion: '1.4.0'
  };
  
  // Locale manifest
  const localeManifest = {
    PackageIdentifier: packageId,
    PackageVersion: version,
    PackageLocale: 'en-US',
    Publisher: publisher,
    PublisherUrl: `https://github.com/${githubUser}`,
    PublisherSupportUrl: `https://github.com/${githubUser}/taiz/issues`,
    Author: publisher,
    PackageName: 'Taiz CLI',
    PackageUrl: `https://github.com/${githubUser}/taiz`,
    License: 'MIT',
    LicenseUrl: `https://github.com/${githubUser}/taiz/blob/main/LICENSE`,
    Copyright: `Copyright (c) ${new Date().getFullYear()} ${publisher}`,
    CopyrightUrl: `https://github.com/${githubUser}/taiz/blob/main/LICENSE`,
    ShortDescription: packageJson.description,
    Description: `Taiz is a developer-friendly CLI tool that works as a polyglot package manager,
supporting multiple programming languages (Node.js, Python, Rust, Go) in a single project.
It provides unified dependency management, development workflows, and cross-platform support.`,
    Moniker: 'taiz',
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
    ReleaseNotes: `Release version ${version}

Features:
- Multi-language project detection (Node.js, Python, Rust, Go)
- Unified dependency management with taiz.yaml
- Development server integration
- Cross-platform support

Commands:
- taiz init - Initialize project
- taiz install - Install dependencies
- taiz dev - Start development server
- taiz build - Build project
- taiz run - Run custom scripts`,
    ReleaseNotesUrl: `https://github.com/${githubUser}/taiz/releases/tag/v${version}`,
    PurchaseUrl: `https://github.com/${githubUser}/taiz`,
    InstallationNotes: "Run 'taiz --help' to get started",
    Documentations: [{
      DocumentLabel: 'README',
      DocumentUrl: `https://github.com/${githubUser}/taiz/blob/main/README.md`
    }],
    ManifestType: 'defaultLocale',
    ManifestVersion: '1.4.0'
  };
  
  // Write manifest files
  await fs.writeFile(
    path.join(manifestDir, `${packageId}.yaml`),
    YAML.stringify(mainManifest, { indent: 2 })
  );
  
  await fs.writeFile(
    path.join(manifestDir, `${packageId}.installer.yaml`),
    YAML.stringify(installerManifest, { indent: 2 })
  );
  
  await fs.writeFile(
    path.join(manifestDir, `${packageId}.locale.en-US.yaml`),
    YAML.stringify(localeManifest, { indent: 2 })
  );
  
  console.log(`✓ Manifest files generated in ${manifestDir}`);
  console.log('\nNext steps:');
  console.log('1. Update the publisher name and GitHub username in the manifest files');
  console.log('2. Verify the SHA256 hash is correct');
  console.log('3. Copy the manifest folder to your winget-pkgs fork');
  console.log('4. Create a pull request');
}

if (require.main === module) {
  generateManifest().catch(console.error);
}

module.exports = { generateManifest };
# Distribution Guide: Winget + Homebrew

This guide shows you how to distribute taiz via Winget (Windows) and Homebrew (macOS) so users can install it with simple commands.

## Overview

After following this guide, users will be able to install taiz with:

- **Windows**: `winget install taiz`
- **macOS**: `brew install taiz`
- **Linux**: `npm install -g taiz` (fallback)

## Prerequisites

1. **GitHub repository** with your taiz code
2. **GitHub account** for releases
3. **Homebrew tap** (optional, for custom formula)

## Step 1: Prepare Your Repository

### Update package.json

Make sure your `package.json` has proper metadata:

```json
{
  "name": "taiz",
  "version": "1.0.0",
  "description": "A polyglot package manager for developers",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/taiz.git"
  },
  "homepage": "https://github.com/yourusername/taiz#readme",
  "bugs": {
    "url": "https://github.com/yourusername/taiz/issues"
  },
  "author": "Your Name <your.email@example.com>",
  "license": "MIT"
}
```

### Create Release Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "pkg . --targets node18-win-x64 --output dist/taiz.exe",
    "build-all": "pkg . --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --out-path dist/",
    "prepare-winget": "npm run build && node scripts/prepare-winget.js",
    "prepare-homebrew": "node scripts/prepare-homebrew.js",
    "prepare-release": "npm run build-all && npm run prepare-winget && npm run prepare-homebrew"
  }
}
```

## Step 2: Windows Distribution (Winget)

### Create Winget Preparation Script

```javascript
// scripts/prepare-winget.js
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');

async function prepareWinget() {
  const version = require('../package.json').version;
  const exePath = path.join(__dirname, '..', 'dist', 'taiz.exe');
  
  if (!await fs.pathExists(exePath)) {
    console.error('Windows executable not found. Run npm run build first.');
    return;
  }
  
  // Calculate SHA256
  const fileBuffer = await fs.readFile(exePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  console.log(`Windows executable SHA256: ${hash}`);
  console.log(`Version: ${version}`);
  console.log(`\nUpdate your Winget manifest with these values.`);
}

prepareWinget().catch(console.error);
```

### Winget Manifest Template

Create `winget-manifest-template.yaml`:

```yaml
# Winget Manifest for Taiz CLI
PackageIdentifier: YourName.Taiz
PackageVersion: 1.0.0
PackageLocale: en-US
Publisher: Your Name
PublisherUrl: https://github.com/yourusername
PublisherSupportUrl: https://github.com/yourusername/taiz/issues
Author: Your Name
PackageName: Taiz CLI
PackageUrl: https://github.com/yourusername/taiz
License: MIT
LicenseUrl: https://github.com/yourusername/taiz/blob/main/LICENSE
ShortDescription: A polyglot package manager for developers
Description: |-
  Taiz is a developer-friendly CLI tool that works as a polyglot package manager,
  supporting multiple programming languages in a single project.
Tags:
- cli
- package-manager
- polyglot
- developer-tools
ManifestType: singleton
ManifestVersion: 1.4.0
Installers:
- Architecture: x64
  InstallerType: portable
  InstallerUrl: https://github.com/yourusername/taiz/releases/download/v1.0.0/taiz.exe
  InstallerSha256: YOUR_SHA256_HASH_HERE
  Commands:
  - taiz
```

### Winget Submission Process

1. **Build and release**:
   ```bash
   npm run build
   npm run prepare-winget
   ```

2. **Create GitHub release**:
   - Tag: `v1.0.0`
   - Upload `dist/taiz.exe`
   - Get download URL

3. **Submit to Winget**:
   - Fork https://github.com/microsoft/winget-pkgs
   - Create manifest in `manifests/y/YourName/Taiz/1.0.0/`
   - Submit pull request

## Step 3: macOS Distribution (Homebrew)

### Option A: Submit to Homebrew Core (Recommended)

For popular packages, submit directly to Homebrew:

1. **Create formula**:
   ```bash
   brew create https://github.com/yourusername/taiz/archive/refs/tags/v1.0.0.tar.gz
   ```

2. **Edit the generated formula**:
   ```ruby
   class Taiz < Formula
     desc "A polyglot package manager for developers"
     homepage "https://github.com/yourusername/taiz"
     url "https://github.com/yourusername/taiz/archive/refs/tags/v1.0.0.tar.gz"
     sha256 "YOUR_SHA256_HASH_HERE"
     license "MIT"
     
     depends_on "node"
     
     def install
       system "npm", "install", *Language::Node.std_npm_install_args(libexec)
       bin.install_symlink Dir["#{libexec}/bin/*"]
     end
     
     test do
       system "#{bin}/taiz", "--version"
       system "#{bin}/taiz", "--help"
     end
   end
   ```

3. **Test locally**:
   ```bash
   brew install --build-from-source ./taiz.rb
   taiz --version
   brew uninstall taiz
   ```

4. **Submit to Homebrew**:
   ```bash
   brew create --tap homebrew/core https://github.com/yourusername/taiz/archive/refs/tags/v1.0.0.tar.gz
   ```

### Option B: Create Your Own Tap

For faster iteration, create your own Homebrew tap:

1. **Create tap repository**:
   ```bash
   # Create repository: homebrew-taiz
   git clone https://github.com/yourusername/homebrew-taiz.git
   cd homebrew-taiz
   mkdir Formula
   ```

2. **Add formula**:
   ```bash
   cp ../taiz/Formula/taiz.rb Formula/
   git add Formula/taiz.rb
   git commit -m "Add taiz formula"
   git push origin main
   ```

3. **Users install with**:
   ```bash
   brew tap yourusername/taiz
   brew install taiz
   ```

### Homebrew Preparation Script

```javascript
// scripts/prepare-homebrew.js
const fs = require('fs-extra');
const crypto = require('crypto');
const { execSync } = require('child_process');

async function prepareHomebrew() {
  const version = require('../package.json').version;
  const tarballUrl = `https://github.com/yourusername/taiz/archive/refs/tags/v${version}.tar.gz`;
  
  try {
    // Download tarball and calculate SHA256
    console.log('Downloading tarball to calculate SHA256...');
    execSync(`curl -L "${tarballUrl}" -o temp-tarball.tar.gz`);
    
    const fileBuffer = await fs.readFile('temp-tarball.tar.gz');
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Clean up
    await fs.remove('temp-tarball.tar.gz');
    
    console.log(`Homebrew tarball SHA256: ${hash}`);
    console.log(`Version: ${version}`);
    console.log(`URL: ${tarballUrl}`);
    console.log(`\nUpdate your Homebrew formula with these values.`);
    
    // Update formula template
    const formulaTemplate = await fs.readFile('Formula/taiz.rb', 'utf8');
    const updatedFormula = formulaTemplate
      .replace(/url ".*"/, `url "${tarballUrl}"`)
      .replace(/sha256 ".*"/, `sha256 "${hash}"`)
      .replace(/version ".*"/, `# version "${version}"`);
    
    await fs.writeFile('Formula/taiz.rb', updatedFormula);
    console.log('✓ Updated Formula/taiz.rb');
    
  } catch (error) {
    console.error('Error preparing Homebrew:', error.message);
  }
}

prepareHomebrew().catch(console.error);
```

## Step 4: Automated Release Process

### GitHub Actions Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install pkg
      run: npm install -g pkg
    
    - name: Build executables
      run: npm run build-all
    
    - name: Prepare distributions
      run: npm run prepare-release
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        files: |
          dist/taiz.exe
          dist/taiz-macos
          dist/taiz-linux
        body: |
          ## Taiz CLI ${{ github.ref_name }}
          
          ### Installation
          
          **Windows:**
          ```
          winget install YourName.Taiz
          ```
          
          **macOS:**
          ```
          brew install yourusername/taiz/taiz
          ```
          
          **Linux/Other:**
          ```
          npm install -g taiz
          ```
          
          ### Manual Installation
          
          Download the appropriate executable for your platform and add it to your PATH.
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Update Homebrew Formula
      run: |
        # This would update your homebrew tap automatically
        # Requires additional setup for authentication
        echo "Update Homebrew formula manually or set up automated tap updates"
```

## Step 5: Testing Your Distribution

### Test Winget Installation

```powershell
# After your Winget PR is merged
winget search taiz
winget install YourName.Taiz
taiz --version
winget uninstall YourName.Taiz
```

### Test Homebrew Installation

```bash
# If using your own tap
brew tap yourusername/taiz
brew install taiz
taiz --version
brew uninstall taiz
brew untap yourusername/taiz

# If submitted to Homebrew core
brew install taiz
```

## Step 6: Update Installation Instructions

Update your README.md:

```markdown
## Installation

### Windows
```bash
winget install YourName.Taiz
```

### macOS
```bash
# From Homebrew core (after acceptance)
brew install taiz

# From custom tap (immediate)
brew tap yourusername/taiz
brew install taiz
```

### Linux / Other
```bash
npm install -g taiz
```

### Manual Installation
Download the latest release from [GitHub Releases](https://github.com/yourusername/taiz/releases)
```

## Step 7: Maintenance and Updates

### For New Versions

1. **Update version** in `package.json`
2. **Create and push tag**:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. **GitHub Actions** will automatically create release
4. **Update Winget**: Submit new PR with updated manifest
5. **Update Homebrew**: Update formula with new SHA256

### Automated Updates

Consider setting up:
- **Winget**: Use winget-releaser GitHub Action
- **Homebrew**: Use homebrew-releaser or bump-formula-pr

## Best Practices

1. **Consistent versioning** across all platforms
2. **Test on clean systems** before releasing
3. **Keep documentation updated** with installation methods
4. **Monitor download statistics** and user feedback
5. **Respond to package manager maintainer feedback** promptly

## Troubleshooting

### Common Issues

- **SHA256 mismatches**: Recalculate after any file changes
- **Winget validation failures**: Use winget-create tool
- **Homebrew build failures**: Test locally first
- **Permission issues**: Ensure proper repository access

### Getting Help

- **Winget**: https://github.com/microsoft/winget-pkgs/issues
- **Homebrew**: https://github.com/Homebrew/homebrew-core/issues
- **General**: Create issues in your repository

## Success Metrics

After successful distribution:
- Users can install with simple commands
- Package appears in search results
- Automatic updates work correctly
- Cross-platform consistency maintained

Your CLI tool will be easily accessible to developers on both Windows and macOS!
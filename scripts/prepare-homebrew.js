#!/usr/bin/env node

/**
 * Prepare Homebrew distribution
 * Downloads source tarball and calculates SHA256 for Homebrew formula
 */

const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');

async function prepareHomebrew() {
  const packageJson = require('../package.json');
  const version = packageJson.version;
  
  // Extract GitHub info from repository URL
  let githubUser = 't4zn';
  let repoName = 'taiz-cli';
  
  if (packageJson.repository && packageJson.repository.url) {
    const match = packageJson.repository.url.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/);
    if (match) {
      githubUser = match[1];
      repoName = match[2];
    }
  }
  
  const tarballUrl = `https://github.com/${githubUser}/${repoName}/archive/refs/tags/v${version}.tar.gz`;
  const tempTarball = path.join(__dirname, '..', 'temp-tarball.tar.gz');
  
  console.log('🍺 Preparing Homebrew distribution...\n');
  
  try {
    console.log('📥 Downloading source tarball...');
    console.log(`   URL: ${tarballUrl}`);
    
    // Download tarball
    execSync(`curl -L "${tarballUrl}" -o "${tempTarball}"`, { stdio: 'inherit' });
    
    if (!await fs.pathExists(tempTarball)) {
      throw new Error('Failed to download tarball');
    }
    
    // Calculate SHA256
    const fileBuffer = await fs.readFile(tempTarball);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const fileSize = fileBuffer.length;
    
    console.log('\n📊 Source Tarball Info:');
    console.log(`   Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   SHA256: ${hash}\n`);
    
    // Update Homebrew formula
    const formulaPath = path.join(__dirname, '..', 'Formula', 'taiz.rb');
    
    if (await fs.pathExists(formulaPath)) {
      let formulaContent = await fs.readFile(formulaPath, 'utf8');
      
      // Update URL, SHA256, and other fields
      formulaContent = formulaContent
        .replace(/url ".*"/, `url "${tarballUrl}"`)
        .replace(/sha256 ".*"/, `sha256 "${hash}"`)
        .replace(/homepage ".*"/, `homepage "${packageJson.homepage || `https://github.com/${githubUser}/${repoName}`}"`)
        .replace(/desc ".*"/, `desc "${packageJson.description}"`);
      
      await fs.writeFile(formulaPath, formulaContent);
      console.log('📝 Updated Homebrew Formula:');
      console.log(`   File: ${formulaPath}\n`);
    } else {
      // Create new formula
      const formulaContent = `class Taiz < Formula
  desc "${packageJson.description}"
  homepage "${packageJson.homepage || `https://github.com/${githubUser}/${repoName}`}"
  url "${tarballUrl}"
  sha256 "${hash}"
  license "${packageJson.license || 'MIT'}"
  head "https://github.com/${githubUser}/${repoName}.git", branch: "main"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/taiz", "--version"
    system "#{bin}/taiz", "--help"
  end
end`;
      
      await fs.ensureDir(path.dirname(formulaPath));
      await fs.writeFile(formulaPath, formulaContent);
      console.log('📝 Created Homebrew Formula:');
      console.log(`   File: ${formulaPath}\n`);
    }
    
    // Clean up
    await fs.remove(tempTarball);
    
    console.log('📋 Next Steps for Homebrew:');
    console.log('\n🎯 Option A - Submit to Homebrew Core (Recommended):');
    console.log('1. Test formula locally:');
    console.log(`   brew install --build-from-source ./Formula/taiz.rb`);
    console.log('2. Submit to Homebrew:');
    console.log(`   brew create --tap homebrew/core ${tarballUrl}`);
    console.log('3. Follow Homebrew contribution guidelines');
    
    console.log('\n🎯 Option B - Create Your Own Tap (Faster):');
    console.log('1. Create repository: homebrew-taiz');
    console.log('2. Copy Formula/taiz.rb to the new repo');
    console.log('3. Users install with:');
    console.log(`   brew tap ${githubUser}/taiz`);
    console.log('   brew install taiz');
    
    console.log('\n🧪 Testing Commands:');
    console.log('# Test locally');
    console.log('brew install --build-from-source ./Formula/taiz.rb');
    console.log('taiz --version');
    console.log('brew uninstall taiz');
    
    // Save info for other scripts
    const brewInfo = {
      version,
      tarballUrl,
      sha256: hash,
      githubUser,
      repoName
    };
    
    await fs.writeFile(
      path.join(__dirname, '..', 'dist', 'homebrew-info.json'),
      JSON.stringify(brewInfo, null, 2)
    );
    
    console.log('\n✅ Homebrew preparation complete!');
    
  } catch (error) {
    console.error('❌ Error preparing Homebrew:', error.message);
    
    if (error.message.includes('404')) {
      console.log('\n💡 The tarball URL might not exist yet.');
      console.log('   Make sure you\'ve created and pushed the git tag:');
      console.log(`   git tag v${version}`);
      console.log('   git push origin v' + version);
    }
    
    // Clean up on error
    if (await fs.pathExists(tempTarball)) {
      await fs.remove(tempTarball);
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  prepareHomebrew().catch(console.error);
}

module.exports = { prepareHomebrew };
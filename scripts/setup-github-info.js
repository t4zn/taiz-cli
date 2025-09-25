#!/usr/bin/env node

/**
 * Setup GitHub Information
 * Updates all files with your GitHub username and repository info
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGitHubInfo() {
  console.log('🔧 Setting up GitHub information for taiz distribution\n');
  
  // Get user input
  const githubUsername = await question('Enter your GitHub username: ');
  const authorName = await question('Enter your name: ');
  const authorEmail = await question('Enter your email: ');
  const publisherName = await question('Enter publisher name (for Winget): ');
  
  console.log('\n📝 Updating files...\n');
  
  // Update package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  packageJson.repository.url = `https://github.com/${githubUsername}/taiz.git`;
  packageJson.homepage = `https://github.com/${githubUsername}/taiz#readme`;
  packageJson.bugs.url = `https://github.com/${githubUsername}/taiz/issues`;
  packageJson.author = `${authorName} <${authorEmail}>`;
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  console.log('✅ Updated package.json');
  
  // Update prepare-winget.js
  const wingetScriptPath = path.join(__dirname, 'prepare-winget.js');
  let wingetScript = await fs.readFile(wingetScriptPath, 'utf8');
  wingetScript = wingetScript.replace(
    /const githubUser = 'yourusername';/,
    `const githubUser = '${githubUsername}';`
  );
  wingetScript = wingetScript.replace(
    /PackageIdentifier: 'YourName\.Taiz'/,
    `PackageIdentifier: '${publisherName}.Taiz'`
  );
  wingetScript = wingetScript.replace(
    /Publisher: packageJson\.author \|\| 'Your Name'/,
    `Publisher: '${publisherName}'`
  );
  await fs.writeFile(wingetScriptPath, wingetScript);
  console.log('✅ Updated prepare-winget.js');
  
  // Update Homebrew formula
  const formulaPath = path.join(__dirname, '..', 'Formula', 'taiz.rb');
  if (await fs.pathExists(formulaPath)) {
    let formula = await fs.readFile(formulaPath, 'utf8');
    formula = formula.replace(
      /https:\/\/github\.com\/yourusername\/taiz/g,
      `https://github.com/${githubUsername}/taiz`
    );
    await fs.writeFile(formulaPath, formula);
    console.log('✅ Updated Formula/taiz.rb');
  }
  
  // Update README.md
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readme = await fs.readFile(readmePath, 'utf8');
  readme = readme.replace(
    /https:\/\/github\.com\/yourusername\/taiz/g,
    `https://github.com/${githubUsername}/taiz`
  );
  readme = readme.replace(
    /winget install YourName\.Taiz/g,
    `winget install ${publisherName}.Taiz`
  );
  readme = readme.replace(
    /brew tap yourusername\/taiz/g,
    `brew tap ${githubUsername}/taiz`
  );
  await fs.writeFile(readmePath, readme);
  console.log('✅ Updated README.md');
  
  // Update GitHub Actions workflow
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'release.yml');
  let workflow = await fs.readFile(workflowPath, 'utf8');
  workflow = workflow.replace(
    /winget install YourName\.Taiz/g,
    `winget install ${publisherName}.Taiz`
  );
  workflow = workflow.replace(
    /brew tap yourusername\/taiz/g,
    `brew tap ${githubUsername}/taiz`
  );
  await fs.writeFile(workflowPath, workflow);
  console.log('✅ Updated .github/workflows/release.yml');
  
  // Create a summary file
  const summaryPath = path.join(__dirname, '..', 'GITHUB_INFO.md');
  const summary = `# GitHub Information

This file contains the GitHub information configured for taiz distribution.

## Configuration
- **GitHub Username**: ${githubUsername}
- **Author Name**: ${authorName}
- **Author Email**: ${authorEmail}
- **Publisher Name**: ${publisherName}
- **Repository URL**: https://github.com/${githubUsername}/taiz

## Package Manager IDs
- **Winget**: ${publisherName}.Taiz
- **Homebrew Tap**: ${githubUsername}/taiz

## Installation Commands
- **Windows**: \`winget install ${publisherName}.Taiz\`
- **macOS**: \`brew tap ${githubUsername}/taiz && brew install taiz\`

## Next Steps
1. Commit and push your changes
2. Create a release: \`git tag v1.0.0 && git push origin v1.0.0\`
3. Follow the instructions in UPLOAD_TO_PACKAGE_MANAGERS.md
`;
  
  await fs.writeFile(summaryPath, summary);
  console.log('✅ Created GITHUB_INFO.md');
  
  console.log('\n🎉 Setup complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Review the updated files');
  console.log('2. Commit and push your changes:');
  console.log('   git add .');
  console.log('   git commit -m "Setup GitHub info for distribution"');
  console.log('   git push origin main');
  console.log('3. Create a release:');
  console.log('   git tag v1.0.0');
  console.log('   git push origin v1.0.0');
  console.log('4. Follow UPLOAD_TO_PACKAGE_MANAGERS.md for submission steps');
  
  rl.close();
}

if (require.main === module) {
  setupGitHubInfo().catch(console.error);
}

module.exports = { setupGitHubInfo };
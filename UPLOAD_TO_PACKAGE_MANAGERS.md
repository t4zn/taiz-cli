# Upload Taiz to Winget and Homebrew - Action Plan

Since your GitHub repo is public, here's the exact step-by-step process to get taiz on both package managers.

## 🎯 Prerequisites Checklist

- [x] Public GitHub repository
- [ ] Update your GitHub username in all files
- [ ] Create a GitHub release
- [ ] Submit to Winget
- [ ] Submit to Homebrew

## Step 1: Update Your Information

First, update these files with your actual GitHub username:

### Update package.json
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_GITHUB_USERNAME/taiz.git"
  },
  "homepage": "https://github.com/YOUR_GITHUB_USERNAME/taiz#readme",
  "bugs": {
    "url": "https://github.com/YOUR_GITHUB_USERNAME/taiz/issues"
  },
  "author": "Your Name <your.email@example.com>"
}
```

### Update scripts/prepare-winget.js
Replace `yourusername` with your actual GitHub username:
```javascript
const githubUser = 'YOUR_GITHUB_USERNAME'; // Change this line
```

### Update scripts/prepare-homebrew.js
The script will automatically extract your GitHub info from package.json.

## Step 2: Build and Create GitHub Release

Run these commands in your terminal:

```bash
# Install dependencies
npm install
npm install -g pkg

# Build all executables and prepare distributions
npm run prepare-release

# Create and push a git tag
git add .
git commit -m "Prepare v1.0.0 release"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

This will trigger GitHub Actions to automatically:
- Build executables for Windows, macOS, and Linux
- Create ZIP distributions
- Calculate SHA256 hashes
- Generate Winget manifest and Homebrew formula
- Create a GitHub release with all files

## Step 3: Submit to Winget (Windows Package Manager)

### 3.1 Fork the Winget Repository
1. Go to https://github.com/microsoft/winget-pkgs
2. Click "Fork" to create your own copy

### 3.2 Clone Your Fork
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/winget-pkgs.git
cd winget-pkgs
```

### 3.3 Create Your Package Branch
```bash
git checkout -b add-taiz-1.0.0
```

### 3.4 Get Your Generated Manifest
After your GitHub release is created, download the generated manifest:
1. Go to your taiz repository
2. Click on "Actions" tab
3. Click on the latest workflow run
4. Download the "distribution-files" artifact
5. Extract the `winget-manifest/` folder

### 3.5 Add Manifest to Winget Repository
```bash
# Create the directory structure
mkdir -p manifests/t/YourName/Taiz/1.0.0

# Copy your manifest files (update the path to your downloaded files)
cp /path/to/downloaded/winget-manifest/* manifests/t/YourName/Taiz/1.0.0/

# Commit and push
git add manifests/t/YourName/Taiz/1.0.0/
git commit -m "Add YourName.Taiz version 1.0.0"
git push origin add-taiz-1.0.0
```

### 3.6 Create Pull Request
1. Go to your forked winget-pkgs repository on GitHub
2. Click "Compare & pull request"
3. Title: "Add YourName.Taiz version 1.0.0"
4. Description:
```markdown
## Package Information
- **Package Name**: Taiz CLI
- **Package Version**: 1.0.0
- **Publisher**: Your Name
- **License**: MIT

## Description
Taiz is a polyglot package manager for developers that supports multiple programming languages in a single project.

## Validation
- [x] Manifest validates successfully
- [x] Installer downloads and runs correctly
- [x] All required fields are present
- [x] SHA256 hash verified

## Additional Notes
This is the initial release of Taiz CLI.
```

## Step 4: Submit to Homebrew (macOS Package Manager)

You have two options for Homebrew:

### Option A: Create Your Own Tap (Recommended - Faster)

#### 4.1 Create a New Repository
1. Go to GitHub and create a new repository named `homebrew-taiz`
2. Clone it locally:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/homebrew-taiz.git
cd homebrew-taiz
```

#### 4.2 Add Your Formula
```bash
# Create Formula directory
mkdir Formula

# Copy the generated formula (from your GitHub Actions artifacts)
cp /path/to/downloaded/Formula/taiz.rb Formula/

# Or create it manually with the content below
```

Create `Formula/taiz.rb`:
```ruby
class Taiz < Formula
  desc "A polyglot package manager for developers"
  homepage "https://github.com/YOUR_GITHUB_USERNAME/taiz"
  url "https://github.com/YOUR_GITHUB_USERNAME/taiz/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "YOUR_SHA256_HASH_HERE"  # Get this from your GitHub Actions artifacts
  license "MIT"
  head "https://github.com/YOUR_GITHUB_USERNAME/taiz.git", branch: "main"

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

#### 4.3 Commit and Push
```bash
git add Formula/taiz.rb
git commit -m "Add taiz formula"
git push origin main
```

#### 4.4 Test Your Tap
```bash
# Add your tap
brew tap YOUR_GITHUB_USERNAME/taiz

# Install taiz
brew install taiz

# Test it works
taiz --version
```

### Option B: Submit to Homebrew Core (Takes Longer)

#### 4.1 Test Locally First
```bash
# Create the formula locally
brew create https://github.com/YOUR_GITHUB_USERNAME/taiz/archive/refs/tags/v1.0.0.tar.gz

# This opens an editor with a template formula
# Edit it with the content from Option A above

# Test installation
brew install --build-from-source ./taiz.rb
taiz --version
brew uninstall taiz
```

#### 4.2 Submit to Homebrew Core
```bash
# Fork homebrew-core
git clone https://github.com/Homebrew/homebrew-core.git
cd homebrew-core

# Create branch
git checkout -b taiz

# Add your formula
cp /path/to/your/taiz.rb Formula/

# Commit and push
git add Formula/taiz.rb
git commit -m "taiz 1.0.0 (new formula)"
git push origin taiz
```

Then create a pull request to Homebrew/homebrew-core.

## Step 5: Verify Everything Works

### Test Winget Installation (After PR is merged)
```powershell
# Windows PowerShell
winget search taiz
winget install YourName.Taiz
taiz --version
```

### Test Homebrew Installation
```bash
# macOS Terminal

# If using your own tap:
brew tap YOUR_GITHUB_USERNAME/taiz
brew install taiz

# If submitted to Homebrew core (after acceptance):
brew install taiz

# Test
taiz --version
```

## Step 6: Update Documentation

After successful submission, update your README.md with the correct installation commands:

```markdown
## Installation

**Windows:**
```bash
winget install YourName.Taiz
```

**macOS:**
```bash
# From your custom tap
brew tap YOUR_GITHUB_USERNAME/taiz
brew install taiz

# Or from Homebrew core (if accepted)
brew install taiz
```
```

## 🎉 Success Metrics

Once everything is set up:
- ✅ Users can install with `winget install YourName.Taiz` on Windows
- ✅ Users can install with `brew install taiz` on macOS
- ✅ Package appears in search results
- ✅ Automatic updates work when you release new versions

## 🔄 For Future Updates

When you release version 1.1.0:

1. **Update version** in package.json
2. **Create new tag**: `git tag v1.1.0 && git push origin v1.1.0`
3. **GitHub Actions** automatically creates release
4. **Update Winget**: Create new PR with updated manifest
5. **Update Homebrew**: Update formula with new version and SHA256

## 🆘 Need Help?

If you run into issues:
1. Check the generated files in GitHub Actions artifacts
2. Validate manifests using winget-create tool
3. Test Homebrew formula locally before submitting
4. Review package manager documentation for specific requirements

## 📝 Checklist Summary

- [ ] Update GitHub username in all files
- [ ] Create GitHub release (v1.0.0)
- [ ] Fork microsoft/winget-pkgs
- [ ] Submit Winget PR
- [ ] Create homebrew-taiz repository
- [ ] Add Homebrew formula
- [ ] Test both installations
- [ ] Update documentation

Follow these steps and taiz will be available on both package managers!
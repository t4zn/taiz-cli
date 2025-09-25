# Ready to Upload Taiz to Package Managers! 🚀

Your repository is now configured for **t4zn/taiz-cli**. Here's exactly what you need to do:

## 🎯 Quick Upload Process

### Step 1: Build and Create Release
```bash
# Install dependencies (if not already done)
npm install
npm install -g pkg

# Build everything and prepare distributions
npm run prepare-release

# Commit and push your changes
git add .
git commit -m "Prepare v1.0.0 release for package managers"
git push origin main

# Create and push release tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger GitHub Actions to automatically create a release with all the necessary files.

### Step 2: Submit to Winget (Windows)

#### 2.1 Fork Winget Repository
1. Go to https://github.com/microsoft/winget-pkgs
2. Click "Fork"

#### 2.2 Clone and Setup
```bash
git clone https://github.com/t4zn/winget-pkgs.git
cd winget-pkgs
git checkout -b add-taiz-1.0.0
```

#### 2.3 Get Your Generated Manifest
1. Go to https://github.com/t4zn/taiz-cli
2. Click "Actions" → Latest workflow run
3. Download "distribution-files" artifact
4. Extract the `winget-manifest/` folder

#### 2.4 Add to Winget
```bash
# Create directory structure
mkdir -p manifests/t/T4zn/Taiz/1.0.0

# Copy your manifest files
cp /path/to/extracted/winget-manifest/* manifests/t/T4zn/Taiz/1.0.0/

# Commit and push
git add manifests/t/T4zn/Taiz/1.0.0/
git commit -m "Add T4zn.Taiz version 1.0.0"
git push origin add-taiz-1.0.0
```

#### 2.5 Create Pull Request
1. Go to your forked winget-pkgs repository
2. Click "Compare & pull request"
3. Title: "Add T4zn.Taiz version 1.0.0"
4. Submit PR

### Step 3: Submit to Homebrew (macOS)

#### 3.1 Create Homebrew Tap
```bash
# Create new repository on GitHub: homebrew-taiz
# Then clone it:
git clone https://github.com/t4zn/homebrew-taiz.git
cd homebrew-taiz
mkdir Formula
```

#### 3.2 Add Formula
```bash
# Copy the generated formula
cp /path/to/extracted/Formula/taiz.rb Formula/
# Or copy from your main repo:
cp ../taiz-cli/Formula/taiz.rb Formula/

# Commit and push
git add Formula/taiz.rb
git commit -m "Add taiz formula"
git push origin main
```

## 🎉 After Upload

### Windows Users Will Install With:
```bash
winget install T4zn.Taiz
```

### macOS Users Will Install With:
```bash
brew tap t4zn/taiz
brew install taiz
```

### Linux Users Will Install With:
```bash
npm install -g taiz
```

## 🧪 Testing

### Test Winget (after PR is merged)
```powershell
winget search taiz
winget install T4zn.Taiz
taiz --version
```

### Test Homebrew
```bash
brew tap t4zn/taiz
brew install taiz
taiz --version
```

## 📋 Your Configuration Summary

- **GitHub Repository**: https://github.com/t4zn/taiz-cli
- **Winget Package ID**: T4zn.Taiz
- **Homebrew Tap**: t4zn/taiz
- **Release URL**: https://github.com/t4zn/taiz-cli/releases

## 🔄 For Future Updates

When you want to release v1.1.0:
1. Update version in package.json
2. Run: `git tag v1.1.0 && git push origin v1.1.0`
3. GitHub Actions will create the release automatically
4. Submit updated manifests to both package managers

## ✅ Checklist

- [ ] Run `npm run prepare-release`
- [ ] Commit and push changes
- [ ] Create v1.0.0 tag and push
- [ ] Wait for GitHub Actions to complete
- [ ] Fork microsoft/winget-pkgs
- [ ] Submit Winget PR
- [ ] Create homebrew-taiz repository
- [ ] Add Homebrew formula
- [ ] Test both installations

## 🆘 Need Help?

If you encounter any issues:
1. Check GitHub Actions logs for build errors
2. Validate manifests using winget-create tool
3. Test Homebrew formula locally before submitting
4. Review the detailed guides in this repository

You're all set! Just follow the steps above and taiz will be available on both package managers! 🎯
/**
 * Project Detection Logic
 * Detects project types by scanning for language-specific files
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Project types and their detection patterns
 */
const PROJECT_TYPES = {
  node: {
    files: ['package.json'],
    installCommand: 'npm install',
    devCommand: 'npm run dev',
    buildCommand: 'npm run build'
  },
  python: {
    files: ['requirements.txt', 'pyproject.toml', 'setup.py'],
    installCommand: 'pip install',
    devCommand: 'python app.py',
    buildCommand: 'python setup.py build'
  },
  rust: {
    files: ['Cargo.toml'],
    installCommand: 'cargo add',
    devCommand: 'cargo run',
    buildCommand: 'cargo build'
  },
  go: {
    files: ['go.mod'],
    installCommand: 'go get',
    devCommand: 'go run .',
    buildCommand: 'go build'
  }
};

/**
 * Detect project types in the current directory
 * @param {string} projectPath - Path to scan (defaults to current directory)
 * @returns {Array} Array of detected project types
 */
async function detectProjectTypes(projectPath = process.cwd()) {
  const detectedTypes = [];

  for (const [type, config] of Object.entries(PROJECT_TYPES)) {
    for (const file of config.files) {
      const filePath = path.join(projectPath, file);
      if (await fs.pathExists(filePath)) {
        detectedTypes.push({
          type,
          config,
          detectedFile: file
        });
        break; // Only need one file to detect the type
      }
    }
  }

  return detectedTypes;
}

/**
 * Get the primary project type (first detected)
 * @param {string} projectPath - Path to scan
 * @returns {Object|null} Primary project type or null if none detected
 */
async function getPrimaryProjectType(projectPath = process.cwd()) {
  const types = await detectProjectTypes(projectPath);
  return types.length > 0 ? types[0] : null;
}

/**
 * Check if a project has multiple language ecosystems
 * @param {string} projectPath - Path to scan
 * @returns {boolean} True if multiple project types detected
 */
async function isPolyglotProject(projectPath = process.cwd()) {
  const types = await detectProjectTypes(projectPath);
  return types.length > 1;
}

/**
 * Get install command for a specific project type
 * @param {string} projectType - The project type (node, python, etc.)
 * @param {string} module - Module name to install
 * @returns {string} Install command
 */
function getInstallCommand(projectType, module) {
  const config = PROJECT_TYPES[projectType];
  if (!config) {
    throw new Error(`Unknown project type: ${projectType}`);
  }

  switch (projectType) {
    case 'node':
      return `npm install ${module}`;
    case 'python':
      return `pip install ${module}`;
    case 'rust':
      return `cargo add ${module}`;
    case 'go':
      return `go get ${module}`;
    default:
      return `${config.installCommand} ${module}`;
  }
}

/**
 * Get uninstall command for a specific project type
 * @param {string} projectType - The project type
 * @param {string} module - Module name to uninstall
 * @returns {string} Uninstall command
 */
function getUninstallCommand(projectType, module) {
  switch (projectType) {
    case 'node':
      return `npm uninstall ${module}`;
    case 'python':
      return `pip uninstall ${module} -y`;
    case 'rust':
      return `cargo remove ${module}`;
    case 'go':
      return `go mod tidy`; // Go doesn't have direct uninstall
    default:
      throw new Error(`Uninstall not supported for project type: ${projectType}`);
  }
}

module.exports = {
  PROJECT_TYPES,
  detectProjectTypes,
  getPrimaryProjectType,
  isPolyglotProject,
  getInstallCommand,
  getUninstallCommand
};
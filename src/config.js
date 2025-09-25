/**
 * Configuration Management
 * Handles taiz.yaml and taiz-lock.yaml files
 */

const fs = require('fs-extra');
const path = require('path');
const YAML = require('yaml');
const semver = require('semver');

const TAIZ_CONFIG_FILE = 'taiz.yaml';
const TAIZ_LOCK_FILE = 'taiz-lock.yaml';

/**
 * Default taiz.yaml structure
 */
const DEFAULT_CONFIG = {
  name: '',
  version: '1.0.0',
  description: '',
  dependencies: {},
  devDependencies: {},
  scripts: {
    dev: 'taiz dev',
    build: 'taiz build'
  },
  projectTypes: []
};

/**
 * Default taiz-lock.yaml structure
 */
const DEFAULT_LOCK = {
  version: '1.0.0',
  lockfileVersion: 1,
  dependencies: {},
  devDependencies: {}
};

/**
 * Load taiz.yaml configuration
 * @param {string} projectPath - Project directory path
 * @returns {Object} Configuration object
 */
async function loadConfig(projectPath = process.cwd()) {
  const configPath = path.join(projectPath, TAIZ_CONFIG_FILE);
  
  if (await fs.pathExists(configPath)) {
    const content = await fs.readFile(configPath, 'utf8');
    return YAML.parse(content) || DEFAULT_CONFIG;
  }
  
  return { ...DEFAULT_CONFIG };
}

/**
 * Save taiz.yaml configuration
 * @param {Object} config - Configuration object
 * @param {string} projectPath - Project directory path
 */
async function saveConfig(config, projectPath = process.cwd()) {
  const configPath = path.join(projectPath, TAIZ_CONFIG_FILE);
  const yamlContent = YAML.stringify(config, { indent: 2 });
  await fs.writeFile(configPath, yamlContent, 'utf8');
}

/**
 * Load taiz-lock.yaml lockfile
 * @param {string} projectPath - Project directory path
 * @returns {Object} Lockfile object
 */
async function loadLockfile(projectPath = process.cwd()) {
  const lockPath = path.join(projectPath, TAIZ_LOCK_FILE);
  
  if (await fs.pathExists(lockPath)) {
    const content = await fs.readFile(lockPath, 'utf8');
    return YAML.parse(content) || DEFAULT_LOCK;
  }
  
  return { ...DEFAULT_LOCK };
}

/**
 * Save taiz-lock.yaml lockfile
 * @param {Object} lockfile - Lockfile object
 * @param {string} projectPath - Project directory path
 */
async function saveLockfile(lockfile, projectPath = process.cwd()) {
  const lockPath = path.join(projectPath, TAIZ_LOCK_FILE);
  const yamlContent = YAML.stringify(lockfile, { indent: 2 });
  await fs.writeFile(lockPath, yamlContent, 'utf8');
}

/**
 * Add dependency to configuration
 * @param {string} module - Module name
 * @param {string} version - Module version
 * @param {string} projectType - Project type (node, python, etc.)
 * @param {boolean} isDev - Whether it's a dev dependency
 * @param {string} projectPath - Project directory path
 */
async function addDependency(module, version, projectType, isDev = false, projectPath = process.cwd()) {
  const config = await loadConfig(projectPath);
  const lockfile = await loadLockfile(projectPath);
  
  // Add to config
  const depKey = isDev ? 'devDependencies' : 'dependencies';
  if (!config[depKey]) config[depKey] = {};
  if (!config[depKey][projectType]) config[depKey][projectType] = {};
  
  config[depKey][projectType][module] = `^${version}`;
  
  // Add to lockfile with exact version
  if (!lockfile[depKey]) lockfile[depKey] = {};
  if (!lockfile[depKey][projectType]) lockfile[depKey][projectType] = {};
  
  lockfile[depKey][projectType][module] = {
    version: version,
    resolved: `https://registry.npmjs.org/${module}/-/${module}-${version}.tgz`, // Placeholder
    integrity: 'sha512-placeholder', // Placeholder
    projectType: projectType
  };
  
  await saveConfig(config, projectPath);
  await saveLockfile(lockfile, projectPath);
}

/**
 * Remove dependency from configuration
 * @param {string} module - Module name
 * @param {string} projectType - Project type
 * @param {string} projectPath - Project directory path
 */
async function removeDependency(module, projectType, projectPath = process.cwd()) {
  const config = await loadConfig(projectPath);
  const lockfile = await loadLockfile(projectPath);
  
  // Remove from both dependencies and devDependencies
  ['dependencies', 'devDependencies'].forEach(depType => {
    if (config[depType] && config[depType][projectType]) {
      delete config[depType][projectType][module];
      
      // Clean up empty project type objects
      if (Object.keys(config[depType][projectType]).length === 0) {
        delete config[depType][projectType];
      }
    }
    
    if (lockfile[depType] && lockfile[depType][projectType]) {
      delete lockfile[depType][projectType][module];
      
      // Clean up empty project type objects
      if (Object.keys(lockfile[depType][projectType]).length === 0) {
        delete lockfile[depType][projectType];
      }
    }
  });
  
  await saveConfig(config, projectPath);
  await saveLockfile(lockfile, projectPath);
}

/**
 * Initialize a new taiz project
 * @param {string} projectName - Project name
 * @param {Array} projectTypes - Detected project types
 * @param {string} projectPath - Project directory path
 */
async function initializeProject(projectName, projectTypes = [], projectPath = process.cwd()) {
  const config = {
    ...DEFAULT_CONFIG,
    name: projectName || path.basename(projectPath),
    projectTypes: projectTypes.map(type => type.type)
  };
  
  const lockfile = { ...DEFAULT_LOCK };
  
  await saveConfig(config, projectPath);
  await saveLockfile(lockfile, projectPath);
}

module.exports = {
  TAIZ_CONFIG_FILE,
  TAIZ_LOCK_FILE,
  loadConfig,
  saveConfig,
  loadLockfile,
  saveLockfile,
  addDependency,
  removeDependency,
  initializeProject
};
/**
 * Installation Logic
 * Handles package installation and uninstallation across different ecosystems
 */

const { spawn } = require('child_process');
const chalk = require('chalk');
const semver = require('semver');

/**
 * Execute a shell command
 * @param {string} command - Command to execute
 * @param {Array} args - Command arguments
 * @param {Object} options - Spawn options
 * @returns {Promise} Promise that resolves when command completes
 */
function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`Running: ${command} ${args.join(' ')}`));
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Get the latest version of a package
 * @param {string} module - Module name
 * @param {string} projectType - Project type
 * @returns {Promise<string>} Latest version
 */
async function getLatestVersion(module, projectType) {
  return new Promise((resolve, reject) => {
    let command, args;
    
    switch (projectType) {
      case 'node':
        command = 'npm';
        args = ['view', module, 'version'];
        break;
      case 'python':
        command = 'pip';
        args = ['index', 'versions', module];
        break;
      default:
        resolve('1.0.0'); // Fallback version
        return;
    }
    
    const child = spawn(command, args, { shell: true });
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        const version = output.trim().split('\n').pop();
        resolve(version || '1.0.0');
      } else {
        resolve('1.0.0'); // Fallback if command fails
      }
    });
    
    child.on('error', () => {
      resolve('1.0.0'); // Fallback on error
    });
  });
}

/**
 * Install a package using the appropriate package manager
 * @param {string} module - Module name
 * @param {string} projectType - Project type (node, python, etc.)
 * @param {Object} options - Installation options
 * @returns {Promise<string>} Installed version
 */
async function installPackage(module, projectType, options = {}) {
  const { global = false, dev = false } = options;
  
  let command, args;
  
  switch (projectType) {
    case 'node':
      command = 'npm';
      args = ['install'];
      if (global) args.push('-g');
      if (dev && !global) args.push('--save-dev');
      args.push(module);
      break;
      
    case 'python':
      command = 'pip';
      args = ['install'];
      if (global) args.push('--user');
      args.push(module);
      break;
      
    case 'rust':
      command = 'cargo';
      args = ['add', module];
      break;
      
    case 'go':
      command = 'go';
      args = ['get', module];
      break;
      
    default:
      throw new Error(`Installation not supported for project type: ${projectType}`);
  }
  
  await executeCommand(command, args);
  
  // Get the installed version
  const version = await getLatestVersion(module, projectType);
  return version;
}

/**
 * Uninstall a package using the appropriate package manager
 * @param {string} module - Module name
 * @param {string} projectType - Project type
 * @param {Object} options - Uninstallation options
 */
async function uninstallPackage(module, projectType, options = {}) {
  const { global = false } = options;
  
  let command, args;
  
  switch (projectType) {
    case 'node':
      command = 'npm';
      args = ['uninstall'];
      if (global) args.push('-g');
      args.push(module);
      break;
      
    case 'python':
      command = 'pip';
      args = ['uninstall', '-y', module];
      break;
      
    case 'rust':
      command = 'cargo';
      args = ['remove', module];
      break;
      
    case 'go':
      // Go doesn't have direct uninstall, need to remove from go.mod manually
      console.log(chalk.yellow(`Go modules are managed in go.mod. Remove ${module} manually and run 'go mod tidy'.`));
      return;
      
    default:
      throw new Error(`Uninstallation not supported for project type: ${projectType}`);
  }
  
  await executeCommand(command, args);
}

/**
 * Check if a command exists in the system
 * @param {string} command - Command to check
 * @returns {Promise<boolean>} True if command exists
 */
function commandExists(command) {
  return new Promise((resolve) => {
    const child = spawn('which', [command], { shell: true, stdio: 'ignore' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Validate that required tools are installed
 * @param {string} projectType - Project type to validate
 * @returns {Promise<boolean>} True if tools are available
 */
async function validateTools(projectType) {
  const toolMap = {
    node: 'npm',
    python: 'pip',
    rust: 'cargo',
    go: 'go'
  };
  
  const tool = toolMap[projectType];
  if (!tool) return false;
  
  const exists = await commandExists(tool);
  if (!exists) {
    console.error(chalk.red(`Error: ${tool} is not installed or not in PATH`));
    console.log(chalk.yellow(`Please install ${tool} to manage ${projectType} dependencies`));
  }
  
  return exists;
}

module.exports = {
  executeCommand,
  getLatestVersion,
  installPackage,
  uninstallPackage,
  commandExists,
  validateTools
};
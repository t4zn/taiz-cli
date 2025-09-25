/**
 * Dev Command
 * Start development server based on project type
 */

const chalk = require('chalk');
const { detectProjectTypes, getPrimaryProjectType } = require('../detector');
const { executeCommand, validateTools } = require('../installer');
const { loadConfig } = require('../config');

/**
 * Dev command handler
 */
async function devCommand() {
  try {
    const projectPath = process.cwd();
    
    console.log(chalk.blue('Starting development server...'));
    
    // Check if taiz project exists
    const config = await loadConfig(projectPath);
    
    // Check for custom dev script in taiz.yaml
    if (config.scripts && config.scripts.dev && config.scripts.dev !== 'taiz dev') {
      console.log(chalk.gray(`Running custom dev script: ${config.scripts.dev}`));
      const [command, ...args] = config.scripts.dev.split(' ');
      await executeCommand(command, args);
      return;
    }
    
    // Detect project types
    const detectedTypes = await detectProjectTypes(projectPath);
    
    if (detectedTypes.length === 0) {
      console.error(chalk.red('No project types detected. Cannot start development server.'));
      console.log(chalk.gray('Supported project types: Node.js (package.json), Python (requirements.txt, pyproject.toml)'));
      process.exit(1);
    }
    
    const primaryType = await getPrimaryProjectType(projectPath);
    
    console.log(chalk.gray(`Detected ${primaryType.type} project`));
    
    // Validate tools
    if (!(await validateTools(primaryType.type))) {
      process.exit(1);
    }
    
    // Start development server based on project type
    let command, args;
    
    switch (primaryType.type) {
      case 'node':
        // Try common Node.js dev commands
        const fs = require('fs-extra');
        const path = require('path');
        const packageJsonPath = path.join(projectPath, 'package.json');
        
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          
          if (packageJson.scripts && packageJson.scripts.dev) {
            command = 'npm';
            args = ['run', 'dev'];
          } else if (packageJson.scripts && packageJson.scripts.start) {
            command = 'npm';
            args = ['run', 'start'];
          } else {
            console.log(chalk.yellow('No dev or start script found in package.json'));
            console.log(chalk.gray('Add a "dev" script to package.json or use "taiz run <script>"'));
            return;
          }
        }
        break;
        
      case 'python':
        // Try common Python dev patterns
        const commonPythonFiles = ['app.py', 'main.py', 'server.py', 'manage.py'];
        let pythonFile = null;
        
        for (const file of commonPythonFiles) {
          if (await require('fs-extra').pathExists(require('path').join(projectPath, file))) {
            pythonFile = file;
            break;
          }
        }
        
        if (pythonFile) {
          command = 'python';
          args = [pythonFile];
          
          // Special handling for Django
          if (pythonFile === 'manage.py') {
            args.push('runserver');
          }
        } else {
          console.log(chalk.yellow('No common Python entry file found (app.py, main.py, server.py, manage.py)'));
          console.log(chalk.gray('Create one of these files or add a custom dev script to taiz.yaml'));
          return;
        }
        break;
        
      case 'rust':
        command = 'cargo';
        args = ['run'];
        break;
        
      case 'go':
        command = 'go';
        args = ['run', '.'];
        break;
        
      default:
        console.error(chalk.red(`Development server not supported for ${primaryType.type} projects`));
        process.exit(1);
    }
    
    console.log(chalk.blue(`Starting ${primaryType.type} development server...`));
    await executeCommand(command, args);
    
  } catch (error) {
    console.error(chalk.red('Failed to start development server:'), error.message);
    process.exit(1);
  }
}

module.exports = { devCommand };
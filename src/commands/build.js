/**
 * Build Command
 * Build project (placeholder for MVP)
 */

const chalk = require('chalk');
const { detectProjectTypes, getPrimaryProjectType } = require('../detector');
const { executeCommand, validateTools } = require('../installer');
const { loadConfig } = require('../config');

/**
 * Build command handler
 */
async function buildCommand() {
  try {
    const projectPath = process.cwd();
    
    console.log(chalk.blue('Building project...'));
    
    // Check if taiz project exists
    const config = await loadConfig(projectPath);
    
    // Check for custom build script in taiz.yaml
    if (config.scripts && config.scripts.build && config.scripts.build !== 'taiz build') {
      console.log(chalk.gray(`Running custom build script: ${config.scripts.build}`));
      const [command, ...args] = config.scripts.build.split(' ');
      await executeCommand(command, args);
      return;
    }
    
    // Detect project types
    const detectedTypes = await detectProjectTypes(projectPath);
    
    if (detectedTypes.length === 0) {
      console.error(chalk.red('No project types detected. Cannot build project.'));
      process.exit(1);
    }
    
    const primaryType = await getPrimaryProjectType(projectPath);
    
    console.log(chalk.gray(`Building ${primaryType.type} project`));
    
    // Validate tools
    if (!(await validateTools(primaryType.type))) {
      process.exit(1);
    }
    
    // Build based on project type
    let command, args;
    
    switch (primaryType.type) {
      case 'node':
        // Try common Node.js build commands
        const fs = require('fs-extra');
        const path = require('path');
        const packageJsonPath = path.join(projectPath, 'package.json');
        
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath);
          
          if (packageJson.scripts && packageJson.scripts.build) {
            command = 'npm';
            args = ['run', 'build'];
          } else {
            console.log(chalk.yellow('No build script found in package.json'));
            console.log(chalk.gray('This is a placeholder build command. Add a "build" script to package.json for actual building.'));
            return;
          }
        }
        break;
        
      case 'python':
        console.log(chalk.yellow('Python build is a placeholder in this MVP.'));
        console.log(chalk.gray('For actual Python building, consider using setuptools, poetry, or other build tools.'));
        return;
        
      case 'rust':
        command = 'cargo';
        args = ['build', '--release'];
        break;
        
      case 'go':
        command = 'go';
        args = ['build'];
        break;
        
      default:
        console.log(chalk.yellow(`Build not implemented for ${primaryType.type} projects in this MVP.`));
        return;
    }
    
    console.log(chalk.blue(`Building ${primaryType.type} project...`));
    await executeCommand(command, args);
    console.log(chalk.green('✓ Build completed successfully'));
    
  } catch (error) {
    console.error(chalk.red('Build failed:'), error.message);
    process.exit(1);
  }
}

module.exports = { buildCommand };
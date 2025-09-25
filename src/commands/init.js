/**
 * Init Command
 * Initialize a new taiz project
 */

const chalk = require('chalk');
const path = require('path');
const { detectProjectTypes } = require('../detector');
const { initializeProject } = require('../config');

/**
 * Initialize command handler
 */
async function initCommand() {
  try {
    const projectPath = process.cwd();
    const projectName = path.basename(projectPath);
    
    console.log(chalk.blue(`Initializing taiz project in ${projectPath}`));
    
    // Detect existing project types
    console.log(chalk.gray('Detecting project types...'));
    const detectedTypes = await detectProjectTypes(projectPath);
    
    if (detectedTypes.length === 0) {
      console.log(chalk.yellow('No existing project files detected. Creating generic taiz project.'));
    } else {
      console.log(chalk.green(`Detected project types: ${detectedTypes.map(t => t.type).join(', ')}`));
      detectedTypes.forEach(type => {
        console.log(chalk.gray(`  - ${type.type}: found ${type.detectedFile}`));
      });
    }
    
    // Initialize the project
    await initializeProject(projectName, detectedTypes, projectPath);
    
    console.log(chalk.green('✓ Created taiz.yaml'));
    console.log(chalk.green('✓ Created taiz-lock.yaml'));
    console.log(chalk.blue('\nProject initialized successfully!'));
    
    if (detectedTypes.length > 0) {
      console.log(chalk.gray('\nYou can now use:'));
      console.log(chalk.gray('  taiz install <module>  - Install dependencies'));
      console.log(chalk.gray('  taiz dev              - Start development server'));
      console.log(chalk.gray('  taiz run <script>     - Run custom scripts'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error.message);
    process.exit(1);
  }
}

module.exports = { initCommand };
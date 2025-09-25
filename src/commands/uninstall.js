/**
 * Uninstall Command
 * Remove dependencies from project
 */

const chalk = require('chalk');
const { detectProjectTypes, getPrimaryProjectType } = require('../detector');
const { uninstallPackage, validateTools } = require('../installer');
const { removeDependency, loadConfig } = require('../config');

/**
 * Uninstall command handler
 * @param {string} module - Module name to uninstall
 */
async function uninstallCommand(module) {
  try {
    const projectPath = process.cwd();
    
    console.log(chalk.blue(`Uninstalling ${module}...`));
    
    // Check if taiz project exists
    const config = await loadConfig(projectPath);
    if (!config.name) {
      console.log(chalk.yellow('No taiz.yaml found. Run "taiz init" first.'));
      return;
    }
    
    // Detect project types
    const detectedTypes = await detectProjectTypes(projectPath);
    
    if (detectedTypes.length === 0) {
      console.error(chalk.red('No project types detected'));
      process.exit(1);
    }
    
    const primaryType = await getPrimaryProjectType(projectPath);
    
    console.log(chalk.gray(`Uninstalling from ${primaryType.type} project...`));
    
    // Validate tools
    if (!(await validateTools(primaryType.type))) {
      process.exit(1);
    }
    
    // Check if module exists in dependencies
    const hasDep = (config.dependencies && config.dependencies[primaryType.type] && config.dependencies[primaryType.type][module]) ||
                   (config.devDependencies && config.devDependencies[primaryType.type] && config.devDependencies[primaryType.type][module]);
    
    if (!hasDep) {
      console.log(chalk.yellow(`${module} is not listed in taiz.yaml dependencies`));
      console.log(chalk.gray('Proceeding with uninstall anyway...'));
    }
    
    // Uninstall the package
    await uninstallPackage(module, primaryType.type);
    
    // Update taiz configuration
    await removeDependency(module, primaryType.type, projectPath);
    
    console.log(chalk.green(`✓ Uninstalled ${module}`));
    console.log(chalk.green('✓ Updated taiz.yaml'));
    console.log(chalk.green('✓ Updated taiz-lock.yaml'));
    
    // Handle polyglot projects
    if (detectedTypes.length > 1) {
      console.log(chalk.blue('\nPolyglot project detected!'));
      console.log(chalk.gray(`Uninstalled from ${primaryType.type}. Check other ecosystems manually if needed.`));
    }
    
  } catch (error) {
    console.error(chalk.red('Uninstallation failed:'), error.message);
    process.exit(1);
  }
}

module.exports = { uninstallCommand };
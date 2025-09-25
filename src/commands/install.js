/**
 * Install Command
 * Install dependencies across different project types
 */

const chalk = require('chalk');
const { detectProjectTypes, getPrimaryProjectType } = require('../detector');
const { installPackage, validateTools } = require('../installer');
const { addDependency, loadConfig } = require('../config');

/**
 * Install all dependencies from taiz.yaml
 * @param {string} projectPath - Project directory path
 */
async function installAllDependencies(projectPath = process.cwd()) {
  const config = await loadConfig(projectPath);
  const detectedTypes = await detectProjectTypes(projectPath);
  
  if (!config.dependencies && !config.devDependencies) {
    console.log(chalk.yellow('No dependencies found in taiz.yaml'));
    return;
  }
  
  let totalInstalled = 0;
  
  // Install regular dependencies
  if (config.dependencies) {
    for (const [projectType, deps] of Object.entries(config.dependencies)) {
      if (!await validateTools(projectType)) {
        console.log(chalk.yellow(`Skipping ${projectType} dependencies - tools not available`));
        continue;
      }
      
      console.log(chalk.blue(`\nInstalling ${projectType} dependencies...`));
      
      for (const [module, versionSpec] of Object.entries(deps)) {
        try {
          console.log(chalk.gray(`Installing ${module}...`));
          await installPackage(module, projectType);
          console.log(chalk.green(`✓ ${module}`));
          totalInstalled++;
        } catch (error) {
          console.log(chalk.red(`✗ Failed to install ${module}: ${error.message}`));
        }
      }
    }
  }
  
  // Install dev dependencies
  if (config.devDependencies) {
    for (const [projectType, deps] of Object.entries(config.devDependencies)) {
      if (!await validateTools(projectType)) {
        console.log(chalk.yellow(`Skipping ${projectType} dev dependencies - tools not available`));
        continue;
      }
      
      console.log(chalk.blue(`\nInstalling ${projectType} dev dependencies...`));
      
      for (const [module, versionSpec] of Object.entries(deps)) {
        try {
          console.log(chalk.gray(`Installing ${module} (dev)...`));
          await installPackage(module, projectType, { dev: true });
          console.log(chalk.green(`✓ ${module} (dev)`));
          totalInstalled++;
        } catch (error) {
          console.log(chalk.red(`✗ Failed to install ${module}: ${error.message}`));
        }
      }
    }
  }
  
  console.log(chalk.green(`\n✓ Installed ${totalInstalled} packages`));
}

/**
 * Install command handler
 * @param {string} module - Module name to install (optional)
 * @param {Object} options - Command options
 */
async function installCommand(module, options = {}) {
  try {
    const { global = false } = options;
    const projectPath = process.cwd();
    
    // If no module specified, install all dependencies
    if (!module) {
      if (global) {
        console.log(chalk.yellow('Cannot install all dependencies globally. Specify a module name for global installation.'));
        return;
      }
      
      console.log(chalk.blue('Installing all dependencies from taiz.yaml...'));
      
      // Check if taiz project exists
      const config = await loadConfig(projectPath);
      if (!config.name) {
        console.log(chalk.yellow('No taiz.yaml found. Run "taiz init" first.'));
        return;
      }
      
      await installAllDependencies(projectPath);
      return;
    }
    
    // Single module installation
    console.log(chalk.blue(`Installing ${module}${global ? ' globally' : ''}...`));
    
    if (!global) {
      // Check if taiz project exists
      const config = await loadConfig(projectPath);
      if (!config.name) {
        console.log(chalk.yellow('No taiz.yaml found. Run "taiz init" first or use --global flag.'));
        return;
      }
    }
    
    // Detect project types
    const detectedTypes = await detectProjectTypes(projectPath);
    
    if (detectedTypes.length === 0 && !global) {
      console.log(chalk.yellow('No project types detected. Use --global flag or initialize a project first.'));
      return;
    }
    
    // For global installs, try to install in all available ecosystems
    if (global) {
      console.log(chalk.gray('Global installation - checking available package managers...'));
      
      const ecosystems = ['node', 'python'];
      let installed = false;
      
      for (const ecosystem of ecosystems) {
        if (await validateTools(ecosystem)) {
          try {
            console.log(chalk.blue(`Installing ${module} in ${ecosystem} ecosystem...`));
            const version = await installPackage(module, ecosystem, { global: true });
            console.log(chalk.green(`✓ Installed ${module}@${version} globally in ${ecosystem}`));
            installed = true;
          } catch (error) {
            console.log(chalk.yellow(`⚠ Failed to install in ${ecosystem}: ${error.message}`));
          }
        }
      }
      
      if (!installed) {
        console.error(chalk.red('Failed to install in any ecosystem'));
        process.exit(1);
      }
      
      return;
    }
    
    // Local project installation
    const primaryType = await getPrimaryProjectType(projectPath);
    
    if (!primaryType) {
      console.error(chalk.red('No supported project type detected'));
      process.exit(1);
    }
    
    console.log(chalk.gray(`Installing in ${primaryType.type} project...`));
    
    // Validate tools
    if (!(await validateTools(primaryType.type))) {
      process.exit(1);
    }
    
    // Install the package
    const version = await installPackage(module, primaryType.type);
    
    // Update taiz configuration
    await addDependency(module, version, primaryType.type, false, projectPath);
    
    console.log(chalk.green(`✓ Installed ${module}@${version}`));
    console.log(chalk.green('✓ Updated taiz.yaml'));
    console.log(chalk.green('✓ Updated taiz-lock.yaml'));
    
    // Handle polyglot projects
    if (detectedTypes.length > 1) {
      console.log(chalk.blue('\nPolyglot project detected!'));
      console.log(chalk.gray(`Installed in ${primaryType.type}. Other detected types: ${detectedTypes.filter(t => t.type !== primaryType.type).map(t => t.type).join(', ')}`));
      console.log(chalk.gray('To install in other ecosystems, specify the ecosystem or run the command in those project contexts.'));
    }
    
  } catch (error) {
    console.error(chalk.red('Installation failed:'), error.message);
    process.exit(1);
  }
}

module.exports = { installCommand };
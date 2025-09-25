/**
 * Run Command
 * Run custom scripts defined in taiz.yaml
 */

const chalk = require('chalk');
const { executeCommand } = require('../installer');
const { loadConfig } = require('../config');

/**
 * Run command handler
 * @param {string} scriptName - Name of the script to run
 */
async function runCommand(scriptName) {
  try {
    const projectPath = process.cwd();
    
    console.log(chalk.blue(`Running script: ${scriptName}`));
    
    // Load taiz configuration
    const config = await loadConfig(projectPath);
    
    if (!config.scripts || !config.scripts[scriptName]) {
      console.error(chalk.red(`Script "${scriptName}" not found in taiz.yaml`));
      
      if (config.scripts && Object.keys(config.scripts).length > 0) {
        console.log(chalk.gray('Available scripts:'));
        Object.keys(config.scripts).forEach(script => {
          console.log(chalk.gray(`  - ${script}: ${config.scripts[script]}`));
        });
      } else {
        console.log(chalk.gray('No scripts defined in taiz.yaml'));
        console.log(chalk.gray('Add scripts to the "scripts" section in taiz.yaml'));
      }
      
      process.exit(1);
    }
    
    const scriptCommand = config.scripts[scriptName];
    console.log(chalk.gray(`Executing: ${scriptCommand}`));
    
    // Parse and execute the command
    const [command, ...args] = scriptCommand.split(' ');
    await executeCommand(command, args);
    
    console.log(chalk.green(`✓ Script "${scriptName}" completed successfully`));
    
  } catch (error) {
    console.error(chalk.red(`Script "${scriptName}" failed:`), error.message);
    process.exit(1);
  }
}

module.exports = { runCommand };
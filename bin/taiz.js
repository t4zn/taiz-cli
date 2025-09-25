#!/usr/bin/env node

/**
 * Taiz CLI Entry Point
 * Global entry point for the taiz polyglot package manager
 */

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// Import CLI commands
const { initCommand } = require('../src/commands/init');
const { installCommand } = require('../src/commands/install');
const { uninstallCommand } = require('../src/commands/uninstall');
const { devCommand } = require('../src/commands/dev');
const { buildCommand } = require('../src/commands/build');
const { runCommand } = require('../src/commands/run');

// Set up the CLI program
program
  .name('taiz')
  .description('A polyglot package manager for developers')
  .version('1.0.0');

// Register commands
program
  .command('init')
  .description('Initialize a new project with taiz.yaml config')
  .action(initCommand);

program
  .command('install [module]')
  .alias('i')
  .description('Install dependencies. If no module specified, installs all dependencies from taiz.yaml')
  .option('-g, --global', 'Install globally')
  .action(installCommand);

program
  .command('uninstall <module>')
  .description('Remove a dependency and update taiz.yaml')
  .action(uninstallCommand);

program
  .command('dev')
  .description('Start development server based on project type')
  .action(devCommand);

program
  .command('build')
  .description('Build the project (placeholder for MVP)')
  .action(buildCommand);

program
  .command('run <script>')
  .description('Run a script defined in taiz.yaml')
  .action(runCommand);

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
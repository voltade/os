#!/usr/bin/env bun

import { Command, Option } from 'commander';

import { appCommand } from './app/index.ts';
import { authCommand } from './auth.ts';
import { environmentCommand } from './environment/index.ts';
import { initConfig } from './utils/config.js';

export type GlobalOptions = {
  org?: string;
};

await initConfig();

const program = new Command();

program
  .name('voltade')
  .description('Voltade OS CLI tools')
  .version('0.1.0')
  .addOption(new Option('--org <orgSlug>', 'Filter by organization slug'));

// Add database command
program.addCommand(environmentCommand);
program.addCommand(authCommand);
program.addCommand(appCommand);

program.parse();

export { program };

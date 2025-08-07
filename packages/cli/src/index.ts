#!/usr/bin/env bun

import { Command } from 'commander';

import { appCommand } from './app/index.ts';
import { authCommand } from './auth.ts';
import { environmentCommand } from './environment/index.ts';

const program = new Command();

program.name('voltade').description('Voltade OS CLI tools').version('0.1.0');

// Add database command
program.addCommand(environmentCommand);
program.addCommand(authCommand);
program.addCommand(appCommand);

program.parse();

import { Command } from 'commander';

import { databaseCommand } from './database/index.ts';
import { getEnvironment } from './get.ts';
import { listEnvironments } from './list.ts';

export const environmentCommand = new Command('environment')
  .alias('env')
  .description('Environment operations')
  .option('--org <orgname>', 'Filter by organization name')
  .addCommand(
    new Command('list')
      .description('List environments')
      .action(listEnvironments),
  )
  .addCommand(
    new Command('get')
      .description('Get environment details')
      .action(getEnvironment),
  )
  .addCommand(databaseCommand);

export type EnvironmentOptions = {
  org?: string;
};

import { Command } from 'commander';

import { getDatabaseCredentials } from './cred.ts';
import { resetDatabase } from './reset.ts';

export const databaseCommand = new Command('database')
  .alias('db')
  .description('Database operations')
  .addCommand(
    new Command('reset')
      .description('Reset the database')
      .action(resetDatabase),
  )
  .addCommand(
    new Command('credentials')
      .alias('cred')
      .description('Get database credentials')
      .action(getDatabaseCredentials),
  );

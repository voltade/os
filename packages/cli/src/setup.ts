import { Command } from 'commander';

export const setupCommand = new Command('setup')
  .alias('setup')
  .description('Setup operations')
  .action(async () => {
    console.log('setup');
  });

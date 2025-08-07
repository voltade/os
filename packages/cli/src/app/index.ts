import { Command } from 'commander';

import { listApps } from './list.ts';

export const appCommand = new Command('app')
  .description('App operations')
  .option('--org <orgSlug>', 'Filter by organization slug')
  .addCommand(new Command('list').description('List apps').action(listApps));

export type AppOptions = {
  org?: string;
};

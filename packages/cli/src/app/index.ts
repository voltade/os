import { Command } from 'commander';

import type { GlobalOptions } from '#src/index.ts';
import { buildApp } from './build.ts';
import { installApp } from './install.ts';
import { listApps } from './list.ts';

export const appCommand = new Command('app')
  .description('App operations')
  .addCommand(new Command('list').description('List apps').action(listApps))
  .addCommand(
    new Command('build')
      .description('Build and upload an app source bundle')
      .argument('<folder>', 'Source folder path')
      .option('--app <appId>', 'App ID to build')
      .action(buildApp),
  )
  .addCommand(
    new Command('install').description('Install an app').action(installApp),
  );

export type AppOptions = GlobalOptions & {};

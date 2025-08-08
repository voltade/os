import type { Command } from 'commander';

import { app } from '#src/utils/app.ts';
import { getFinalOptions } from '#src/utils/index.ts';
import type { AppOptions } from './index.ts';

export async function listApps(this: Command) {
  const options = getFinalOptions<AppOptions>(this);

  const apps = await app.list(options.org);

  console.log(apps);
}

import type { Command } from 'commander';

import { api } from '#src/utils/api.ts';
import { getFinalOptions } from '#src/utils/index.ts';
import type { AppOptions } from './index.ts';

export async function listApps(command: Command) {
  const options = getFinalOptions<AppOptions>(command);

  const apps = await api.app.$get({ query: { org_id: options.org } });

  console.log(apps);
}

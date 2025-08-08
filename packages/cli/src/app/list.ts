import type { Command } from 'commander';

import { api } from '#src/utils/api.ts';
import { getFinalOptions } from '#src/utils/index.ts';
import type { AppOptions } from './index.ts';

export async function listApps(this: Command) {
  const options = getFinalOptions<AppOptions>(this);

  console.log(options);

  const res = await api.app.$get({ query: { org_id: options.org } });

  const data = await res.json();

  console.log(data);
}

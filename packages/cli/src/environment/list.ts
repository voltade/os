import type { Command } from 'commander';

import { getEnvironments, getFinalOptions } from '../utils/index.ts';
import type { EnvironmentOptions } from './index.ts';

export async function listEnvironments(this: Command) {
  const options = getFinalOptions<EnvironmentOptions>(this);
  const environments = await getEnvironments();

  const filtered = options.org
    ? environments.filter((env) => env.org === options.org)
    : environments;

  console.log(filtered);
}

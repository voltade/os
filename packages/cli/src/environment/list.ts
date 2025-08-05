import type { Command } from 'commander';

import { getEnvironments, getFinalOptions } from '../utils/index.ts';
import type { EnvironmentOptions } from './index.ts';

export async function listEnvironments(_options: unknown, command: Command) {
  const options = getFinalOptions<EnvironmentOptions>(command);
  const environments = await getEnvironments();

  const filtered = options.org
    ? environments.filter((env) => env.org === options.org)
    : environments;

  console.log(filtered);
}

import type { Command } from 'commander';

import { getEnvironments, getFinalOptions } from '../utils/index.ts';
import type { EnvironmentOptions } from './index.ts';

export async function listEnvironments(this: Command) {
  const options = getFinalOptions<EnvironmentOptions>(this);
  if (!options.org) {
    throw new Error(
      'Organization is required add --org <org-id> to the command',
    );
  }
  const environments = await getEnvironments(options.org);

  console.log(environments);
}

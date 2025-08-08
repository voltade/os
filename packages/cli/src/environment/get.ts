import { select } from '@inquirer/prompts';
import type { Command } from 'commander';

import {
  getDetails,
  getEnvironments,
  getFinalOptions,
} from '#src/utils/index.ts';
import type { EnvironmentOptions } from './index.ts';

export async function getEnvironment(this: Command) {
  const options = getFinalOptions<EnvironmentOptions>(this);

  const allEnvironments = await getEnvironments();
  const environments = options.org
    ? allEnvironments.filter((env) => env.org === options.org)
    : allEnvironments;

  const selectedEnvironment = await select({
    message: 'Select an environment:',
    choices: environments.map((env) => ({
      name: `${env.org}-${env.env}`,
      value: env.name,
    })),
  });

  const details = await getDetails(selectedEnvironment);

  console.log(JSON.stringify(details, null, 2));
}

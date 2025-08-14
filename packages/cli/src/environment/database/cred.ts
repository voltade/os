import { $ } from 'bun';
import { select } from '@inquirer/prompts';
import type { Command } from 'commander';

import { getEnvironments, getFinalOptions } from '#src/utils/index.ts';
import type { EnvironmentOptions } from '../index.ts';

export async function getDatabaseCredentials(command: Command) {
  const options = getFinalOptions<EnvironmentOptions>(command);
  if (!options.org) {
    throw new Error(
      'Organization is required add --org <org-id> to the command',
    );
  }
  const allEnvironments = await getEnvironments(options.org);
  const environments = options.org
    ? allEnvironments.filter((env) => env.org === options.org)
    : allEnvironments;

  if (environments.length === 0) {
    console.log('No environments found.');
    return;
  }

  const selectedEnvironment = await select({
    message: 'Select an environment:',
    choices: environments.map((env) => ({
      name: `${env.org}-${env.env}`,
      value: env.name,
    })),
  });

  const namespace = environments.find(
    (env) => env.name === selectedEnvironment,
  )?.namespace;

  if (!namespace) {
    console.error('Environment not found.');
    return;
  }

  const secret =
    await $`kubectl get secret -n ${namespace} cnpg-cluster-app -o json`.text();

  const parsedCredentials = JSON.parse(secret);

  const credentials = Object.fromEntries(
    Object.entries(parsedCredentials.data).map(([key, value]) => [
      key,
      Buffer.from(value as string, 'base64').toString('utf-8'),
    ]),
  );

  console.log(credentials);
}

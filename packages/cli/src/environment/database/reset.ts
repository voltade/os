import { $ } from 'bun';
import { confirm, select } from '@inquirer/prompts';
import type { Command } from 'commander';

import { getEnvironments, getFinalOptions } from '#src/utils/index.ts';
import type { EnvironmentOptions } from '../index.ts';

export async function resetDatabase(command: Command) {
  try {
    const options = getFinalOptions<EnvironmentOptions>(command);

    const allEnvironments = await getEnvironments();
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

    const shouldReset = await confirm({
      message:
        'Are you sure you want to reset the database? This will delete all data.',
      default: false,
    });

    if (!shouldReset) {
      console.log('Database reset cancelled.');
      return;
    }

    console.log('Resetting database...');

    const namespace = environments.find(
      (env) => env.name === selectedEnvironment,
    )?.namespace;

    if (!namespace) {
      console.error('Environment not found.');
      return;
    }

    console.log(`📍 Namespace: ${namespace}`);

    try {
      console.log('🗑️  Dropping database...');
      await $`kubectl cnpg psql cnpg-cluster -n ${namespace} -- -c "drop database app with (force)"`;

      console.log('🔄 Patching database to absent...');
      await $`kubectl patch database app --type=merge -n ${namespace} -p '{"spec":{"ensure":"absent"}}'`;

      console.log('🔄 Patching database to present...');
      await $`kubectl patch database app --type=merge -n ${namespace} -p '{"spec":{"ensure":"present"}}'`;

      console.log('🏗️  Creating schema and extensions...');
      const sqlCommands = [
        'create schema if not exists extensions;',
        'create extension supabase_vault cascade;',
        'grant usage on schema vault to app;',
        'grant execute on all functions in schema vault to app;',
        'grant select on all tables in schema vault to app;',
        'grant references on all tables in schema vault to app;',
      ].join(' ');

      await $`kubectl cnpg psql cnpg-cluster -n ${namespace} -- -d app -c ${sqlCommands}`;

      console.log('✅ Database reset completed successfully!');
    } catch (execError) {
      console.error('❌ Database reset failed during execution:', execError);
      throw execError;
    }
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  }
}

import fs from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'bun';
import { select } from '@inquirer/prompts';
import { Args } from '@oclif/core';
import { titleCase } from 'scule';
import slug from 'slug';
import z from 'zod';

import { BaseCommand } from '#src/base.ts';

const packageJsonSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  scripts: z
    .object({
      build: z.string().optional(),
    })
    .optional(),
});

export default class Install extends BaseCommand {
  static override args = {
    appPath: Args.string(),
  };

  public async run(): Promise<void> {
    const { spinner, honoClient, authClient } = this;
    console.log('Installing app...');

    spinner.start('Fetching organizations...');
    const orgsRes = await honoClient.organization.$get();
    spinner.stop();
    const orgs = await orgsRes.json();
    if (!orgs || orgs.length === 0) {
      this.error('You must create an organization before installing an app.');
    }

    const orgId = await select({
      message: 'Select organization',
      choices: orgs
        .filter((org) => !!org)
        .map((org) => ({
          name: `${org.name} (${org.id})`,
          value: org.id,
        })),
    });
    await authClient.organization.setActive({ organizationId: orgId });

    spinner.start('Fetching environments...');
    const environmentsRes = await honoClient.environment.$get({
      query: { orgId },
    });
    spinner.stop();
    const environments = await environmentsRes.json();
    if (!environments || environments.length === 0) {
      this.error('You must create an environment before installing an app.');
    }

    const envId = await select({
      message: 'Select environment',
      choices: environments
        .filter((env) => !!env)
        .map((env) => ({
          name: `${env.name} (${env.id})`,
          value: env.id,
        })),
    });

    const { args } = await this.parse(Install);
    const appFullPath = args.appPath
      ? path.resolve(args.appPath)
      : process.cwd();

    const parseRes = packageJsonSchema.safeParse(
      JSON.parse(
        await fs.readFile(path.join(appFullPath, 'package.json'), 'utf-8'),
      ),
    );
    if (!parseRes.success) {
      this.error(`Invalid package.json: ${parseRes.error.message}`);
    }
    const pkgJson = parseRes.data;

    spinner.start('Fetching app...');
    const appsRes = await honoClient.app.$get({
      query: { org_id: orgId },
    });
    spinner.stop();
    const apps = await appsRes.json();

    const appSlug = slug(pkgJson.name);
    let app = apps.find((a) => a.slug === appSlug);
    if (!app) {
      spinner.warn(`App ${appSlug} not found in this organization.`);
      spinner.start(`Creating app ${appSlug}...`);
      const createAppRes = await honoClient.app.$post({
        json: {
          slug: appSlug,
          name: titleCase(appSlug),
          description: pkgJson.description,
          git_repo_url: 'http://example.com/repo.git',
          build_command: `bun run build`,
        },
      });
      spinner.stop();
      if (!createAppRes.ok) {
        const error = await createAppRes.text();
        this.error(`Failed to create app: ${error}`);
      }
      app = await createAppRes.json();
    }

    spinner.start(`Building app ${appSlug}...`);
    const buildCommand = app.build_command ?? 'bun run build';

    $.cwd(appFullPath);
    await $`${{ raw: buildCommand }}`;

    spinner.stop();
  }
}

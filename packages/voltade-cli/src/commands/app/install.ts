import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';
import { select } from '@inquirer/prompts';
import { Args, Flags } from '@oclif/core';
import { titleCase } from 'scule';
import slug from 'slug';
import * as tar from 'tar';
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
  static override flags = {
    ...BaseCommand.flags,
    'skip-build': Flags.boolean({
      description: 'Skip the build step and only install the app',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { spinner, honoClient, authClient } = this;
    const { args, flags } = await this.parse(Install);

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

    const appFullPath = args.appPath
      ? path.resolve(args.appPath)
      : process.cwd();

    const parseRes = packageJsonSchema.safeParse(
      JSON.parse(
        fs.readFileSync(path.join(appFullPath, 'package.json'), 'utf-8'),
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

    const appSlug = slug(pkgJson.name.replace('/', '-'));
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
          output_path: 'dist',
        },
      });
      spinner.stop();
      if (!createAppRes.ok) {
        const error = await createAppRes.text();
        this.error(`Failed to create app: ${error}`);
      }
      app = await createAppRes.json();
    }

    if (flags['skip-build']) {
      this.log(`Skipping build for app ${appSlug}.`);
    } else {
      this.log(`Building app ${appSlug}...`);
      const buildCommand = app.build_command ?? 'bun run build';
      $.cwd(appFullPath);
      await $`${{ raw: buildCommand }}`;
    }

    spinner.start(`Creating app build...`);
    const appBuildRes = await honoClient.app_build.s3.signed_url.$post({
      json: {
        orgId,
        appId: app.id,
      },
    });
    if (!appBuildRes.ok) {
      const error = await appBuildRes.text();
      this.error(`Failed to create app build: ${error}`);
    }
    const { appBuild, uploadUrl } = await appBuildRes.json();
    spinner.stop();

    const outputPath = path.resolve(appFullPath, app.output_path);
    if (!fs.existsSync(outputPath)) {
      this.error(`Output path ${outputPath} does not exist.`);
    }
    const tmpDir = process.env.TMPDIR || '/tmp';
    const tarFilePath = path.join(tmpDir, `${appBuild.id}.tar.gz`);

    spinner.start(`Archiving app build...`);
    await tar.create(
      {
        gzip: true,
        cwd: outputPath,
        file: tarFilePath,
        portable: true,
      },
      ['.'],
    );
    spinner.stop();
    this.log(`App build archived to ${tarFilePath}`);
    const tarFile = Bun.file(tarFilePath);

    spinner.start(`Uploading app build...`);
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: tarFile,
    });
    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      this.error(`Failed to upload app build: ${error}`);
    }
    spinner.stop();
    this.log(`App build uploaded successfully.`);

    await honoClient.app_build[':buildId'].status.$patch({
      param: {
        buildId: appBuild.id,
      },
      json: {
        orgId,
        appId: app.id,
        status: 'ready',
      },
    });

    spinner.start(`Installing app build...`);
    const installRes = await honoClient.app_installation.$post({
      json: {
        organization_id: orgId,
        environment_id: envId,
        app_id: app.id,
        app_build_id: appBuild.id,
      },
    });
    if (!installRes.ok) {
      const error = await installRes.text();
      this.error(`Failed to install app: ${error}`);
    }
    spinner.stop();
  }
}

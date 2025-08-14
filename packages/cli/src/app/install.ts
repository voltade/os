import { confirm, select } from '@inquirer/prompts';
import type { Command } from 'commander';

import { api } from '#src/utils/api.ts';
import { app as appUtils } from '#src/utils/app.ts';
import { appBuild } from '#src/utils/app_build.ts';
import { getEnvironments } from '#src/utils/environments.ts';
import { org } from '#src/utils/orgs.ts';

// local shapes for selections
type OrganizationItem = { id: string; slug: string; name?: string | null };
type AppItem = { id: string; slug: string; name?: string | null };
type BuildItem = { id: string; status: string; created_at: string };

export async function installApp(this: Command) {
  // Interactive selection: Organization (choose by slug, store id)
  const orgsRes = await org.list();
  const orgs = (
    Array.isArray(orgsRes) ? orgsRes.filter(Boolean) : []
  ) as OrganizationItem[];
  if (orgs.length === 0) throw new Error('No organizations found');

  const selectedOrgId = await select<string>({
    message: 'Select organization',
    choices: orgs.map((o) => ({
      name: o.slug + (o.name ? ` — ${o.name}` : ''),
      value: o.id as string,
    })),
  });
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);
  if (!selectedOrg) throw new Error('Selected organization not found');

  // Interactive selection: App (choose by slug, store id)
  const appsRes = await appUtils.list(selectedOrgId);
  const apps = (
    Array.isArray(appsRes) ? appsRes.filter(Boolean) : []
  ) as AppItem[];
  if (apps.length === 0)
    throw new Error(`No apps found for org ${selectedOrg.slug}`);

  const selectedAppId = await select<string>({
    message: 'Select app',
    choices: apps.map((a) => ({
      name: a.slug + (a.name ? ` — ${a.name}` : ''),
      value: a.id as string,
    })),
  });
  const selectedApp = apps.find((a) => a.id === selectedAppId);
  if (!selectedApp) throw new Error('Selected app not found');

  // Interactive selection: Environment
  const environments = await getEnvironments(selectedOrg.id);
  const orgEnvironments = environments.filter(
    (env) => env.org === selectedOrg.id,
  );
  if (orgEnvironments.length === 0)
    throw new Error(`No environments found for org ${selectedOrg.slug}`);

  const selectedEnvId = await select<string>({
    message: 'Select environment',
    choices: orgEnvironments.map((env) => ({
      name: `${env.env} (${env.namespace})`,
      value: env.id,
    })),
  });

  const selectedEnvironment = orgEnvironments.find(
    (env) => env.id === selectedEnvId,
  );
  if (!selectedEnvironment) throw new Error('Selected environment not found');

  // Confirmation
  const proceed = await confirm({
    message: `Install app '${selectedApp.slug}' to environment '${selectedEnvironment.env}' in org '${selectedOrg.slug}'?`,
    default: true,
  });
  if (!proceed) {
    console.log('Aborted.');
    return;
  }

  try {
    // List available builds for the selected app
    console.log('Loading available builds...');
    const buildsRes = await appBuild.list(selectedAppId, selectedOrgId);

    if ('error' in buildsRes) {
      throw new Error(`Failed to load builds: ${buildsRes.error}`);
    }

    const builds = (Array.isArray(buildsRes) ? buildsRes : []) as BuildItem[];
    if (builds.length === 0) {
      throw new Error(
        `No builds found for app ${selectedApp.slug}. Please create a build first.`,
      );
    }

    // Interactive selection: Build
    const selectedBuildId = await select<string>({
      message: 'Select build',
      choices: builds.map((build) => ({
        name: `${build.id} - ${build.status} (${new Date(build.created_at).toLocaleString()})`,
        value: build.id,
      })),
    });

    console.log(`Selected build: ${selectedBuildId}`);

    // Create app installation with the build ID
    const installationRes = await api.app_installation.$post({
      json: {
        app_id: selectedAppId,
        environment_id: selectedEnvId,
        organization_id: selectedOrgId,
        app_build_id: selectedBuildId,
      },
    });

    let installation: unknown;

    if (!installationRes.ok) {
      const errorText = await installationRes.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(errorText);
      } catch {}

      const alreadyExists =
        installationRes.status === 400 &&
        parsed !== null &&
        typeof parsed === 'object' &&
        'error' in parsed &&
        (parsed as { error: string }).error ===
          'App installation already exists';

      if (alreadyExists) {
        const updateConfirm = await confirm({
          message: `App '${selectedApp.slug}' is already installed in environment '${selectedEnvironment.env}'. Do you want to update it to the selected build?`,
          default: true,
        });

        if (!updateConfirm) {
          console.log('Update cancelled.');
          return;
        }

        // Update existing installation with new build
        const updateRes = await api.app_installation.$put({
          json: {
            app_id: selectedAppId,
            environment_id: selectedEnvId,
            organization_id: selectedOrgId,
            app_build_id: selectedBuildId,
          },
        });

        if (!updateRes.ok) {
          const updateErrorText = await updateRes.text();
          console.error(
            `Update failed: ${updateRes.status} ${updateErrorText}`,
          );
          process.exit(1);
        }

        installation = await updateRes.json();
        console.log(
          JSON.stringify(
            {
              success: true,
              message: `App '${selectedApp.slug}' updated successfully in environment '${selectedEnvironment.env}'`,
              buildId: selectedBuildId,
              installation,
            },
            null,
            2,
          ),
        );
        return;
      }

      // Other errors
      console.error(
        `Installation failed: ${installationRes.status} ${errorText}`,
      );
      process.exit(1);
    } else {
      installation = await installationRes.json();
    }

    console.log(
      JSON.stringify(
        {
          success: true,
          message: `App '${selectedApp.slug}' installed successfully to environment '${selectedEnvironment.env}'`,
          buildId: selectedBuildId,
          installation,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error('Installation failed:', error);
    throw error;
  }
}

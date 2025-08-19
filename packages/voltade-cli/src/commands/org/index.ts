import { select } from '@inquirer/prompts';

import { BaseCommand } from '#src/base.ts';

export default class Org extends BaseCommand {
  public async run(): Promise<void> {
    const { spinner, authClient } = this;

    const { data: session } = await authClient.getSession();
    if (!session) {
      spinner.fail('You are not logged in');
      this.error('Please log in first using the `voltade login` command.');
    }
    const activeOrganizationId = session.session.activeOrganizationId;

    spinner.start('Loading organizations...');
    const { data: orgs } = await authClient.organization.list();
    spinner.stop();
    if (!orgs?.length) {
      spinner.fail('No organizations found');
      this.error('You need to create an organization first.');
    }

    const selectedId = await select({
      message: 'Select an organization:',
      choices: orgs.map((org) => ({
        name: activeOrganizationId === org.id ? `* ${org.name}` : org.name,
        value: org.id,
      })),
    });

    if (selectedId && selectedId !== activeOrganizationId) {
      spinner.start('Switching organization...');
      await authClient.organization.setActive({ organizationId: selectedId });
      spinner.stop();
      this.log(
        `Switched to organization: ${orgs.find((org) => org.id === selectedId)?.name}`,
      );
    }
  }
}

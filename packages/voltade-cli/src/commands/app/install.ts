import { BaseCommand } from '#src/base.ts';

export default class Install extends BaseCommand {
  public async run(): Promise<void> {
    const { spinner, honoClient } = this;
    console.log('Installing app...');

    spinner.start('Getting organizations...');
    const orgsRes = await honoClient.organization.$get();
    spinner.stop();

    const orgs = await orgsRes.json();
    console.log(orgs);
  }
}

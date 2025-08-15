import { BaseCommand } from '#src/base.ts';

export default class Whoami extends BaseCommand {
  static override description = 'Who am I?';

  public async run(): Promise<void> {
    const { spinner, authClient } = this;

    spinner.start('Retrieving session...');
    const sessionRes = await authClient.getSession();
    if (sessionRes.error) {
      this.spinner.fail('Failed to retrieve session');
      this.log(sessionRes.error.message);
      return;
    }
    spinner.stop();

    const session = sessionRes.data;
    if (!session) {
      this.log('You are not logged in.');
      return;
    }

    this.log(`You are logged in as ${session.user.email}`);
  }
}

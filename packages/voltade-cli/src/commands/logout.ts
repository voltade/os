import { confirm } from '@inquirer/prompts';

import { BaseCommand } from '#src/base.ts';
import { deleteCookies } from '#src/utils/cookies.ts';

export default class Login extends BaseCommand {
  static override description = 'Login to Voltade OS';

  public async run(): Promise<void> {
    const confirmed = await confirm({
      message: 'Are you sure you want to log out?',
    });
    if (!confirmed) {
      this.spinner.fail('Logout cancelled');
      return;
    }
    await deleteCookies(this.config.dataDir);
  }
}

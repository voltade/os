import { input } from '@inquirer/prompts';

import { BaseCommand } from '#src/base.ts';

export default class Login extends BaseCommand {
  static override description = 'Login to Voltade OS';

  public async run(): Promise<void> {
    const { spinner, authClient } = this;

    const email = await input({ message: 'Email:' });
    spinner.start('Sending verification code...');
    const verificationRes = await authClient.emailOtp.sendVerificationOtp({
      type: 'sign-in',
      email,
    });
    spinner.stop();
    if (verificationRes.error) {
      spinner.fail('Failed to send verification code');
      this.error(verificationRes.error.message ?? '', {
        code: verificationRes.error.code,
        message: verificationRes.error.statusText,
      });
    }

    const otp = await input({ message: 'Verification code:' });
    spinner.start('Signing in...');
    const signinRes = await authClient.signIn.emailOtp({
      email,
      otp,
    });
    spinner.stop();
    if (signinRes.error) {
      spinner.fail('Failed to sign in');
      this.error(signinRes.error.message ?? '', {
        code: signinRes.error.code,
        message: signinRes.error.statusText,
      });
    }
  }
}

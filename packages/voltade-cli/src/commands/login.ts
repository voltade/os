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

    spinner.start('Loading organizations...');
    const { data: orgs } = await authClient.organization.list();
    spinner.stop();
    if (!orgs?.length) {
      spinner.fail('No organizations found');
      this.error('You need to create an organization first.');
    }

    if (orgs.length === 1 && orgs[0]) {
      const org = orgs[0];
      spinner.start(`Setting active organization to ${org.name}...`);
      const setActiveRes = await authClient.organization.setActive({
        organizationId: org.id,
      });
      spinner.stop();
      if (setActiveRes.error) {
        spinner.fail('Failed to set active organization');
        this.error(setActiveRes.error.message ?? '', {
          code: setActiveRes.error.code,
          message: setActiveRes.error.statusText,
        });
      }
      this.log(
        `Logged in as ${email} and set active organization to ${org.name}`,
      );
    }
  }
}

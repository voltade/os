import cj from 'color-json';

import { BaseCommand } from '#src/base.ts';

export default class Info extends BaseCommand {
  public async run(): Promise<void> {
    const primitiveConfigs: Record<
      string,
      string | boolean | number | null | undefined
    > = {};
    for (const [key, value] of Object.entries(this.config)) {
      if (
        typeof value === 'string' ||
        typeof value === 'boolean' ||
        typeof value === 'number' ||
        value === null ||
        value === undefined
      ) {
        primitiveConfigs[key] = value;
      }
    }
    this.log('oclif config:');
    this.log(cj(primitiveConfigs));

    const { data: orgs } = await this.authClient.organization.list();
    console.log(orgs);

    const { data: session } = await this.authClient.getSession();
    if (session) {
      this.log('session:');
      this.log(cj(session));
    }
  }
}

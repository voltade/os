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
    this.log(cj(primitiveConfigs));
  }
}

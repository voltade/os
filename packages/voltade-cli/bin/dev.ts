import path from 'node:path';
import { execute } from '@oclif/core';

import oclif from '../oclif.config.mjs';
import pjson from '../package.json';

await execute({
  // uncomment the following line to see the full error stack trace
  // development: true,
  loadOptions: {
    root: path.resolve(__dirname, '../'),
    pjson: {
      ...pjson,
      oclif: {
        ...oclif,
        commands: './src/commands',
      },
    },
  },
});

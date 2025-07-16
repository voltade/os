import { writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { Glob } from 'bun';

import { plv8ify } from './plv8ify/index.ts';
import { formatSqlFile } from './utils/formatSql.ts';

const plv8Glob = new Glob('schemas/**/{functions,triggers}/*.plv8.ts');
for await (const file of plv8Glob.scan('.')) {
  const dir = dirname(file);
  const name = basename(file, '.plv8.ts');

  const sql = await plv8ify(file);
  const sqlFile = join(dir, `${name}.plv8.sql`);

  await writeFile(sqlFile, sql);
  await formatSqlFile(sqlFile);
}

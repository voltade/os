import { SQL } from 'bun';

import { appEnvVariables } from '../utils/env.ts';
import { processSqlFile } from './utils/processSqlFile.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

const sql = new SQL({
  url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
});

const currentSql = await processSqlFile('src/current.sql');

await sql.transaction(async (tx) => {
  await tx.unsafe(currentSql);
  console.log('src/current.sql executed successfully');
});

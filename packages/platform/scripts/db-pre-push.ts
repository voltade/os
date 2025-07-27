import { processSqlFile } from './utils/processSqlFile.ts';
import { sql } from './utils/sql.ts';

const prePushSql = await processSqlFile('migrations/pre-push.sql');

sql.transaction(async (sql) => {
  await sql.unsafe(prePushSql);
});
console.log('migrations/pre-push.sql executed successfully');

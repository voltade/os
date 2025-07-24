import { processSqlFile } from './utils/processSqlFile.ts';
import { appSql } from './utils/sql.ts';

const prePushSql = await processSqlFile('pre-push.sql');

appSql.transaction(async (sql) => {
  await sql.unsafe(prePushSql);
});
console.log('src/pre-push.sql executed successfully');

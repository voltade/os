import { processSqlFile } from './utils/processSqlFile.ts';
import { appSql } from './utils/sql.ts';

const currentSql = await processSqlFile('current.sql');

appSql.transaction(async (sql) => {
  await sql.unsafe(currentSql);
});
console.log('src/current.sql executed successfully');

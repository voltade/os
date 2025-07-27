import { processSqlFile } from './utils/processSqlFile.ts';
import { sql } from './utils/sql.ts';

const currentSql = await processSqlFile('migrations/current.sql');

sql.transaction(async (sql) => {
  await sql.unsafe(currentSql);
});
console.log('migrations/current.sql executed successfully');

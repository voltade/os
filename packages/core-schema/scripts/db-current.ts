import { db } from '../lib/db.ts';
import { processSqlFile } from './utils/processSqlFile.ts';

const currentSql = await processSqlFile('current.sql');

await db.transaction(async (tx) => {
  await tx.execute(currentSql);
  console.log('src/current.sql executed successfully');
});

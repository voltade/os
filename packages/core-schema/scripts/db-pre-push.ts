import { db } from '../lib/db.ts';
import { processSqlFile } from './utils/processSqlFile.ts';

const currentSql = await processSqlFile('pre-push.sql');

await db.transaction(async (tx) => {
  await tx.execute(currentSql);
  console.log('src/pre-push.sql executed successfully');
});

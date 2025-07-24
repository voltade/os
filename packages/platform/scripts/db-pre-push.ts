import { db } from '../utils/db.ts';
import { processSqlFile } from './utils/processSqlFile.ts';

const prePushSql = await processSqlFile('pre-push.sql');

await db.transaction(async (tx) => {
  await tx.execute(prePushSql);
  console.log('src/pre-push.sql executed successfully');
});

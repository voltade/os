import { db } from '../lib/db.ts';
import { processSqlFile } from './utils/processSqlFile.ts';

const openfgaSql = await processSqlFile('schemas/openfga.sql');

await db.transaction(async (tx) => {
  await tx.execute(openfgaSql);
  console.log('schemas/openfga.sql executed successfully');
});

import { sql } from 'drizzle-orm';

import schemasConfig from '../schemas.json';
import { db } from '../utils/db.ts';

try {
  console.log('Starting schema drop process...');
  console.log(
    `Found ${schemasConfig.schemas.length} schemas to drop:`,
    schemasConfig.schemas,
  );

  // Use Drizzle transaction to drop all schemas
  await db.transaction(async (tx) => {
    for (const schemaName of schemasConfig.schemas) {
      console.log(`Dropping schema: ${schemaName}`);

      // Drop schema with CASCADE to remove all objects within it
      await tx.execute(
        sql.raw(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`),
      );

      console.log(`✓ Schema "${schemaName}" dropped successfully`);
    }
  });

  console.log('All schemas dropped successfully!');

  //TODO: Check if we need this
  // Drop and recreate public schema
  console.log('Dropping and recreating public schema...');
  await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "public" CASCADE`));
  console.log('✓ Public schema dropped');

  await db.execute(sql.raw(`CREATE SCHEMA "public"`));
  console.log('✓ Public schema recreated');

  console.log('Schema reset completed successfully!');
} catch (error) {
  console.error('Error dropping schemas:', error);
  process.exit(1);
}

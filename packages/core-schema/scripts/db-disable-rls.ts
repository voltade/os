#!/usr/bin/env bun

import { sql } from 'drizzle-orm';

import { db } from '../utils/db.ts';

interface TableInfo {
  schema: string;
  table: string;
  rls_enabled: boolean;
}

async function getTablesWithRLS(): Promise<TableInfo[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        n.nspname as schema,
        c.relname as table,
        c.relrowsecurity as rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        AND c.relrowsecurity = true
      ORDER BY n.nspname, c.relname;
    `);

    return (result || []) as TableInfo[];
  } catch (error) {
    console.log('Error querying tables:', error);
    return [];
  }
}

async function getAllTables(): Promise<TableInfo[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        n.nspname as schema,
        c.relname as table,
        c.relrowsecurity as rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY n.nspname, c.relname;
    `);

    return (result || []) as TableInfo[];
  } catch (error) {
    console.log('Error querying tables:', error);
    return [];
  }
}

async function disableRLS(): Promise<void> {
  console.log('⚠️  DISABLING ROW LEVEL SECURITY ⚠️');
  console.log('This should only be used in development environments!\n');

  const tables = await getTablesWithRLS();

  if (tables.length === 0) {
    console.log('No tables found with RLS enabled');
    return;
  }

  console.log(`Found ${tables.length} tables with RLS enabled:\n`);

  for (const table of tables) {
    try {
      await db.execute(
        sql.raw(
          `ALTER TABLE "${table.schema}"."${table.table}" DISABLE ROW LEVEL SECURITY;`,
        ),
      );
      console.log(`\tDisabled RLS: ${table.schema}.${table.table}`);
    } catch (error) {
      console.log(`\tFailed to disable RLS: ${table.schema}.${table.table}`);
      console.log(`\t\tError: ${error}`);
    }
  }

  console.log('\nRLS disable operation completed');
  console.log('Use --enable flag to re-enable RLS on all tables');
}

async function enableRLS(): Promise<void> {
  console.log('ENABLING ROW LEVEL SECURITY\n');

  const tables = await getAllTables();

  if (tables.length === 0) {
    console.log('No tables found');
    return;
  }

  console.log(`Enabling RLS on ${tables.length} tables:\n`);

  for (const table of tables) {
    try {
      await db.execute(
        sql.raw(
          `ALTER TABLE "${table.schema}"."${table.table}" ENABLE ROW LEVEL SECURITY;`,
        ),
      );
      console.log(`\tEnabled RLS: ${table.schema}.${table.table}`);
    } catch (error) {
      console.log(`\t⚠️  Warning: ${table.schema}.${table.table} - ${error}`);
    }
  }

  console.log('\nRLS enable operation completed');
}

async function showStatus(): Promise<void> {
  console.log('ROW LEVEL SECURITY STATUS\n');

  const tables = await getAllTables();

  if (tables.length === 0) {
    console.log('No tables found');
    return;
  }

  const enabled = tables.filter((t) => t.rls_enabled);
  const disabled = tables.filter((t) => !t.rls_enabled);

  console.log(`Total tables: ${tables.length}`);
  console.log(`RLS enabled: ${enabled.length}`);
  console.log(`RLS disabled: ${disabled.length}\n`);

  if (enabled.length > 0) {
    console.log('Tables with RLS enabled:');
    enabled.forEach((t) => console.log(`\t${t.schema}.${t.table}`));
    console.log('');
  }

  if (disabled.length > 0) {
    console.log('Tables with RLS disabled:');
    disabled.forEach((t) => console.log(`\t${t.schema}.${t.table}`));
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--enable')) {
      await enableRLS();
    } else if (args.includes('--status')) {
      await showStatus();
    } else {
      await disableRLS();
    }
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await main();
}

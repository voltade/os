import { $ } from 'bun';
import { type FormatOptionsWithDialect, format } from 'sql-formatter';

import config from '../../.sql-formatter.json';

export function formatSql(sql: string): string {
  return format(sql, config as unknown as FormatOptionsWithDialect);
}

export async function formatSqlFile(file: string) {
  console.log(`Formatting SQL file: ${file}`);
  return await $`bun sql-formatter --fix ${file}`;
}

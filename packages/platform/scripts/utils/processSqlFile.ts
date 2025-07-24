import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Glob } from 'bun';

import { formatSql } from './formatSql.ts';

const INCLUDE_REGEX = /^--!include\s+(.*)$/gm;

/**
 * Recursively processes an SQL file, replacing `--!include` directives
 * with the content of the specified files. Paths are relative to the file
 * containing the directive.
 * @param filePath The path to the SQL file to process.
 * @returns The processed SQL content as a string.
 */
export async function processSqlFile(filePath: string): Promise<string> {
  const fileContent = await readFile(filePath, 'utf-8');
  const fileDir = dirname(filePath);

  const parts = fileContent.split(INCLUDE_REGEX);
  const resultParts: string[] = [parts[0]!];

  // The `parts` array will have the structure:
  // [text, included_path, text, included_path, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const includePath = parts[i]!.trim();

    const glob = new Glob(includePath);
    const includedContents: string[] = [];

    // The glob scan is relative to the current file's directory
    for await (const file of glob.scan(fileDir)) {
      const includedFilePath = join(fileDir, file);
      // Recursively process the included file
      const includedContent = await processSqlFile(includedFilePath);
      includedContents.push(includedContent);
    }

    resultParts.push(includedContents.join('\n\n'));

    // Add the subsequent text part
    if (parts[i + 1]) {
      resultParts.push(parts[i + 1]!);
    }
  }
  return formatSql(resultParts.join(''));
}

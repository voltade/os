import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

(() => {
  // First fix the relations.ts file
  const relationsPath = path.resolve(
    process.cwd(),
    'server/drizzle/relations.ts',
  );
  console.log(`Reading relations file from: ${relationsPath}`);

  let relationsContent = readFileSync(relationsPath, 'utf-8');
  console.log('Read relations file successfully');

  // Fix import paths from "./schema" to "./schema.ts"
  relationsContent = relationsContent.replace(
    /from\s+["']\.\/schema["']/g,
    'from "./schema.ts"',
  );
  console.log('Fixed import paths in relations file');

  // Write the relations file back
  writeFileSync(relationsPath, relationsContent, 'utf-8');
  console.log('Relations file updated successfully');

  // Now fix the schema.ts file
  const schemaPath = path.resolve(process.cwd(), 'server/drizzle/schema.ts');
  console.log(`Reading schema file from: ${schemaPath}`);

  // Read the file
  let content = readFileSync(schemaPath, 'utf-8');
  console.log('Read schema file successfully');

  type DefaultPattern = {
    fullMatch: string;
    innerContent: string;
    start: number;
    end: number;
  };

  // Function to find default patterns with balanced parentheses
  function findDefaultPatterns(str: string): DefaultPattern[] {
    const results: DefaultPattern[] = [];
    let pos = str.indexOf('.default(');

    while (pos !== -1) {
      let openCount = 1;
      const startPos = pos + 9; // position after '.default('
      let endPos = startPos;

      // Find matching closing parenthesis
      while (endPos < str.length && openCount > 0) {
        if (str[endPos] === '(') openCount++;
        if (str[endPos] === ')') openCount--;
        endPos++;
      }

      if (openCount === 0) {
        const fullMatch = str.substring(pos, endPos);
        const innerContent = str.substring(startPos, endPos - 1);
        results.push({ fullMatch, innerContent, start: pos, end: endPos });
      }

      pos = str.indexOf('.default(', endPos);
    }

    return results;
  }

  // Function to extract pgEnum definitions
  function extractPgEnums(str: string): Map<string, string> {
    const enumMap = new Map<string, string>();
    const enumRegex =
      /export\s+const\s+(\w+)\s*=\s*pgEnum\s*\(\s*["']([^"']+)["']/g;

    let match = enumRegex.exec(str);
    while (match !== null) {
      const [, enumName, enumType] = match;
      if (enumName && enumType) {
        enumMap.set(enumType.toLowerCase(), enumName);
      }
      match = enumRegex.exec(str);
    }

    return enumMap;
  }

  // Function to fix unknown types
  function fixUnknownTypes(str: string, enumMap: Map<string, string>): string {
    // Pattern to match: columnName: unknown("column_name").array(),
    const unknownPattern =
      /(\w+):\s*unknown\s*\(\s*["']([^"']+)["']\s*\)(\s*\.array\(\s*\))?/g;

    return str.replace(
      unknownPattern,
      (match, columnName, dbColumnName, arrayPart) => {
        // Try to find matching enum by column name
        const enumName =
          enumMap.get(columnName.toLowerCase()) ||
          enumMap.get(dbColumnName.toLowerCase());

        if (enumName) {
          const arrayCall = arrayPart || '';
          return `${columnName}: ${enumName}("${dbColumnName}")${arrayCall}`;
        }

        // If no enum found, keep original
        return match;
      },
    );
  }

  // Extract pgEnum definitions
  const enumMap = extractPgEnums(content);
  console.log(
    `Found ${enumMap.size} pgEnum definitions:`,
    Object.fromEntries(enumMap),
  );

  // Fix unknown types
  content = fixUnknownTypes(content, enumMap);
  console.log('Fixed unknown types');

  // Find all default patterns
  const patterns = findDefaultPatterns(content);
  console.log(`Found ${patterns.length} .default() patterns`);

  // Process patterns from end to start to avoid position shifts
  for (let i = patterns.length - 1; i >= 0; i--) {
    // biome-ignore lint/style/noNonNullAssertion: This pattern must exist since we're iterating through valid indices
    const pattern: DefaultPattern = patterns[i]!;

    // Skip if it already contains sql`...`
    if (pattern.innerContent.includes('sql`')) {
      continue;
    }

    // Create replacement with sql`` wrapping
    const replacement = `.default(sql\`${pattern.innerContent}\`)`;

    // Replace in the content
    content =
      content.substring(0, pattern.start) +
      replacement +
      content.substring(pattern.end);
  }

  // Write the file back
  writeFileSync(schemaPath, content, 'utf-8');
  console.log('Schema file updated successfully');
})();

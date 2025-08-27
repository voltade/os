import fs from 'node:fs';
import path from 'node:path';

export type VoltadeYaml = {
  core_schema_version?: string;
  [key: string]: unknown;
};

export function readVoltadeYaml(appRootPath: string): VoltadeYaml | null {
  const yamlPath = path.join(appRootPath, 'voltade.yaml');
  if (!fs.existsSync(yamlPath)) return null;
  const content = fs.readFileSync(yamlPath, 'utf-8');
  const result: VoltadeYaml = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('---')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    const unquoted = value.replace(/^['"]|['"]$/g, '');
    (result as Record<string, unknown>)[key] = unquoted;
  }
  return result;
}

export function getCoreSchemaVersion(appRootPath: string): string | null {
  const yaml = readVoltadeYaml(appRootPath);
  const v = yaml?.core_schema_version;
  if (typeof v === 'string' && v.length > 0) return v;
  return null;
}

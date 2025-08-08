import {
  cp as fsCp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { confirm, input, select } from '@inquirer/prompts';
import type { Command } from 'commander';

import { api } from '#src/utils/api.ts';
import { app as appUtils } from '#src/utils/app.ts';
import { org } from '#src/utils/orgs.ts';

// local shapes for selections
type OrganizationItem = { id: string; slug: string; name?: string | null };
type AppItem = { id: string; slug: string; name?: string | null };

type PackageJson = {
  name?: string;
  version?: string;
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  resolutions?: Record<string, string>;
  pnpm?: {
    patchedDependencies?: Record<string, string>;
  };
  patches?: Record<string, string | string[]>;
  scripts?: Record<string, string>;
};

const EXCLUDES = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.turbo/**',
  '.next/**',
  '.output/**',
  '.DS_Store',
];

function ensureAbsolute(p: string) {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(filePath: string): Promise<PackageJson> {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as PackageJson;
}

function hasWorkspaceDeps(pkg: PackageJson): boolean {
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  return Object.values(deps).some((v) => v.startsWith('workspace:'));
}

function collectWorkspaceDepNames(pkg: PackageJson): Set<string> {
  const result = new Set<string>();
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  for (const [name, version] of Object.entries(deps)) {
    if (version.startsWith('workspace:')) result.add(name);
  }
  return result;
}

async function findWorkspaceRoot(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);
  while (true) {
    const pkgPath = path.join(current, 'package.json');
    if (await exists(pkgPath)) {
      const pkg = await readPackageJson(pkgPath);
      if (
        pkg.workspaces &&
        (Array.isArray(pkg.workspaces) || typeof pkg.workspaces === 'object')
      ) {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function getWorkspaceGlobs(rootPkg: PackageJson): string[] {
  if (Array.isArray(rootPkg.workspaces)) return rootPkg.workspaces;
  if (rootPkg.workspaces && Array.isArray(rootPkg.workspaces.packages))
    return rootPkg.workspaces.packages;
  return [];
}

async function mapWorkspaceNamesToDirs(
  rootDir: string,
  globs: string[],
): Promise<Map<string, string>> {
  const nameToDir = new Map<string, string>();
  for (const g of globs) {
    // Bun.glob supports ** globs
    const matcher = new Bun.Glob(path.join(g, 'package.json'));
    for await (const match of matcher.scan({ cwd: rootDir, onlyFiles: true })) {
      const pkgJsonPath = path.join(rootDir, match);
      try {
        const pkg = await readPackageJson(pkgJsonPath);
        if (pkg.name) {
          nameToDir.set(pkg.name, path.dirname(pkgJsonPath));
        }
      } catch {
        // ignore
      }
    }
  }
  return nameToDir;
}

async function resolveNeededWorkspaceDirs(
  rootDir: string,
  initialNames: Set<string>,
): Promise<Array<{ name: string; absDir: string }>> {
  const rootPkg = await readPackageJson(path.join(rootDir, 'package.json'));
  const globs = getWorkspaceGlobs(rootPkg);
  const nameToDir = await mapWorkspaceNamesToDirs(rootDir, globs);

  const queue = [...initialNames];
  const seen = new Set<string>();
  const result: Array<{ name: string; absDir: string }> = [];

  while (queue.length) {
    const next = queue.shift();
    if (!next) break;
    const name = next;
    if (seen.has(name)) continue;
    seen.add(name);
    const dir = nameToDir.get(name);
    if (!dir) continue;
    const absDir = path.resolve(dir);
    result.push({ name, absDir });
    // Recurse: include workspace deps of this package
    try {
      const pkg = await readPackageJson(path.join(absDir, 'package.json'));
      const more = collectWorkspaceDepNames(pkg);
      for (const m of more) if (!seen.has(m)) queue.push(m);
    } catch {
      // ignore
    }
  }

  return result;
}

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true });
}

async function copyDirPreservingRelative(
  root: string,
  sourceAbs: string,
  stagingRoot: string,
) {
  const rel = path.relative(root, sourceAbs);
  const dest = path.join(stagingRoot, rel);
  await ensureDir(path.dirname(dest));
  await fsCp(sourceAbs, dest, {
    recursive: true,
    force: true,
    filter: (src) => {
      const relPath = path.relative(sourceAbs, src);
      if (!relPath) return true;
      const normalized = relPath.split(path.sep).join('/');
      return !EXCLUDES.some((pattern) => {
        // very simple matcher for top-level excludes
        if (pattern.endsWith('/**')) {
          const base = pattern.slice(0, -3);
          return normalized.startsWith(base);
        }
        return normalized.includes(pattern.replace('/**', ''));
      });
    },
  });
}

async function copyPathPreservingRelative(
  rootDir: string,
  absolutePath: string,
  stagingRoot: string,
) {
  const rel = path.relative(rootDir, absolutePath);
  const dest = path.join(stagingRoot, rel);
  await ensureDir(path.dirname(dest));
  await fsCp(absolutePath, dest, { recursive: true, force: true });
}

function extractPatchPathsFromDeps(pkg: PackageJson): string[] {
  const result: string[] = [];
  const check = (obj?: Record<string, string>) => {
    for (const val of Object.values(obj ?? {})) {
      if (!val) continue;
      if (val.startsWith('patch:')) {
        const hashIndex = val.indexOf('#');
        if (hashIndex !== -1) {
          const ref = val.slice(hashIndex + 1);
          if (
            ref.startsWith('.') ||
            ref.startsWith('..') ||
            ref.startsWith('/')
          ) {
            result.push(ref);
          }
        }
      }
    }
  };
  check(pkg.dependencies);
  check(pkg.devDependencies);
  check(pkg.resolutions);
  return result;
}

async function includeRootPatches(
  rootDir: string,
  rootPkg: PackageJson,
  stagingRoot: string,
) {
  // 1) Conventional directories
  const conventionalDirs = [
    path.join(rootDir, 'patches'),
    path.join(rootDir, '.yarn', 'patches'),
  ];
  for (const dir of conventionalDirs) {
    if (await exists(dir)) {
      await copyPathPreservingRelative(rootDir, dir, stagingRoot);
    }
  }

  // 2) pnpm.patchedDependencies
  const pnpmPatches = rootPkg.pnpm?.patchedDependencies ?? {};
  for (const relPath of Object.values(pnpmPatches)) {
    const abs = path.resolve(rootDir, relPath);
    if (await exists(abs)) {
      await copyPathPreservingRelative(rootDir, abs, stagingRoot);
    }
  }

  // 3) package.json "patches" field (Yarn Berry)
  const pkgPatches = rootPkg.patches ?? {};
  for (const val of Object.values(pkgPatches)) {
    const items = Array.isArray(val) ? val : [val];
    for (const rel of items) {
      const abs = path.resolve(rootDir, rel);
      if (await exists(abs)) {
        await copyPathPreservingRelative(rootDir, abs, stagingRoot);
      }
    }
  }

  // 4) Dependencies that use patch: protocol with a local file reference
  const depPatchRefs = extractPatchPathsFromDeps(rootPkg);
  for (const rel of depPatchRefs) {
    const abs = path.resolve(rootDir, rel);
    if (await exists(abs)) {
      await copyPathPreservingRelative(rootDir, abs, stagingRoot);
    }
  }
}

function sanitizeScriptsInPlace(pkg: PackageJson): PackageJson {
  if (!pkg.scripts) return pkg;
  const scripts = { ...pkg.scripts };
  const removeIfContains = (key: string, needle: string) => {
    const val = scripts?.[key];
    if (val?.toLowerCase().includes(needle)) {
      delete scripts[key];
    }
  };
  // Remove git-hook installers which fail outside git worktrees
  removeIfContains('prepare', 'lefthook');
  removeIfContains('postinstall', 'lefthook');
  removeIfContains('prepare', 'husky');
  removeIfContains('postinstall', 'husky');
  // Be conservative: drop prepare/postinstall entirely in build zips
  if (scripts.prepare) delete scripts.prepare;
  if (scripts.postinstall) delete scripts.postinstall;
  pkg.scripts = scripts;
  return pkg;
}

async function maybeSanitizePackageJsonAt(
  rootDir: string,
  absSourceDir: string,
  stagingRoot: string,
) {
  const rel = path.relative(rootDir, absSourceDir);
  const pkgPath = path.join(stagingRoot, rel, 'package.json');
  if (await exists(pkgPath)) {
    try {
      const pkg = await readPackageJson(pkgPath);
      const sanitized = sanitizeScriptsInPlace(pkg);
      await writeFile(pkgPath, JSON.stringify(sanitized, null, 2));
    } catch {
      // ignore
    }
  }
}

async function zipDirectory(outputZipPath: string, cwd: string) {
  const args = [
    '-r',
    '-q',
    outputZipPath,
    '.',
    '-x',
    ...EXCLUDES.map((e) => `'${e}'`),
  ];
  const proc = Bun.spawn({
    cmd: ['zip', ...args],
    cwd,
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`zip failed with code ${code}`);
  }
}

export async function buildApp(this: Command, folderPathArg: string) {
  const folderPath = ensureAbsolute(folderPathArg);

  if (!(await exists(folderPath)))
    throw new Error(`Path not found: ${folderPath}`);
  const pkgJsonPath = path.join(folderPath, 'package.json');
  if (!(await exists(pkgJsonPath)))
    throw new Error(`package.json not found in ${folderPath}`);

  const pkg = await readPackageJson(pkgJsonPath);

  // Interactive selection: Organization (choose by slug, store id)
  const orgsRes = await org.list();
  const orgs = (
    Array.isArray(orgsRes) ? orgsRes.filter(Boolean) : []
  ) as OrganizationItem[];
  if (orgs.length === 0) throw new Error('No organizations found');
  const selectedOrgId = await select<string>({
    message: 'Select organization',
    choices: orgs.map((o) => ({
      name: o.slug + (o.name ? ` — ${o.name}` : ''),
      value: o.id as string,
    })),
  });
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);
  if (!selectedOrg) throw new Error('Selected organization not found');

  // Interactive selection: App (choose by slug, store id)
  const appsRes = await appUtils.list(selectedOrgId);
  const apps = (
    Array.isArray(appsRes) ? appsRes.filter(Boolean) : []
  ) as AppItem[];
  if (apps.length === 0)
    throw new Error(`No apps found for org ${selectedOrg.slug}`);
  const selectedAppId = await select<string>({
    message: 'Select app',
    choices: apps.map((a) => ({
      name: a.slug + (a.name ? ` — ${a.name}` : ''),
      value: a.id as string,
    })),
  });
  const selectedApp = apps.find((a) => a.id === selectedAppId);
  if (!selectedApp) throw new Error('Selected app not found');

  // Confirmation
  const proceed = await confirm({
    message: `Proceed to build app '${selectedApp.slug}' for org '${selectedOrg.slug}' from path: ${folderPath}?`,
    default: true,
  });
  if (!proceed) {
    console.log('Aborted.');
    return;
  }

  const orgId = selectedOrgId;
  const appId = selectedAppId;

  // Prepare zip
  const tmpRoot = await mkdtempUnique('voltade-build-');
  const zipPath = path.join(tmpRoot, 'source.zip');

  if (hasWorkspaceDeps(pkg)) {
    // try to auto-detect workspace root; else ask
    let rootDir = await findWorkspaceRoot(folderPath);
    if (!rootDir) {
      rootDir = await input({
        message: 'Workspace root not found. Enter monorepo root path:',
        default: path.dirname(folderPath),
      });
      rootDir = ensureAbsolute(rootDir);
    }

    const rootPkg = await readPackageJson(path.join(rootDir, 'package.json'));
    const neededNames = collectWorkspaceDepNames(pkg);
    const neededDirs = await resolveNeededWorkspaceDirs(rootDir, neededNames);

    const stagingRoot = path.join(tmpRoot, 'staging');
    await ensureDir(stagingRoot);

    // copy root package.json (sanitized to avoid git-hook installers)
    const sanitizedRootPkg = sanitizeScriptsInPlace({ ...rootPkg });
    await writeFile(
      path.join(stagingRoot, 'package.json'),
      JSON.stringify(sanitizedRootPkg, null, 2),
    );

    // copy app dir preserving relative path
    await copyDirPreservingRelative(rootDir, folderPath, stagingRoot);
    await maybeSanitizePackageJsonAt(rootDir, folderPath, stagingRoot);

    // copy each needed workspace package
    for (const { absDir } of neededDirs) {
      await copyDirPreservingRelative(rootDir, absDir, stagingRoot);
      await maybeSanitizePackageJsonAt(rootDir, absDir, stagingRoot);
    }

    // include patch files referenced by the root package.json
    await includeRootPatches(rootDir, rootPkg, stagingRoot);

    // zip from staging root
    await zipDirectory(zipPath, stagingRoot);
  } else {
    // Non-workspace: create staging with sanitized package.json
    const stagingRoot = path.join(tmpRoot, 'staging');
    await ensureDir(stagingRoot);
    // Copy the entire folder into staging
    await fsCp(folderPath, stagingRoot, { recursive: true, force: true });
    // Sanitize package.json at staging root
    await maybeSanitizePackageJsonAt(
      path.dirname(folderPath),
      folderPath,
      stagingRoot,
    );
    await zipDirectory(zipPath, stagingRoot);
  }

  // Request presigned URL
  const presignRes = await api.app_build.s3.signed_url.$post({
    json: { appId, orgId },
  });
  if (!presignRes.ok) {
    const errText = await presignRes.text();
    const errJson = JSON.parse(errText);
    if (errJson?.error?.name === 'ZodError') {
      throw Error(errJson.error.message);
    }
    throw Error(`Failed to get presigned URL: ${presignRes.status} ${errText}`);
  }
  const { uploadUrl, appBuild } = (await presignRes.json()) as {
    uploadUrl: string;
    appBuild: Array<{ id: string }>;
  };
  const buildId = appBuild?.[0]?.id;
  if (!uploadUrl || !buildId) throw Error('Invalid presign response');

  // Upload zip to S3
  const blob = Bun.file(zipPath);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'application/zip' },
  });
  if (!(uploadRes.status === 200 || uploadRes.status === 204)) {
    const errText = await uploadRes.text();
    throw Error(`Upload failed: ${uploadRes.status} ${errText}`);
  }

  // Notify server to progress state
  const notifyRes = await api.app_build.s3.$post({
    json: { orgId, appId, buildId },
  });
  if (!notifyRes.ok) {
    const errText = await notifyRes.text();
    throw Error(`Failed to notify server: ${notifyRes.status} ${errText}`);
  }

  console.log(JSON.stringify({ success: true, buildId }, null, 2));

  // Cleanup temp directory
  await rm(tmpRoot, { recursive: true, force: true }).catch(() => {});
}

async function mkdtempUnique(prefix: string): Promise<string> {
  const dir = path.join(
    os.tmpdir(),
    `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(dir, { recursive: true });
  return dir;
}

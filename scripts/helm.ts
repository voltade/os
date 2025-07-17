#!/usr/bin/env bun
import { $ } from 'bun';
import semver from 'semver';
import yaml from 'yaml';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const chartName = args.find((arg) => !arg.startsWith('--'));

if (!chartName) {
  console.error(
    [
      'Bump the version of a Helm chart and push it to the local registry.',
      'Usage: bun scripts/helm.ts <chart-name> [--overwrite]',
    ].join('\n'),
  );
  process.exit(1);
}

const chartYaml = await Bun.file(`charts/${chartName}/Chart.yaml`).text();
const chartDocument = yaml.parseDocument(chartYaml);
const currentVersion = chartDocument.get('version') as string;
let versionToPush: string | null = currentVersion;

if (overwrite) {
  console.log(
    `Using current version ${currentVersion} for ${chartName} (overwrite)`,
  );
} else {
  versionToPush = semver.inc(currentVersion, 'patch');
  if (!versionToPush) {
    console.error(`Failed to increment version: ${currentVersion}`);
    process.exit(1);
  }
  chartDocument.set('version', versionToPush);
  await Bun.write(`charts/${chartName}/Chart.yaml`, chartDocument.toString());
  console.log(
    `Updated ${chartName} version from ${currentVersion} to ${versionToPush}`,
  );
}

const filename = `${chartName}-${versionToPush}.tgz`;

await $`helm package --dependency-update charts/${chartName}`;
await $`helm push --ca-file terraform/kind-local/certs/ca.crt ${filename} oci://registry.127.0.0.1.nip.io`;
await $`rm ${filename}`;

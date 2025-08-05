#!/usr/bin/env bun
import crypto from 'node:crypto';
import * as path from 'node:path';
import { $, Glob } from 'bun';
import { checkbox } from '@inquirer/prompts';
import semver from 'semver';
import yaml from 'yaml';

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const patch = args.includes('--patch');
const yes = args.includes('--yes') || args.includes('-y');

const chartsGlob = new Glob('charts/*/Chart.yaml');
const chartMap = new Map<
  string,
  {
    yaml: yaml.Document;
    chartName: string;
    chartVersion: string;
    newVersion: string;
  }
>();

for await (const file of chartsGlob.scan({
  cwd: path.resolve(import.meta.dir, '..'),
  absolute: true,
})) {
  const chartYaml = await Bun.file(file).text();
  const chartDocument = yaml.parseDocument(chartYaml);
  const chartName = chartDocument.get('name') as string;
  const chartVersion = chartDocument.get('version') as string;
  if (!chartName) {
    console.error(`Chart name not found in ${file}`);
    continue;
  }
  let newVersion = '';
  if (force) {
    newVersion = chartVersion;
  } else if (patch) {
    newVersion = semver.inc(chartVersion, 'patch') as string;
  } else {
    const randomBytes = crypto.randomBytes(32);
    const hash = crypto.createHash('sha256');
    hash.update(randomBytes);
    const randomHex = hash.digest('hex').slice(0, 7);

    const parsed = semver.parse(chartVersion)!;
    if (parsed.prerelease.length) {
      newVersion = `${parsed.major}.${parsed.minor}.${parsed.patch}-${randomHex}`;
    } else {
      newVersion = semver.inc(
        chartVersion,
        'prerelease',
        randomHex,
        false,
      ) as string;
    }
  }
  chartMap.set(chartName, {
    yaml: chartDocument,
    chartName,
    chartVersion,
    newVersion,
  });
}

let selectedCharts: string[] = [];
if (yes) {
  selectedCharts = [...chartMap.keys()];
} else {
  selectedCharts = await checkbox({
    message: 'Select charts',
    choices: [...chartMap.entries()].map(
      ([name, { chartVersion, newVersion }]) => ({
        checked: true,
        value: name,
        name:
          chartVersion === newVersion
            ? `${name} (${chartVersion})`
            : `${name} (${chartVersion} -> ${newVersion})`,
      }),
    ),
  });
}

if (selectedCharts.length === 0) {
  console.error('No charts selected');
  process.exit(1);
}

for (const chartName of selectedCharts) {
  // biome-ignore lint/style/noNonNullAssertion: map has the chartName
  const { yaml, newVersion } = chartMap.get(chartName)!;
  yaml.set('version', newVersion);

  await Bun.write(`charts/${chartName}/Chart.yaml`, yaml.toString());
  const filename = `${chartName}-${newVersion}.tgz`;

  console.log('');
  console.log(`+ helm package --dependency-update charts/${chartName}`);
  await $`helm package --dependency-update charts/${chartName}`;

  console.log(
    `+ helm push --ca-file terraform/kind-local/certs/ca.crt ${filename} oci://registry.127.0.0.1.nip.io`,
  );
  await $`helm push --ca-file terraform/kind-local/certs/ca.crt ${filename} oci://registry.127.0.0.1.nip.io`;

  console.log(`+ rm ${filename}`);
  await $`rm ${filename}`;
}

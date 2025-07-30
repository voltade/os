import { mkdir } from 'node:fs/promises';
import * as tar from 'tar';

export const downloadPackage = async (
  orgId: string,
  appId: string,
  releaseId: string,
  path: string,
) => {
  const response = await fetch(
    `https://git.voltade.com/api/packages/${orgId}/generic/${appId}/${releaseId}/app.tar.gz`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FORGEJO_PACKAGE_TOKEN}`,
      },
    },
  );
  if (!response.ok || !response.body) {
    console.info(
      appId,
      'error',
      `Failed to download package: ${response.status}`,
    );
    throw new Error(`Failed to download package: ${response.status}`);
  }

  await mkdir(path, { recursive: true });

  // Stream the response to tar and extract the contents to the worker path
  const tarStream = tar.x({
    strip: 1, // Number of leading components from file names to strip.
    z: true, // gzip
    C: path, // Extract to this directory
  });

  const extractionFinished = new Promise((resolve, reject) => {
    tarStream.on('finish', resolve);
    tarStream.on('error', reject);
  });
  for await (const chunk of response.body) {
    if (!tarStream.write(chunk)) {
      await new Promise((resolveDrain) =>
        tarStream.once('drain', resolveDrain),
      );
    }
  }
  tarStream.end();
  await extractionFinished;

  console.info(appId, 'info', 'Package extracted successfully');
  return path;
};

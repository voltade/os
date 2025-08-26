import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import * as tar from 'tar';

import { s3Client } from './s3.ts';

export const downloadPackage = async (
  packageDetails: {
    orgId: string;
    appSlug: string;
    buildId: string;
  },
  outputPath: string,
) => {
  const s3Key = `builds/${packageDetails.orgId}/${packageDetails.appSlug}/${packageDetails.buildId}/artifact.tar.gz`;
  console.info(
    packageDetails.appSlug,
    'info',
    `Downloading artifact from S3: ${s3Key}`,
  );

  const s3file = s3Client.file(s3Key);

  let buffer: ArrayBuffer;
  try {
    buffer = await s3file.arrayBuffer();
    console.info(
      packageDetails.appSlug,
      'info',
      `Successfully downloaded artifact: ${s3Key}`,
    );
  } catch (error) {
    console.error(
      packageDetails.appSlug,
      'error',
      `Failed to download artifact from S3: ${s3Key}`,
      error,
    );
    throw new Error(
      `Failed to download artifact from S3: ${s3Key}. Error: ${error}`,
    );
  }

  await mkdir(outputPath, { recursive: true });

  // Extract tar.gz to output path
  await new Promise<void>((resolve, reject) => {
    const extractStream = tar.extract({
      cwd: outputPath,
      gzip: true,
    });

    extractStream.on('end', () => resolve());
    extractStream.on('error', reject);

    const readable = Readable.from(Buffer.from(buffer));
    readable.pipe(extractStream);
  });

  console.info(
    packageDetails.appSlug,
    'info',
    'Package extracted successfully',
  );
  return outputPath;
};

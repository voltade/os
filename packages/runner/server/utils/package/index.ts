import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import * as tar from 'tar';

import { s3Client } from './s3.ts';

export const downloadPackage = async (
  packageDetails: {
    orgId: string;
    appId: string;
    releaseId: string;
  },
  outputPath: string,
) => {
  const s3file = s3Client.file(
    `builds/${packageDetails.orgId}/${packageDetails.appId}/${packageDetails.releaseId}/artifact.tar.gz`,
  );

  const buffer = await s3file.arrayBuffer();

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

  console.info(packageDetails.appId, 'info', 'Package extracted successfully');
  return outputPath;
};
